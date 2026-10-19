import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getJournals,
  saveJournal,
  updateJournal,
  deleteJournal,
} from '../src/storage/journal.storage';
import { Journal } from '../src/types/journal.types';

beforeEach(async () => {
  await AsyncStorage.clear();
});

// saving a journal and retrieving it

test('saves a journal and retrieves it', async () => {
  const journal: Journal = {
    id: '1',
    title: 'My First Entry',
    body: 'Today was a good day.',
    createdAt: '2025-01-01T10:00:00.000Z',
  };

  await saveJournal(journal);
  const journals = await getJournals();

  expect(journals).toHaveLength(1);
  expect(journals[0].id).toBe('1');
  expect(journals[0].title).toBe('My First Entry');
  expect(journals[0].body).toBe('Today was a good day.');
});

// updating a journal changes only that entry

test('updates a journal entry without affecting others', async () => {
  const journal1: Journal = {
    id: '1',
    title: 'Entry One',
    body: 'Original body.',
    createdAt: '2025-01-01T10:00:00.000Z',
  };
  const journal2: Journal = {
    id: '2',
    title: 'Entry Two',
    body: 'Another entry.',
    createdAt: '2025-01-02T10:00:00.000Z',
  };

  await saveJournal(journal1);
  await saveJournal(journal2);

  await updateJournal({ ...journal1, title: 'Updated Title', body: 'Updated body.' });

  const journals = await getJournals();
  const updated = journals.find(j => j.id === '1');
  const untouched = journals.find(j => j.id === '2');

  expect(updated?.title).toBe('Updated Title');
  expect(updated?.body).toBe('Updated body.');
  expect(untouched?.title).toBe('Entry Two');
});

// deleting a journal removes it from storage

test('deletes a journal and it no longer appears in the list', async () => {
  const journal: Journal = {
    id: '99',
    title: 'To Be Deleted',
    body: 'This should not persist.',
    createdAt: '2025-03-01T08:00:00.000Z',
  };

  await saveJournal(journal);
  await deleteJournal('99');

  const journals = await getJournals();
  expect(journals.find(j => j.id === '99')).toBeUndefined();
  expect(journals).toHaveLength(0);
});