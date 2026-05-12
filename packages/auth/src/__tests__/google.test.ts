import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exchangeGoogleCode } from '../oauth/google.js'

describe('exchangeGoogleCode', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends correct parameters to Google token endpoint', async () => {
    const mockResponse = {
      id_token: 'mock-id-token',
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
    }

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response)

    const result = await exchangeGoogleCode(
      'auth-code',
      'client-id',
      'client-secret',
      'http://localhost:5173/auth/callback/google',
      'code-verifier',
    )

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, options] = fetchSpy.mock.calls[0]!
    expect(url).toBe('https://oauth2.googleapis.com/token')
    expect(options?.method).toBe('POST')

    const body = options?.body as URLSearchParams
    expect(body.get('code')).toBe('auth-code')
    expect(body.get('client_id')).toBe('client-id')
    expect(body.get('client_secret')).toBe('client-secret')
    expect(body.get('code_verifier')).toBe('code-verifier')
    expect(body.get('grant_type')).toBe('authorization_code')

    expect(result).toEqual({
      idToken: 'mock-id-token',
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    })
  })

  it('throws on failed token exchange', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Bad Request'),
    } as Response)

    await expect(
      exchangeGoogleCode('bad-code', 'client-id', 'client-secret', 'http://localhost/callback'),
    ).rejects.toThrow('Google token exchange failed')
  })
})
