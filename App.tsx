import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';

import AppNavigator from './src/navigation/AppNavigator';
import {
  setupNotifications,
  updateMoodReminder,
} from './src/services/notification.service';

export default function App(): React.JSX.Element {
  useEffect(() => {
    async function initialiseNotifications(): Promise<void> {
      try {
        const notificationsReady = await setupNotifications();

        if (!notificationsReady) {
          return;
        }

        /*
         * This checks whether the application was opened by tapping
         * a notification while the app was completely closed.
         */
        const initialNotification =
          await notifee.getInitialNotification();

        if (
          initialNotification?.notification.data?.notificationType ===
          'mood-reminder'
        ) {
          console.log(
            'Mood logging screen opened from a notification.',
          );
        }

        await updateMoodReminder();
      } catch (error) {
        console.error(
          'Failed to initialise notifications:',
          error,
        );
      }
    }

    initialiseNotifications();

    /*
     * This handles a notification being tapped while the application
     * is already open or running in the background.
     */
    const unsubscribe = notifee.onForegroundEvent(
      ({ type, detail }) => {
        if (
          type === EventType.PRESS &&
          detail.notification?.data?.notificationType ===
            'mood-reminder'
        ) {
          console.log(
            'Mood reminder notification was pressed.',
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