import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types/mood.types';

const STORAGE_KEY = 'mood_entries';

export async function getMoodEntries(): Promise<MoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveMoodEntry(entry: MoodEntry): Promise<void> {
  try {
    const existing = await getMoodEntries();
    const filtered = existing.filter(e => e.date !== entry.date);
    const updated = [entry, ...filtered];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    console.error('Failed to save mood entry');
  }
}

export async function getTodaysMood(): Promise<number | null> {
  const today = new Date().toISOString().split('T')[0];
  const entries = await getMoodEntries();
  const todayEntry = entries.find(e => e.date === today);
  return todayEntry ? todayEntry.mood : null;
}

export async function getMoodsByDays(days: number): Promise<MoodEntry[]> {
  const entries = await getMoodEntries();
  const result: MoodEntry[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    result.push({ date: dateStr, mood: entry ? entry.mood : 0 });
  }
  return result;
}

export interface WeeklyAverage {
  label: string;
  average: number;
}

export async function getWeeklyAverages(weeks: number): Promise<WeeklyAverage[]> {
  const entries = await getMoodEntries();
  const result: WeeklyAverage[] = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const weekEntries: number[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - w * 7 - d);
      const dateStr = date.toISOString().split('T')[0];
      const entry = entries.find(e => e.date === dateStr);
      if (entry && entry.mood > 0) {
        weekEntries.push(entry.mood);
      }
    }
    const avg = weekEntries.length > 0
      ? weekEntries.reduce((s, v) => s + v, 0) / weekEntries.length
      : 0;

    // Label as the start date of the week
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - w * 7 - 6);
    const label = `${startDate.getMonth() + 1}/${startDate.getDate()}`;

    result.push({ label, average: parseFloat(avg.toFixed(1)) });
  }

  return result;
}