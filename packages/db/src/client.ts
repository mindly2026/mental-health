import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './schema/index'

const connectionString =
  process.env['DATABASE_URL'] ?? 'postgres://dev:devpassword@localhost:5433/mentalhealth'

const queryClient = postgres(connectionString)

export const db = drizzle(queryClient, { schema })

export type Database = typeof db
