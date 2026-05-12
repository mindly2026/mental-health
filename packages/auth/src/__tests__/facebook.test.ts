import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exchangeFacebookCode, verifyFacebookToken } from '../oauth/facebook.js'

describe('exchangeFacebookCode', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('sends correct parameters to Facebook token endpoint', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ access_token: 'fb-token' }),
    } as Response)

    const result = await exchangeFacebookCode(
      'auth-code',
      'app-id',
      'app-secret',
      'http://localhost:5173/auth/callback/facebook',
      'code-verifier',
    )

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url] = fetchSpy.mock.calls[0]!
    const parsedUrl = new URL(url as string)
    expect(parsedUrl.searchParams.get('code')).toBe('auth-code')
    expect(parsedUrl.searchParams.get('client_id')).toBe('app-id')
    expect(parsedUrl.searchParams.get('client_secret')).toBe('app-secret')
    expect(parsedUrl.searchParams.get('code_verifier')).toBe('code-verifier')

    expect(result).toEqual({ accessToken: 'fb-token' })
  })

  it('throws on failed token exchange', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      text: () => Promise.resolve('Error'),
    } as Response)

    await expect(
      exchangeFacebookCode('code', 'id', 'secret', 'http://localhost/callback'),
    ).rejects.toThrow('Facebook token exchange failed')
  })
})

describe('verifyFacebookToken', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('verifies token and fetches user info', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { is_valid: true, app_id: 'app-id', user_id: 'fb-user-123' },
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'fb-user-123',
            name: 'Test User',
            email: 'test@example.com',
            picture: { data: { url: 'https://example.com/avatar.jpg' } },
          }),
      } as Response)

    const result = await verifyFacebookToken('access-token', 'app-id', 'app-secret')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      providerUserId: 'fb-user-123',
      email: 'test@example.com',
      name: 'Test User',
      avatarUrl: 'https://example.com/avatar.jpg',
    })
  })

  it('throws when token is invalid', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { is_valid: false, app_id: 'app-id', user_id: 'fb-user-123' },
        }),
    } as Response)

    await expect(verifyFacebookToken('bad-token', 'app-id', 'app-secret')).rejects.toThrow(
      'Facebook access token is invalid',
    )
  })

  it('throws when token belongs to a different app', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: { is_valid: true, app_id: 'other-app', user_id: 'fb-user-123' },
        }),
    } as Response)

    await expect(verifyFacebookToken('token', 'app-id', 'app-secret')).rejects.toThrow(
      'Facebook access token belongs to a different app',
    )
  })

  it('throws when email is missing', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { is_valid: true, app_id: 'app-id', user_id: 'fb-user-123' },
          }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            id: 'fb-user-123',
            name: 'No Email User',
          }),
      } as Response)

    await expect(verifyFacebookToken('token', 'app-id', 'app-secret')).rejects.toThrow(
      'Facebook account missing email',
    )
  })
})
