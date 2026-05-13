import { SignJWT, jwtVerify } from 'jose'
import type { JwtPayload } from './types.js'

const textEncoder = new TextEncoder()

export async function signToken(
  payload: JwtPayload,
  secret: string,
  expiresIn = '7d',
): Promise<string> {
  const key = textEncoder.encode(secret)
  return new SignJWT({ sub: payload.sub, email: payload.email, role: payload.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key)
}

export async function verifyToken(token: string, secret: string): Promise<JwtPayload> {
  const key = textEncoder.encode(secret)
  const { payload } = await jwtVerify(token, key)
  // jose's JWTPayload is a superset; cast through unknown for safety
  return payload as unknown as JwtPayload
}
