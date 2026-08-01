import React, {
  useEffect,
  useRef,
} from 'react';

import {
  AppState,
  AppStateStatus,
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
  updateMotivationalReminder,
} from './src/services/motivationalNotification.service';

import {
  updateLastActiveTime,
} from './src/storage/motivationalReminder.storage';

import {
  requestActivitySuggestionNavigation,
  restorePendingActivityNavigation,
} from './src/navigation/navigation.service';

export default function App(): React.JSX.Element {
  const currentAppState = useRef<AppStateStatus>(
    AppState.currentState,
  );

  useEffect(() => {
    /**
     * Records that the user is currently using the app,
     * then restarts the motivational inactivity countdown.
     */
    async function recordAppActivity(): Promise<void> {
      try {
        await updateLastActiveTime();
        await updateMotivationalReminder();
      } catch (error) {
        console.log(
          'Failed to update app activity:',
          error,
        );
      }
    }

    async function initialiseApp(): Promise<void> {
      try {
        const notificationsReady =
          await setupNotifications();

        if (!notificationsReady) {
          return;
        }

        /*
         * Detects whether a notification opened the app
         * from a completely closed state.
         */
        const initialNotification =
          await notifee.getInitialNotification();

        const initialNotificationType =
          initialNotification?.notification.data
            ?.notificationType;

        /*
         * Open the movement suggestion page when an
         * activity notification launched the app.
         */
        if (
          initialNotificationType ===
          'physical-activity-reminder'
        ) {
          await requestActivitySuggestionNavigation();
        }

        /*
         * Restore a navigation request saved by the
         * background notification handler.
         */
        await restorePendingActivityNavigation();

        /*
         * Opening the app counts as activity. This resets
         * the motivational notification countdown.
         */
        await updateLastActiveTime();

        /*
         * Refresh every notification schedule according
         * to the user's saved preferences.
         */
        await Promise.all([
          updateMoodReminder(),
          updateSleepReminder(),
          updateActivityReminder(),
          updateMotivationalReminder(),
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
     * Handles notification presses while the React
     * application is already running.
     */
    const unsubscribeNotification =
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

          /*
           * Pressing any notification and returning to
           * the app counts as app activity.
           */
          recordAppActivity()
            .catch(error => {
              console.log(
                'Failed to record notification activity:',
                error,
              );
            });
        },
      );

    /*
     * When the user returns to the app after leaving it,
     * reset the inactivity countdown.
     */
    const appStateSubscription =
      AppState.addEventListener(
        'change',
        nextState => {
          const previousState =
            currentAppState.current;

          currentAppState.current =
            nextState;

          if (
            nextState === 'active' &&
            previousState !== 'active'
          ) {
            restorePendingActivityNavigation()
              .catch(error => {
                console.log(
                  'Failed to restore activity navigation:',
                  error,
                );
              });

            recordAppActivity()
              .catch(error => {
                console.log(
                  'Failed to record app activity:',
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