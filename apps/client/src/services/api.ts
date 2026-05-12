import type { LoginResponse } from '@mental-health/contract'
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

export async function postLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await apiFetch<ApiResponse<LoginResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return res.data
}

export async function postRegister(
  email: string,
  password: string,
  name: string,
): Promise<LoginResponse> {
  const res = await apiFetch<ApiResponse<LoginResponse>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
  return res.data
}
