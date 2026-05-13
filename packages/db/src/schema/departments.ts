import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { clinics } from './clinics'

export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Department = typeof departments.$inferSelect
export type NewDepartment = typeof departments.$inferInsert
