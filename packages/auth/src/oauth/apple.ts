import { importPKCS8, SignJWT, jwtVerify } from 'jose'
import { getJWKS } from './jwks-cache.js'
import type { AppleClientSecretConfig, OAuthTokenExchangeResult, OAuthUserInfo } from './types.js'

const APPLE_JWKS_URL = 'https://appleid.apple.com/auth/keys'
const APPLE_TOKEN_URL = 'https://appleid.apple.com/auth/token'
const APPLE_ISSUER = 'https://appleid.apple.com'

export async function generateAppleClientSecret(config: AppleClientSecretConfig): Promise<string> {
  const privateKey = await importPKCS8(config.privateKey, 'ES256')
  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: config.keyId })
    .setIssuer(config.teamId)
    .setIssuedAt()
    .setExpirationTime('5m')
    .setAudience(APPLE_ISSUER)
    .setSubject(config.clientId)
    .sign(privateKey)
}

export async function exchangeAppleCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
): Promise<OAuthTokenExchangeResult> {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })

  const res = await fetch(APPLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Apple token exchange failed: ${text}`)
  }

  const data = (await res.json()) as {
    id_token?: string
    access_token: string
    refresh_token?: string
  }

  return {
    idToken: data.id_token,
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  }
}

export async function verifyAppleIdToken(
  idToken: string,
  clientId: string,
): Promise<OAuthUserInfo> {
  const jwks = getJWKS(APPLE_JWKS_URL)
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: APPLE_ISSUER,
    audience: clientId,
  })

  const email = payload['email'] as string | undefined
  if (!email) throw new Error('Apple ID token missing email')

  return {
    providerUserId: payload.sub ?? '',
    email,
    name: email, // Apple sends name separately, not in the ID token
    avatarUrl: null, // Apple doesn't provide avatar
  }
}
