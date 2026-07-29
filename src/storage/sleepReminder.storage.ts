import AsyncStorage from '@react-native-async-storage/async-storage';

const SLEEP_REMINDERS_ENABLED_KEY =
  'sleep-reminders-enabled';

const SLEEP_REMINDER_HOUR_KEY =
  'sleep-reminder-hour';

const SLEEP_REMINDER_MINUTE_KEY =
  'sleep-reminder-minute';

export interface SleepReminderTime {
  hour: number;
  minute: number;
}

const DEFAULT_SLEEP_TIME: SleepReminderTime = {
  hour: 22,
  minute: 0,
};

export async function getSleepRemindersEnabled(): Promise<boolean> {
  try {
    const storedValue = await AsyncStorage.getItem(
      SLEEP_REMINDERS_ENABLED_KEY,
    );

    /*
     * Sleep reminders are disabled by default until the
     * user chooses to enable them.
     */
    if (storedValue === null) {
      return false;
    }

    return storedValue === 'true';
  } catch (error) {
    console.error(
      'Failed to retrieve sleep reminder preference:',
      error,
    );

    return false;
  }
}

export async function setSleepRemindersEnabled(
  enabled: boolean,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      SLEEP_REMINDERS_ENABLED_KEY,
      enabled.toString(),
    );
  } catch (error) {
    console.error(
      'Failed to save sleep reminder preference:',
      error,
    );

    throw error;
  }
}

export async function getSleepReminderTime(): Promise<SleepReminderTime> {
  try {
    const [storedHour, storedMinute] =
      await Promise.all([
        AsyncStorage.getItem(
          SLEEP_REMINDER_HOUR_KEY,
        ),
        AsyncStorage.getItem(
          SLEEP_REMINDER_MINUTE_KEY,
        ),
      ]);

    if (
      storedHour === null ||
      storedMinute === null
    ) {
      return DEFAULT_SLEEP_TIME;
    }

    const hour = Number(storedHour);
    const minute = Number(storedMinute);

    const timeIsInvalid =
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59;

    if (timeIsInvalid) {
      return DEFAULT_SLEEP_TIME;
    }

    return {
      hour,
      minute,
    };
  } catch (error) {
    console.error(
      'Failed to retrieve sleep reminder time:',
      error,
    );

    return DEFAULT_SLEEP_TIME;
  }
}

export async function setSleepReminderTime(
  time: SleepReminderTime,
): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(
        SLEEP_REMINDER_HOUR_KEY,
        time.hour.toString(),
      ),

      AsyncStorage.setItem(
        SLEEP_REMINDER_MINUTE_KEY,
        time.minute.toString(),
      ),
    ]);
  } catch (error) {
    console.error(
      'Failed to save sleep reminder time:',
      error,
    );

    throw error;
  }
}