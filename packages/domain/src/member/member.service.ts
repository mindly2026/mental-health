import { and, eq } from 'drizzle-orm'
import { db, users, clinicMembers, clinics, departments } from '@mental-health/db'
import type { NewClinicMember } from '@mental-health/db'
import type {
  InviteMemberRequest,
  UpdateMemberRequest,
  ClinicMemberWithUser,
  DoctorPublicInfo,
} from '@mental-health/contract'

export async function inviteMember(
  clinicId: string,
  invitedByUserId: string,
  input: InviteMemberRequest,
): Promise<ClinicMemberWithUser> {
  // Find or create the user record
  let [existingUser] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

  if (!existingUser) {
    // Create a shell account — no password until they complete setup
    const [created] = await db
      .insert(users)
      .values({
        email: input.email,
        name: input.name ?? input.email,
        passwordHash: null,
        role: input.role,
      })
      .returning()
    if (!created) throw new Error('Failed to create user record')
    existingUser = created
  } else {
    // Ensure their role is appropriate (doctor/staff)
    if (existingUser.role !== 'doctor' && existingUser.role !== 'staff') {
      throw new Error(
        'This email belongs to a customer or clinic account and cannot be invited as a member',
      )
    }
  }

  // Check for existing membership at this clinic
  const [existing] = await db
    .select()
    .from(clinicMembers)
    .where(and(eq(clinicMembers.clinicId, clinicId), eq(clinicMembers.userId, existingUser.id)))
    .limit(1)

  if (existing) {
    throw new Error('This person is already a member of this clinic')
  }

  const [member] = await db
    .insert(clinicMembers)
    .values({
      clinicId,
      userId: existingUser.id,
      role: input.role,
      departmentId: input.departmentId ?? null,
      status: existingUser.passwordHash ? 'active' : 'pending',
      invitedBy: invitedByUserId,
    } satisfies NewClinicMember)
    .returning()

  if (!member) throw new Error('Failed to invite member')

  let departmentName: string | null = null
  if (member.departmentId) {
    const [dept] = await db
      .select()
      .from(departments)
      .where(eq(departments.id, member.departmentId))
      .limit(1)
    departmentName = dept?.name ?? null
  }

  return {
    ...member,
    userName: existingUser.name,
    userEmail: existingUser.email,
    departmentName,
  }
}

export async function getClinicMembers(
  clinicId: string,
  role?: 'doctor' | 'staff',
): Promise<ClinicMemberWithUser[]> {
  const rows = await db
    .select({
      member: clinicMembers,
      userName: users.name,
      userEmail: users.email,
      departmentName: departments.name,
    })
    .from(clinicMembers)
    .innerJoin(users, eq(clinicMembers.userId, users.id))
    .leftJoin(departments, eq(clinicMembers.departmentId, departments.id))
    .where(
      role
        ? and(eq(clinicMembers.clinicId, clinicId), eq(clinicMembers.role, role))
        : eq(clinicMembers.clinicId, clinicId),
    )
    .orderBy(users.name)

  return rows.map(({ member, userName, userEmail, departmentName }) => ({
    ...member,
    userName,
    userEmail,
    departmentName: departmentName ?? null,
  }))
}

export async function getActiveDoctorsByClinic(
  clinicId: string,
  departmentId?: string,
): Promise<DoctorPublicInfo[]> {
  const conditions = [
    eq(clinicMembers.clinicId, clinicId),
    eq(clinicMembers.role, 'doctor'),
    eq(clinicMembers.status, 'active'),
    ...(departmentId ? [eq(clinicMembers.departmentId, departmentId)] : []),
  ]

  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      memberId: clinicMembers.id,
      departmentId: clinicMembers.departmentId,
      departmentName: departments.name,
    })
    .from(clinicMembers)
    .innerJoin(users, eq(clinicMembers.userId, users.id))
    .leftJoin(departments, eq(clinicMembers.departmentId, departments.id))
    .where(and(...conditions))
    .orderBy(users.name)

  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    memberId: r.memberId,
    departmentId: r.departmentId ?? null,
    departmentName: r.departmentName ?? null,
  }))
}

export async function getMembersByUserId(userId: string) {
  return db
    .select({
      member: clinicMembers,
      clinicName: clinics.name,
      departmentName: departments.name,
    })
    .from(clinicMembers)
    .innerJoin(clinics, eq(clinicMembers.clinicId, clinics.id))
    .leftJoin(departments, eq(clinicMembers.departmentId, departments.id))
    .where(and(eq(clinicMembers.userId, userId), eq(clinicMembers.status, 'active')))
}

export async function getMemberById(memberId: string) {
  const [row] = await db.select().from(clinicMembers).where(eq(clinicMembers.id, memberId)).limit(1)
  return row ?? null
}

export async function updateMember(memberId: string, clinicId: string, input: UpdateMemberRequest) {
  const updates: Partial<{
    role: 'doctor' | 'staff'
    departmentId: string | null
    status: 'pending' | 'active' | 'suspended'
  }> = {}

  if (input.role !== undefined) updates.role = input.role
  if (input.departmentId !== undefined) updates.departmentId = input.departmentId ?? null
  if (input.status !== undefined) updates.status = input.status

  const [updated] = await db
    .update(clinicMembers)
    .set(updates)
    .where(and(eq(clinicMembers.id, memberId), eq(clinicMembers.clinicId, clinicId)))
    .returning()

  if (!updated) throw new Error('Member not found')
  return updated
}

export async function removeMember(memberId: string, clinicId: string) {
  const [deleted] = await db
    .delete(clinicMembers)
    .where(and(eq(clinicMembers.id, memberId), eq(clinicMembers.clinicId, clinicId)))
    .returning()

  if (!deleted) throw new Error('Member not found')
  return deleted
}
