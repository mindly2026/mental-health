import { randomBytes, createHash } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import type { OAuthStatePayload } from './types.js'

const textEncoder = new TextEncoder()

export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url')
}

export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url')
}

export function generateNonce(): string {
  return randomBytes(16).toString('base64url')
}

export async function createStateToken(
  payload: Omit<OAuthStatePayload, 'iat' | 'exp'>,
  secret: string,
): Promise<string> {
  const key = textEncoder.encode(secret)
  const claims: Record<string, unknown> = {
    provider: payload.provider,
    nonce: payload.nonce,
    redirectUri: payload.redirectUri,
  }
  if (payload.codeVerifier) {
    claims['codeVerifier'] = payload.codeVerifier
  }
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(key)
}

export async function verifyStateToken(token: string, secret: string): Promise<OAuthStatePayload> {
  const key = textEncoder.encode(secret)
  const { payload } = await jwtVerify(token, key)
  return payload as unknown as OAuthStatePayload
}
