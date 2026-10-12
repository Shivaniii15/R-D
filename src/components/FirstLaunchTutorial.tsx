import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { getTutorialCompleted, setTutorialCompleted } from '../storage/tutorial.storage';
import { ThemeColors, useTheme } from '../theme/ThemeContext';

const tutorialSteps = [
  {
    tab: 'Home',
    icon: 'home',
    title: 'Track your mood',
    description: 'Log your mood during the day and experience how it develops over time.',
  },
  {
    tab: 'Journal',
    icon: 'book',
    title: 'Log your journey',
    description: 'Create private journal entries to write down how you feel. Save the journal entries to review later or delete them if you want to start fresh.',
  },
  {
    tab: 'Settings',
    icon: 'settings',
    title: 'Adjust your preferences',
    description: 'Manage your reminder timers, adjust notification settings, and customize the appearance between a lighter mode and a darker mode.',
  },
  {
    tab: 'Wellness',
    icon: 'heart',
    title: 'Explore wellbeing resources',
    description: 'Find wellbeing resources dependent on if you are a student or a staff member and try a breathing exercise to relax.',
  },
];

export default function FirstLaunchTutorial({
  start,
}: {
  start: boolean;
}): React.JSX.Element {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!start) {
      return;
    }

    let active = true;

    getTutorialCompleted()
      .then(completed => {
        if (active && !completed) {
          setVisible(true);
        }
      })
      .catch(() => {
        if (active) {
          setVisible(true);
        }
      });

    return () => {
      active = false;
    };
  }, [start]);

  function dismissTutorial(): void {
    setVisible(false);
    setStepIndex(0);
    setTutorialCompleted().catch(() => {
      Alert.alert(
        'Tutorial preference not saved',
        'The tutorial may appear again the next time you open the app.',
      );
    });
  }

  const currentStep = tutorialSteps[stepIndex];
  const isLastStep = stepIndex === tutorialSteps.length - 1;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={dismissTutorial}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.eyebrow}>
              {currentStep.tab.toUpperCase()}  ·  {stepIndex + 1} OF {tutorialSteps.length}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close tutorial"
              hitSlop={12}
              onPress={dismissTutorial}
              style={styles.closeButton}>
              <Feather name="x" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.iconCircle}>
            <Feather name={currentStep.icon} size={30} color={colors.accent} />
          </View>

          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.description}>{currentStep.description}</Text>
          <Text style={styles.hint}>Use the tabs along the bottom to move around the app.</Text>

          <View style={styles.progressRow}>
            {tutorialSteps.map((item, index) => (
              <View
                key={item.tab}
                style={[styles.progressDot, index === stepIndex && styles.progressDotActive]}
              />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (isLastStep) {
                dismissTutorial();
              } else {
                setStepIndex(index => index + 1);
              }
            }}
            style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {isLastStep ? 'Get started' : 'Next'}
            </Text>
            {!isLastStep && (
              <Feather name="arrow-right" size={18} color={colors.accentText} />
            )}
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={dismissTutorial}
            style={styles.skipButton}>
            <Text style={styles.skipButtonText}>Skip tutorial</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: 'rgba(0, 0, 0, 0.48)',
    },
    card: {
      width: '100%',
      maxWidth: 420,
      padding: 24,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    topRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    eyebrow: {
      color: colors.textSubtle,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 1,
    },
    closeButton: {
      padding: 4,
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceMuted,
      marginBottom: 20,
    },
    title: {
      color: colors.text,
      fontSize: 23,
      lineHeight: 29,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 10,
    },
    description: {
      color: colors.textMuted,
      fontSize: 15,
      lineHeight: 23,
      textAlign: 'center',
    },
    hint: {
      color: colors.textSubtle,
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 16,
    },
    progressRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 24,
      marginBottom: 22,
    },
    progressDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    progressDotActive: {
      width: 22,
      backgroundColor: colors.accent,
    },
    primaryButton: {
      width: '100%',
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    primaryButtonText: {
      color: colors.accentText,
      fontSize: 15,
      fontWeight: '700',
    },
    skipButton: {
      paddingVertical: 14,
      paddingHorizontal: 12,
    },
    skipButtonText: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
