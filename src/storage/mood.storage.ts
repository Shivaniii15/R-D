import AsyncStorage from '@react-native-async-storage/async-storage';

import { MoodEntry } from '../types/mood.types';
import { getLocalDateString } from '../utils/date.utils';

const STORAGE_KEY = 'mood_entries';

const WIDGET_LAST_LOG_KEY = 'widget_last_mood_log';
const WIDGET_COOLDOWN_MS = 30_000;

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

export async function getTodaysMood(): Promise<number | null> {
  const today = getLocalDateString();

  const entries = await getMoodEntries();

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

    const dateStr =
      getLocalDateString(date);

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

  for (let w = weeks - 1; w >= 0; w--) {
    const dailyAverages: number[] = [];

    for (let d = 6; d >= 0; d--) {
      const date = new Date();

      date.setDate(
        date.getDate() - w * 7 - d,
      );

      const dateStr =
        getLocalDateString(date);

      const dailyEntries = entries.filter(
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
      average: parseFloat(
        weeklyAverage.toFixed(1),
      ),
    });
  }

  return result;
}

/**
 * Records when a mood was successfully logged
 * from the Android home-screen widget.
 */
export async function setWidgetLastLogTime(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      WIDGET_LAST_LOG_KEY,
      Date.now().toString(),
    );
  } catch {
    console.error(
      'Failed to save widget mood log time',
    );
  }
}

/**
 * Returns true when the user has logged a mood
 * from the widget within the last 30 seconds.
 */
export async function isWidgetMoodOnCooldown(): Promise<boolean> {
  try {
    const storedTime =
      await AsyncStorage.getItem(
        WIDGET_LAST_LOG_KEY,
      );

    if (!storedTime) {
      return false;
    }

    const lastLogTime =
      Number(storedTime);

    if (!Number.isFinite(lastLogTime)) {
      return false;
    }

    const elapsedTime =
      Date.now() - lastLogTime;

    return (
      elapsedTime <
      WIDGET_COOLDOWN_MS
    );
  } catch {
    return false;
  }
}