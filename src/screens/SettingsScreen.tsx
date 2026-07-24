import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { useFocusEffect } from '@react-navigation/native';

import {
  getReminderTime,
  getRemindersEnabled,
  ReminderTime,
  setReminderTime,
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

  const [selectedTime, setSelectedTime] =
    useState<ReminderTime>({
      hour: 20,
      minute: 0,
    });

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [isUpdating, setIsUpdating] =
    useState<boolean>(false);

  const [showTimePicker, setShowTimePicker] =
    useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadReminderSettings(): Promise<void> {
        try {
          const [enabled, time] =
            await Promise.all([
              getRemindersEnabled(),
              getReminderTime(),
            ]);

          if (isActive) {
            setLocalRemindersEnabled(enabled);
            setSelectedTime(time);
          }
        } catch (error) {
          console.error(
            'Failed to load reminder settings:',
            error,
          );
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      loadReminderSettings();

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

    setLocalRemindersEnabled(enabled);
    setIsUpdating(true);

    try {
      await setRemindersEnabled(enabled);

      if (enabled) {
        await updateMoodReminder();
      } else {
        await cancelMoodReminder();
      }
    } catch (error) {
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

  function handleTimeChange(
    event: DateTimePickerEvent,
    date?: Date,
  ): void {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
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
      await setReminderTime(selectedTime);

      if (remindersEnabled) {
        await updateMoodReminder();
      }

      Alert.alert(
        'Reminder time saved',
        `Your reminder has been set for ${formatReminderTime(
          selectedTime,
        )}.`,
      );
    } catch (error) {
      console.error(
        'Failed to save reminder time:',
        error,
      );

      Alert.alert(
        'Unable to save reminder time',
        'The selected reminder time could not be saved. Please try again.',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function getPickerDate(): Date {
    const pickerDate = new Date();

    pickerDate.setHours(
      selectedTime.hour,
      selectedTime.minute,
      0,
      0,
    );

    return pickerDate;
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

        <View style={styles.timeCard}>
          <Text style={styles.settingTitle}>
            Reminder time
          </Text>

          <Text style={styles.settingDescription}>
            Choose when you would like to receive your
            daily reminder.
          </Text>

          <Pressable
            style={styles.timeButton}
            onPress={() => setShowTimePicker(true)}
            disabled={isUpdating}>
            <Text style={styles.timeButtonText}>
              {formatReminderTime(selectedTime)}
            </Text>
          </Pressable>

          {showTimePicker && (
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
            <Text style={styles.saveButtonText}>
              Save reminder time
            </Text>
          </Pressable>
        </View>

        {isUpdating && (
          <View style={styles.updatingContainer}>
            <ActivityIndicator size="small" />

            <Text style={styles.updatingText}>
              Updating reminder settings...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatReminderTime(
  time: ReminderTime,
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

  timeCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 18,
    marginTop: 18,
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