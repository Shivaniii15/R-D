import AsyncStorage from '@react-native-async-storage/async-storage';

const COMPLETION_KEY_PREFIX = 'self-care-reminder-completed';

function getTodayDateKey(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getTodayStorageKey(): string {
  return `${COMPLETION_KEY_PREFIX}-${getTodayDateKey()}`;
}

/**
 * Returns whether today's reminder has been completed.
 */
export async function getTodaysReminderCompleted(): Promise<boolean> {
  try {
    const storedValue = await AsyncStorage.getItem(
      getTodayStorageKey(),
    );

    return storedValue === 'true';
  } catch (error) {
    console.error(
      "Failed to retrieve today's reminder completion:",
      error,
    );

    return false;
  }
}

/**
 * Records today's reminder as completed.
 */
export async function markTodaysReminderCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(
      getTodayStorageKey(),
      'true',
    );
  } catch (error) {
    console.error(
      "Failed to save today's reminder completion:",
      error,
    );

    throw error;
  }
}