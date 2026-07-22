import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_ENABLED_KEY = 'self-care-reminders-enabled';

/**
 * Returns the user's saved reminder preference.
 *
 * Reminders are enabled by default when the user has never
 * changed the setting.
 */
export async function getRemindersEnabled(): Promise<boolean> {
  try {
    const storedValue = await AsyncStorage.getItem(
      REMINDERS_ENABLED_KEY,
    );

    if (storedValue === null) {
      return true;
    }

    return storedValue === 'true';
  } catch (error) {
    console.error(
      'Failed to retrieve reminder preference:',
      error,
    );

    return true;
  }
}

/**
 * Saves the user's reminder preference.
 */
export async function setRemindersEnabled(
  enabled: boolean,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      REMINDERS_ENABLED_KEY,
      enabled.toString(),
    );
  } catch (error) {
    console.error(
      'Failed to save reminder preference:',
      error,
    );

    throw error;
  }
}