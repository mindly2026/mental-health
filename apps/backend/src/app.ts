import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { healthRoutes } from './routes/health.js'
import { authRoutes } from './routes/auth.js'
import { moodRoutes } from './routes/mood.js'
import { clinicRoutes } from './routes/clinics.js'
import { departmentRoutes } from './routes/departments.js'
import { memberRoutes } from './routes/members.js'
import { appointmentRoutes } from './routes/appointments.js'
import { doctorRoutes } from './routes/doctor.js'
import { staffRoutes } from './routes/staff.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
    },
  })

  // Plugins
  await app.register(cors, {
    origin: process.env['CLIENT_URL'] ?? 'http://localhost:5173',
    credentials: true,
  })

  await app.register(jwt, {
    secret: process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production',
  })

  // Routes
  await app.register(healthRoutes)
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(moodRoutes, { prefix: '/mood' })
  await app.register(clinicRoutes, { prefix: '/clinics' })
  await app.register(departmentRoutes, { prefix: '/clinics' })
  await app.register(memberRoutes, { prefix: '/clinics' })
  await app.register(appointmentRoutes, { prefix: '/appointments' })
  await app.register(doctorRoutes, { prefix: '/doctor' })
  await app.register(staffRoutes, { prefix: '/staff' })

  return app
}
