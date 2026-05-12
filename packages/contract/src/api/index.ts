import type { MoodEntry } from '../models/index.js'

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
}

export interface LoginResponse {
  token: string
  user: { id: string; email: string; name: string; avatarUrl: string | null }
}

// Mood
export interface CreateMoodEntryRequest {
  score: number
  note?: string | undefined
}

export type MoodEntryResponse = ApiResponse<MoodEntry>
export type MoodEntriesResponse = ApiResponse<MoodEntry[]>
