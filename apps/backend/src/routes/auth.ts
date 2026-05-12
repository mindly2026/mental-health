import type { FastifyInstance } from 'fastify'
import type { RegisterRequest, LoginRequest } from '@mental-health/contract'
import { registerUser, loginUser } from '@mental-health/domain'

function getJwtSecret(): string {
  return process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production'
}

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterRequest }>('/register', async (request, reply) => {
    const { email, password, name } = request.body

    if (!email || !password || !name) {
      return reply.status(400).send({ error: 'Email, password, and name are required' })
    }

    try {
      const result = await registerUser(email, password, name, getJwtSecret())
      return reply.status(201).send({ data: result })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Registration failed'
      return reply.status(409).send({ error: message })
    }
  })

  app.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
    const { email, password } = request.body

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' })
    }

    try {
      const result = await loginUser(email, password, getJwtSecret())
      return reply.send({ data: result })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Login failed'
      return reply.status(401).send({ error: message })
    }
  })
}
