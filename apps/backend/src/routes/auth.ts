import type { FastifyInstance } from 'fastify'
import type { LoginRequest, RegisterRequest } from '@mental-health/contract'
import { loginUser, registerUser } from '@mental-health/domain'

export async function authRoutes(app: FastifyInstance) {
  app.post<{ Body: RegisterRequest }>('/register', async (request, reply) => {
    const user = await registerUser(request.body)
    return reply.status(201).send({ data: user })
  })

  app.post<{ Body: LoginRequest }>('/login', async (request, reply) => {
    const jwtSecret = process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production'
    const result = await loginUser(request.body, jwtSecret)
    return reply.send({ data: result })
  })
}
