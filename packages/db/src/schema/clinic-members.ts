import { pgEnum, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { clinics } from './clinics'
import { users } from './users'
import { departments } from './departments'

export const memberRoleEnum = pgEnum('member_role', ['doctor', 'staff'])
export const memberStatusEnum = pgEnum('member_status', ['pending', 'active', 'suspended'])

export const clinicMembers = pgTable(
  'clinic_members',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    clinicId: uuid('clinic_id')
      .notNull()
      .references(() => clinics.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull(),
    departmentId: uuid('department_id').references(() => departments.id, {
      onDelete: 'set null',
    }),
    status: memberStatusEnum('status').notNull().default('pending'),
    invitedBy: uuid('invited_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique('clinic_members_clinic_user_unique').on(table.clinicId, table.userId)],
)

export type ClinicMember = typeof clinicMembers.$inferSelect
export type NewClinicMember = typeof clinicMembers.$inferInsert
