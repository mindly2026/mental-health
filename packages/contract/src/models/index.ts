export interface User {
  id: string
  email: string
  name: string
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
