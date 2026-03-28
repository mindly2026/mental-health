import { eq, desc } from 'drizzle-orm'
import { db, moodEntries, type NewMoodEntry } from '@mental-health/db'
import type { CreateMoodEntryRequest } from '@mental-health/contract'
import type { MoodEntry } from '@mental-health/db'

export async function createMoodEntry(
  userId: string,
  input: CreateMoodEntryRequest,
): Promise<MoodEntry> {
  const [entry] = await db
    .insert(moodEntries)
    .values({
      userId,
      score: input.score,
      note: input.note,
    } satisfies NewMoodEntry)
    .returning()

  if (!entry) throw new Error('Failed to create mood entry')
  return entry
}

export async function getMoodEntriesByUser(userId: string): Promise<MoodEntry[]> {
  return db
    .select()
    .from(moodEntries)
    .where(eq(moodEntries.userId, userId))
    .orderBy(desc(moodEntries.createdAt))
}
