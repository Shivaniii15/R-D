import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import notifee, {
  EventType,
} from '@notifee/react-native';

import AppNavigator from './src/navigation/AppNavigator';

import {
  setupNotifications,
  updateMoodReminder,
} from './src/services/notification.service';

import {
  updateSleepReminder,
} from './src/services/sleepNotification.service';

export default function App(): React.JSX.Element {
  useEffect(() => {
    async function initialiseNotifications(): Promise<void> {
      try {
        const notificationsReady =
          await setupNotifications();

        if (!notificationsReady) {
          return;
        }

        const initialNotification =
          await notifee.getInitialNotification();

        const notificationType =
          initialNotification?.notification.data
            ?.notificationType;

        if (
          notificationType ===
          'mood-reminder'
        ) {
          console.log(
            'Mood logging screen opened from a notification.',
          );
        }

        if (
          notificationType ===
          'sleep-reminder'
        ) {
          console.log(
            'Application opened from a sleep reminder.',
          );
        }

        await Promise.all([
          updateMoodReminder(),
          updateSleepReminder(),
        ]);
      } catch (error) {
        console.error(
          'Failed to initialise notifications:',
          error,
        );
      }
    }

    initialiseNotifications();

    const unsubscribe =
      notifee.onForegroundEvent(
        ({ type, detail }) => {
          if (type !== EventType.PRESS) {
            return;
          }

          const notificationType =
            detail.notification?.data
              ?.notificationType;

          if (
            notificationType ===
            'mood-reminder'
          ) {
            console.log(
              'Mood reminder notification was pressed.',
            );
          }

          if (
            notificationType ===
            'sleep-reminder'
          ) {
            console.log(
              'Sleep reminder notification was pressed.',
            );
          }
        },
      );

    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />

      <AppNavigator />
    </>
  );
}