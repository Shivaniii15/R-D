import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types/mood.types';

const STORAGE_KEY = 'mood_entries';

export interface WeeklyAverage {
  label: string;
  average: number;
}

export async function getMoodEntries(): Promise<MoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveMoodEntry(
  entry: MoodEntry,
): Promise<void> {
  try {
    const existing = await getMoodEntries();

    const newEntry: MoodEntry = {
      ...entry,
      timestamp:
        entry.timestamp ?? new Date().toISOString(),
    };

    // Keep all previous mood logs.
    // Users can now log multiple moods on the same day.
    const updated = [
      newEntry,
      ...existing,
    ];

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updated),
    );
  } catch {
    console.error('Failed to save mood entry');
  }
}

export async function getTodaysMood():
  Promise<number | null> {
  const today = new Date()
    .toISOString()
    .split('T')[0];

  const entries = await getMoodEntries();

  // New entries are inserted first,
  // so this returns the latest mood logged today.
  const latestTodayEntry = entries.find(
    entry => entry.date === today,
  );

  return latestTodayEntry
    ? latestTodayEntry.mood
    : null;
}

function calculateAverage(
  moods: number[],
): number {
  if (moods.length === 0) {
    return 0;
  }

  const total = moods.reduce(
    (sum, mood) => sum + mood,
    0,
  );

  return total / moods.length;
}

export async function getMoodsByDays(
  days: number,
): Promise<MoodEntry[]> {
  const entries = await getMoodEntries();
  const result: MoodEntry[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();

    date.setDate(
      date.getDate() - i,
    );

    const dateStr = date
      .toISOString()
      .split('T')[0];

    const dailyEntries = entries.filter(
      entry =>
        entry.date === dateStr &&
        entry.mood > 0,
    );

    const dailyAverage =
      calculateAverage(
        dailyEntries.map(
          entry => entry.mood,
        ),
      );

    result.push({
      date: dateStr,
      mood:
        dailyEntries.length > 0
          ? parseFloat(
              dailyAverage.toFixed(1),
            )
          : 0,
    });
  }

  return result;
}

export async function getWeeklyAverages(
  weeks: number,
): Promise<WeeklyAverage[]> {
  const entries = await getMoodEntries();
  const result: WeeklyAverage[] = [];

  for (
    let w = weeks - 1;
    w >= 0;
    w--
  ) {
    const dailyAverages: number[] = [];

    for (
      let d = 6;
      d >= 0;
      d--
    ) {
      const date = new Date();

      date.setDate(
        date.getDate() -
          w * 7 -
          d,
      );

      const dateStr = date
        .toISOString()
        .split('T')[0];

      const dailyEntries =
        entries.filter(
          entry =>
            entry.date === dateStr &&
            entry.mood > 0,
        );

      if (dailyEntries.length > 0) {
        const dailyAverage =
          calculateAverage(
            dailyEntries.map(
              entry => entry.mood,
            ),
          );

        dailyAverages.push(
          dailyAverage,
        );
      }
    }

    const weeklyAverage =
      calculateAverage(
        dailyAverages,
      );

    const startDate = new Date();

    startDate.setDate(
      startDate.getDate() -
        w * 7 -
        6,
    );

    const label =
      `${startDate.getMonth() + 1}/` +
      `${startDate.getDate()}`;

    result.push({
      label,
      average:
        parseFloat(
          weeklyAverage.toFixed(1),
        ),
    });
  }

  return result;
}