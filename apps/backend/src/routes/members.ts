import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { InviteMemberRequest, UpdateMemberRequest } from '@mental-health/contract'
import {
  inviteMember,
  getClinicMembers,
  updateMember,
  removeMember,
  getClinicByUserId,
} from '@mental-health/domain'

type JwtUser = { sub: string; role: string }

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    await reply.status(401).send({ error: 'Unauthorized' })
  }
}

async function requireClinicOwner(
  clinicId: string,
  user: JwtUser,
  reply: FastifyReply,
): Promise<boolean> {
  if (user.role !== 'clinic') {
    await reply.status(403).send({ error: 'Only clinic accounts can manage members' })
    return false
  }
  const clinic = await getClinicByUserId(user.sub)
  if (!clinic || clinic.id !== clinicId) {
    await reply.status(403).send({ error: 'Not your clinic' })
    return false
  }
  return true
}

export async function memberRoutes(app: FastifyInstance) {
  // List all members (clinic owner or staff)
  app.get<{ Params: { clinicId: string }; Querystring: { role?: string } }>(
    '/:clinicId/members',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      if (user.role !== 'clinic' && user.role !== 'staff') {
        return reply.status(403).send({ error: 'Not authorized' })
      }
      if (user.role === 'clinic') {
        const clinic = await getClinicByUserId(user.sub)
        if (!clinic || clinic.id !== request.params.clinicId) {
          return reply.status(403).send({ error: 'Not your clinic' })
        }
      }
      const role = request.query.role as 'doctor' | 'staff' | undefined
      const members = await getClinicMembers(request.params.clinicId, role)
      return reply.send({ data: members })
    },
  )

  // Invite a doctor or staff member by email
  app.post<{ Params: { clinicId: string }; Body: InviteMemberRequest }>(
    '/:clinicId/members',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      const authorized = await requireClinicOwner(request.params.clinicId, user, reply)
      if (!authorized) return

      const { email, role } = request.body
      if (!email || !role) {
        return reply.status(400).send({ error: 'Email and role are required' })
      }
      if (role !== 'doctor' && role !== 'staff') {
        return reply.status(400).send({ error: 'Role must be "doctor" or "staff"' })
      }

      try {
        const member = await inviteMember(request.params.clinicId, user.sub, request.body)
        return reply.status(201).send({ data: member })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to invite member'
        return reply.status(409).send({ error: message })
      }
    },
  )

  // Update a member's role, department, or status
  app.patch<{ Params: { clinicId: string; memberId: string }; Body: UpdateMemberRequest }>(
    '/:clinicId/members/:memberId',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      const authorized = await requireClinicOwner(request.params.clinicId, user, reply)
      if (!authorized) return

      try {
        const updated = await updateMember(
          request.params.memberId,
          request.params.clinicId,
          request.body,
        )
        return reply.send({ data: updated })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Member not found'
        return reply.status(404).send({ error: message })
      }
    },
  )

  // Remove a member from the clinic
  app.delete<{ Params: { clinicId: string; memberId: string } }>(
    '/:clinicId/members/:memberId',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      const authorized = await requireClinicOwner(request.params.clinicId, user, reply)
      if (!authorized) return

      try {
        await removeMember(request.params.memberId, request.params.clinicId)
        return reply.status(204).send()
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Member not found'
        return reply.status(404).send({ error: message })
      }
    },
  )
}
