import type { MoodEntry, Clinic, ClinicAvailability, Appointment } from '../models/index.js'

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

// Auth
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

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'customer' | 'clinic'
  avatarUrl: string | null
}

export interface LoginResponse {
  token: string
  user: AuthUser
}

// Mood
export interface CreateMoodEntryRequest {
  score: number
  note?: string | undefined
}

export type MoodEntryResponse = ApiResponse<MoodEntry>
export type MoodEntriesResponse = ApiResponse<MoodEntry[]>

// Clinics
export interface CreateClinicRequest {
  name: string
  address?: string | undefined
  phone?: string | undefined
  description?: string | undefined
}

export type ClinicResponse = ApiResponse<Clinic>
export type ClinicsResponse = ApiResponse<Clinic[]>

// Availability
export interface AvailabilitySlot {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface SetAvailabilityRequest {
  slots: AvailabilitySlot[]
}

export type AvailabilityResponse = ApiResponse<ClinicAvailability[]>

// Appointments
export interface BookAppointmentRequest {
  clinicId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  notes?: string | undefined
}

export interface AppointmentWithDetails extends Appointment {
  clinicName?: string | undefined
  customerName?: string | undefined
}

export type AppointmentResponse = ApiResponse<AppointmentWithDetails>
export type AppointmentsResponse = ApiResponse<AppointmentWithDetails[]>
