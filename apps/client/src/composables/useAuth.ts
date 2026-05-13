import { reactive, readonly } from 'vue'
import type { ClinicWithMembership } from '@mental-health/contract'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'customer' | 'clinic' | 'doctor' | 'staff'
  avatarUrl: string | null
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  // Clinics the current doctor/staff belongs to
  clinics: ClinicWithMembership[]
  // The clinic the doctor/staff is currently working in
  selectedClinicId: string | null
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
  clinics: (() => {
    const raw = localStorage.getItem('auth_clinics')
    if (!raw) return []
    try {
      return JSON.parse(raw) as ClinicWithMembership[]
    } catch {
      return []
    }
  })(),
  selectedClinicId: localStorage.getItem('selected_clinic_id'),
})

export function useAuth() {
  function setAuth(token: string, user: AuthUser, clinics?: ClinicWithMembership[]) {
    state.token = token
    state.user = user
    state.clinics = clinics ?? []
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_user', JSON.stringify(user))
    localStorage.setItem('auth_clinics', JSON.stringify(clinics ?? []))

    // Auto-select if only one clinic
    if (clinics && clinics.length === 1) {
      const id = clinics[0]!.clinicId
      state.selectedClinicId = id
      localStorage.setItem('selected_clinic_id', id)
    }
  }

  function selectClinic(clinicId: string) {
    state.selectedClinicId = clinicId
    localStorage.setItem('selected_clinic_id', clinicId)
  }

  function clearAuth() {
    state.token = null
    state.user = null
    state.clinics = []
    state.selectedClinicId = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    localStorage.removeItem('auth_clinics')
    localStorage.removeItem('selected_clinic_id')
  }

  function logout() {
    clearAuth()
  }

  const isAuthenticated = () => !!state.token

  return {
    state: readonly(state),
    setAuth,
    selectClinic,
    clearAuth,
    logout,
    isAuthenticated,
  }
}
