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
import { useTheme } from '../theme/ThemeContext';
import type { ThemeColors } from '../theme/ThemeContext';

export default function TodayRemindersScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
          <ActivityIndicator size="large" color={colors.accent} />
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
                color={isCompleted ? colors.accentText : colors.text}
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
                color={colors.accent}
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
                  color={colors.accentText}
                />
              ) : (
                <>
                  <Feather
                    name="check-circle"
                    size={19}
                    color={colors.accentText}
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
      fontSize: 30,
      fontWeight: '700',
    },

    subheading: {
      color: colors.textMuted,
      fontSize: 16,
      lineHeight: 22,
      marginTop: 6,
      marginBottom: 28,
    },

    reminderCard: {
      backgroundColor: colors.surfaceMuted,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
    },

    completedCard: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
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
      backgroundColor: colors.border,
    },

    completedIconContainer: {
      backgroundColor: colors.accent,
    },

    headerTextContainer: {
      flex: 1,
      marginLeft: 14,
    },

    reminderTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },

    statusText: {
      fontSize: 14,
      fontWeight: '600',
      marginTop: 4,
    },

    pendingStatus: {
      color: colors.textMuted,
    },

    completedStatus: {
      color: colors.accent,
    },

    reminderDescription: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 18,
    },

    completeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 20,
    },

    completeButtonText: {
      color: colors.accentText,
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
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 14,
      marginTop: 20,
    },

    completedMessageText: {
      flex: 1,
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 9,
    },
  });
}