import { eq } from 'drizzle-orm'
import { db, users } from '@mental-health/db'
import { hashPassword, comparePassword, signToken } from '@mental-health/auth'
import type { LoginResponse } from '@mental-health/contract'

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return user ?? null
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

  const valid = await comparePassword(password, user.passwordHash)
  if (!valid) {
    throw new Error('Invalid email or password')
  }

  const token = await signToken({ sub: user.id, email: user.email, role: user.role }, jwtSecret)

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  }
}
