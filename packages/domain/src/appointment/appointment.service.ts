import { eq } from 'drizzle-orm'
import { db, appointments, clinics, users } from '@mental-health/db'
import type { NewAppointment } from '@mental-health/db'
import type { AppointmentWithDetails, BookAppointmentRequest } from '@mental-health/contract'

export async function bookAppointment(
  customerId: string,
  input: BookAppointmentRequest,
): Promise<AppointmentWithDetails> {
  const [appointment] = await db
    .insert(appointments)
    .values({
      clinicId: input.clinicId,
      customerId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      notes: input.notes ?? null,
    } satisfies NewAppointment)
    .returning()

  if (!appointment) throw new Error('Failed to book appointment')

  const [clinic] = await db
    .select()
    .from(clinics)
    .where(eq(clinics.id, appointment.clinicId))
    .limit(1)

  return { ...appointment, clinicName: clinic?.name }
}

export async function getClinicAppointments(clinicId: string): Promise<AppointmentWithDetails[]> {
  const rows = await db
    .select({
      appointment: appointments,
      customerName: users.name,
    })
    .from(appointments)
    .leftJoin(users, eq(appointments.customerId, users.id))
    .where(eq(appointments.clinicId, clinicId))
    .orderBy(appointments.date, appointments.startTime)

  return rows.map(({ appointment, customerName }) => ({
    ...appointment,
    customerName: customerName ?? undefined,
  }))
}

export async function getCustomerAppointments(
  customerId: string,
): Promise<AppointmentWithDetails[]> {
  const rows = await db
    .select({
      appointment: appointments,
      clinicName: clinics.name,
    })
    .from(appointments)
    .leftJoin(clinics, eq(appointments.clinicId, clinics.id))
    .where(eq(appointments.customerId, customerId))
    .orderBy(appointments.date, appointments.startTime)

  return rows.map(({ appointment, clinicName }) => ({
    ...appointment,
    clinicName: clinicName ?? undefined,
  }))
}

export async function updateAppointmentStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled',
) {
  const [updated] = await db
    .update(appointments)
    .set({ status })
    .where(eq(appointments.id, id))
    .returning()

  if (!updated) throw new Error('Appointment not found')
  return updated
}
