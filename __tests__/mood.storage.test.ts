import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  logMoodEntry,
  getMoodEntries,
  getTodaysMood,
} from '../src/storage/mood.storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

// Test 1: logging a mood entry and retrieving it
test('logs a mood entry and retrieves the daily average', async () => {
  const result = await logMoodEntry(4);

  expect(result.success).toBe(true);

  const entries = await getMoodEntries();
  expect(entries).toHaveLength(1);
  expect(entries[0].mood).toBe(4);
});

// Test 2: blocks a second log within the cooldown period
test('blocks logging again within the 1 hour cooldown', async () => {
  await logMoodEntry(3);
  const result = await logMoodEntry(5);

  expect(result.success).toBe(false);
  expect(result.reason).toBe('cooldown');
  expect(result.cooldownMinutesLeft).toBeGreaterThan(0);
});

// Test 3: getTodaysMood returns null when nothing has been logged today
test('getTodaysMood returns null when no entry exists for today', async () => {
  const todaysMood = await getTodaysMood();
  expect(todaysMood).toBeNull();
});