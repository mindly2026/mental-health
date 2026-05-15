import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
  getDoctorAppointments,
  getMembersByUserId,
  getDoctorAvailability,
  setDoctorAvailability,
} from '@mental-health/domain'
import type { SetDoctorAvailabilityRequest } from '@mental-health/contract'

type JwtUser = { sub: string; role: string }

async function requireDoctor(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    const user = request.user as JwtUser
    if (user.role !== 'doctor') {
      await reply.status(403).send({ error: 'Doctor access only' })
    }
  } catch {
    await reply.status(401).send({ error: 'Unauthorized' })
  }
}

export async function doctorRoutes(app: FastifyInstance) {
  // All routes require doctor role
  app.addHook('onRequest', requireDoctor)

  // Get all clinics this doctor belongs to
  app.get('/clinics', async (request, reply) => {
    const user = request.user as JwtUser
    const memberships = await getMembersByUserId(user.sub)
    const result = memberships.map(({ member, clinicName, departmentName }) => ({
      clinicId: member.clinicId,
      clinicName,
      departmentId: member.departmentId,
      departmentName: departmentName ?? null,
      status: member.status,
    }))
    return reply.send({ data: result })
  })

  // Get appointments for this doctor, optionally filtered by clinic
  app.get<{ Querystring: { clinicId?: string } }>('/appointments', async (request, reply) => {
    const user = request.user as JwtUser
    const { clinicId } = request.query
    const appts = await getDoctorAppointments(user.sub, clinicId)
    return reply.send({ data: appts })
  })

  // Get doctor's own availability for a clinic
  app.get<{ Querystring: { clinicId: string } }>('/availability', async (request, reply) => {
    const user = request.user as JwtUser
    const { clinicId } = request.query
    if (!clinicId) return reply.status(400).send({ error: 'clinicId is required' })

    // Find the member record for this doctor+clinic pair
    const memberships = await getMembersByUserId(user.sub)
    const membership = memberships.find((m) => m.member.clinicId === clinicId)
    if (!membership) return reply.status(404).send({ error: 'Not a member of this clinic' })

    const slots = await getDoctorAvailability(membership.member.id)
    return reply.send({ data: slots })
  })

  // Set doctor's own availability for a clinic
  app.put<{ Querystring: { clinicId: string }; Body: SetDoctorAvailabilityRequest }>(
    '/availability',
    async (request, reply) => {
      const user = request.user as JwtUser
      const { clinicId } = request.query
      if (!clinicId) return reply.status(400).send({ error: 'clinicId is required' })

      const memberships = await getMembersByUserId(user.sub)
      const membership = memberships.find((m) => m.member.clinicId === clinicId)
      if (!membership) return reply.status(404).send({ error: 'Not a member of this clinic' })

      try {
        const slots = await setDoctorAvailability(
          membership.member.id,
          user.sub,
          clinicId,
          request.body.slots,
        )
        return reply.send({ data: slots })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to save availability'
        return reply.status(400).send({ error: message })
      }
    },
  )
}
