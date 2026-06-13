import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'NewJournal'>;

export default function NewJournalScreen(): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const navigation = useNavigation<NavProp>();

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title for your journal.');
      return;
    }
    const journal = {
      id: Date.now().toString(),
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };
    await saveJournal(journal);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>New Journal</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.save}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form}>
          <TextInput
            style={styles.titleInput}
            placeholder="Title"
            placeholderTextColor="#bbb"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <View style={styles.divider} />
          <TextInput
            style={styles.bodyInput}
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heading: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111',
  },
  cancel: {
    fontSize: 15,
    color: '#aaa',
  },
  save: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  form: {
    padding: 20,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  bodyInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 300,
  },
});
