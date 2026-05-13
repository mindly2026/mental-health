import { eq } from 'drizzle-orm'
import { db, clinics, clinicAvailability } from '@mental-health/db'
import type { NewClinic, NewClinicAvailability } from '@mental-health/db'
import type { CreateClinicRequest, SetAvailabilityRequest } from '@mental-health/contract'

export async function createClinic(userId: string, input: CreateClinicRequest) {
  const [clinic] = await db
    .insert(clinics)
    .values({
      userId,
      name: input.name,
      address: input.address ?? null,
      phone: input.phone ?? null,
      description: input.description ?? null,
    } satisfies NewClinic)
    .returning()

  if (!clinic) throw new Error('Failed to create clinic')
  return clinic
}

export async function getClinicByUserId(userId: string) {
  const [clinic] = await db.select().from(clinics).where(eq(clinics.userId, userId)).limit(1)
  return clinic ?? null
}

export async function getClinicById(id: string) {
  const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1)
  return clinic ?? null
}

export async function getAllClinics() {
  return db.select().from(clinics)
}

export async function setClinicAvailability(clinicId: string, input: SetAvailabilityRequest) {
  await db.delete(clinicAvailability).where(eq(clinicAvailability.clinicId, clinicId))

  if (input.slots.length === 0) return []

  const inserted = await db
    .insert(clinicAvailability)
    .values(
      input.slots.map(
        (slot) =>
          ({
            clinicId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }) satisfies NewClinicAvailability,
      ),
    )
    .returning()

  return inserted
}

export async function getClinicAvailability(clinicId: string) {
  return db
    .select()
    .from(clinicAvailability)
    .where(eq(clinicAvailability.clinicId, clinicId))
    .orderBy(clinicAvailability.dayOfWeek, clinicAvailability.startTime)
}
