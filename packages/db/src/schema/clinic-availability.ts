import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { clinics } from './clinics'

export const clinicAvailability = pgTable('clinic_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text('start_time').notNull(), // "HH:MM" 24h format
  endTime: text('end_time').notNull(), // "HH:MM" 24h format
})

export type ClinicAvailability = typeof clinicAvailability.$inferSelect
export type NewClinicAvailability = typeof clinicAvailability.$inferInsert
