import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getJournals, deleteJournal } from '../storage/journal.storage';
import { Journal } from '../types/journal.types';
import { JournalStackParamList } from '../navigation/JournalNavigator';

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'JournalList'>;

export default function JournalScreen(): React.JSX.Element {
  const [journals, setJournals] = useState<Journal[]>([]);
  const navigation = useNavigation<NavProp>();

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
    const date = new Date(iso);
    return date.toLocaleString();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Journals</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate('NewJournal')}>
          <Text style={styles.newButtonText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {journals.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No journals yet. Create one!</Text>
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
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.cardBody} numberOfLines={2}>
                  {item.body}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  newButton: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '500',
  },
});