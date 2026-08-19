import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import { getTodaysMood } from '../storage/mood.storage';

import {
  getReminderTime,
  getRemindersEnabled,
} from '../storage/reminderPreferences.storage';

const MOOD_CHANNEL_ID = 'mood-reminders';
const MOOD_REMINDER_ID = 'daily-mood-reminder';

export async function setupNotifications(): Promise<boolean> {
  try {
    const settings = await notifee.requestPermission();

    const permissionGranted =
      settings.authorizationStatus ===
        AuthorizationStatus.AUTHORIZED ||
      settings.authorizationStatus ===
        AuthorizationStatus.PROVISIONAL;

    if (!permissionGranted) {
      console.log('Notification permission was not granted.');
      return false;
    }

    await notifee.createChannel({
      id: MOOD_CHANNEL_ID,
      name: 'Mood Reminders',
      description: 'Daily reminders to log your mood.',
      importance: AndroidImportance.HIGH,
    });

    return true;
  } catch (error) {
    console.error(
      'Failed to set up notifications:',
      error,
    );

    return false;
  }
}

export async function cancelMoodReminder(): Promise<void> {
  try {
    await notifee.cancelTriggerNotification(
      MOOD_REMINDER_ID,
    );

    console.log('Pending mood reminder cancelled.');
  } catch (error) {
    console.error(
      'Failed to cancel mood reminder:',
      error,
    );

    throw error;
  }
}

async function getNextReminderTime(): Promise<number> {
  const now = new Date();
  const savedTime = await getReminderTime();

  const reminderTime = new Date();

  reminderTime.setHours(
    savedTime.hour,
    savedTime.minute,
    0,
    0,
  );

  if (reminderTime.getTime() <= now.getTime()) {
    reminderTime.setDate(
      reminderTime.getDate() + 1,
    );
  }

  return reminderTime.getTime();
}

export async function updateMoodReminder(): Promise<boolean> {
  try {
    const remindersEnabled =
      await getRemindersEnabled();

    if (!remindersEnabled) {
      await cancelMoodReminder();

      console.log(
        'Self-care reminders are disabled. No reminder scheduled.',
      );

      return false;
    }

    const notificationsReady =
      await setupNotifications();

    if (!notificationsReady) {
      return false;
    }

    await cancelMoodReminder();

    const todaysMood = await getTodaysMood();

    if (todaysMood !== null) {
      console.log(
        'Mood already logged. No reminder scheduled.',
      );

      return false;
    }

    const reminderTimestamp =
      await getNextReminderTime();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTimestamp,
    };

    await notifee.createTriggerNotification(
      {
        id: MOOD_REMINDER_ID,
        title: 'You have not logged your mood today',
        body: 'Take a moment to record how you are feeling.',
        data: {
          screen: 'Home',
          notificationType: 'mood-reminder',
        },
        android: {
          channelId: MOOD_CHANNEL_ID,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );

    console.log(
      `Mood reminder scheduled for ${new Date(
        reminderTimestamp,
      ).toLocaleTimeString()}.`,
    );

    return true;
  } catch (error) {
    console.error(
      'Failed to update mood reminder:',
      error,
    );

    return false;
  }
}