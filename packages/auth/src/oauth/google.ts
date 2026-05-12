import { jwtVerify } from 'jose'
import { getJWKS } from './jwks-cache.js'
import type { OAuthTokenExchangeResult, OAuthUserInfo } from './types.js'

const GOOGLE_JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_ISSUER = ['https://accounts.google.com', 'accounts.google.com']

export async function exchangeGoogleCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  codeVerifier?: string,
): Promise<OAuthTokenExchangeResult> {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  if (codeVerifier) {
    body.set('code_verifier', codeVerifier)
  }

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Google token exchange failed: ${text}`)
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

export async function verifyGoogleIdToken(
  idToken: string,
  clientId: string,
): Promise<OAuthUserInfo> {
  const jwks = getJWKS(GOOGLE_JWKS_URL)
  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: GOOGLE_ISSUER,
    audience: clientId,
  })

  const email = payload['email'] as string | undefined
  if (!email) throw new Error('Google ID token missing email')

  return {
    providerUserId: payload.sub ?? '',
    email,
    name: (payload['name'] as string | undefined) ?? email,
    avatarUrl: (payload['picture'] as string | undefined) ?? null,
  }
}
