import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getJournals, deleteJournal } from '../storage/journal.storage';
import { Journal } from '../types/journal.types';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { journalStyles as styles } from '../styles/journal.styles';
import { useAccessibility } from '../context/AccessibilityContext';

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'JournalList'>;

export default function JournalScreen(): React.JSX.Element {
  const [journals, setJournals] = useState<Journal[]>([]);
  const navigation = useNavigation<NavProp>();
  const { scale } = useAccessibility();

  useFocusEffect(
    useCallback(() => {
      getJournals().then(setJournals);
    }, []),
  );

  async function handleDelete(id: string) {
    await deleteJournal(id);
    setJournals(prev => prev.filter(j => j.id !== id));
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.heading, { fontSize: scale(20) }]}>My Journals</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('NewJournal')}>
          <Text style={[styles.newButtonText, { fontSize: scale(14) }]}>+ New</Text>
        </TouchableOpacity>
      </View>

      {journals.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { fontSize: scale(15) }]}>No journals yet. Create one!</Text>
        </View>
      ) : (
        <FlatList
          data={journals}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ViewJournal', { journal: item })}>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { fontSize: scale(16) }]}>{item.title}</Text>
                <Text style={[styles.cardDate, { fontSize: scale(12) }]}>{formatDate(item.createdAt)}</Text>
                <Text style={[styles.cardBody, { fontSize: scale(14) }]} numberOfLines={2}>{item.body}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={[styles.deleteText, { fontSize: scale(13) }]}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}