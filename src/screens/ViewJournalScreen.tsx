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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { updateJournal } from '../storage/journal.storage';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { journalStyles as styles } from '../styles/journal.styles';

type NavProp = NativeStackNavigationProp<JournalStackParamList, 'ViewJournal'>;
type RouteProps = RouteProp<JournalStackParamList, 'ViewJournal'>;

export default function ViewJournalScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RouteProps>();
  const { journal } = params;

  const [title, setTitle] = useState(journal.title);
  const [body, setBody] = useState(journal.body);

  async function handleSave() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter a title.');
      return;
    }
    await updateJournal({
      ...journal,
      title: title.trim(),
      body: body.trim(),
    });
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Edit Journal</Text>
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