import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import {
  getActivityReminderTime,
  getActivityRemindersEnabled,
} from '../storage/activityReminder.storage';

import {
  setupNotifications,
} from './notification.service';

const ACTIVITY_CHANNEL_ID =
  'physical-activity-reminders';

const ACTIVITY_NOTIFICATION_ID =
  'daily-physical-activity-reminder';

async function createActivityChannel(): Promise<void> {
  await notifee.createChannel({
    id: ACTIVITY_CHANNEL_ID,
    name: 'Physical Activity Reminders',
    description:
      'Daily reminders encouraging short physical activity.',
    importance: AndroidImportance.HIGH,
  });
}

async function hasExactAlarmPermission(): Promise<boolean> {
  const settings =
    await notifee.getNotificationSettings();

  const alarmSetting =
    settings.android?.alarm;

  return (
    alarmSetting === undefined ||
    alarmSetting ===
      AndroidNotificationSetting.NOT_SUPPORTED ||
    alarmSetting ===
      AndroidNotificationSetting.ENABLED
  );
}

export async function openActivityAlarmPermissionSettings(): Promise<void> {
  await notifee.openAlarmPermissionSettings();
}

export async function cancelActivityReminder(): Promise<void> {
  try {
    await notifee.cancelTriggerNotification(
      ACTIVITY_NOTIFICATION_ID,
    );
  } catch (error) {
    console.log(
      'Failed to cancel physical activity reminder:',
      error,
    );

    throw error;
  }
}

async function getNextActivityTimestamp(): Promise<number> {
  const savedTime =
    await getActivityReminderTime();

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

export interface ActivityReminderUpdateResult {
  scheduled: boolean;
  permissionRequired: boolean;
}

export async function updateActivityReminder(): Promise<ActivityReminderUpdateResult> {
  try {
    const enabled =
      await getActivityRemindersEnabled();

    if (!enabled) {
      await cancelActivityReminder();

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

    const alarmPermissionGranted =
      await hasExactAlarmPermission();

    if (!alarmPermissionGranted) {
      return {
        scheduled: false,
        permissionRequired: true,
      };
    }

    await createActivityChannel();
    await cancelActivityReminder();

    const timestamp =
      await getNextActivityTimestamp();

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: ACTIVITY_NOTIFICATION_ID,
        title: 'Time for a movement break',
        body:
          'A short walk or stretch may help improve your mood.',
        data: {
          notificationType:
            'physical-activity-reminder',
        },
        android: {
          channelId: ACTIVITY_CHANNEL_ID,
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

    return {
      scheduled: triggerIds.includes(
        ACTIVITY_NOTIFICATION_ID,
      ),
      permissionRequired: false,
    };
  } catch (error) {
    console.log(
      'Failed to update physical activity reminder:',
      error,
    );

    return {
      scheduled: false,
      permissionRequired: false,
    };
  }
}