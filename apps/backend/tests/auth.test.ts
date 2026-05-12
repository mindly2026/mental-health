import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import { createTestApp, cleanDatabase, closeDatabase } from './helpers.js'
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
    it('should register a new user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        },
      })

      expect(response.statusCode).toBe(201)
      const body = response.json()
      expect(body.data).toHaveProperty('id')
      expect(body.data.email).toBe('test@example.com')
      expect(body.data.name).toBe('Test User')
    })

    it('should reject duplicate emails', async () => {
      const payload = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      }

      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload,
      })

      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload,
      })

      expect(response.statusCode).toBe(500)
    })
  })

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Register first
      await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        },
      })

      // Then login
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123',
        },
      })

      expect(response.statusCode).toBe(200)
      const body = response.json()
      expect(body.data).toHaveProperty('token')
    })

    it('should reject invalid credentials', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'wrong',
        },
      })

      expect(response.statusCode).toBe(500)
    })
  })
})
