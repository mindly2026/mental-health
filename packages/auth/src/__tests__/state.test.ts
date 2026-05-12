import { describe, it, expect } from 'vitest'
import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateNonce,
  createStateToken,
  verifyStateToken,
} from '../oauth/state.js'

const TEST_SECRET = 'test-secret-for-oauth-state-tests'

describe('PKCE utilities', () => {
  it('generateCodeVerifier returns a base64url string', () => {
    const verifier = generateCodeVerifier()
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(verifier.length).toBeGreaterThan(0)
  })

  it('generateCodeChallenge produces consistent S256 hash', () => {
    const verifier = generateCodeVerifier()
    const challenge1 = generateCodeChallenge(verifier)
    const challenge2 = generateCodeChallenge(verifier)
    expect(challenge1).toBe(challenge2)
    expect(challenge1).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('different verifiers produce different challenges', () => {
    const v1 = generateCodeVerifier()
    const v2 = generateCodeVerifier()
    expect(generateCodeChallenge(v1)).not.toBe(generateCodeChallenge(v2))
  })
})

describe('generateNonce', () => {
  it('returns a base64url string', () => {
    const nonce = generateNonce()
    expect(nonce).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(nonce.length).toBeGreaterThan(0)
  })

  it('returns unique values', () => {
    const a = generateNonce()
    const b = generateNonce()
    expect(a).not.toBe(b)
  })
})

describe('state token', () => {
  it('creates and verifies a state token', async () => {
    const payload = {
      provider: 'google',
      codeVerifier: 'test-verifier',
      nonce: 'test-nonce',
      redirectUri: 'http://localhost:5173/auth/callback/google',
    }

    const token = await createStateToken(payload, TEST_SECRET)
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3) // JWT format

    const verified = await verifyStateToken(token, TEST_SECRET)
    expect(verified.provider).toBe('google')
    expect(verified.codeVerifier).toBe('test-verifier')
    expect(verified.nonce).toBe('test-nonce')
    expect(verified.redirectUri).toBe('http://localhost:5173/auth/callback/google')
  })

  it('creates state token without codeVerifier (Apple)', async () => {
    const payload = {
      provider: 'apple',
      nonce: 'test-nonce',
      redirectUri: 'http://localhost:5173/auth/callback/apple',
    }

    const token = await createStateToken(payload, TEST_SECRET)
    const verified = await verifyStateToken(token, TEST_SECRET)
    expect(verified.provider).toBe('apple')
    expect(verified.codeVerifier).toBeUndefined()
  })

  it('rejects token with wrong secret', async () => {
    const payload = {
      provider: 'google',
      nonce: 'test-nonce',
      redirectUri: 'http://localhost:5173/auth/callback/google',
    }

    const token = await createStateToken(payload, TEST_SECRET)
    await expect(verifyStateToken(token, 'wrong-secret')).rejects.toThrow()
  })
})
