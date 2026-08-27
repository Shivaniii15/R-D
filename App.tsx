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

        await restorePendingActivityNavigation();

        await updateLastActiveTime();

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

          recordAppActivity()
            .catch(error => {
              console.log(
                'Failed to record notification activity:',
                error,
              );
            });
        },
      );

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