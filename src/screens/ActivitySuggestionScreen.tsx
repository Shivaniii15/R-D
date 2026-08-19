import React, {
  useMemo,
  useState,
} from 'react';

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

interface ActivitySuggestion {
  title: string;
  description: string;
  duration: string;
  icon: string;
}

const suggestions: ActivitySuggestion[] = [
  {
    title: 'Take a short walk',
    description:
      'Walk around your home, campus, workplace, or outside at a comfortable pace.',
    duration: '5 minutes',
    icon: 'navigation',
  },
  {
    title: 'Stretch your body',
    description:
      'Gently stretch your neck, shoulders, arms, back, and legs.',
    duration: '3–5 minutes',
    icon: 'activity',
  },
  {
    title: 'Stand and move',
    description:
      'Stand up, shake out your arms and legs, and move around the room.',
    duration: '2 minutes',
    icon: 'move',
  },
];

export default function ActivitySuggestionScreen(): React.JSX.Element {
  const navigation = useNavigation();

  const initialIndex = useMemo(
    () =>
      new Date().getDate() %
      suggestions.length,
    [],
  );

  const [suggestionIndex, setSuggestionIndex] =
    useState(initialIndex);

  const suggestion =
    suggestions[suggestionIndex];

  function showAnotherSuggestion(): void {
    setSuggestionIndex(currentIndex =>
      (currentIndex + 1) %
      suggestions.length,
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Feather
            name="arrow-left"
            size={20}
            color="#111111"
          />

          <Text style={styles.backText}>
            Back
          </Text>
        </Pressable>

        <Text style={styles.heading}>
          Movement break
        </Text>

        <Text style={styles.subheading}>
          Try a small activity to refresh your body
          and support your mood.
        </Text>

        <View style={styles.suggestionCard}>
          <View style={styles.iconContainer}>
            <Feather
              name={suggestion.icon}
              size={32}
              color="#ffffff"
            />
          </View>

          <Text style={styles.suggestionTitle}>
            {suggestion.title}
          </Text>

          <Text style={styles.duration}>
            {suggestion.duration}
          </Text>

          <Text style={styles.description}>
            {suggestion.description}
          </Text>
        </View>

        <Pressable
          style={styles.anotherButton}
          onPress={showAnotherSuggestion}>
          <Feather
            name="refresh-cw"
            size={18}
            color="#ffffff"
          />

          <Text style={styles.anotherButtonText}>
            Show another activity
          </Text>
        </Pressable>

        <Text style={styles.safetyText}>
          Choose an activity that feels comfortable and
          appropriate for you.
        </Text>
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
    paddingTop: 20,
    paddingBottom: 40,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 18,
  },

  backText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },

  heading: {
    color: '#111111',
    fontSize: 30,
    fontWeight: '700',
  },

  subheading: {
    color: '#777777',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 8,
  },

  suggestionCard: {
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 18,
    padding: 24,
    marginTop: 30,
  },

  iconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
  },

  suggestionTitle: {
    color: '#111111',
    fontSize: 23,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },

  duration: {
    color: '#287a45',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
  },

  description: {
    color: '#666666',
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 14,
  },

  anotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: 20,
  },

  anotherButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 9,
  },

  safetyText: {
    color: '#888888',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 20,
  },
});