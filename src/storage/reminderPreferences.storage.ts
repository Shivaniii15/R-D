import AsyncStorage from '@react-native-async-storage/async-storage';

const REMINDERS_ENABLED_KEY = 'self-care-reminders-enabled';
const REMINDER_HOUR_KEY = 'self-care-reminder-hour';
const REMINDER_MINUTE_KEY = 'self-care-reminder-minute';

export interface ReminderTime {
  hour: number;
  minute: number;
}

const DEFAULT_REMINDER_TIME: ReminderTime = {
  hour: 20,
  minute: 0,
};

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

export async function getReminderTime(): Promise<ReminderTime> {
  try {
    const [storedHour, storedMinute] = await Promise.all([
      AsyncStorage.getItem(REMINDER_HOUR_KEY),
      AsyncStorage.getItem(REMINDER_MINUTE_KEY),
    ]);

    if (
      storedHour === null ||
      storedMinute === null
    ) {
      return DEFAULT_REMINDER_TIME;
    }

    const hour = Number(storedHour);
    const minute = Number(storedMinute);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return DEFAULT_REMINDER_TIME;
    }

    return {
      hour,
      minute,
    };
  } catch (error) {
    console.error(
      'Failed to retrieve reminder time:',
      error,
    );

    return DEFAULT_REMINDER_TIME;
  }
}

export async function setReminderTime(
  time: ReminderTime,
): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(
        REMINDER_HOUR_KEY,
        time.hour.toString(),
      ),
      AsyncStorage.setItem(
        REMINDER_MINUTE_KEY,
        time.minute.toString(),
      ),
    ]);
  } catch (error) {
    console.error(
      'Failed to save reminder time:',
      error,
    );

    throw error;
  }
}