export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'clinic'
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface MoodEntry {
  id: string
  userId: string
  score: number // 1-10
  note?: string | undefined
  createdAt: Date
}

export interface Clinic {
  id: string
  userId: string
  name: string
  address: string | null
  phone: string | null
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ClinicAvailability {
  id: string
  clinicId: string
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startTime: string // HH:MM
  endTime: string // HH:MM
}

export interface Appointment {
  id: string
  clinicId: string
  customerId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  createdAt: Date
}
