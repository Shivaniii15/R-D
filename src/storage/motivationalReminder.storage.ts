import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY =
  'motivational-reminders-enabled';

const INACTIVITY_DAYS_KEY =
  'motivational-inactivity-days';

const LAST_ACTIVE_KEY =
  'motivational-last-active';

export async function getMotivationalRemindersEnabled(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(
      ENABLED_KEY,
    );

    if (value === null) {
      return false;
    }

    return value === 'true';
  } catch {
    return false;
  }
}

export async function setMotivationalRemindersEnabled(
  enabled: boolean,
): Promise<void> {
  await AsyncStorage.setItem(
    ENABLED_KEY,
    enabled.toString(),
  );
}

export async function getInactivityDays(): Promise<number> {
  try {
    const value = await AsyncStorage.getItem(
      INACTIVITY_DAYS_KEY,
    );

    if (value === null) {
      return 2;
    }

    return Number(value);
  } catch {
    return 2;
  }
}

export async function setInactivityDays(
  days: number,
): Promise<void> {
  await AsyncStorage.setItem(
    INACTIVITY_DAYS_KEY,
    days.toString(),
  );
}

export async function updateLastActiveTime(): Promise<void> {
  await AsyncStorage.setItem(
    LAST_ACTIVE_KEY,
    Date.now().toString(),
  );
}

export async function getLastActiveTime(): Promise<number> {
  const value = await AsyncStorage.getItem(
    LAST_ACTIVE_KEY,
  );

  if (value === null) {
    return Date.now();
  }

  return Number(value);
}