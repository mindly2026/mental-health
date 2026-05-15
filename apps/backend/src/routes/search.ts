import type { FastifyInstance } from 'fastify'
import type { SearchType } from '@mental-health/contract'
import { searchClinics, searchDoctors, searchDepartments } from '@mental-health/domain'

export async function searchRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { type: string; q: string } }>('/search', async (request, reply) => {
    const { type, q } = request.query
    if (!q || q.trim().length === 0) {
      return reply.send({ data: { type, clinics: [], doctors: [], departments: [] } })
    }

    const searchType = type as SearchType
    switch (searchType) {
      case 'clinic': {
        const clinics = await searchClinics(q)
        return reply.send({ data: { type: searchType, clinics } })
      }
      case 'doctor': {
        const doctors = await searchDoctors(q)
        return reply.send({ data: { type: searchType, doctors } })
      }
      case 'department': {
        const departments = await searchDepartments(q)
        return reply.send({ data: { type: searchType, departments } })
      }
      default:
        return reply
          .status(400)
          .send({ error: 'Invalid search type. Use clinic, doctor, or department.' })
    }
  })
}
