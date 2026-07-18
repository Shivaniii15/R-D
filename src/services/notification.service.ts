import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import { getTodaysMood } from '../storage/mood.storage';

const MOOD_CHANNEL_ID = 'mood-reminders';
const MOOD_REMINDER_ID = 'daily-mood-reminder';
const REMINDER_HOUR = 20; // 8:00 PM
const REMINDER_MINUTE = 0;

export async function setupNotifications(): Promise<boolean> {
  const settings = await notifee.requestPermission();

  const permissionGranted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

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
}

export async function cancelMoodReminder(): Promise<void> {
  await notifee.cancelTriggerNotification(MOOD_REMINDER_ID);
}

function getNextReminderTime(): number {
  const now = new Date();

  const reminderTime = new Date();
  reminderTime.setHours(REMINDER_HOUR, REMINDER_MINUTE, 0, 0);

  /*
   * When 8:00 PM has already passed, schedule the next reminder
   * for 8:00 PM tomorrow.
   */
  if (reminderTime.getTime() <= now.getTime()) {
    reminderTime.setDate(reminderTime.getDate() + 1);
  }

  return reminderTime.getTime();
}

export async function updateMoodReminder(): Promise<boolean> {
  const notificationsReady = await setupNotifications();

  if (!notificationsReady) {
    return false;
  }

  /*
   * Remove the existing trigger first so that duplicate reminders
   * cannot be scheduled.
   */
  await cancelMoodReminder();

  const todaysMood = await getTodaysMood();

  /*
   * Do not schedule a reminder when today's mood has already
   * been recorded.
   */
  if (todaysMood !== null) {
    console.log('Mood already logged. No reminder scheduled.');
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

  console.log('Mood reminder scheduled for the next 8:00 PM.');
  return true;
}