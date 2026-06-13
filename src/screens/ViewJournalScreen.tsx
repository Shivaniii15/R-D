import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { JournalStackParamList } from '../navigation/JournalNavigator';
import { styles } from '../styles/Journal.styles';


type NavProp = NativeStackNavigationProp<JournalStackParamList, 'ViewJournal'>;
type RouteProps = RouteProp<JournalStackParamList, 'ViewJournal'>;

export default function ViewJournalScreen(): React.JSX.Element {
  const navigation = useNavigation<NavProp>();
  const { params } = useRoute<RouteProps>();
  const { journal } = params;

  function formatDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleString();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{journal.title}</Text>
        <Text style={styles.date}>{formatDate(journal.createdAt)}</Text>
        <View style={styles.divider} />
        <Text style={styles.body}>{journal.body}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}


