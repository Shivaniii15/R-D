import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMoodEntries } from '../storage/mood.storage';
import { MoodEntry } from '../types/mood.types';
import { moodHistoryStyles as styles } from '../styles/moodHistory.styles';

export default function MoodHistoryScreen(): React.JSX.Element {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      getMoodEntries().then(savedEntries => {
        const sortedEntries = [...savedEntries].sort((a, b) =>
          b.date.localeCompare(a.date),
        );
        setEntries(sortedEntries);
      });
    }, []),
  );

  function formatDate(date: string): string {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function getMoodDescription(mood: number): string {
    if (mood <= 1) return 'Very low';
    if (mood <= 2) return 'Low';
    if (mood <= 3) return 'Okay';
    if (mood <= 4) return 'Good';
    return 'Excellent';
  }

  async function handleClearAll() {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all your mood entries. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('mood_entries');
            setEntries([]);
            setSelectedEntry(null);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Mood History</Text>
        <Text style={styles.subheading}>
          Review how your mood has changed over time.
        </Text>
      </View>

      {selectedEntry && (
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Selected entry</Text>
            <TouchableOpacity onPress={() => setSelectedEntry(null)}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.detailsDate}>{formatDate(selectedEntry.date)}</Text>
          <Text style={styles.detailsMood}>{selectedEntry.mood}/5</Text>
          <Text style={styles.detailsDescription}>
            {getMoodDescription(selectedEntry.mood)}
          </Text>
          <Text style={styles.notesLabel}>Notes</Text>
          <Text style={styles.notesText}>
            No notes were recorded for this mood entry.
          </Text>
        </View>
      )}

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No mood data yet</Text>
          <Text style={styles.emptyText}>
            Your previous mood entries will appear here after you begin logging them.
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={entries}
            keyExtractor={item => item.date}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.entryCard}
                activeOpacity={0.7}
                onPress={() => setSelectedEntry(item)}>
                <View>
                  <Text style={styles.entryDate}>{formatDate(item.date)}</Text>
                  <Text style={styles.entryDescription}>
                    {getMoodDescription(item.mood)}
                  </Text>
                </View>
                <View style={styles.moodBadge}>
                  <Text style={styles.moodBadgeText}>{item.mood}/5</Text>
                </View>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.clearButton}
            activeOpacity={0.8}
            onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>Clear All History</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}