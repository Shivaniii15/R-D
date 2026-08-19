import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVITY_ENABLED_KEY =
  'physical-activity-reminders-enabled';

const ACTIVITY_HOUR_KEY =
  'physical-activity-reminder-hour';

const ACTIVITY_MINUTE_KEY =
  'physical-activity-reminder-minute';

export interface ActivityReminderTime {
  hour: number;
  minute: number;
}

const DEFAULT_ACTIVITY_TIME: ActivityReminderTime = {
  hour: 17,
  minute: 0,
};

export async function getActivityRemindersEnabled(): Promise<boolean> {
  try {
    const storedValue = await AsyncStorage.getItem(
      ACTIVITY_ENABLED_KEY,
    );

    if (storedValue === null) {
      return false;
    }

    return storedValue === 'true';
  } catch (error) {
    console.log(
      'Failed to load physical activity reminder preference:',
      error,
    );

    return false;
  }
}

export async function setActivityRemindersEnabled(
  enabled: boolean,
): Promise<void> {
  await AsyncStorage.setItem(
    ACTIVITY_ENABLED_KEY,
    enabled.toString(),
  );
}

export async function getActivityReminderTime(): Promise<ActivityReminderTime> {
  try {
    const [storedHour, storedMinute] =
      await Promise.all([
        AsyncStorage.getItem(ACTIVITY_HOUR_KEY),
        AsyncStorage.getItem(ACTIVITY_MINUTE_KEY),
      ]);

    if (
      storedHour === null ||
      storedMinute === null
    ) {
      return DEFAULT_ACTIVITY_TIME;
    }

    const hour = Number(storedHour);
    const minute = Number(storedMinute);

    const invalidTime =
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59;

    if (invalidTime) {
      return DEFAULT_ACTIVITY_TIME;
    }

    return {
      hour,
      minute,
    };
  } catch (error) {
    console.log(
      'Failed to load physical activity reminder time:',
      error,
    );

    return DEFAULT_ACTIVITY_TIME;
  }
}

export async function setActivityReminderTime(
  time: ActivityReminderTime,
): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(
      ACTIVITY_HOUR_KEY,
      time.hour.toString(),
    ),

    AsyncStorage.setItem(
      ACTIVITY_MINUTE_KEY,
      time.minute.toString(),
    ),
  ]);
}