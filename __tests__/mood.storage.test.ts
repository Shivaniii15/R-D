import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveMoodEntry,
  getMoodEntries,
  getTodaysMood,
} from '../src/storage/mood.storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

// saving a mood entry and retrieving it

test('saves a mood entry and retrieves it', async () => {
  const entry = { date: '2025-01-01', mood: 4 };

  await saveMoodEntry(entry);
  const entries = await getMoodEntries();

  expect(entries).toHaveLength(1);
  expect(entries[0].date).toBe('2025-01-01');
  expect(entries[0].mood).toBe(4);
});

// getTodaysMood returns null when nothing logged today 

test('getTodaysMood returns null when no entry exists for today', async () => {
  // Save an entry for a past date only
  await saveMoodEntry({ date: '2020-01-01', mood: 3 });

  const todaysMood = await getTodaysMood();
  expect(todaysMood).toBeNull();
});