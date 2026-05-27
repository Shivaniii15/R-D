import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';import { screenStyles } from '../styles/Screen.styles.ts';

export default function JournalScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={screenStyles.screen}>
      <Text style={screenStyles.screenTitle}>Journal</Text>
    </SafeAreaView>
  );
}