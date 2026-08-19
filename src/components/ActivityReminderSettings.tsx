import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  ActivityReminderTime,
  getActivityReminderTime,
  getActivityRemindersEnabled,
  setActivityReminderTime,
  setActivityRemindersEnabled,
} from '../storage/activityReminder.storage';

import {
  cancelActivityReminder,
  openActivityAlarmPermissionSettings,
  updateActivityReminder,
} from '../services/activityNotification.service';

export default function ActivityReminderSettings(): React.JSX.Element {
  const [enabled, setEnabled] =
    useState(false);

  const [selectedTime, setSelectedTime] =
    useState<ActivityReminderTime>({
      hour: 17,
      minute: 0,
    });

  const [showPicker, setShowPicker] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isUpdating, setIsUpdating] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadSettings(): Promise<void> {
        try {
          const [savedEnabled, savedTime] =
            await Promise.all([
              getActivityRemindersEnabled(),
              getActivityReminderTime(),
            ]);

          if (active) {
            setEnabled(savedEnabled);
            setSelectedTime(savedTime);
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      loadSettings();

      return () => {
        active = false;
      };
    }, []),
  );

  async function handleToggle(
    newValue: boolean,
  ): Promise<void> {
    if (isUpdating) {
      return;
    }

    const previousValue = enabled;

    setEnabled(newValue);
    setIsUpdating(true);

    try {
      await setActivityRemindersEnabled(
        newValue,
      );

      if (!newValue) {
        await cancelActivityReminder();
        return;
      }

      const result =
        await updateActivityReminder();

      if (result.permissionRequired) {
        Alert.alert(
          'Permission required',
          'Physical activity reminders need permission to schedule alarms.',
          [
            {
              text: 'Not now',
              style: 'cancel',
            },
            {
              text: 'Open settings',
              onPress: () => {
                openActivityAlarmPermissionSettings()
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
          'Reminder not scheduled',
          'Check that notifications are allowed for this app, then try again.',
        );
      }
    } catch (error) {
      setEnabled(previousValue);

      await setActivityRemindersEnabled(
        previousValue,
      );

      Alert.alert(
        'Unable to update reminders',
        'The physical activity reminder setting could not be changed.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function handleTimeChange(
    event: DateTimePickerEvent,
    date?: Date,
  ): void {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (
      event.type === 'dismissed' ||
      date === undefined
    ) {
      return;
    }

    setSelectedTime({
      hour: date.getHours(),
      minute: date.getMinutes(),
    });
  }

  async function handleSaveTime(): Promise<void> {
    if (isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      await setActivityReminderTime(
        selectedTime,
      );

      if (!enabled) {
        Alert.alert(
          'Activity time saved',
          `Your activity reminder time has been saved as ${formatTime(
            selectedTime,
          )}. Enable reminders to receive notifications.`,
        );

        return;
      }

      const result =
        await updateActivityReminder();

      if (result.permissionRequired) {
        Alert.alert(
          'Permission required',
          'Allow Alarms & reminders, then return and save the activity time again.',
        );

        return;
      }

      if (!result.scheduled) {
        Alert.alert(
          'Reminder not scheduled',
          'Check your notification settings and try again.',
        );

        return;
      }

      Alert.alert(
        'Activity reminder saved',
        `Your reminder has been scheduled for ${formatTime(
          selectedTime,
        )}.`,
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function getPickerDate(): Date {
    const date = new Date();

    date.setHours(
      selectedTime.hour,
      selectedTime.minute,
      0,
      0,
    );

    return date;
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <>
      <Text style={styles.sectionHeading}>
        Physical activity
      </Text>

      <View style={styles.settingCard}>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>
            Physical activity reminders
          </Text>

          <Text style={styles.description}>
            Receive a daily reminder encouraging a short
            walk or stretch.
          </Text>

          <Text style={styles.status}>
            {enabled
              ? 'Activity reminders are enabled'
              : 'Activity reminders are disabled'}
          </Text>
        </View>

        <Switch
          value={enabled}
          onValueChange={handleToggle}
          disabled={isUpdating}
          trackColor={{
            false: '#d5d5d5',
            true: '#777777',
          }}
          thumbColor={
            enabled
              ? '#111111'
              : '#f4f4f4'
          }
        />
      </View>

      <View style={styles.timeCard}>
        <Text style={styles.settingTitle}>
          Activity reminder time
        </Text>

        <Text style={styles.description}>
          Choose when you would like to receive your
          movement reminder.
        </Text>

        <Pressable
          style={styles.timeButton}
          onPress={() => setShowPicker(true)}
          disabled={isUpdating}>
          <Text style={styles.timeButtonText}>
            {formatTime(selectedTime)}
          </Text>
        </Pressable>

        {showPicker && (
          <DateTimePicker
            value={getPickerDate()}
            mode="time"
            is24Hour={false}
            display={
              Platform.OS === 'ios'
                ? 'spinner'
                : 'default'
            }
            onChange={handleTimeChange}
          />
        )}

        <Pressable
          style={[
            styles.saveButton,
            isUpdating &&
              styles.disabledButton,
          ]}
          onPress={handleSaveTime}
          disabled={isUpdating}>
          {isUpdating ? (
            <ActivityIndicator
              size="small"
              color="#ffffff"
            />
          ) : (
            <Text style={styles.saveButtonText}>
              Save activity time
            </Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

function formatTime(
  time: ActivityReminderTime,
): string {
  const date = new Date();

  date.setHours(
    time.hour,
    time.minute,
    0,
    0,
  );

  return date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  loading: {
    paddingVertical: 30,
  },

  sectionHeading: {
    color: '#111111',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 12,
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

  description: {
    color: '#666666',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },

  status: {
    color: '#888888',
    fontSize: 13,
    marginTop: 10,
  },

  timeCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
    marginBottom: 18,
  },

  timeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 18,
  },

  timeButtonText: {
    color: '#111111',
    fontSize: 24,
    fontWeight: '700',
  },

  saveButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },

  disabledButton: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});