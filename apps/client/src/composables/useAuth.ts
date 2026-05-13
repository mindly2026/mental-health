import { reactive, readonly } from 'vue'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'customer' | 'clinic'
  avatarUrl: string | null
}

interface AuthState {
  token: string | null
  user: AuthUser | null
}

const state = reactive<AuthState>({
  token: localStorage.getItem('auth_token'),
  user: (() => {
    const raw = localStorage.getItem('auth_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  })(),
})

export function useAuth() {
  function setAuth(token: string, user: AuthUser) {
    state.token = token
    state.user = user
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  function clearAuth() {
    state.token = null
    state.user = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  function logout() {
    clearAuth()
  }

  const isAuthenticated = () => !!state.token

  return {
    state: readonly(state),
    setAuth,
    clearAuth,
    logout,
    isAuthenticated,
  }
}
