export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: number; // 1-5

  // When this individual mood was logged.
  // Optional so older saved mood entries still work.
  timestamp?: string;
}