import { eq, and } from 'drizzle-orm'
import { db, users, oauthAccounts, type NewUser, type NewOAuthAccount } from '@mental-health/db'
import { signToken } from '@mental-health/auth'
import type { OAuthUserInfo } from '@mental-health/auth'
import type { OAuthLoginResponse, OAuthProvider } from '@mental-health/contract'

export async function findOrCreateOAuthUser(
  provider: OAuthProvider,
  userInfo: OAuthUserInfo,
  jwtSecret: string,
  overrideName?: string,
): Promise<OAuthLoginResponse> {
  // 1. Look up existing oauth account
  const [existingAccount] = await db
    .select()
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.provider, provider),
        eq(oauthAccounts.providerUserId, userInfo.providerUserId),
      ),
    )
    .limit(1)

  if (existingAccount) {
    // Existing user -- fetch and update avatar if changed
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, existingAccount.userId))
      .limit(1)

    if (!user) throw new Error('OAuth account exists but user not found')

    if (userInfo.avatarUrl && userInfo.avatarUrl !== user.avatarUrl) {
      await db
        .update(users)
        .set({ avatarUrl: userInfo.avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, user.id))
    }

    const token = await signToken({ sub: user.id, email: user.email }, jwtSecret)

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: userInfo.avatarUrl ?? user.avatarUrl,
      },
      isNewUser: false,
    }
  }

  // 2. Check if a user with the same email already exists (link accounts)
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, userInfo.email))
    .limit(1)

  if (existingUser) {
    // Link new OAuth account to existing user
    await db.insert(oauthAccounts).values({
      userId: existingUser.id,
      provider,
      providerUserId: userInfo.providerUserId,
      email: userInfo.email,
    } satisfies NewOAuthAccount)

    if (userInfo.avatarUrl && !existingUser.avatarUrl) {
      await db
        .update(users)
        .set({ avatarUrl: userInfo.avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, existingUser.id))
    }

    const token = await signToken({ sub: existingUser.id, email: existingUser.email }, jwtSecret)

    return {
      token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        avatarUrl: userInfo.avatarUrl ?? existingUser.avatarUrl,
      },
      isNewUser: false,
    }
  }

  // 3. Create new user + oauth account in a transaction
  const name = overrideName ?? userInfo.name

  const result = await db.transaction(async (tx) => {
    const [newUser] = await tx
      .insert(users)
      .values({
        email: userInfo.email,
        name,
        avatarUrl: userInfo.avatarUrl,
      } satisfies NewUser)
      .returning()

    if (!newUser) throw new Error('Failed to create user')

    await tx.insert(oauthAccounts).values({
      userId: newUser.id,
      provider,
      providerUserId: userInfo.providerUserId,
      email: userInfo.email,
    } satisfies NewOAuthAccount)

    return newUser
  })

  const token = await signToken({ sub: result.id, email: result.email }, jwtSecret)

  return {
    token,
    user: {
      id: result.id,
      email: result.email,
      name: result.name,
      avatarUrl: result.avatarUrl,
    },
    isNewUser: true,
  }
}
