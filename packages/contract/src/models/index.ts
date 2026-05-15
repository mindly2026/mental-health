export interface User {
  id: string
  email: string
  name: string
  role: 'customer' | 'clinic' | 'doctor' | 'staff'
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

export interface DoctorAvailability {
  id: string
  memberId: string
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  startTime: string // HH:MM
  endTime: string // HH:MM
}

export interface Department {
  id: string
  clinicId: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ClinicMember {
  id: string
  clinicId: string
  userId: string
  role: 'doctor' | 'staff'
  departmentId: string | null
  status: 'pending' | 'active' | 'suspended'
  invitedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface ClinicMemberWithUser extends ClinicMember {
  userName: string
  userEmail: string
  departmentName: string | null
}

export interface ClinicWithMembership {
  clinicId: string
  clinicName: string
  memberRole: 'doctor' | 'staff'
  departmentId: string | null
  departmentName: string | null
  memberStatus: 'pending' | 'active' | 'suspended'
}

export interface DoctorPublicInfo {
  userId: string
  name: string
  memberId: string
  departmentId: string | null
  departmentName: string | null
}

export interface DoctorSearchResult {
  userId: string
  name: string
  clinics: Array<{
    clinicId: string
    clinicName: string
    memberId: string
    departmentId: string | null
    departmentName: string | null
  }>
}

export interface DepartmentSearchResult {
  departmentId: string
  name: string
  clinicId: string
  clinicName: string
}

export interface Appointment {
  id: string
  clinicId: string
  customerId: string
  doctorId: string | null
  departmentId: string | null
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  status: 'pending' | 'confirmed' | 'cancelled'
  notes: string | null
  createdAt: Date
}
