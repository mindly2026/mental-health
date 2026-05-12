import { getTestDatabaseUrl } from '@mental-health/db/testing'

process.env['DATABASE_URL'] = getTestDatabaseUrl()
process.env['JWT_SECRET'] = 'test-secret'
