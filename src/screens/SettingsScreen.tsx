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

import {
  useFocusEffect,
} from '@react-navigation/native';

import {
  getReminderTime,
  getRemindersEnabled,
  ReminderTime,
  setReminderTime,
  setRemindersEnabled,
} from '../storage/reminderPreferences.storage';

import {
  getSleepReminderTime,
  getSleepRemindersEnabled,
  setSleepReminderTime,
  setSleepRemindersEnabled,
  SleepReminderTime,
} from '../storage/sleepReminder.storage';

import {
  cancelMoodReminder,
  updateMoodReminder,
} from '../services/notification.service';

import {
  cancelSleepReminder,
  openSleepAlarmPermissionSettings,
  updateSleepReminder,
} from '../services/sleepNotification.service';

export default function SettingsScreen(): React.JSX.Element {
  const [
    remindersEnabled,
    setLocalRemindersEnabled,
  ] = useState<boolean>(true);

  const [
    sleepRemindersEnabled,
    setLocalSleepRemindersEnabled,
  ] = useState<boolean>(false);

  const [
    selectedTime,
    setSelectedTime,
  ] = useState<ReminderTime>({
    hour: 20,
    minute: 0,
  });

  const [
    selectedSleepTime,
    setSelectedSleepTime,
  ] = useState<SleepReminderTime>({
    hour: 22,
    minute: 0,
  });

  const [
    isLoading,
    setIsLoading,
  ] = useState<boolean>(true);

  const [
    isUpdatingMood,
    setIsUpdatingMood,
  ] = useState<boolean>(false);

  const [
    isUpdatingSleep,
    setIsUpdatingSleep,
  ] = useState<boolean>(false);

  const [
    showTimePicker,
    setShowTimePicker,
  ] = useState<boolean>(false);

  const [
    showSleepTimePicker,
    setShowSleepTimePicker,
  ] = useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadSettings(): Promise<void> {
        setIsLoading(true);

        try {
          const [
            moodEnabled,
            moodTime,
            sleepEnabled,
            sleepTime,
          ] = await Promise.all([
            getRemindersEnabled(),
            getReminderTime(),
            getSleepRemindersEnabled(),
            getSleepReminderTime(),
          ]);

          if (!isActive) {
            return;
          }

          setLocalRemindersEnabled(
            moodEnabled,
          );

          setSelectedTime(
            moodTime,
          );

          setLocalSleepRemindersEnabled(
            sleepEnabled,
          );

          setSelectedSleepTime(
            sleepTime,
          );
        } catch (error) {
          console.log(
            'Failed to load settings:',
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
    if (isUpdatingMood) {
      return;
    }

    const previousValue =
      remindersEnabled;

    setLocalRemindersEnabled(
      enabled,
    );

    setIsUpdatingMood(true);

    try {
      await setRemindersEnabled(
        enabled,
      );

      if (enabled) {
        await updateMoodReminder();
      } else {
        await cancelMoodReminder();
      }
    } catch (error) {
      setLocalRemindersEnabled(
        previousValue,
      );

      await setRemindersEnabled(
        previousValue,
      );

      console.log(
        'Failed to update self-care reminders:',
        error,
      );

      Alert.alert(
        'Unable to update reminders',
        'The self-care reminder setting could not be changed.',
      );
    } finally {
      setIsUpdatingMood(false);
    }
  }

  async function handleSleepReminderToggle(
    enabled: boolean,
  ): Promise<void> {
    if (isUpdatingSleep) {
      return;
    }

    const previousValue =
      sleepRemindersEnabled;

    setLocalSleepRemindersEnabled(
      enabled,
    );

    setIsUpdatingSleep(true);

    try {
      await setSleepRemindersEnabled(
        enabled,
      );

      if (!enabled) {
        await cancelSleepReminder();

        return;
      }

      const result =
        await updateSleepReminder();

      if (result.permissionRequired) {
        Alert.alert(
          'Permission required',
          'Sleep reminders need permission to schedule alarms. Open Android settings and allow Alarms & reminders?',
          [
            {
              text: 'Not now',
              style: 'cancel',
            },
            {
              text: 'Open settings',
              onPress: () => {
                openSleepAlarmPermissionSettings()
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
          'Check that notifications are enabled for this app, then try again.',
        );
      }
    } catch (error) {
      setLocalSleepRemindersEnabled(
        previousValue,
      );

      await setSleepRemindersEnabled(
        previousValue,
      );

      console.log(
        'Failed to update sleep reminders:',
        error,
      );

      Alert.alert(
        'Unable to update sleep reminders',
        'The sleep reminder setting could not be changed.',
      );
    } finally {
      setIsUpdatingSleep(false);
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

  function handleSleepTimeChange(
    event: DateTimePickerEvent,
    date?: Date,
  ): void {
    if (Platform.OS === 'android') {
      setShowSleepTimePicker(false);
    }

    if (
      event.type === 'dismissed' ||
      date === undefined
    ) {
      return;
    }

    setSelectedSleepTime({
      hour: date.getHours(),
      minute: date.getMinutes(),
    });
  }

  async function handleSaveTime(): Promise<void> {
    if (isUpdatingMood) {
      return;
    }

    setIsUpdatingMood(true);

    try {
      await setReminderTime(
        selectedTime,
      );

      if (remindersEnabled) {
        await updateMoodReminder();
      }

      Alert.alert(
        'Reminder time saved',
        `Your self-care reminder has been set for ${formatTime(
          selectedTime,
        )}.`,
      );
    } catch (error) {
      console.log(
        'Failed to save reminder time:',
        error,
      );

      Alert.alert(
        'Unable to save reminder time',
        'The selected reminder time could not be saved.',
      );
    } finally {
      setIsUpdatingMood(false);
    }
  }

  async function handleSaveSleepTime(): Promise<void> {
    if (isUpdatingSleep) {
      return;
    }

    setIsUpdatingSleep(true);

    try {
      await setSleepReminderTime(
        selectedSleepTime,
      );

      if (!sleepRemindersEnabled) {
        Alert.alert(
          'Bedtime saved',
          `Your bedtime has been saved as ${formatTime(
            selectedSleepTime,
          )}. Enable sleep reminders to receive notifications.`,
        );

        return;
      }

      const result =
        await updateSleepReminder();

      if (result.permissionRequired) {
        Alert.alert(
          'Permission required',
          'Allow Alarms & reminders for this app. After enabling it, return to the app and tap Save bedtime again.',
          [
            {
              text: 'Not now',
              style: 'cancel',
            },
            {
              text: 'Open settings',
              onPress: () => {
                openSleepAlarmPermissionSettings()
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
          'Sleep reminder not scheduled',
          'Check that app notifications are enabled, then try saving your bedtime again.',
        );

        return;
      }

      Alert.alert(
        'Bedtime saved',
        `Your sleep reminder has been scheduled for ${formatTime(
          selectedSleepTime,
        )}.`,
      );
    } catch (error) {
      console.log(
        'Failed to save bedtime:',
        error,
      );

      Alert.alert(
        'Unable to save bedtime',
        'The selected bedtime could not be saved.',
      );
    } finally {
      setIsUpdatingSleep(false);
    }
  }

  function getPickerDate(
    time:
      | ReminderTime
      | SleepReminderTime,
  ): Date {
    const pickerDate =
      new Date();

    pickerDate.setHours(
      time.hour,
      time.minute,
      0,
      0,
    );

    return pickerDate;
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}>
        <View
          style={
            styles.loadingContainer
          }>
          <ActivityIndicator
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }>
        <Text style={styles.heading}>
          Settings
        </Text>

        <Text
          style={styles.subheading}>
          Control your application preferences.
        </Text>

        <Text
          style={styles.sectionHeading}>
          Self-care
        </Text>

        <View
          style={styles.settingCard}>
          <View
            style={
              styles.settingTextContainer
            }>
            <Text
              style={styles.settingTitle}>
              Self-care reminders
            </Text>

            <Text
              style={
                styles.settingDescription
              }>
              Receive a daily notification when you have
              not logged your mood.
            </Text>

            <Text
              style={styles.statusText}>
              {remindersEnabled
                ? 'Reminders are enabled'
                : 'Reminders are disabled'}
            </Text>
          </View>

          <Switch
            value={remindersEnabled}
            onValueChange={
              handleReminderToggle
            }
            disabled={isUpdatingMood}
            trackColor={{
              false: '#d5d5d5',
              true: '#777777',
            }}
            thumbColor={
              remindersEnabled
                ? '#111111'
                : '#f4f4f4'
            }
          />
        </View>

        <View
          style={styles.timeCard}>
          <Text
            style={styles.settingTitle}>
            Self-care reminder time
          </Text>

          <Text
            style={
              styles.settingDescription
            }>
            Choose when you would like to receive your
            daily self-care reminder.
          </Text>

          <Pressable
            style={styles.timeButton}
            onPress={() =>
              setShowTimePicker(true)
            }
            disabled={isUpdatingMood}>
            <Text
              style={
                styles.timeButtonText
              }>
              {formatTime(
                selectedTime,
              )}
            </Text>
          </Pressable>

          {showTimePicker && (
            <DateTimePicker
              value={getPickerDate(
                selectedTime,
              )}
              mode="time"
              is24Hour={false}
              display={
                Platform.OS === 'ios'
                  ? 'spinner'
                  : 'default'
              }
              onChange={
                handleTimeChange
              }
            />
          )}

          <Pressable
            style={[
              styles.saveButton,
              isUpdatingMood &&
                styles.disabledButton,
            ]}
            onPress={
              handleSaveTime
            }
            disabled={isUpdatingMood}>
            <Text
              style={
                styles.saveButtonText
              }>
              Save reminder time
            </Text>
          </Pressable>
        </View>

        <Text
          style={styles.sectionHeading}>
          Sleep
        </Text>

        <View
          style={styles.settingCard}>
          <View
            style={
              styles.settingTextContainer
            }>
            <Text
              style={styles.settingTitle}>
              Sleep reminders
            </Text>

            <Text
              style={
                styles.settingDescription
              }>
              Receive a notification when your scheduled
              bedtime arrives.
            </Text>

            <Text
              style={styles.statusText}>
              {sleepRemindersEnabled
                ? 'Sleep reminders are enabled'
                : 'Sleep reminders are disabled'}
            </Text>
          </View>

          <Switch
            value={
              sleepRemindersEnabled
            }
            onValueChange={
              handleSleepReminderToggle
            }
            disabled={
              isUpdatingSleep
            }
            trackColor={{
              false: '#d5d5d5',
              true: '#777777',
            }}
            thumbColor={
              sleepRemindersEnabled
                ? '#111111'
                : '#f4f4f4'
            }
          />
        </View>

        <View
          style={styles.timeCard}>
          <Text
            style={styles.settingTitle}>
            Bedtime
          </Text>

          <Text
            style={
              styles.settingDescription
            }>
            Choose when you would like to receive your
            sleep reminder.
          </Text>

          <Pressable
            style={styles.timeButton}
            onPress={() =>
              setShowSleepTimePicker(
                true,
              )
            }
            disabled={
              isUpdatingSleep
            }>
            <Text
              style={
                styles.timeButtonText
              }>
              {formatTime(
                selectedSleepTime,
              )}
            </Text>
          </Pressable>

          {showSleepTimePicker && (
            <DateTimePicker
              value={getPickerDate(
                selectedSleepTime,
              )}
              mode="time"
              is24Hour={false}
              display={
                Platform.OS === 'ios'
                  ? 'spinner'
                  : 'default'
              }
              onChange={
                handleSleepTimeChange
              }
            />
          )}

          <Pressable
            style={[
              styles.saveButton,
              isUpdatingSleep &&
                styles.disabledButton,
            ]}
            onPress={
              handleSaveSleepTime
            }
            disabled={
              isUpdatingSleep
            }>
            <Text
              style={
                styles.saveButtonText
              }>
              Save bedtime
            </Text>
          </Pressable>
        </View>

        {(isUpdatingMood ||
          isUpdatingSleep) && (
          <View
            style={
              styles.updatingContainer
            }>
            <ActivityIndicator
              size="small"
            />

            <Text
              style={
                styles.updatingText
              }>
              Updating reminder settings...
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(
  time:
    | ReminderTime
    | SleepReminderTime,
): string {
  const date = new Date();

  date.setHours(
    time.hour,
    time.minute,
    0,
    0,
  );

  return date.toLocaleTimeString(
    [],
    {
      hour: 'numeric',
      minute: '2-digit',
    },
  );
}

const styles =
  StyleSheet.create({
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

    updatingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 20,
    },

    updatingText: {
      color: '#777777',
      fontSize: 13,
      marginLeft: 8,
    },
  });