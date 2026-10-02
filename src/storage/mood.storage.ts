import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, MoodLog } from '../types/mood.types';

const LOGS_KEY = 'mood_logs';
const ENTRIES_KEY = 'mood_entries';

const MAX_LOGS_PER_DAY = 3;
const COOLDOWN_MINUTES = 60;

// ─── Raw logs (multiple per day) ─────────────────────────────────────────────

export async function getMoodLogs(): Promise<MoodLog[]> {
  try {
    const data = await AsyncStorage.getItem(LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getTodaysLogs(): Promise<MoodLog[]> {
  const today = new Date().toISOString().split('T')[0];
  const logs = await getMoodLogs();
  return logs.filter(l => l.date === today);
}

export interface LogMoodResult {
  success: boolean;
  reason?: 'max_reached' | 'cooldown';
  cooldownMinutesLeft?: number;
}

export async function logMoodEntry(mood: number): Promise<LogMoodResult> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const todaysLogs = await getTodaysLogs();

  // Check max per day
  if (todaysLogs.length >= MAX_LOGS_PER_DAY) {
    return { success: false, reason: 'max_reached' };
  }

  // Check cooldown from last log
  if (todaysLogs.length > 0) {
    const lastLog = todaysLogs.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )[0];
    const minutesSinceLast =
      (now.getTime() - new Date(lastLog.timestamp).getTime()) / 60000;

    if (minutesSinceLast < COOLDOWN_MINUTES) {
      return {
        success: false,
        reason: 'cooldown',
        cooldownMinutesLeft: Math.ceil(COOLDOWN_MINUTES - minutesSinceLast),
      };
    }
  }

  const newLog: MoodLog = {
    id: now.getTime().toString(),
    date: today,
    timestamp: now.toISOString(),
    mood,
  };

  const allLogs = await getMoodLogs();
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify([newLog, ...allLogs]));

  // Recalculate and save the daily average for graphs/history
  const updatedTodaysLogs = [...todaysLogs, newLog];
  const avg = Math.round(
    updatedTodaysLogs.reduce((sum, l) => sum + l.mood, 0) / updatedTodaysLogs.length,
  );
  await saveDailyAverage({ date: today, mood: avg });

  return { success: true };
}

async function saveDailyAverage(entry: MoodEntry): Promise<void> {
  try {
    const existing = await getMoodEntries();
    const filtered = existing.filter(e => e.date !== entry.date);
    const updated = [entry, ...filtered];
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(updated));
  } catch {
    console.error('Failed to save daily average');
  }
}

// ─── Daily averages (for graphs & history) ───────────────────────────────────

export async function getMoodEntries(): Promise<MoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem(ENTRIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function getTodaysMood(): Promise<number | null> {
  const today = new Date().toISOString().split('T')[0];
  const entries = await getMoodEntries();
  const todayEntry = entries.find(e => e.date === today);
  return todayEntry ? todayEntry.mood : null;
}

export async function getTodayStatus(): Promise<{
  logsCount: number;
  canLog: boolean;
  cooldownMinutesLeft: number;
  latestMood: number | null;
}> {
  const todaysLogs = await getTodaysLogs();
  const sorted = [...todaysLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
  const lastLog = sorted[0] ?? null;
  const now = new Date();

  const minutesSinceLast = lastLog
    ? (now.getTime() - new Date(lastLog.timestamp).getTime()) / 60000
    : COOLDOWN_MINUTES + 1;

  const cooldownMinutesLeft = Math.max(0, Math.ceil(COOLDOWN_MINUTES - minutesSinceLast));
  const canLog =
    todaysLogs.length < MAX_LOGS_PER_DAY && minutesSinceLast >= COOLDOWN_MINUTES;

  return {
    logsCount: todaysLogs.length,
    canLog,
    cooldownMinutesLeft,
    latestMood: lastLog ? lastLog.mood : null,
  };
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
    const avg =
      weekEntries.length > 0
        ? weekEntries.reduce((s, v) => s + v, 0) / weekEntries.length
        : 0;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - w * 7 - 6);
    const label = `${startDate.getMonth() + 1}/${startDate.getDate()}`;

    result.push({ label, average: parseFloat(avg.toFixed(1)) });
  }

  return result;
}