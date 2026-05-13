import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { clinics } from './clinics'
import { users } from './users'
import { departments } from './departments'

export const appointmentStatusEnum = pgEnum('appointment_status', [
  'pending',
  'confirmed',
  'cancelled',
])

export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  clinicId: uuid('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  doctorId: uuid('doctor_id').references(() => users.id, { onDelete: 'set null' }),
  departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
  date: text('date').notNull(), // "YYYY-MM-DD"
  startTime: text('start_time').notNull(), // "HH:MM"
  endTime: text('end_time').notNull(), // "HH:MM"
  status: appointmentStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Appointment = typeof appointments.$inferSelect
export type NewAppointment = typeof appointments.$inferInsert
