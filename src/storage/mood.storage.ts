import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MoodEntry,
} from '../types/mood.types';

import {
  getLocalDateString,
} from '../utils/date.utils';

const STORAGE_KEY =
  'mood_entries';

export interface WeeklyAverage {
  label: string;
  average: number;
}

/**
 * Get every individual mood entry.
 */
export async function getMoodEntries():
  Promise<MoodEntry[]> {
  try {
    const data =
      await AsyncStorage.getItem(
        STORAGE_KEY,
      );

    return data
      ? JSON.parse(data)
      : [];
  } catch {
    return [];
  }
}

/**
 * Save a new individual mood entry.
 *
 * Existing entries from the same day
 * are NOT removed because users can
 * log their mood multiple times per day.
 */
export async function saveMoodEntry(
  entry: MoodEntry,
): Promise<void> {
  try {
    const existing =
      await getMoodEntries();

    const newEntry: MoodEntry = {
      ...entry,

      timestamp:
        entry.timestamp ??
        new Date().toISOString(),
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
    console.error(
      'Failed to save mood entry',
    );
  }
}

/**
 * Returns the latest mood logged today.
 *
 * Uses the device's LOCAL date rather
 * than the UTC date.
 */
export async function getTodaysMood():
  Promise<number | null> {
  const today =
    getLocalDateString();

  const entries =
    await getMoodEntries();

  /*
   * New mood entries are inserted at
   * the beginning of the array, so the
   * first matching entry is today's
   * latest mood.
   */
  const latestTodayEntry =
    entries.find(
      entry =>
        entry.date === today,
    );

  return latestTodayEntry
    ? latestTodayEntry.mood
    : null;
}

/**
 * Calculate the arithmetic mean of
 * an array of mood values.
 */
function calculateAverage(
  moods: number[],
): number {
  if (moods.length === 0) {
    return 0;
  }

  const total = moods.reduce(
    (sum, mood) =>
      sum + mood,
    0,
  );

  return total / moods.length;
}

/**
 * Returns one mood value for each day.
 *
 * If multiple moods were logged on the
 * same day, their average is returned.
 *
 * Example:
 *
 * 2, 4, 5
 *
 * (2 + 4 + 5) / 3 = 3.7
 */
export async function getMoodsByDays(
  days: number,
): Promise<MoodEntry[]> {
  const entries =
    await getMoodEntries();

  const result: MoodEntry[] = [];

  for (
    let i = days - 1;
    i >= 0;
    i--
  ) {
    const date = new Date();

    date.setDate(
      date.getDate() - i,
    );

    /*
     * IMPORTANT:
     *
     * Use the device's local calendar
     * date instead of toISOString().
     */
    const dateStr =
      getLocalDateString(date);

    const dailyEntries =
      entries.filter(
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
              dailyAverage.toFixed(
                1,
              ),
            )
          : 0,
    });
  }

  return result;
}

/**
 * Calculate weekly averages.
 *
 * Each day's mood logs are averaged
 * first. Those daily averages are then
 * used to calculate the week's average.
 *
 * This prevents a day with many mood
 * entries from receiving more weight
 * than another day.
 */
export async function getWeeklyAverages(
  weeks: number,
): Promise<WeeklyAverage[]> {
  const entries =
    await getMoodEntries();

  const result: WeeklyAverage[] =
    [];

  for (
    let w = weeks - 1;
    w >= 0;
    w--
  ) {
    const dailyAverages:
      number[] = [];

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

      /*
       * Again, use the local calendar
       * date rather than UTC.
       */
      const dateStr =
        getLocalDateString(date);

      const dailyEntries =
        entries.filter(
          entry =>
            entry.date ===
              dateStr &&
            entry.mood > 0,
        );

      if (
        dailyEntries.length > 0
      ) {
        const dailyAverage =
          calculateAverage(
            dailyEntries.map(
              entry =>
                entry.mood,
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

    const startDate =
      new Date();

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
          weeklyAverage.toFixed(
            1,
          ),
        ),
    });
  }

  return result;
}