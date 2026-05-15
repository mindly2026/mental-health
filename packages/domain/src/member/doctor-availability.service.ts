import { and, eq, ne } from 'drizzle-orm'
import { db, clinicMembers, clinicAvailability, doctorAvailability } from '@mental-health/db'
import type { NewDoctorAvailability } from '@mental-health/db'
import type { AvailabilitySlot } from '@mental-health/contract'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart < bEnd && bStart < aEnd
}

export async function setDoctorAvailability(
  memberId: string,
  doctorUserId: string,
  clinicId: string,
  slots: AvailabilitySlot[],
) {
  // Auth guard: verify the member record belongs to doctorUserId and clinicId
  const [member] = await db
    .select()
    .from(clinicMembers)
    .where(
      and(
        eq(clinicMembers.id, memberId),
        eq(clinicMembers.userId, doctorUserId),
        eq(clinicMembers.clinicId, clinicId),
      ),
    )
    .limit(1)

  if (!member) {
    throw new Error('Member record not found or does not belong to this doctor/clinic')
  }

  // Fetch clinic availability for validation
  const clinicWindows = await db
    .select()
    .from(clinicAvailability)
    .where(eq(clinicAvailability.clinicId, clinicId))

  // Validate each slot is within a clinic window for that dayOfWeek
  for (const slot of slots) {
    const windowsForDay = clinicWindows.filter((w) => w.dayOfWeek === slot.dayOfWeek)
    const fits = windowsForDay.some(
      (w) => w.startTime <= slot.startTime && slot.endTime <= w.endTime,
    )
    if (!fits) {
      const dayName = DAY_NAMES[slot.dayOfWeek] ?? `day ${slot.dayOfWeek}`
      const hint =
        windowsForDay.length > 0
          ? windowsForDay.map((w) => `${w.startTime}–${w.endTime}`).join(', ')
          : 'no clinic hours set'
      throw new Error(
        `Slot ${slot.startTime}–${slot.endTime} on ${dayName} is outside clinic hours (${hint})`,
      )
    }
  }

  // Cross-clinic overlap check: fetch this doctor's availability at other clinics
  const otherMemberships = await db
    .select({ id: clinicMembers.id })
    .from(clinicMembers)
    .where(and(eq(clinicMembers.userId, doctorUserId), ne(clinicMembers.id, memberId)))

  if (otherMemberships.length > 0) {
    const otherMemberIds = otherMemberships.map((m) => m.id)
    // Fetch all availability rows for the doctor's other clinic memberships
    const otherSlots = await Promise.all(
      otherMemberIds.map((id) =>
        db.select().from(doctorAvailability).where(eq(doctorAvailability.memberId, id)),
      ),
    )
    const allOtherSlots = otherSlots.flat()

    for (const slot of slots) {
      const conflicting = allOtherSlots.find(
        (o) =>
          o.dayOfWeek === slot.dayOfWeek &&
          timesOverlap(slot.startTime, slot.endTime, o.startTime, o.endTime),
      )
      if (conflicting) {
        const dayName = DAY_NAMES[slot.dayOfWeek] ?? `day ${slot.dayOfWeek}`
        throw new Error(
          `Slot ${slot.startTime}–${slot.endTime} on ${dayName} overlaps with your availability at another clinic (${conflicting.startTime}–${conflicting.endTime})`,
        )
      }
    }
  }

  // Replace existing rows for this member
  await db.delete(doctorAvailability).where(eq(doctorAvailability.memberId, memberId))

  if (slots.length === 0) return []

  const inserted = await db
    .insert(doctorAvailability)
    .values(
      slots.map(
        (slot) =>
          ({
            memberId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }) satisfies NewDoctorAvailability,
      ),
    )
    .returning()

  return inserted
}

export async function getDoctorAvailability(memberId: string) {
  return db
    .select()
    .from(doctorAvailability)
    .where(eq(doctorAvailability.memberId, memberId))
    .orderBy(doctorAvailability.dayOfWeek, doctorAvailability.startTime)
}
