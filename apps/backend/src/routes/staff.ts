import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { getClinicAppointments, getMembersByUserId } from '@mental-health/domain'

type JwtUser = { sub: string; role: string }

async function requireStaff(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    const user = request.user as JwtUser
    if (user.role !== 'staff') {
      await reply.status(403).send({ error: 'Staff access only' })
    }
  } catch {
    await reply.status(401).send({ error: 'Unauthorized' })
  }
}

export async function staffRoutes(app: FastifyInstance) {
  app.addHook('onRequest', requireStaff)

  // Get all clinics this staff member belongs to
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

  // Get all appointments for a specific clinic (staff can see all appointments in their clinic)
  app.get<{ Params: { clinicId: string } }>(
    '/clinics/:clinicId/appointments',
    async (request, reply) => {
      const user = request.user as JwtUser
      const { clinicId } = request.params

      // Verify this staff member belongs to the requested clinic
      const memberships = await getMembersByUserId(user.sub)
      const isMember = memberships.some((m) => m.member.clinicId === clinicId)
      if (!isMember) {
        return reply.status(403).send({ error: 'You are not a member of this clinic' })
      }

      const appts = await getClinicAppointments(clinicId)
      return reply.send({ data: appts })
    },
  )
}
