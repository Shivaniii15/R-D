import notifee, {
  AndroidImportance,
  AndroidNotificationSetting,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import {
  getInactivityDays,
  getLastActiveTime,
  getMotivationalRemindersEnabled,
} from '../storage/motivationalReminder.storage';

import {
  setupNotifications,
} from './notification.service';

const MOTIVATIONAL_CHANNEL_ID =
  'motivational-notifications';

const MOTIVATIONAL_NOTIFICATION_ID =
  'inactivity-motivational-notification';

const ONE_DAY_IN_MILLISECONDS =
  24 * 60 * 60 * 1000;

export interface MotivationalReminderUpdateResult {
  scheduled: boolean;
  permissionRequired: boolean;
}

/**
 * Creates the Android channel used by motivational notifications.
 */
async function createMotivationalChannel(): Promise<void> {
  await notifee.createChannel({
    id: MOTIVATIONAL_CHANNEL_ID,
    name: 'Motivational Notifications',
    description:
      'Encouraging notifications after a period of inactivity.',
    importance: AndroidImportance.HIGH,
  });
}

/**
 * Checks whether Android allows exact timestamp alarms.
 */
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

/**
 * Opens Android's Alarms & reminders permission page.
 */
export async function openMotivationalAlarmPermissionSettings(): Promise<void> {
  await notifee.openAlarmPermissionSettings();
}

/**
 * Cancels the currently scheduled motivational notification.
 */
export async function cancelMotivationalReminder(): Promise<void> {
  try {
    await notifee.cancelTriggerNotification(
      MOTIVATIONAL_NOTIFICATION_ID,
    );
  } catch (error) {
    console.log(
      'Failed to cancel motivational notification:',
      error,
    );

    throw error;
  }
}

/**
 * Calculates when the inactivity notification should appear.
 */
async function getMotivationalReminderTimestamp(): Promise<number> {
  const lastActiveTime =
    await getLastActiveTime();

  const inactivityDays =
    await getInactivityDays();

  return (
    lastActiveTime +
    inactivityDays *
      ONE_DAY_IN_MILLISECONDS
  );
}

/**
 * Schedules the motivational notification according to the
 * user's saved settings.
 *
 * This is a one-time notification. Each time the user returns
 * to the app, their activity time will be updated and this
 * notification will be rescheduled.
 */
export async function updateMotivationalReminder(): Promise<MotivationalReminderUpdateResult> {
  try {
    const enabled =
      await getMotivationalRemindersEnabled();

    if (!enabled) {
      await cancelMotivationalReminder();

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

    await createMotivationalChannel();

    /*
     * Cancel the previous schedule before creating a new one.
     * This prevents duplicate motivational notifications.
     */
    await cancelMotivationalReminder();

    let timestamp =
      await getMotivationalReminderTimestamp();

    /*
     * Prevent an invalid trigger if the saved time has
     * already passed.
     */
    if (timestamp <= Date.now()) {
      const inactivityDays =
        await getInactivityDays();

      timestamp =
        Date.now() +
        inactivityDays *
          ONE_DAY_IN_MILLISECONDS;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: MOTIVATIONAL_NOTIFICATION_ID,
        title: 'Keep going — you are making progress',
        body:
          'Take a moment to return and record how you are feeling today.',
        data: {
          notificationType:
            'motivational-reminder',
        },
        android: {
          channelId:
            MOTIVATIONAL_CHANNEL_ID,
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
        MOTIVATIONAL_NOTIFICATION_ID,
      );

    console.log(
      'Motivational notification scheduled for:',
      new Date(timestamp).toLocaleString(),
    );

    return {
      scheduled: wasScheduled,
      permissionRequired: false,
    };
  } catch (error) {
    console.log(
      'Failed to update motivational notification:',
      error,
    );

    return {
      scheduled: false,
      permissionRequired: false,
    };
  }
}