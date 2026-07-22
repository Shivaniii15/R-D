import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import { getTodaysMood } from '../storage/mood.storage';
import { getRemindersEnabled } from '../storage/reminderPreferences.storage';

const MOOD_CHANNEL_ID = 'mood-reminders';
const MOOD_REMINDER_ID = 'daily-mood-reminder';

const REMINDER_HOUR = 20; // 8:00 PM
const REMINDER_MINUTE = 0;

/**
 * Requests notification permission and creates the Android
 * notification channel.
 */
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

/**
 * Cancels the pending daily mood reminder.
 */
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

/**
 * Calculates the timestamp for the next 8:00 PM.
 */
function getNextReminderTime(): number {
  const now = new Date();

  const reminderTime = new Date();
  reminderTime.setHours(
    REMINDER_HOUR,
    REMINDER_MINUTE,
    0,
    0,
  );

  /*
   * If 8:00 PM has already passed today, schedule the
   * reminder for 8:00 PM tomorrow.
   */
  if (reminderTime.getTime() <= now.getTime()) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  return reminderTime.getTime();
}

/**
 * Checks the user's reminder preference and today's mood,
 * then either schedules or cancels the reminder.
 */
export async function updateMoodReminder(): Promise<boolean> {
  try {
    const remindersEnabled =
      await getRemindersEnabled();

    /*
     * Cancel any pending notification when the user has
     * disabled reminders.
     */
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

    /*
     * Remove the existing trigger before creating another
     * one so duplicate reminders cannot be scheduled.
     */
    await cancelMoodReminder();

    const todaysMood = await getTodaysMood();

    /*
     * Do not schedule a reminder when today's mood has
     * already been recorded.
     */
    if (todaysMood !== null) {
      console.log(
        'Mood already logged. No reminder scheduled.',
      );

      return false;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: getNextReminderTime(),
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
      'Mood reminder scheduled for the next 8:00 PM.',
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