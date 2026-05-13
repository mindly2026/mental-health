import { and, eq } from 'drizzle-orm'
import { db, departments } from '@mental-health/db'
import type { NewDepartment } from '@mental-health/db'
import type { CreateDepartmentRequest, UpdateDepartmentRequest } from '@mental-health/contract'

export async function createDepartment(clinicId: string, input: CreateDepartmentRequest) {
  const [dept] = await db
    .insert(departments)
    .values({
      clinicId,
      name: input.name,
      description: input.description ?? null,
    } satisfies NewDepartment)
    .returning()

  if (!dept) throw new Error('Failed to create department')
  return dept
}

export async function getDepartmentsByClinicId(clinicId: string) {
  return db
    .select()
    .from(departments)
    .where(eq(departments.clinicId, clinicId))
    .orderBy(departments.name)
}

export async function getDepartmentById(id: string) {
  const [dept] = await db.select().from(departments).where(eq(departments.id, id)).limit(1)
  return dept ?? null
}

export async function updateDepartment(
  id: string,
  clinicId: string,
  input: UpdateDepartmentRequest,
) {
  const updates: Partial<{ name: string; description: string | null }> = {}
  if (input.name !== undefined) updates.name = input.name
  if (input.description !== undefined) updates.description = input.description ?? null

  const [updated] = await db
    .update(departments)
    .set(updates)
    .where(and(eq(departments.id, id), eq(departments.clinicId, clinicId)))
    .returning()

  if (!updated) throw new Error('Department not found')
  return updated
}

export async function deleteDepartment(id: string, clinicId: string) {
  const [deleted] = await db
    .delete(departments)
    .where(and(eq(departments.id, id), eq(departments.clinicId, clinicId)))
    .returning()

  if (!deleted) throw new Error('Department not found')
  return deleted
}
