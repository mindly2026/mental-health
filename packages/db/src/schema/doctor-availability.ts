import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { clinicMembers } from './clinic-members'

export const doctorAvailability = pgTable('doctor_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  memberId: uuid('member_id')
    .notNull()
    .references(() => clinicMembers.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 6 = Saturday
  startTime: text('start_time').notNull(), // "HH:MM" 24h format
  endTime: text('end_time').notNull(), // "HH:MM" 24h format
})

export type DoctorAvailability = typeof doctorAvailability.$inferSelect
export type NewDoctorAvailability = typeof doctorAvailability.$inferInsert
