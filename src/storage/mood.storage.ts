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

export async function getWeekMoods(): Promise<MoodEntry[]> {
  const entries = await getMoodEntries();
  const result: MoodEntry[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === dateStr);
    result.push({ date: dateStr, mood: entry ? entry.mood : 0 });
  }
  return result;
}
