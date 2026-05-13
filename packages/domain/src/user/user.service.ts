import { eq } from 'drizzle-orm'
import { db, users, clinicMembers, clinics, departments } from '@mental-health/db'
import { hashPassword, comparePassword, signToken } from '@mental-health/auth'
import type {
  LoginResponse,
  CheckEmailResponse,
  ClinicWithMembership,
} from '@mental-health/contract'

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return user ?? null
}

export async function checkEmailStatus(email: string): Promise<CheckEmailResponse> {
  const user = await getUserByEmail(email)
  if (!user) return { status: 'not_found' }
  if (!user.passwordHash) return { status: 'pending_invite' }
  return { status: 'active' }
}

export async function setupAccount(
  email: string,
  password: string,
  name: string | undefined,
  jwtSecret: string,
): Promise<LoginResponse> {
  const user = await getUserByEmail(email)
  if (!user) throw new Error('No account found for this email')
  if (user.passwordHash) throw new Error('Account is already set up. Please log in.')

  const passwordHash = await hashPassword(password)

  const updates: { passwordHash: string; name?: string } = { passwordHash }
  if (name) updates.name = name

  const [updated] = await db.update(users).set(updates).where(eq(users.id, user.id)).returning()

  if (!updated) throw new Error('Failed to set up account')

  // Activate all pending memberships for this user
  await db.update(clinicMembers).set({ status: 'active' }).where(eq(clinicMembers.userId, user.id))

  const token = await signToken(
    { sub: updated.id, email: updated.email, role: updated.role },
    jwtSecret,
  )

  const memberships = await getActiveMemberships(updated.id)

  return {
    token,
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      avatarUrl: updated.avatarUrl,
    },
    clinics: memberships.length > 0 ? memberships : undefined,
  }
}

export async function registerUser(
  email: string,
  password: string,
  name: string,
  jwtSecret: string,
  role: 'customer' | 'clinic' = 'customer',
): Promise<LoginResponse> {
  const existing = await getUserByEmail(email)
  if (existing) {
    throw new Error('A user with this email already exists')
  }

  const passwordHash = await hashPassword(password)

  const [newUser] = await db.insert(users).values({ email, name, passwordHash, role }).returning()

  if (!newUser) throw new Error('Failed to create user')

  const token = await signToken(
    { sub: newUser.id, email: newUser.email, role: newUser.role },
    jwtSecret,
  )

  return {
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl,
    },
  }
}

export async function loginUser(
  email: string,
  password: string,
  jwtSecret: string,
): Promise<LoginResponse> {
  const user = await getUserByEmail(email)
  if (!user) {
    throw new Error('Invalid email or password')
  }

  if (!user.passwordHash) {
    throw new Error('Account setup is not complete. Please set your password first.')
  }

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) {
    throw new Error('Invalid email or password')
  }

  const token = await signToken({ sub: user.id, email: user.email, role: user.role }, jwtSecret)

  const memberships =
    user.role === 'doctor' || user.role === 'staff' ? await getActiveMemberships(user.id) : []

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    clinics: memberships.length > 0 ? memberships : undefined,
  }
}

async function getActiveMemberships(userId: string): Promise<ClinicWithMembership[]> {
  const rows = await db
    .select({
      clinicId: clinics.id,
      clinicName: clinics.name,
      memberRole: clinicMembers.role,
      departmentId: clinicMembers.departmentId,
      departmentName: departments.name,
      memberStatus: clinicMembers.status,
    })
    .from(clinicMembers)
    .innerJoin(clinics, eq(clinicMembers.clinicId, clinics.id))
    .leftJoin(departments, eq(clinicMembers.departmentId, departments.id))
    .where(eq(clinicMembers.userId, userId))

  return rows.map((r) => ({
    clinicId: r.clinicId,
    clinicName: r.clinicName,
    memberRole: r.memberRole,
    departmentId: r.departmentId ?? null,
    departmentName: r.departmentName ?? null,
    memberStatus: r.memberStatus,
  }))
}
