import type {
  MoodEntry,
  Clinic,
  ClinicAvailability,
  Appointment,
  Department,
  ClinicMember,
  ClinicMemberWithUser,
  ClinicWithMembership,
} from '../models/index.js'

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T
  message?: string | undefined
}

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role?: 'customer' | 'clinic' | undefined
}

export interface CheckEmailRequest {
  email: string
}

export interface CheckEmailResponse {
  status: 'pending_invite' | 'active' | 'not_found'
}

export interface SetupAccountRequest {
  email: string
  password: string
  name?: string | undefined
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'customer' | 'clinic' | 'doctor' | 'staff'
  avatarUrl: string | null
}

export interface LoginResponse {
  token: string
  user: AuthUser
  // Populated for doctors/staff so the client can show a clinic picker when needed
  clinics?: ClinicWithMembership[] | undefined
}

// ─── Mood ────────────────────────────────────────────────────────────────────

export interface CreateMoodEntryRequest {
  score: number
  note?: string | undefined
}

export type MoodEntryResponse = ApiResponse<MoodEntry>
export type MoodEntriesResponse = ApiResponse<MoodEntry[]>

// ─── Clinics ─────────────────────────────────────────────────────────────────

export interface CreateClinicRequest {
  name: string
  address?: string | undefined
  phone?: string | undefined
  description?: string | undefined
}

export type ClinicResponse = ApiResponse<Clinic>
export type ClinicsResponse = ApiResponse<Clinic[]>

// ─── Availability ─────────────────────────────────────────────────────────────

export interface AvailabilitySlot {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface SetAvailabilityRequest {
  slots: AvailabilitySlot[]
}

export type AvailabilityResponse = ApiResponse<ClinicAvailability[]>

// ─── Departments ──────────────────────────────────────────────────────────────

export interface CreateDepartmentRequest {
  name: string
  description?: string | undefined
}

export interface UpdateDepartmentRequest {
  name?: string | undefined
  description?: string | undefined
}

export type DepartmentResponse = ApiResponse<Department>
export type DepartmentsResponse = ApiResponse<Department[]>

// ─── Members ──────────────────────────────────────────────────────────────────

export interface InviteMemberRequest {
  email: string
  name?: string | undefined
  role: 'doctor' | 'staff'
  departmentId?: string | undefined
}

export interface UpdateMemberRequest {
  role?: 'doctor' | 'staff' | undefined
  departmentId?: string | null | undefined
  status?: 'pending' | 'active' | 'suspended' | undefined
}

export type ClinicMemberResponse = ApiResponse<ClinicMember>
export type ClinicMembersResponse = ApiResponse<ClinicMemberWithUser[]>

// ─── Appointments ─────────────────────────────────────────────────────────────

export interface BookAppointmentRequest {
  clinicId: string
  doctorId?: string | undefined
  departmentId?: string | undefined
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  notes?: string | undefined
}

export interface AppointmentWithDetails extends Appointment {
  clinicName?: string | undefined
  customerName?: string | undefined
  doctorName?: string | undefined
  departmentName?: string | undefined
}

export type AppointmentResponse = ApiResponse<AppointmentWithDetails>
export type AppointmentsResponse = ApiResponse<AppointmentWithDetails[]>
