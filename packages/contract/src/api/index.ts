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

// OAuth
export type * from './oauth.js'

// Mood
export interface CreateMoodEntryRequest {
  score: number
  note?: string | undefined
}

export type MoodEntryResponse = ApiResponse<MoodEntry>
export type MoodEntriesResponse = ApiResponse<MoodEntry[]>
