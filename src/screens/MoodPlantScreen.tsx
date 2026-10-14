import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export default function MoodPlantScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48 }}>🌱</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16 }}>Coming Soon</Text>
        <Text style={{ fontSize: 14, color: colors.textSubtle, marginTop: 8 }}>Your mood plant is on its way!</Text>
      </View>
    </SafeAreaView>
  );
}