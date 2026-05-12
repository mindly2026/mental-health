import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { createTestApp, cleanDatabase, closeDatabase } from '../helpers.js'
import type { FastifyInstance } from 'fastify'

describe('Auth routes', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await createTestApp()
  })

  beforeEach(async () => {
    await cleanDatabase()
  })

  afterAll(async () => {
    await app.close()
    await closeDatabase()
  })

  describe('POST /auth/register', () => {
    const validPayload = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    }

    it('should register a new user and return token with user data', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: validPayload,
      })

      expect(response.statusCode).toBe(201)
      const body = response.json()
      expect(body.data).toHaveProperty('token')
      expect(typeof body.data.token).toBe('string')
      expect(body.data.user).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      })
      expect(body.data.user).toHaveProperty('id')
    })

    it('should reject duplicate email with 409', async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: validPayload,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: validPayload,
      })

      expect(response.statusCode).toBe(409)
      const body = response.json()
      expect(body).toHaveProperty('error')
    })

    it('should return 400 when email is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { name: 'Test User', password: 'password123' },
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body).toHaveProperty('error')
    })

    it('should return 400 when password is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email: 'test@example.com', name: 'Test User' },
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body).toHaveProperty('error')
    })

    it('should return 400 when name is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: { email: 'test@example.com', password: 'password123' },
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body).toHaveProperty('error')
    })
  })

  describe('POST /auth/login', () => {
    const registerPayload = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    }

    it('should login with valid credentials and return token with user data', async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: registerPayload,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com', password: 'password123' },
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.data).toHaveProperty('token')
      expect(typeof body.data.token).toBe('string')
      expect(body.data.user).toMatchObject({
        email: 'test@example.com',
        name: 'Test User',
      })
      expect(body.data.user).toHaveProperty('id')
    })

    it('should reject wrong password with 401', async () => {
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: registerPayload,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com', password: 'wrongpassword' },
      })

      expect(response.statusCode).toBe(401)
      const body = response.json()
      expect(body).toHaveProperty('error')
    })

    it('should reject non-existent email with 401', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'nonexistent@example.com', password: 'password123' },
      })

      expect(response.statusCode).toBe(401)
      const body = response.json()
      expect(body).toHaveProperty('error')
    })

    it('should return 400 when email is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { password: 'password123' },
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body).toHaveProperty('error')
    })

    it('should return 400 when password is missing', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: { email: 'test@example.com' },
      })

      expect(response.statusCode).toBe(400)
      const body = response.json()
      expect(body).toHaveProperty('error')
    })
  })
})
