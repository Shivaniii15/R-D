import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import {
  getSleepReminderTime,
  getSleepRemindersEnabled,
} from '../storage/sleepReminder.storage';

import {
  setupNotifications,
} from './notification.service';

const SLEEP_CHANNEL_ID = 'sleep-reminders';
const SLEEP_NOTIFICATION_ID = 'daily-sleep-reminder';

async function createSleepNotificationChannel(): Promise<void> {
  await notifee.createChannel({
    id: SLEEP_CHANNEL_ID,
    name: 'Sleep Reminders',
    description:
      'Daily reminders to go to sleep at your selected bedtime.',
    importance: AndroidImportance.HIGH,
  });
}

async function hasExactAlarmPermission(): Promise<boolean> {
  const settings =
    await notifee.getNotificationSettings();

  const alarmSetting =
    settings.android?.alarm;

  if (
    alarmSetting === undefined ||
    alarmSetting ===
      AndroidNotificationSetting.NOT_SUPPORTED ||
    alarmSetting ===
      AndroidNotificationSetting.ENABLED
  ) {
    return true;
  }

  return false;
}

export async function openSleepAlarmPermissionSettings(): Promise<void> {
  await notifee.openAlarmPermissionSettings();
}

export async function cancelSleepReminder(): Promise<void> {
  try {
    await notifee.cancelTriggerNotification(
      SLEEP_NOTIFICATION_ID,
    );

    console.log(
      'Sleep reminder trigger cancelled.',
    );
  } catch (error) {
    console.log(
      'Failed to cancel sleep reminder:',
      error,
    );

    throw error;
  }
}

async function getNextSleepReminderTimestamp(): Promise<number> {
  const savedTime =
    await getSleepReminderTime();

  const now = new Date();
  const reminderDate = new Date();

  reminderDate.setHours(
    savedTime.hour,
    savedTime.minute,
    0,
    0,
  );

  if (
    reminderDate.getTime() <=
    now.getTime()
  ) {
    reminderDate.setDate(
      reminderDate.getDate() + 1,
    );
  }

  return reminderDate.getTime();
}

export interface SleepReminderUpdateResult {
  scheduled: boolean;
  permissionRequired: boolean;
}

export async function updateSleepReminder(): Promise<SleepReminderUpdateResult> {
  try {
    const enabled =
      await getSleepRemindersEnabled();

    if (!enabled) {
      await cancelSleepReminder();

      return {
        scheduled: false,
        permissionRequired: false,
      };
    }

    const notificationsReady =
      await setupNotifications();

    if (!notificationsReady) {
      return {
        scheduled: false,
        permissionRequired: false,
      };
    }

    const exactAlarmPermissionGranted =
      await hasExactAlarmPermission();

    if (!exactAlarmPermissionGranted) {
      return {
        scheduled: false,
        permissionRequired: true,
      };
    }

    await createSleepNotificationChannel();

    await cancelSleepReminder();

    const reminderTimestamp =
      await getNextSleepReminderTimestamp();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: reminderTimestamp,
      repeatFrequency:
        RepeatFrequency.DAILY,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: SLEEP_NOTIFICATION_ID,
        title: 'Time to go to sleep',
        body:
          'Your scheduled bedtime has arrived. Start winding down and get ready for sleep.',
        data: {
          notificationType:
            'sleep-reminder',
        },
        android: {
          channelId: SLEEP_CHANNEL_ID,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );

    const triggerIds =
      await notifee.getTriggerNotificationIds();

    const wasScheduled =
      triggerIds.includes(
        SLEEP_NOTIFICATION_ID,
      );

    console.log(
      'Scheduled notification IDs:',
      triggerIds,
    );

    console.log(
      'Sleep reminder time:',
      new Date(
        reminderTimestamp,
      ).toLocaleString(),
    );

    return {
      scheduled: wasScheduled,
      permissionRequired: false,
    };
  } catch (error) {
    console.log(
      'Failed to update sleep reminder:',
      error,
    );

    return {
      scheduled: false,
      permissionRequired: false,
    };
  }
}