import { buildApp } from '../src/app.js'
import { db, queryClient } from '@mental-health/db'
import { sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'

export async function createTestApp(): Promise<FastifyInstance> {
  const app = await buildApp()
  return app
}

export async function cleanDatabase(): Promise<void> {
  await db.execute(sql`TRUNCATE mood_entries, users CASCADE`)
}

export async function closeDatabase(): Promise<void> {
  await queryClient.end()
}
