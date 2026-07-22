import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  getRemindersEnabled,
  setRemindersEnabled,
} from '../storage/reminderPreferences.storage';

import {
  cancelMoodReminder,
  updateMoodReminder,
} from '../services/notification.service';

export default function SettingsScreen(): React.JSX.Element {
  const [
    remindersEnabled,
    setLocalRemindersEnabled,
  ] = useState<boolean>(true);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [isUpdating, setIsUpdating] =
    useState<boolean>(false);

  /**
   * Reloads the saved preference whenever the user opens
   * the Settings tab.
   */
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadReminderPreference(): Promise<void> {
        try {
          const enabled =
            await getRemindersEnabled();

          if (isActive) {
            setLocalRemindersEnabled(enabled);
          }
        } catch (error) {
          console.error(
            'Failed to load reminder preference:',
            error,
          );
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      loadReminderPreference();

      return () => {
        isActive = false;
      };
    }, []),
  );

  async function handleReminderToggle(
    enabled: boolean,
  ): Promise<void> {
    if (isUpdating) {
      return;
    }

    const previousValue = remindersEnabled;

    /*
     * Update the switch immediately to make the interface
     * feel responsive.
     */
    setLocalRemindersEnabled(enabled);
    setIsUpdating(true);

    try {
      await setRemindersEnabled(enabled);

      if (enabled) {
        /*
         * Reschedule the reminder if the user has not logged
         * today's mood.
         */
        await updateMoodReminder();
      } else {
        /*
         * Stop any reminder that is currently pending.
         */
        await cancelMoodReminder();
      }
    } catch (error) {
      /*
       * Restore the previous switch value if saving or
       * scheduling fails.
       */
      setLocalRemindersEnabled(previousValue);

      console.error(
        'Failed to update reminder setting:',
        error,
      );

      Alert.alert(
        'Unable to update reminders',
        'The reminder setting could not be changed. Please try again.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>
          Settings
        </Text>

        <Text style={styles.subheading}>
          Control your application preferences.
        </Text>

        <View style={styles.settingCard}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>
              Self-care reminders
            </Text>

            <Text style={styles.settingDescription}>
              Receive a daily notification when you have
              not logged your mood.
            </Text>

            <Text style={styles.statusText}>
              {remindersEnabled
                ? 'Reminders are enabled'
                : 'Reminders are disabled'}
            </Text>
          </View>

          <Switch
            value={remindersEnabled}
            onValueChange={handleReminderToggle}
            disabled={isUpdating}
            trackColor={{
              false: '#d5d5d5',
              true: '#777',
            }}
            thumbColor={
              remindersEnabled
                ? '#111'
                : '#f4f4f4'
            }
          />
        </View>

        {isUpdating && (
          <View style={styles.updatingContainer}>
            <ActivityIndicator size="small" />

            <Text style={styles.updatingText}>
              Updating reminder setting...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heading: {
    color: '#111111',
    fontSize: 30,
    fontWeight: '700',
  },

  subheading: {
    color: '#777777',
    fontSize: 16,
    marginTop: 6,
    marginBottom: 28,
  },

  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 18,
  },

  settingTextContainer: {
    flex: 1,
    paddingRight: 16,
  },

  settingTitle: {
    color: '#111111',
    fontSize: 17,
    fontWeight: '600',
  },

  settingDescription: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  statusText: {
    color: '#888888',
    fontSize: 13,
    marginTop: 10,
  },

  updatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  updatingText: {
    color: '#777777',
    fontSize: 13,
    marginLeft: 8,
  },
});