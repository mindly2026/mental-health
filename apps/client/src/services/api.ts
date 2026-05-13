import type {
  LoginResponse,
  Clinic,
  ClinicAvailability,
  AppointmentWithDetails,
  SetAvailabilityRequest,
  BookAppointmentRequest,
  CreateClinicRequest,
  CheckEmailResponse,
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  ClinicMemberWithUser,
  ClinicMember,
  InviteMemberRequest,
  UpdateMemberRequest,
  ClinicWithMembership,
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

// ─── Auth ────────────────────────────────────────────────────────────────────

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

export async function checkEmail(email: string): Promise<CheckEmailResponse> {
  const res = await apiFetch<ApiResponse<CheckEmailResponse>>('/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  return res.data
}

export async function setupAccount(
  email: string,
  password: string,
  name?: string,
): Promise<LoginResponse> {
  const res = await apiFetch<ApiResponse<LoginResponse>>('/auth/setup-account', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  })
  return res.data
}

// ─── Clinics ─────────────────────────────────────────────────────────────────

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

// ─── Departments ──────────────────────────────────────────────────────────────

export async function getDepartments(clinicId: string): Promise<Department[]> {
  const res = await apiFetch<ApiResponse<Department[]>>(`/clinics/${clinicId}/departments`)
  return res.data
}

export async function createDepartment(
  clinicId: string,
  input: CreateDepartmentRequest,
): Promise<Department> {
  const res = await apiFetch<ApiResponse<Department>>(`/clinics/${clinicId}/departments`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.data
}

export async function updateDepartment(
  clinicId: string,
  deptId: string,
  input: UpdateDepartmentRequest,
): Promise<Department> {
  const res = await apiFetch<ApiResponse<Department>>(
    `/clinics/${clinicId}/departments/${deptId}`,
    {
      method: 'PUT',
      body: JSON.stringify(input),
    },
  )
  return res.data
}

export async function deleteDepartment(clinicId: string, deptId: string): Promise<void> {
  await apiFetch<void>(`/clinics/${clinicId}/departments/${deptId}`, { method: 'DELETE' })
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function getMembers(
  clinicId: string,
  role?: 'doctor' | 'staff',
): Promise<ClinicMemberWithUser[]> {
  const query = role ? `?role=${role}` : ''
  const res = await apiFetch<ApiResponse<ClinicMemberWithUser[]>>(
    `/clinics/${clinicId}/members${query}`,
  )
  return res.data
}

export async function inviteMember(
  clinicId: string,
  input: InviteMemberRequest,
): Promise<ClinicMemberWithUser> {
  const res = await apiFetch<ApiResponse<ClinicMemberWithUser>>(`/clinics/${clinicId}/members`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.data
}

export async function updateMember(
  clinicId: string,
  memberId: string,
  input: UpdateMemberRequest,
): Promise<ClinicMember> {
  const res = await apiFetch<ApiResponse<ClinicMember>>(
    `/clinics/${clinicId}/members/${memberId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(input),
    },
  )
  return res.data
}

export async function removeMember(clinicId: string, memberId: string): Promise<void> {
  await apiFetch<void>(`/clinics/${clinicId}/members/${memberId}`, { method: 'DELETE' })
}

// ─── Doctor portal ────────────────────────────────────────────────────────────

export async function getDoctorClinics(): Promise<ClinicWithMembership[]> {
  const res = await apiFetch<ApiResponse<ClinicWithMembership[]>>('/doctor/clinics')
  return res.data
}

export async function getDoctorAppointments(clinicId?: string): Promise<AppointmentWithDetails[]> {
  const query = clinicId ? `?clinicId=${clinicId}` : ''
  const res = await apiFetch<ApiResponse<AppointmentWithDetails[]>>(`/doctor/appointments${query}`)
  return res.data
}

// ─── Staff portal ─────────────────────────────────────────────────────────────

export async function getStaffClinics(): Promise<ClinicWithMembership[]> {
  const res = await apiFetch<ApiResponse<ClinicWithMembership[]>>('/staff/clinics')
  return res.data
}

export async function getStaffAppointments(clinicId: string): Promise<AppointmentWithDetails[]> {
  const res = await apiFetch<ApiResponse<AppointmentWithDetails[]>>(
    `/staff/clinics/${clinicId}/appointments`,
  )
  return res.data
}

// ─── Appointments ─────────────────────────────────────────────────────────────

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
