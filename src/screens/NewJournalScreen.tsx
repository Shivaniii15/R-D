import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Voice from '@dev-amirzubair/react-native-voice';
import { launchImageLibrary } from 'react-native-image-picker';
import { saveJournal } from '../storage/journal.storage';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { createJournalStyles } from '../styles/journal.styles';
import { useTheme } from '../theme/ThemeContext';
import { useAccessibility } from '../context/AccessibilityContext';
import Feather from 'react-native-vector-icons/Feather';

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
  const { colors } = useTheme();
  const { scale } = useAccessibility();
  const styles = createJournalStyles(colors);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [prompt, setPrompt] = useState(getRandomPrompt());
  const [isListening, setIsListening] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const navigation = useNavigation<NavProp>();

  useEffect(() => {
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    Voice.onSpeechResults = event => {
      const recognizedText = event.value?.[0]?.trim();
      if (recognizedText) {
        setBody(currentBody =>
          currentBody
            ? `${currentBody.trimEnd()} ${recognizedText}`
            : recognizedText,
        );
      }
    };
    Voice.onSpeechError = event => {
      setIsListening(false);
      Alert.alert(
        'Voice input unavailable',
        event.error?.message ?? 'Speech recognition could not start. Please try again.',
      );
    };

    return () => {
      Voice.destroy()
        .then(() => Voice.removeAllListeners())
        .catch(error => console.warn('Failed to clean up speech recognition:', error));
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
      imageUri: imageUri ?? undefined,
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
      }
    } catch (error) {
      setIsListening(false);
      Alert.alert(
        'Voice input unavailable',
        error instanceof Error
          ? error.message
          : 'Speech recognition could not start. Please try again.',
      );
    }
  }

  function handleImageAttachment() {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setImageUri(uri);
      }
    });
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>New Journal</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
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
              <Text style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Prompt Suggestion
              </Text>
              <Text style={{ fontSize: 14, color: '#333', lineHeight: 20 }}>
                {prompt}
              </Text>
            </View>
            <TouchableOpacity onPress={handleNewPrompt} style={{ marginLeft: 12, padding: 4 }}>
              <Feather name="refresh-cw" size={18} color="#888" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <View style={styles.divider} />

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
                name="mic"
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

          <TouchableOpacity
            onPress={handleImageAttachment}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 16,
              padding: 12,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e0e0e0',
              borderStyle: 'dashed',
            }}>
            <Feather name="image" size={scale(18)} color="#888" />
            <Text style={{ fontSize: scale(14), color: '#888', marginLeft: 8 }}>
              {imageUri ? 'Change image' : 'Add image'}
            </Text>
          </TouchableOpacity>

          {imageUri && (
            <View style={{ marginTop: 12, position: 'relative' }}>
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setImageUri(null)}
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderRadius: 12,
                  padding: 4,
                }}>
                <Feather name="x" size={scale(16)} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}