import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getDoctorAppointments, getMembersByUserId } from '@mental-health/domain'

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
}
