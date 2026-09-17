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
import { getJournalInsights, InsightType, INSIGHT_TYPES } from '../services/gemini.service';
import { useAccessibility } from '../context/AccessibilityContext';

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'JournalList'>;

type ModalStep = 'selectType' | 'selectJournal' | 'loading' | 'result';

export default function JournalScreen(): React.JSX.Element {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>('selectType');
  const [selectedType, setSelectedType] = useState<InsightType>('general');
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [insights, setInsights] = useState('');
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

  function openAIModal() {
    if (journals.length === 0) {
      Alert.alert('No Journals', 'Create a journal entry first to get AI insights.');
      return;
    }
    setModalStep('selectType');
    setSelectedJournal(null);
    setInsights('');
    setModalVisible(true);
  }

  function handleSelectType(type: InsightType) {
    setSelectedType(type);
    setModalStep('selectJournal');
  }

  async function handleSelectJournal(journal: Journal) {
    setSelectedJournal(journal);
    setModalStep('loading');
    try {
      const result = await getJournalInsights(journal, selectedType);
      setInsights(result);
      setModalStep('result');
    } catch (error) {
      setModalVisible(false);
      Alert.alert('Error', 'Failed to get AI insights. Please check your API key and try again.');
    }
  }

  function closeModal() {
    setModalVisible(false);
    setModalStep('selectType');
    setSelectedJournal(null);
    setInsights('');
  }

  const selectedTypeInfo = INSIGHT_TYPES.find(t => t.type === selectedType);

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

            {/* Step 1 — Select Insight Type */}
            {modalStep === 'selectType' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>AI Insights</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>What kind of insights would you like?</Text>
                {INSIGHT_TYPES.map(item => (
                  <TouchableOpacity
                    key={item.type}
                    style={styles.typeCard}
                    onPress={() => handleSelectType(item.type)}
                    activeOpacity={0.7}>
                    <Text style={styles.typeEmoji}>{item.emoji}</Text>
                    <View style={styles.typeTextContainer}>
                      <Text style={styles.typeLabel}>{item.label}</Text>
                      <Text style={styles.typeDescription}>{item.description}</Text>
                    </View>
                    <Text style={styles.typeArrow}>›</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Step 2 — Select Journal */}
            {modalStep === 'selectJournal' && (
              <>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setModalStep('selectType')}>
                    <Text style={styles.modalBack}>← Back</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>{selectedTypeInfo?.emoji} {selectedTypeInfo?.label}</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>Choose a journal entry to analyse.</Text>
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

            {/* Step 3 — Loading */}
            {modalStep === 'loading' && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#111" />
                <Text style={styles.modalLoadingText}>
                  Analysing "{selectedJournal?.title}"...
                </Text>
              </View>
            )}

            {/* Step 4 — Result */}
            {modalStep === 'result' && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedTypeInfo?.emoji} {selectedTypeInfo?.label}</Text>
                  <TouchableOpacity onPress={closeModal}>
                    <Text style={styles.modalClose}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalSubtitle}>Based on "{selectedJournal?.title}"</Text>
                <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
                  <Text style={styles.insightsText}>{insights}</Text>
                </ScrollView>
                <TouchableOpacity
                  style={styles.modalBackButton}
                  onPress={() => setModalStep('selectType')}>
                  <Text style={styles.modalBackButtonText}>← Try a different insight type</Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}