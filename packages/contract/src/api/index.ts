import type { User, MoodEntry } from '../models/index.js'

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

export interface LoginResponse {
  token: string
  user: Omit<User, 'createdAt' | 'updatedAt'>
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

// Mood
export interface CreateMoodEntryRequest {
  score: number
  note?: string | undefined
}

export type MoodEntryResponse = ApiResponse<MoodEntry>
export type MoodEntriesResponse = ApiResponse<MoodEntry[]>
