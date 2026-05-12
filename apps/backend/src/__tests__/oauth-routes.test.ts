import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { oauthRoutes } from '../routes/oauth.js'

describe('OAuth routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET', 'test-jwt-secret')
    vi.stubEnv('CLIENT_URL', 'http://localhost:5173')
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-client-id')
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-client-secret')
    vi.stubEnv('APPLE_CLIENT_ID', 'apple-client-id')
    vi.stubEnv('APPLE_TEAM_ID', 'apple-team-id')
    vi.stubEnv('APPLE_KEY_ID', 'apple-key-id')
    vi.stubEnv('APPLE_PRIVATE_KEY', 'fake-key')
    vi.stubEnv('FACEBOOK_APP_ID', 'facebook-app-id')
    vi.stubEnv('FACEBOOK_APP_SECRET', 'facebook-app-secret')

    app = Fastify()
    await app.register(oauthRoutes, { prefix: '/oauth' })
    await app.ready()
  })

  afterAll(async () => {
    vi.unstubAllEnvs()
    await app.close()
  })

  describe('GET /oauth/:provider/authorize', () => {
    it('returns Google auth URL with correct params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/oauth/google/authorize',
      })

      expect(response.statusCode).toBe(200)
      const body = response.json() as { data: { url: string; state: string } }
      expect(body.data.url).toContain('accounts.google.com')
      expect(body.data.url).toContain('client_id=google-client-id')
      expect(body.data.url).toContain('response_type=code')
      expect(body.data.url).toContain('code_challenge_method=S256')
      expect(body.data.state).toBeTruthy()
    })

    it('returns Apple auth URL with correct params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/oauth/apple/authorize',
      })

      expect(response.statusCode).toBe(200)
      const body = response.json() as { data: { url: string; state: string } }
      expect(body.data.url).toContain('appleid.apple.com')
      expect(body.data.url).toContain('client_id=apple-client-id')
      expect(body.data.url).toContain('response_mode=fragment')
    })

    it('returns Facebook auth URL with correct params', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/oauth/facebook/authorize',
      })

      expect(response.statusCode).toBe(200)
      const body = response.json() as { data: { url: string; state: string } }
      expect(body.data.url).toContain('facebook.com')
      expect(body.data.url).toContain('client_id=facebook-app-id')
      expect(body.data.url).toContain('code_challenge_method=S256')
    })

    it('rejects invalid provider', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/oauth/twitter/authorize',
      })

      expect(response.statusCode).toBe(400)
      const body = response.json() as { error: string }
      expect(body.error).toContain('Invalid provider')
    })
  })

  describe('POST /oauth/:provider/callback', () => {
    it('rejects invalid provider', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/oauth/twitter/callback',
        payload: { code: 'test', state: 'test' },
      })

      expect(response.statusCode).toBe(400)
    })

    it('rejects invalid state token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/oauth/google/callback',
        payload: { code: 'test', state: 'invalid-state-token' },
      })

      expect(response.statusCode).toBe(500) // JWT verification throws
    })
  })

  describe('POST /oauth/:provider/token', () => {
    it('rejects invalid provider', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/oauth/twitter/token',
        payload: { token: 'test' },
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
