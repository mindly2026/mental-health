import type { FastifyInstance } from 'fastify'
import {
  createStateToken,
  verifyStateToken,
  generateCodeVerifier,
  generateCodeChallenge,
  generateNonce,
  exchangeGoogleCode,
  verifyGoogleIdToken,
  generateAppleClientSecret,
  exchangeAppleCode,
  verifyAppleIdToken,
  exchangeFacebookCode,
  verifyFacebookToken,
} from '@mental-health/auth'
import type { OAuthUserInfo } from '@mental-health/auth'
import { OAUTH_PROVIDERS } from '@mental-health/contract'
import type {
  OAuthProvider,
  OAuthCallbackRequest,
  OAuthTokenRequest,
  OAuthAuthorizeResponse,
  OAuthLoginResponse,
} from '@mental-health/contract'
import { findOrCreateOAuthUser } from '@mental-health/domain'

function getEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function getJwtSecret(): string {
  return process.env['JWT_SECRET'] ?? 'dev-secret-change-in-production'
}

function getClientUrl(): string {
  return process.env['CLIENT_URL'] ?? 'http://localhost:5173'
}

function getRedirectUri(provider: OAuthProvider): string {
  return `${getClientUrl()}/auth/callback/${provider}`
}

function isValidProvider(provider: string): provider is OAuthProvider {
  return (OAUTH_PROVIDERS as readonly string[]).includes(provider)
}

function buildGoogleAuthUrl(
  clientId: string,
  redirectUri: string,
  state: string,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

function buildAppleAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'name email',
    state,
    response_mode: 'fragment',
  })
  return `https://appleid.apple.com/auth/authorize?${params.toString()}`
}

function buildFacebookAuthUrl(
  appId: string,
  redirectUri: string,
  state: string,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'email,public_profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  })
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`
}

export async function oauthRoutes(app: FastifyInstance) {
  // --- GET /oauth/:provider/authorize (web flow step 1) ---
  app.get<{ Params: { provider: string } }>('/:provider/authorize', async (request, reply) => {
    const { provider } = request.params
    if (!isValidProvider(provider)) {
      return reply.status(400).send({ error: `Invalid provider: ${provider}` })
    }

    const jwtSecret = getJwtSecret()
    const redirectUri = getRedirectUri(provider)
    const nonce = generateNonce()

    let url: string
    let codeVerifier: string | undefined

    switch (provider) {
      case 'google': {
        const clientId = getEnv('GOOGLE_CLIENT_ID')
        codeVerifier = generateCodeVerifier()
        const codeChallenge = generateCodeChallenge(codeVerifier)
        url = buildGoogleAuthUrl(clientId, redirectUri, '', codeChallenge)
        break
      }
      case 'apple': {
        const clientId = getEnv('APPLE_CLIENT_ID')
        // Apple doesn't support PKCE
        url = buildAppleAuthUrl(clientId, redirectUri, '')
        break
      }
      case 'facebook': {
        const appId = getEnv('FACEBOOK_APP_ID')
        codeVerifier = generateCodeVerifier()
        const codeChallenge = generateCodeChallenge(codeVerifier)
        url = buildFacebookAuthUrl(appId, redirectUri, '', codeChallenge)
        break
      }
    }

    const stateToken = await createStateToken(
      { provider, codeVerifier, nonce, redirectUri },
      jwtSecret,
    )

    // Replace the empty state in the URL with the actual state token
    const authUrl = new URL(url)
    authUrl.searchParams.set('state', stateToken)

    const response: OAuthAuthorizeResponse = { url: authUrl.toString(), state: stateToken }
    return reply.send({ data: response })
  })

  // --- POST /oauth/:provider/callback (web flow step 2) ---
  app.post<{ Params: { provider: string }; Body: OAuthCallbackRequest }>(
    '/:provider/callback',
    async (request, reply) => {
      const { provider } = request.params
      if (!isValidProvider(provider)) {
        return reply.status(400).send({ error: `Invalid provider: ${provider}` })
      }

      const { code, state, user: appleUser } = request.body
      const jwtSecret = getJwtSecret()

      // Verify state token
      const statePayload = await verifyStateToken(state, jwtSecret)
      if (statePayload.provider !== provider) {
        return reply.status(400).send({ error: 'State provider mismatch' })
      }

      let userInfo: OAuthUserInfo
      let overrideName: string | undefined

      switch (provider) {
        case 'google': {
          const clientId = getEnv('GOOGLE_CLIENT_ID')
          const clientSecret = getEnv('GOOGLE_CLIENT_SECRET')
          const tokens = await exchangeGoogleCode(
            code,
            clientId,
            clientSecret,
            statePayload.redirectUri,
            statePayload.codeVerifier,
          )
          if (!tokens.idToken) throw new Error('Google did not return an ID token')
          userInfo = await verifyGoogleIdToken(tokens.idToken, clientId)
          break
        }
        case 'apple': {
          const clientId = getEnv('APPLE_CLIENT_ID')
          const clientSecret = await generateAppleClientSecret({
            teamId: getEnv('APPLE_TEAM_ID'),
            clientId,
            keyId: getEnv('APPLE_KEY_ID'),
            privateKey: getEnv('APPLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
          })
          const tokens = await exchangeAppleCode(
            code,
            clientId,
            clientSecret,
            statePayload.redirectUri,
          )
          if (!tokens.idToken) throw new Error('Apple did not return an ID token')
          userInfo = await verifyAppleIdToken(tokens.idToken, clientId)

          // Apple only sends name on first auth
          if (appleUser?.name) {
            const parts = [appleUser.name.firstName, appleUser.name.lastName].filter(Boolean)
            if (parts.length > 0) {
              overrideName = parts.join(' ')
            }
          }
          break
        }
        case 'facebook': {
          const appId = getEnv('FACEBOOK_APP_ID')
          const appSecret = getEnv('FACEBOOK_APP_SECRET')
          const tokens = await exchangeFacebookCode(
            code,
            appId,
            appSecret,
            statePayload.redirectUri,
            statePayload.codeVerifier,
          )
          userInfo = await verifyFacebookToken(tokens.accessToken, appId, appSecret)
          break
        }
      }

      const result = await findOrCreateOAuthUser(provider, userInfo, jwtSecret, overrideName)

      const response: OAuthLoginResponse = result
      return reply.send({ data: response })
    },
  )

  // --- POST /oauth/:provider/token (mobile flow) ---
  app.post<{ Params: { provider: string }; Body: OAuthTokenRequest }>(
    '/:provider/token',
    async (request, reply) => {
      const { provider } = request.params
      if (!isValidProvider(provider)) {
        return reply.status(400).send({ error: `Invalid provider: ${provider}` })
      }

      const { token, name } = request.body
      const jwtSecret = getJwtSecret()

      let userInfo: OAuthUserInfo

      switch (provider) {
        case 'google': {
          const clientId = getEnv('GOOGLE_CLIENT_ID')
          userInfo = await verifyGoogleIdToken(token, clientId)
          break
        }
        case 'apple': {
          const clientId = getEnv('APPLE_CLIENT_ID')
          userInfo = await verifyAppleIdToken(token, clientId)
          break
        }
        case 'facebook': {
          const appId = getEnv('FACEBOOK_APP_ID')
          const appSecret = getEnv('FACEBOOK_APP_SECRET')
          userInfo = await verifyFacebookToken(token, appId, appSecret)
          break
        }
      }

      const result = await findOrCreateOAuthUser(provider, userInfo, jwtSecret, name)

      const response: OAuthLoginResponse = result
      return reply.send({ data: response })
    },
  )
}
