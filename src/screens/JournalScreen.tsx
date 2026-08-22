import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getJournals, deleteJournal } from '../storage/journal.storage';
import { Journal } from '../types/journal.types';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { journalStyles as styles } from '../styles/journal.styles';
import { getJournalInsights } from '../services/gemini.service';

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'JournalList'>;

type ModalStep = 'select' | 'loading' | 'result';

export default function JournalScreen(): React.JSX.Element {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('select');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [insights, setInsights] = useState('');
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
    return new Date(iso).toLocaleString();
  }

  function openAIModal() {
    if (journals.length === 0) {
      Alert.alert('No Journals', 'Create a journal entry first to get AI insights.');
      return;
    }
    setModalStep('select');
    setSelectedJournal(null);
    setInsights('');
    setModalVisible(true);
  }

  async function handleSelectJournal(journal: Journal) {
    setSelectedJournal(journal);
    setModalStep('loading');
    try {
      const result = await getJournalInsights(journal);
      setInsights(result);
      setModalStep('result');
    } catch (error) {
      setModalVisible(false);
      Alert.alert('Error', 'Failed to get AI insights. Please check your API key and try again.');
    }
  }

  function closeModal() {
    setModalVisible(false);
    setModalStep('select');
    setSelectedJournal(null);
    setInsights('');
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
                <Text style={styles.cardBody} numberOfLines={2}>{item.body}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      {/* AI Insights Button */}
      <TouchableOpacity style={styles.aiButton} onPress={openAIModal} activeOpacity={0.8}>
        <Text style={styles.aiButtonText}>✦ AI Insights</Text>
      </TouchableOpacity>

      {/* AI Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            {/* Select Journal Step */}
            {modalStep === 'select' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select a Journal</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>
                  Choose a journal entry to get AI insights on.
                </Text>
                <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                  {journals.map(journal => (
                    <TouchableOpacity
                      key={journal.id}
                      style={styles.modalCard}
                      onPress={() => handleSelectJournal(journal)}
                      activeOpacity={0.7}>
                      <Text style={styles.modalCardTitle}>{journal.title}</Text>
                      <Text style={styles.modalCardDate}>{formatDate(journal.createdAt)}</Text>
                      <Text style={styles.modalCardBody} numberOfLines={2}>{journal.body}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            {/* Loading Step */}
            {modalStep === 'loading' && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#111" />
                <Text style={styles.modalLoadingText}>
                  Analysing "{selectedJournal?.title}"...
                </Text>
              </View>
            )}

            {/* Result Step */}
            {modalStep === 'result' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>AI Insights</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>
                  Based on "{selectedJournal?.title}"
                </Text>
                <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                  <Text style={styles.insightsText}>{insights}</Text>
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => setModalStep('select')}>
                  <Text style={styles.modalBackButtonText}>← Try another journal</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}