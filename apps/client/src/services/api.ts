import type { OAuthAuthorizeResponse, OAuthLoginResponse } from '@mental-health/contract'
import { useAuth } from '../composables/useAuth'

const API_BASE = (import.meta.env['VITE_API_URL'] as string | undefined) ?? 'http://localhost:3000'

interface ApiResponse<T> {
  data: T
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { state } = useAuth()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`API error ${res.status}: ${body}`)
  }
  return res.json() as Promise<T>
}

export async function getOAuthAuthorizeUrl(provider: string): Promise<OAuthAuthorizeResponse> {
  const res = await apiFetch<ApiResponse<OAuthAuthorizeResponse>>(
    `/auth/oauth/${provider}/authorize`,
  )
  return res.data
}

export async function postOAuthCallback(
  provider: string,
  body: { code: string; state: string; user?: unknown },
): Promise<OAuthLoginResponse> {
  const res = await apiFetch<ApiResponse<OAuthLoginResponse>>(`/auth/oauth/${provider}/callback`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return res.data
}

export async function postOAuthToken(
  provider: string,
  body: { token: string; name?: string },
): Promise<OAuthLoginResponse> {
  const res = await apiFetch<ApiResponse<OAuthLoginResponse>>(`/auth/oauth/${provider}/token`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return res.data
}
