import type { FastifyInstance } from 'fastify'
import type { BookAppointmentRequest } from '@mental-health/contract'
import {
  bookAppointment,
  getCustomerAppointments,
  updateAppointmentStatus,
} from '@mental-health/domain'

type JwtUser = { sub: string; role: string }

export async function appointmentRoutes(app: FastifyInstance) {
  // Protect all appointment routes
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      await reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  // Customer: book an appointment
  app.post<{ Body: BookAppointmentRequest }>('/', async (request, reply) => {
    const user = request.user as JwtUser
    if (user.role !== 'customer') {
      return reply.status(403).send({ error: 'Only customers can book appointments' })
    }
    try {
      const appt = await bookAppointment(user.sub, request.body)
      return reply.status(201).send({ data: appt })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to book appointment'
      return reply.status(400).send({ error: message })
    }
  })

  // Get my appointments
  app.get('/', async (request) => {
    const user = request.user as JwtUser
    const appts = await getCustomerAppointments(user.sub)
    return { data: appts }
  })

  // Update appointment status
  app.patch<{ Params: { id: string }; Body: { status: 'pending' | 'confirmed' | 'cancelled' } }>(
    '/:id/status',
    async (request, reply) => {
      try {
        const appt = await updateAppointmentStatus(request.params.id, request.body.status)
        return reply.send({ data: appt })
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to update appointment'
        return reply.status(400).send({ error: message })
      }
    },
  )
}
