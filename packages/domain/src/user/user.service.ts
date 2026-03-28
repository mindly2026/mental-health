import { eq } from 'drizzle-orm'
import { db, users, type NewUser } from '@mental-health/db'
import { hashPassword, comparePassword, signToken } from '@mental-health/auth'
import type { LoginRequest, LoginResponse, RegisterRequest } from '@mental-health/contract'

export async function registerUser(
  input: RegisterRequest,
): Promise<{ id: string; email: string; name: string }> {
  const passwordHash = await hashPassword(input.password)

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash,
    } satisfies NewUser)
    .returning({ id: users.id, email: users.email, name: users.name })

  if (!user) throw new Error('Failed to create user')
  return user
}

export async function loginUser(input: LoginRequest, jwtSecret: string): Promise<LoginResponse> {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)

  if (!user) throw new Error('Invalid credentials')

  const valid = await comparePassword(input.password, user.passwordHash)
  if (!valid) throw new Error('Invalid credentials')

  const token = await signToken({ sub: user.id, email: user.email }, jwtSecret)

  return {
    token,
    user: { id: user.id, email: user.email, name: user.name },
  }
}
