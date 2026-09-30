import React, { useState } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { updateJournal } from '../storage/journal.storage';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { journalStyles as styles } from '../styles/journal.styles';
import { useAccessibility } from '../context/AccessibilityContext';
import Feather from 'react-native-vector-icons/Feather';

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'ViewJournal'>;
type RouteProps = RouteProp<JournalStackParamList, 'ViewJournal'>;

export default function ViewJournalScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RouteProps>();
  const { journal } = params;
  const { scale } = useAccessibility();

  const [title, setTitle] = useState(journal.title);
  const [body, setBody] = useState(journal.body);
  const [imageUri, setImageUri] = useState<string | undefined>(journal.imageUri);

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title.');
      return;
    }
    await updateJournal({
      ...journal,
      title: title.trim(),
      body: body.trim(),
      imageUri: imageUri,
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancel, { fontSize: scale(15) }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.heading, { fontSize: scale(20) }]}>Edit Journal</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { fontSize: scale(15) }]}>Save</Text>
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form}>
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

          {imageUri && (
            <View style={{ marginTop: 16, position: 'relative' }}>
              <Image
                source={{ uri: imageUri }}
                style={{ width: '100%', height: 200, borderRadius: 12 }}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={() => setImageUri(undefined)}
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