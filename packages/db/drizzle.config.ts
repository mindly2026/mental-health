import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: ['./src/schema/users.ts', './src/schema/mood-entries.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env['DATABASE_URL'] ?? 'postgres://dev:devpassword@localhost:5433/mentalhealth',
  },
})
