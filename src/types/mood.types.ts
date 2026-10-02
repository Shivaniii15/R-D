export interface MoodLog {
  id: string;        // unique per log
  date: string;      // YYYY-MM-DD
  timestamp: string; // ISO datetime
  mood: number;      // 1-5
}

export interface MoodEntry {
  date: string; // YYYY-MM-DD
  mood: number; // daily average, 1-5
}