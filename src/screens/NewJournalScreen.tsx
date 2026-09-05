import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { saveJournal } from '../storage/journal.storage';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { journalStyles as styles } from '../styles/journal.styles';
import Feather from 'react-native-vector-icons/Feather';
import { useAccessibility } from '../context/AccessibilityContext';
import Voice from '@dev-amirzubair/react-native-voice';

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
  const [isListening, setIsListening] = useState(false);
  const navigation = useNavigation<NavProp>();
  const { scale } = useAccessibility();

  useEffect(() => {
    Voice.onSpeechResults = (e: any) => {
      if (e.value && e.value.length > 0) {
        setBody(prev => prev + (prev ? ' ' : '') + e.value[0]);
      }
    };

    Voice.onSpeechError = (e: any) => {
      console.log('Speech error:', e);
      setIsListening(false);
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

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

  async function handleVoiceToggle() {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        await Voice.start('en-NZ');
        setIsListening(true);
      }
    } catch (e) {
      console.log('Voice error:', e);
      setIsListening(false);
    }
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

          {/* Body input with mic button */}
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.bodyInput, { fontSize: scale(16), paddingRight: 48 }]}
              placeholder="Write your thoughts..."
              placeholderTextColor="#bbb"
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              onPress={handleVoiceToggle}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                padding: 8,
                borderRadius: 20,
                backgroundColor: isListening ? '#e74c3c' : '#f0f0f0',
              }}>
              <Feather
                name={isListening ? 'mic' : 'mic'}
                size={scale(20)}
                color={isListening ? '#fff' : '#888'}
              />
            </TouchableOpacity>
          </View>

          {isListening && (
            <Text style={{ fontSize: scale(12), color: '#e74c3c', marginTop: 8, textAlign: 'center' }}>
              Listening... tap the mic to stop
            </Text>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}