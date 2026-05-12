import type { FastifyInstance } from 'fastify'
import { oauthRoutes } from './oauth.js'

export async function authRoutes(app: FastifyInstance) {
  await app.register(oauthRoutes, { prefix: '/oauth' })
}
