import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { saveJournal } from '../storage/journal.storage';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { journalStyles as styles } from '../styles/journal.styles';
import Feather from 'react-native-vector-icons/Feather';
import { useAccessibility } from '../context/AccessibilityContext';

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'NewJournal'>;

const PROMPTS = [
  'What made you smile today?',
  'What has been on your mind lately?',
  'What is one thing you are grateful for right now?',
  'How did today make you feel and why?',
  'What is something you are looking forward to?',
  'What is one challenge you faced today and how did you handle it?',
  'Describe a moment today where you felt calm or at peace.',
  'What is something kind you did for yourself or someone else today?',
  'What would make tomorrow a better day?',
  'What is one thing you wish people understood about how you are feeling?',
  'What has been draining your energy lately?',
  'What is something small that brought you joy this week?',
  'If you could change one thing about today, what would it be?',
  'What are you proud of yourself for recently?',
  'How are you really feeling right now, beyond just okay or fine?',
];

function getRandomPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

export default function NewJournalScreen(): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [prompt, setPrompt] = useState(getRandomPrompt());
  const navigation = useNavigation<NavProp>();
  const { scale } = useAccessibility();

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title.');
      return;
    }
    await saveJournal({
      id: Date.now().toString(),
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    });
    navigation.goBack();
  }

  function handleNewPrompt() {
    setPrompt(getRandomPrompt());
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancel, { fontSize: scale(15) }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.heading, { fontSize: scale(20) }]}>New Journal</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { fontSize: scale(15) }]}>Save</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form}>

          {/* Prompt Suggestion Card */}
          <View style={{
            backgroundColor: '#F0F4FF',
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: scale(11), color: '#888', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Prompt Suggestion
              </Text>
              <Text style={{ fontSize: scale(14), color: '#333', lineHeight: 20 }}>
                {prompt}
              </Text>
            </View>
            <TouchableOpacity onPress={handleNewPrompt} style={{ marginLeft: 12, padding: 4 }}>
              <Feather name="refresh-cw" size={scale(18)} color="#888" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.titleInput, { fontSize: scale(22) }]}
            placeholder="Title"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <View style={styles.divider} />
          <TextInput
            style={[styles.bodyInput, { fontSize: scale(16) }]}
            placeholder="Write your thoughts..."
            placeholderTextColor="#bbb"
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}