import AsyncStorage from '@react-native-async-storage/async-storage';
import { Journal } from '../types/journal.types';

const STORAGE_KEY = 'journals';

export async function getJournals(): Promise<Journal[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveJournal(journal: Journal): Promise<void> {
  try {
    const existing = await getJournals();
    const updated = [journal, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    console.error('Failed to save journal');
  }
}

export async function deleteJournal(id: string): Promise<void> {
  try {
    const existing = await getJournals();
    const updated = existing.filter(j => j.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    console.error('Failed to delete journal');
  }
}
