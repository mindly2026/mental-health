import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

const TEMP_URL_FILE = path.join(os.tmpdir(), 'mental-health-test-db-url.txt')

let container: StartedPostgreSqlContainer | undefined

export async function startTestDatabase(): Promise<void> {
  container = await new PostgreSqlContainer('postgres:17-alpine').start()

  const connectionUri = container.getConnectionUri()

  // Run Drizzle migrations
  const migrationClient = postgres(connectionUri, { max: 1 })
  const migrationDb = drizzle(migrationClient)

  const migrationsFolder = path.resolve(import.meta.dirname, '../drizzle')
  await migrate(migrationDb, { migrationsFolder })
  await migrationClient.end()

  // Write the connection URL to a temp file so worker processes can read it
  fs.writeFileSync(TEMP_URL_FILE, connectionUri, 'utf-8')
}

export async function stopTestDatabase(): Promise<void> {
  if (container) {
    await container.stop()
    container = undefined
  }

  // Clean up temp file
  if (fs.existsSync(TEMP_URL_FILE)) {
    fs.unlinkSync(TEMP_URL_FILE)
  }
}

export function getTestDatabaseUrl(): string {
  if (!fs.existsSync(TEMP_URL_FILE)) {
    throw new Error('Test database URL file not found. Did startTestDatabase() run in globalSetup?')
  }
  return fs.readFileSync(TEMP_URL_FILE, 'utf-8')
}
