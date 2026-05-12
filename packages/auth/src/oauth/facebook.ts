import type { OAuthTokenExchangeResult, OAuthUserInfo } from './types.js'

const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token'
const FACEBOOK_DEBUG_TOKEN_URL = 'https://graph.facebook.com/debug_token'
const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v19.0/me'

export async function exchangeFacebookCode(
  code: string,
  appId: string,
  appSecret: string,
  redirectUri: string,
  codeVerifier?: string,
): Promise<OAuthTokenExchangeResult> {
  const params = new URLSearchParams({
    code,
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
  })
  if (codeVerifier) {
    params.set('code_verifier', codeVerifier)
  }

  const res = await fetch(`${FACEBOOK_TOKEN_URL}?${params.toString()}`)

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Facebook token exchange failed: ${text}`)
  }

  const data = (await res.json()) as { access_token: string }

  return {
    accessToken: data.access_token,
  }
}

export async function verifyFacebookToken(
  accessToken: string,
  appId: string,
  appSecret: string,
): Promise<OAuthUserInfo> {
  // Step 1: Verify token with debug_token endpoint
  const appToken = `${appId}|${appSecret}`
  const debugParams = new URLSearchParams({
    input_token: accessToken,
    access_token: appToken,
  })

  const debugRes = await fetch(`${FACEBOOK_DEBUG_TOKEN_URL}?${debugParams.toString()}`)
  if (!debugRes.ok) {
    const text = await debugRes.text()
    throw new Error(`Facebook debug_token failed: ${text}`)
  }

  const debugData = (await debugRes.json()) as {
    data: { is_valid: boolean; app_id: string; user_id: string }
  }

  if (!debugData.data.is_valid) {
    throw new Error('Facebook access token is invalid')
  }
  if (debugData.data.app_id !== appId) {
    throw new Error('Facebook access token belongs to a different app')
  }

  // Step 2: Fetch user info via Graph API
  const meParams = new URLSearchParams({
    fields: 'id,name,email,picture.type(large)',
    access_token: accessToken,
  })

  const meRes = await fetch(`${FACEBOOK_GRAPH_URL}?${meParams.toString()}`)
  if (!meRes.ok) {
    const text = await meRes.text()
    throw new Error(`Facebook Graph API /me failed: ${text}`)
  }

  const meData = (await meRes.json()) as {
    id: string
    name?: string
    email?: string
    picture?: { data?: { url?: string } }
  }

  if (!meData.email) {
    throw new Error('Facebook account missing email')
  }

  return {
    providerUserId: meData.id,
    email: meData.email,
    name: meData.name ?? meData.email,
    avatarUrl: meData.picture?.data?.url ?? null,
  }
}
