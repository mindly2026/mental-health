import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import type { FastifyInstance } from 'fastify'
import { authRoutes } from '../routes/auth.js'

vi.mock('@mental-health/domain', () => ({
  registerUser: vi.fn(async (email: string, _password: string, name: string) => {
    if (email === 'existing@example.com') {
      throw new Error('A user with this email already exists')
    }
    return {
      token: 'mock-jwt-token',
      user: { id: 'user-1', email, name, avatarUrl: null },
    }
  }),
  loginUser: vi.fn(async (email: string, password: string) => {
    if (email === 'test@example.com' && password === 'correct-password') {
      return {
        token: 'mock-jwt-token',
        user: { id: 'user-1', email, name: 'Test User', avatarUrl: null },
      }
    }
    throw new Error('Invalid email or password')
  }),
}))

describe('Auth routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET', 'test-jwt-secret')
    app = Fastify()
    await app.register(authRoutes, { prefix: '/auth' })
    await app.ready()
  })

  afterAll(async () => {
    vi.unstubAllEnvs()
    await app.close()
  })

  describe('POST /auth/register', () => {
    it('registers a new user and returns 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email: 'new@example.com', password: 'my-password', name: 'New User' },
      })

      expect(response.statusCode).toBe(201)
      const body = response.json() as { data: { token: string; user: { email: string } } }
      expect(body.data.token).toBe('mock-jwt-token')
      expect(body.data.user.email).toBe('new@example.com')
    })

    it('returns 409 when email already exists', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'existing@example.com',
          password: 'my-password',
          name: 'Existing User',
        },
      })

      expect(response.statusCode).toBe(409)
      const body = response.json() as { error: string }
      expect(body.error).toContain('already exists')
    })

    it('returns 400 when fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email: 'test@example.com' },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('POST /auth/login', () => {
    it('logs in with correct credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com', password: 'correct-password' },
      })

      expect(response.statusCode).toBe(200)
      const body = response.json() as { data: { token: string; user: { email: string } } }
      expect(body.data.token).toBe('mock-jwt-token')
      expect(body.data.user.email).toBe('test@example.com')
    })

    it('returns 401 with wrong password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com', password: 'wrong-password' },
      })

      expect(response.statusCode).toBe(401)
      const body = response.json() as { error: string }
      expect(body.error).toContain('Invalid email or password')
    })

    it('returns 400 when fields are missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com' },
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
