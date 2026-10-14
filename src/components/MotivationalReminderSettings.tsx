import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  getInactivityDays,
  getMotivationalRemindersEnabled,
  setInactivityDays,
  setMotivationalRemindersEnabled,
  updateLastActiveTime,
} from '../storage/motivationalReminder.storage';

import {
  cancelMotivationalReminder,
  openMotivationalAlarmPermissionSettings,
  updateMotivationalReminder,
} from '../services/motivationalNotification.service';
import { ThemeColors, useTheme } from '../theme/ThemeContext';

const INACTIVITY_OPTIONS = [
  1,
  2,
  3,
  7,
];

export default function MotivationalReminderSettings(): React.JSX.Element {
  const { colors } = useTheme();

  const styles = createMotivationalReminderStyles(colors);

  const [
    remindersEnabled,
    setLocalRemindersEnabled,
  ] = useState<boolean>(false);

  const [
    selectedDays,
    setSelectedDays,
  ] = useState<number>(2);

  const [
    savedDays,
    setSavedDays,
  ] = useState<number>(2);

  const [
    isLoading,
    setIsLoading,
  ] = useState<boolean>(true);

  const [
    isUpdating,
    setIsUpdating,
  ] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadSettings(): Promise<void> {
        setIsLoading(true);

        try {
          const [
            enabled,
            inactivityDays,
          ] = await Promise.all([
            getMotivationalRemindersEnabled(),
            getInactivityDays(),
          ]);

          if (!isActive) {
            return;
          }

          setLocalRemindersEnabled(
            enabled,
          );

          setSelectedDays(
            inactivityDays,
          );

          setSavedDays(
            inactivityDays,
          );
        } catch (error) {
          console.log(
            'Failed to load motivational reminder settings:',
            error,
          );
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      loadSettings();

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

    const previousValue =
      remindersEnabled;

    setLocalRemindersEnabled(
      enabled,
    );

    setIsUpdating(true);

    try {
      await setMotivationalRemindersEnabled(
        enabled,
      );

      if (!enabled) {
        await cancelMotivationalReminder();
        return;
      }

      /*
       * Enabling motivational notifications starts a new
       * inactivity countdown from the current time.
       */
      await updateLastActiveTime();

      const result =
        await updateMotivationalReminder();

      if (result.permissionRequired) {
        Alert.alert(
          'Permission required',
          'Motivational notifications need permission to schedule reminders. Open Android settings and allow Alarms & reminders?',
          [
            {
              text: 'Not now',
              style: 'cancel',
            },
            {
              text: 'Open settings',
              onPress: () => {
                openMotivationalAlarmPermissionSettings()
                  .catch(error => {
                    console.log(
                      'Failed to open alarm settings:',
                      error,
                    );
                  });
              },
            },
          ],
        );

        return;
      }

      if (!result.scheduled) {
        Alert.alert(
          'Notification not scheduled',
          'Check that notifications are enabled for this app, then try again.',
        );

        return;
      }

      Alert.alert(
        'Motivational notifications enabled',
        `A notification will be sent after ${formatDayCount(
          savedDays,
        )} of inactivity.`,
      );
    } catch (error) {
      setLocalRemindersEnabled(
        previousValue,
      );

      try {
        await setMotivationalRemindersEnabled(
          previousValue,
        );
      } catch (restoreError) {
        console.log(
          'Failed to restore motivational reminder preference:',
          restoreError,
        );
      }

      console.log(
        'Failed to update motivational reminders:',
        error,
      );

      Alert.alert(
        'Unable to update notifications',
        'The motivational notification setting could not be changed.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function handleSelectDays(
    days: number,
  ): void {
    if (isUpdating) {
      return;
    }

    setSelectedDays(days);
  }

  async function handleSavePreference(): Promise<void> {
    if (isUpdating) {
      return;
    }

    const previousSavedDays =
      savedDays;

    setIsUpdating(true);

    try {
      await setInactivityDays(
        selectedDays,
      );

      setSavedDays(
        selectedDays,
      );

      if (!remindersEnabled) {
        Alert.alert(
          'Preference saved',
          `Motivational notifications will be sent after ${formatDayCount(
            selectedDays,
          )} of inactivity when you enable them.`,
        );

        return;
      }

      /*
       * Changing the inactivity preference starts a new
       * countdown from the current time.
       */
      await updateLastActiveTime();

      const result =
        await updateMotivationalReminder();

      if (result.permissionRequired) {
        Alert.alert(
          'Permission required',
          'Allow Alarms & reminders for this app. Then return and save the preference again.',
          [
            {
              text: 'Not now',
              style: 'cancel',
            },
            {
              text: 'Open settings',
              onPress: () => {
                openMotivationalAlarmPermissionSettings()
                  .catch(error => {
                    console.log(
                      'Failed to open alarm settings:',
                      error,
                    );
                  });
              },
            },
          ],
        );

        return;
      }

      if (!result.scheduled) {
        Alert.alert(
          'Notification not scheduled',
          'Your preference was saved, but the notification could not be scheduled. Check the app notification settings and try again.',
        );

        return;
      }

      Alert.alert(
        'Preference saved',
        `You will receive a motivational notification after ${formatDayCount(
          selectedDays,
        )} without using the app.`,
      );
    } catch (error) {
      setSelectedDays(
        previousSavedDays,
      );

      console.log(
        'Failed to save inactivity preference:',
        error,
      );

      Alert.alert(
        'Unable to save preference',
        'The inactivity period could not be saved. Please try again.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  const hasUnsavedChanges =
    selectedDays !== savedDays;

  return (
    <>
      <Text style={styles.sectionHeading}>
        Motivation
      </Text>

      <View style={styles.settingCard}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>
            Motivational notifications
          </Text>

          <Text style={styles.settingDescription}>
            Receive encouragement to return and continue
            tracking your mental wellbeing after a period
            of inactivity.
          </Text>

          <Text style={styles.statusText}>
            {remindersEnabled
              ? 'Motivational notifications are enabled'
              : 'Motivational notifications are disabled'}
          </Text>
        </View>

        <Switch
          value={remindersEnabled}
          onValueChange={
            handleReminderToggle
          }
          disabled={isUpdating}
          trackColor={{
            false: colors.border,
            true: colors.accent,
          }}
          thumbColor={
            remindersEnabled
              ? colors.accent
              : colors.surface
          }
        />
      </View>

      <View style={styles.preferenceCard}>
        <Text style={styles.settingTitle}>
          Inactivity period
        </Text>

        <Text style={styles.settingDescription}>
          Choose how long the app should remain unused
          before sending encouragement to return.
        </Text>

        <View style={styles.optionContainer}>
          {INACTIVITY_OPTIONS.map(days => {
            const isSelected =
              selectedDays === days;

            return (
              <Pressable
                key={days}
                style={[
                  styles.optionButton,
                  isSelected &&
                    styles.selectedOptionButton,
                ]}
                onPress={() =>
                  handleSelectDays(days)
                }
                disabled={isUpdating}>
                <Text
                  style={[
                    styles.optionText,
                    isSelected &&
                      styles.selectedOptionText,
                  ]}>
                  {days}
                </Text>

                <Text
                  style={[
                    styles.optionLabel,
                    isSelected &&
                      styles.selectedOptionText,
                  ]}>
                  {days === 1
                    ? 'day'
                    : 'days'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.currentPreferenceText}>
          Current setting: after{' '}
          {formatDayCount(savedDays)} of inactivity
        </Text>

        <Pressable
          style={[
            styles.saveButton,
            isUpdating &&
              styles.disabledButton,
          ]}
          onPress={
            handleSavePreference
          }
          disabled={isUpdating}>
          {isUpdating ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
            />
          ) : (
            <Text style={styles.saveButtonText}>
              {hasUnsavedChanges
                ? 'Save notification preference'
                : 'Save preference'}
            </Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

function formatDayCount(
  days: number,
): string {
  return days === 1
    ? '1 day'
    : `${days} days`;
}

function createMotivationalReminderStyles(colors: ThemeColors) {
  return StyleSheet.create({
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 30,
    },

    sectionHeading: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '700',
      marginTop: 10,
      marginBottom: 12,
    },

    settingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceMuted,
      borderRadius: 16,
      padding: 18,
    },

    settingTextContainer: {
      flex: 1,
      paddingRight: 16,
    },

    settingTitle: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '600',
    },

    settingDescription: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      marginTop: 6,
    },

    statusText: {
      color: colors.textSubtle,
      fontSize: 13,
      marginTop: 10,
    },

    preferenceCard: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 16,
      padding: 18,
      marginTop: 18,
      marginBottom: 18,
    },

    optionContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },

    optionButton: {
      width: '22%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 12,
    },

    selectedOptionButton: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },

    optionText: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },

    optionLabel: {
      color: colors.textSubtle,
      fontSize: 12,
      marginTop: 2,
    },

    selectedOptionText: {
      color: colors.accentText,
    },

    currentPreferenceText: {
      color: colors.textSubtle,
      fontSize: 13,
      marginTop: 18,
    },

    saveButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 16,
    },

    disabledButton: {
      opacity: 0.5,
    },

    saveButtonText: {
      color: colors.accentText,
      fontSize: 15,
      fontWeight: '600',
    },
  });
}