import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';import { screenStyles } from '../styles/Screen.styles.ts';

export default function HomeScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={screenStyles.screen}>
      <Text style={screenStyles.screenTitle}>Home</Text>
    </SafeAreaView>
  );
}