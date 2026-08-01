import React, {
  useEffect,
} from 'react';
import {
  AppState,
  StatusBar,
} from 'react-native';

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

import {
  updateActivityReminder,
} from './src/services/activityNotification.service';

import {
  requestActivitySuggestionNavigation,
  restorePendingActivityNavigation,
} from './src/navigation/navigation.service';

export default function App(): React.JSX.Element {
  useEffect(() => {
    async function initialiseApp(): Promise<void> {
      try {
        const notificationsReady =
          await setupNotifications();

        if (!notificationsReady) {
          return;
        }

        /*
         * Handles a notification that launched the app
         * from a completely closed state.
         */
        const initialNotification =
          await notifee.getInitialNotification();

        const initialNotificationType =
          initialNotification?.notification.data
            ?.notificationType;

        if (
          initialNotificationType ===
          'physical-activity-reminder'
        ) {
          await requestActivitySuggestionNavigation();
        }

        /*
         * Restores a press recorded by the background
         * event handler.
         */
        await restorePendingActivityNavigation();

        await Promise.all([
          updateMoodReminder(),
          updateSleepReminder(),
          updateActivityReminder(),
        ]);
      } catch (error) {
        console.log(
          'Failed to initialise the app:',
          error,
        );
      }
    }

    initialiseApp();

    /*
     * Handles notification presses while React is
     * already running in the foreground.
     */
    const unsubscribeNotification =
      notifee.onForegroundEvent(
        ({ type, detail }) => {
          const notificationType =
            detail.notification?.data
              ?.notificationType;

          if (
            type === EventType.PRESS &&
            notificationType ===
              'physical-activity-reminder'
          ) {
            requestActivitySuggestionNavigation()
              .catch(error => {
                console.log(
                  'Failed to open activity suggestion:',
                  error,
                );
              });
          }
        },
      );

    /*
     * When the app returns from the background, restore
     * any pending navigation request.
     */
    const appStateSubscription =
      AppState.addEventListener(
        'change',
        nextState => {
          if (nextState === 'active') {
            restorePendingActivityNavigation()
              .catch(error => {
                console.log(
                  'Failed to restore activity navigation:',
                  error,
                );
              });
          }
        },
      );

    return () => {
      unsubscribeNotification();
      appStateSubscription.remove();
    };
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