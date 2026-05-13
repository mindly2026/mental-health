import type {
  LoginResponse,
  Clinic,
  ClinicAvailability,
  AppointmentWithDetails,
  SetAvailabilityRequest,
  BookAppointmentRequest,
  CreateClinicRequest,
} from '@mental-health/contract'
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

// Auth
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
  role: 'customer' | 'clinic' = 'customer',
): Promise<LoginResponse> {
  const res = await apiFetch<ApiResponse<LoginResponse>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, role }),
  })
  return res.data
}

// Clinics
export async function getClinics(): Promise<Clinic[]> {
  const res = await apiFetch<ApiResponse<Clinic[]>>('/clinics')
  return res.data
}

export async function getClinic(id: string): Promise<Clinic> {
  const res = await apiFetch<ApiResponse<Clinic>>(`/clinics/${id}`)
  return res.data
}

export async function createClinic(input: CreateClinicRequest): Promise<Clinic> {
  const res = await apiFetch<ApiResponse<Clinic>>('/clinics', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.data
}

export async function getMyClinic(): Promise<Clinic> {
  const res = await apiFetch<ApiResponse<Clinic>>('/clinics/me')
  return res.data
}

export async function getClinicAvailability(clinicId: string): Promise<ClinicAvailability[]> {
  const res = await apiFetch<ApiResponse<ClinicAvailability[]>>(`/clinics/${clinicId}/availability`)
  return res.data
}

export async function setClinicAvailability(
  clinicId: string,
  input: SetAvailabilityRequest,
): Promise<ClinicAvailability[]> {
  const res = await apiFetch<ApiResponse<ClinicAvailability[]>>(
    `/clinics/${clinicId}/availability`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
  return res.data
}

export async function getClinicAppointments(clinicId: string): Promise<AppointmentWithDetails[]> {
  const res = await apiFetch<ApiResponse<AppointmentWithDetails[]>>(
    `/clinics/${clinicId}/appointments`,
  )
  return res.data
}

// Appointments
export async function bookAppointment(
  input: BookAppointmentRequest,
): Promise<AppointmentWithDetails> {
  const res = await apiFetch<ApiResponse<AppointmentWithDetails>>('/appointments', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.data
}

export async function getMyAppointments(): Promise<AppointmentWithDetails[]> {
  const res = await apiFetch<ApiResponse<AppointmentWithDetails[]>>('/appointments')
  return res.data
}

export async function updateAppointmentStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'cancelled',
): Promise<AppointmentWithDetails> {
  const res = await apiFetch<ApiResponse<AppointmentWithDetails>>(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
  return res.data
}
