import type { FastifyInstance } from 'fastify'
import type { CreateMoodEntryRequest } from '@mental-health/contract'
import { createMoodEntry, getMoodEntriesByUser } from '@mental-health/domain'

export async function moodRoutes(app: FastifyInstance) {
  // Protect all mood routes
  app.addHook('onRequest', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch {
      await reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  app.get('/', async (request) => {
    const payload = request.user as { sub: string }
    const entries = await getMoodEntriesByUser(payload.sub)
    return { data: entries }
  })

  app.post<{ Body: CreateMoodEntryRequest }>('/', async (request, reply) => {
    const payload = request.user as { sub: string }
    const entry = await createMoodEntry(payload.sub, request.body)
    return reply.status(201).send({ data: entry })
  })
}
