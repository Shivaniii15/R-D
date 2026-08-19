import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './navigation.types';

const PENDING_ACTIVITY_NAVIGATION_KEY =
  'pending-physical-activity-navigation';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

let activityNavigationPending = false;

export async function requestActivitySuggestionNavigation(): Promise<void> {
  /*
   * Store the request so it survives background execution
   * and a cold application start.
   */
  await AsyncStorage.setItem(
    PENDING_ACTIVITY_NAVIGATION_KEY,
    'true',
  );

  activityNavigationPending = true;

  attemptActivitySuggestionNavigation();
}

export function attemptActivitySuggestionNavigation(): void {
  if (
    !activityNavigationPending ||
    !navigationRef.isReady()
  ) {
    return;
  }

  navigationRef.navigate('ActivitySuggestion');
  activityNavigationPending = false;

  AsyncStorage.removeItem(
    PENDING_ACTIVITY_NAVIGATION_KEY,
  ).catch(error => {
    console.log(
      'Failed to clear pending activity navigation:',
      error,
    );
  });
}

export async function restorePendingActivityNavigation(): Promise<void> {
  try {
    const pendingValue = await AsyncStorage.getItem(
      PENDING_ACTIVITY_NAVIGATION_KEY,
    );

    activityNavigationPending =
      pendingValue === 'true';

    attemptActivitySuggestionNavigation();
  } catch (error) {
    console.log(
      'Failed to restore activity navigation:',
      error,
    );
  }
}

export function handleNavigationReady(): void {
  attemptActivitySuggestionNavigation();
}