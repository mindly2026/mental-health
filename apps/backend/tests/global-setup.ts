import { startTestDatabase, stopTestDatabase } from '@mental-health/db/testing'

export async function setup() {
  await startTestDatabase()
}

export async function teardown() {
  await stopTestDatabase()
}
