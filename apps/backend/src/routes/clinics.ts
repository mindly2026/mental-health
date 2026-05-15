import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { CreateClinicRequest, SetAvailabilityRequest } from '@mental-health/contract'
import {
  createClinic,
  getClinicByUserId,
  getClinicById,
  getAllClinics,
  setClinicAvailability,
  getClinicAvailability,
  getClinicAppointments,
  getActiveDoctorsByClinic,
  getDoctorAvailability,
} from '@mental-health/domain'

type JwtUser = { sub: string; role: string }

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    await reply.status(401).send({ error: 'Unauthorized' })
  }
}

export async function clinicRoutes(app: FastifyInstance) {
  // Public: list all clinics
  app.get('/', async (_request, reply) => {
    const list = await getAllClinics()
    return reply.send({ data: list })
  })

  // Protected: get own clinic profile
  app.get('/me', { onRequest: [requireAuth] }, async (request, reply) => {
    const user = request.user as JwtUser
    const clinic = await getClinicByUserId(user.sub)
    if (!clinic) return reply.status(404).send({ error: 'Clinic profile not found' })
    return reply.send({ data: clinic })
  })

  // Public: get clinic by id
  app.get<{ Params: { id: string } }>('/:id', async (request, reply) => {
    const clinic = await getClinicById(request.params.id)
    if (!clinic) return reply.status(404).send({ error: 'Clinic not found' })
    return reply.send({ data: clinic })
  })

  // Public: get clinic availability
  app.get<{ Params: { id: string } }>('/:id/availability', async (request, reply) => {
    const slots = await getClinicAvailability(request.params.id)
    return reply.send({ data: slots })
  })

  // Protected: create clinic profile (clinic role only)
  app.post<{ Body: CreateClinicRequest }>(
    '/',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      if (user.role !== 'clinic') {
        return reply.status(403).send({ error: 'Only clinic accounts can create clinic profiles' })
      }
      try {
        const clinic = await createClinic(user.sub, request.body)
        return reply.status(201).send({ data: clinic })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to create clinic'
        return reply.status(400).send({ error: message })
      }
    },
  )

  // Protected: set availability (clinic role, own clinic only)
  app.put<{ Params: { id: string }; Body: SetAvailabilityRequest }>(
    '/:id/availability',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      if (user.role !== 'clinic') {
        return reply.status(403).send({ error: 'Only clinic accounts can set availability' })
      }
      const clinic = await getClinicByUserId(user.sub)
      if (!clinic || clinic.id !== request.params.id) {
        return reply.status(403).send({ error: 'Not your clinic' })
      }
      const slots = await setClinicAvailability(request.params.id, request.body)
      return reply.send({ data: slots })
    },
  )

  // Public: get active doctors for a clinic
  app.get<{ Params: { clinicId: string } }>('/:clinicId/doctors', async (request, reply) => {
    const doctors = await getActiveDoctorsByClinic(request.params.clinicId)
    return reply.send({ data: doctors })
  })

  // Public: get a doctor's availability (used by booking UI)
  app.get<{ Params: { clinicId: string; memberId: string } }>(
    '/:clinicId/doctors/:memberId/availability',
    async (request, reply) => {
      const slots = await getDoctorAvailability(request.params.memberId)
      return reply.send({ data: slots })
    },
  )

  // Public: get active doctors for a clinic filtered by department
  app.get<{ Params: { clinicId: string; deptId: string } }>(
    '/:clinicId/departments/:deptId/doctors',
    async (request, reply) => {
      const doctors = await getActiveDoctorsByClinic(request.params.clinicId, request.params.deptId)
      return reply.send({ data: doctors })
    },
  )

  // Protected: get appointments for a clinic (clinic role, own clinic only)
  app.get<{ Params: { id: string } }>(
    '/:id/appointments',
    { onRequest: [requireAuth] },
    async (request, reply) => {
      const user = request.user as JwtUser
      if (user.role !== 'clinic') {
        return reply
          .status(403)
          .send({ error: 'Only clinic accounts can view clinic appointments' })
      }
      const clinic = await getClinicByUserId(user.sub)
      if (!clinic || clinic.id !== request.params.id) {
        return reply.status(403).send({ error: 'Not your clinic' })
      }
      const appts = await getClinicAppointments(request.params.id)
      return reply.send({ data: appts })
    },
  )
}
