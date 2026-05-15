import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { CreateDepartmentRequest, UpdateDepartmentRequest } from '@mental-health/contract'
import {
  createDepartment,
  getDepartmentsByClinicId,
  updateDepartment,
  deleteDepartment,
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

export async function departmentRoutes(app: FastifyInstance) {
  // Public: list departments for a clinic (needed by clients when booking)
  app.get<{ Params: { clinicId: string } }>('/:clinicId/departments', async (request, reply) => {
    const depts = await getDepartmentsByClinicId(request.params.clinicId)
    return reply.send({ data: depts })
  })

  // Create a department (clinic owner only)
  app.post<{ Params: { clinicId: string }; Body: CreateDepartmentRequest }>(
    '/:clinicId/departments',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      if (user.role !== 'clinic') {
        return reply.status(403).send({ error: 'Only clinic accounts can create departments' })
      }
      const clinic = await getClinicByUserId(user.sub)
      if (!clinic || clinic.id !== request.params.clinicId) {
        return reply.status(403).send({ error: 'Not your clinic' })
      }
      if (!request.body.name) {
        return reply.status(400).send({ error: 'Department name is required' })
      }
      try {
        const dept = await createDepartment(request.params.clinicId, request.body)
        return reply.status(201).send({ data: dept })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to create department'
        return reply.status(400).send({ error: message })
      }
    },
  )

  // Update a department (clinic owner only)
  app.put<{
    Params: { clinicId: string; deptId: string }
    Body: UpdateDepartmentRequest
  }>('/:clinicId/departments/:deptId', { onRequest: [requireAuth] }, async (request, reply) => {
    const user = request.user as JwtUser
    if (user.role !== 'clinic') {
      return reply.status(403).send({ error: 'Only clinic accounts can update departments' })
    }
    const clinic = await getClinicByUserId(user.sub)
    if (!clinic || clinic.id !== request.params.clinicId) {
      return reply.status(403).send({ error: 'Not your clinic' })
    }
    try {
      const dept = await updateDepartment(
        request.params.deptId,
        request.params.clinicId,
        request.body,
      )
      return reply.send({ data: dept })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Department not found'
      return reply.status(404).send({ error: message })
    }
  })

  // Delete a department (clinic owner only)
  app.delete<{ Params: { clinicId: string; deptId: string } }>(
    '/:clinicId/departments/:deptId',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      if (user.role !== 'clinic') {
        return reply.status(403).send({ error: 'Only clinic accounts can delete departments' })
      }
      const clinic = await getClinicByUserId(user.sub)
      if (!clinic || clinic.id !== request.params.clinicId) {
        return reply.status(403).send({ error: 'Not your clinic' })
      }
      try {
        await deleteDepartment(request.params.deptId, request.params.clinicId)
        return reply.status(204).send()
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Department not found'
        return reply.status(404).send({ error: message })
      }
    },
  )
}
