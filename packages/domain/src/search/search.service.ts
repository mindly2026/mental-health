import { and, eq, ilike } from 'drizzle-orm'
import { db, clinics, users, clinicMembers, departments } from '@mental-health/db'
import type { Clinic, DoctorSearchResult, DepartmentSearchResult } from '@mental-health/contract'

export async function searchClinics(query: string): Promise<Clinic[]> {
  const rows = await db
    .select()
    .from(clinics)
    .where(ilike(clinics.name, `%${query}%`))
    .orderBy(clinics.name)

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    name: r.name,
    address: r.address ?? null,
    phone: r.phone ?? null,
    description: r.description ?? null,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }))
}

export async function searchDoctors(query: string): Promise<DoctorSearchResult[]> {
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      memberId: clinicMembers.id,
      clinicId: clinics.id,
      clinicName: clinics.name,
      departmentId: clinicMembers.departmentId,
      departmentName: departments.name,
    })
    .from(users)
    .innerJoin(
      clinicMembers,
      and(
        eq(clinicMembers.userId, users.id),
        eq(clinicMembers.role, 'doctor'),
        eq(clinicMembers.status, 'active'),
      ),
    )
    .innerJoin(clinics, eq(clinicMembers.clinicId, clinics.id))
    .leftJoin(departments, eq(clinicMembers.departmentId, departments.id))
    .where(ilike(users.name, `%${query}%`))
    .orderBy(users.name)

  // Group by userId
  const map = new Map<string, DoctorSearchResult>()
  for (const row of rows) {
    let entry = map.get(row.userId)
    if (!entry) {
      entry = { userId: row.userId, name: row.name, clinics: [] }
      map.set(row.userId, entry)
    }
    entry.clinics.push({
      clinicId: row.clinicId,
      clinicName: row.clinicName,
      memberId: row.memberId,
      departmentId: row.departmentId ?? null,
      departmentName: row.departmentName ?? null,
    })
  }

  return Array.from(map.values())
}

export async function searchDepartments(query: string): Promise<DepartmentSearchResult[]> {
  const rows = await db
    .select({
      departmentId: departments.id,
      name: departments.name,
      clinicId: clinics.id,
      clinicName: clinics.name,
    })
    .from(departments)
    .innerJoin(clinics, eq(departments.clinicId, clinics.id))
    .where(ilike(departments.name, `%${query}%`))
    .orderBy(departments.name)

  return rows.map((r) => ({
    departmentId: r.departmentId,
    name: r.name,
    clinicId: r.clinicId,
    clinicName: r.clinicName,
  }))
}
