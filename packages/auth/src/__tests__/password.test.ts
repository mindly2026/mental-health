import { describe, it, expect } from 'vitest'
import { hashPassword, comparePassword } from '../password.js'

describe('hashPassword', () => {
  it('returns a salt:hash string', async () => {
    const hash = await hashPassword('my-password')
    expect(hash).toContain(':')
    const [salt, key] = hash.split(':')
    expect(salt).toMatch(/^[0-9a-f]{32}$/) // 16 bytes hex
    expect(key).toMatch(/^[0-9a-f]{128}$/) // 64 bytes hex
  })

  it('produces different hashes for the same password (unique salts)', async () => {
    const hash1 = await hashPassword('same-password')
    const hash2 = await hashPassword('same-password')
    expect(hash1).not.toBe(hash2)
  })
})

describe('comparePassword', () => {
  it('returns true for the correct password', async () => {
    const hash = await hashPassword('correct-password')
    const result = await comparePassword('correct-password', hash)
    expect(result).toBe(true)
  })

  it('returns false for an incorrect password', async () => {
    const hash = await hashPassword('correct-password')
    const result = await comparePassword('wrong-password', hash)
    expect(result).toBe(false)
  })

  it('returns false for a malformed hash', async () => {
    const result = await comparePassword('password', 'not-a-valid-hash')
    expect(result).toBe(false)
  })
})
