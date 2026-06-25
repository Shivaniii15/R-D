import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { saveJournal } from '../storage/journal.storage';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { journalStyles as styles } from '../styles/journal.styles';

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'NewJournal'>;

export default function NewJournalScreen(): React.JSX.Element {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const navigation = useNavigation<NavProp>();

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
