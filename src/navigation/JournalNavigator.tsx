import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JournalScreen from '../screens/JournalScreen';
import NewJournalScreen from '../screens/NewJournalScreen';
import ViewJournalScreen from '../screens/ViewJournalScreen';
import { Journal } from '../types/journal.types';

export type JournalStackParamList = {
  JournalList: undefined;
  NewJournal: undefined;
  ViewJournal: { journal: Journal };
};

const Stack = createNativeStackNavigator<JournalStackParamList>();

export default function JournalNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="JournalList" component={JournalScreen} />
      <Stack.Screen name="NewJournal" component={NewJournalScreen} />
      <Stack.Screen name="ViewJournal" component={ViewJournalScreen} />
    </Stack.Navigator>
  );
}