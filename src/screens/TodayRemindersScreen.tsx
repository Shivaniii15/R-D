import React, {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

import {
  getTodaysReminderCompleted,
  markTodaysReminderCompleted,
} from '../storage/reminderCompletion.storage';

export default function TodayRemindersScreen(): React.JSX.Element {
  const [isCompleted, setIsCompleted] =
    useState<boolean>(false);

  const [isLoading, setIsLoading] =
    useState<boolean>(true);

  const [isUpdating, setIsUpdating] =
    useState<boolean>(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadReminderStatus(): Promise<void> {
        setIsLoading(true);

        try {
          const completed =
            await getTodaysReminderCompleted();

          if (isActive) {
            setIsCompleted(completed);
          }
        } catch (error) {
          console.error(
            'Failed to load reminder status:',
            error,
          );
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      loadReminderStatus();

      return () => {
        isActive = false;
      };
    }, []),
  );

  async function handleMarkCompleted(): Promise<void> {
    if (isCompleted || isUpdating) {
      return;
    }

    setIsUpdating(true);

    try {
      await markTodaysReminderCompleted();
      setIsCompleted(true);

      Alert.alert(
        'Activity completed',
        'Your self-care reminder has been marked as completed.',
      );
    } catch (error) {
      console.error(
        'Failed to complete reminder:',
        error,
      );

      Alert.alert(
        'Unable to complete reminder',
        'The reminder could not be marked as completed. Please try again.',
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
          Today&apos;s Reminders
        </Text>

        <Text style={styles.subheading}>
          Complete today&apos;s self-care activity and keep track of your progress.
        </Text>

        <View
          style={[
            styles.reminderCard,
            isCompleted && styles.completedCard,
          ]}>
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.iconContainer,
                isCompleted &&
                  styles.completedIconContainer,
              ]}>
              <Feather
                name={isCompleted ? 'check' : 'heart'}
                size={24}
                color={isCompleted ? '#ffffff' : '#111111'}
              />
            </View>

            <View style={styles.headerTextContainer}>
              <Text style={styles.reminderTitle}>
                Daily mood check-in
              </Text>

              <Text
                style={[
                  styles.statusText,
                  isCompleted
                    ? styles.completedStatus
                    : styles.pendingStatus,
                ]}>
                {isCompleted ? 'Completed' : 'Pending'}
              </Text>
            </View>
          </View>

          <Text style={styles.reminderDescription}>
            Take a moment to reflect on your day and record how you are feeling.
          </Text>

          {isCompleted ? (
            <View style={styles.completedMessage}>
              <Feather
                name="check-circle"
                size={20}
                color="#287a45"
              />

              <Text style={styles.completedMessageText}>
                You completed today&apos;s self-care activity.
              </Text>
            </View>
          ) : (
            <Pressable
              style={[
                styles.completeButton,
                isUpdating &&
                  styles.disabledButton,
              ]}
              onPress={handleMarkCompleted}
              disabled={isUpdating}>
              {isUpdating ? (
                <ActivityIndicator
                  size="small"
                  color="#ffffff"
                />
              ) : (
                <>
                  <Feather
                    name="check-circle"
                    size={19}
                    color="#ffffff"
                  />

                  <Text style={styles.completeButtonText}>
                    Mark as Completed
                  </Text>
                </>
              )}
            </Pressable>
          )}
        </View>
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
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 28,
  },

  reminderCard: {
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#eeeeee',
  },

  completedCard: {
    backgroundColor: '#f1faf4',
    borderColor: '#bcdcc6',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8e8e8',
  },

  completedIconContainer: {
    backgroundColor: '#287a45',
  },

  headerTextContainer: {
    flex: 1,
    marginLeft: 14,
  },

  reminderTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '700',
  },

  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },

  pendingStatus: {
    color: '#a06b00',
  },

  completedStatus: {
    color: '#287a45',
  },

  reminderDescription: {
    color: '#666666',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 18,
  },

  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 20,
  },

  completeButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  completedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dff3e5',
    borderRadius: 12,
    padding: 14,
    marginTop: 20,
  },

  completedMessageText: {
    flex: 1,
    color: '#287a45',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 9,
  },
});