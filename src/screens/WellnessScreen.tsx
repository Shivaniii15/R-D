import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';
import { useAccessibility } from '../context/AccessibilityContext';
import { useTheme } from '../theme/ThemeContext';

type WellnessStackParamList = {
  WellnessHome: undefined;
  Resources: undefined;
  Breathing: undefined;
  MoodPlant: undefined;
};

type NavigationProp = NativeStackNavigationProp<WellnessStackParamList>;

interface WellnessOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  screen: keyof WellnessStackParamList;
}

const options: WellnessOption[] = [
  {
    id: '1',
    title: 'Resources',
    description: 'Articles, guides and links to AUT wellbeing services.',
    icon: 'grid',
    color: '#CCE5FF',
    screen: 'Resources',
  },
  {
    id: '2',
    title: 'Breathing Exercise',
    description: 'A guided box breathing exercise to help you calm down.',
    icon: 'wind',
    color: '#D4EDDA',
    screen: 'Breathing',
  },
  {
    id: '3',
    title: 'Mood Plant',
    description: 'Grow your plant by logging your mood every day.',
    icon: 'feather',
    color: '#FFF3CD',
    screen: 'MoodPlant',
  },
];

export default function WellnessScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { scale } = useAccessibility();
  const { colors } = useTheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    options: {
      paddingHorizontal: 20,
      paddingTop: 24,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
      backgroundColor: colors.surface,
    },
    optionIcon: {
      width: 50,
      height: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    optionContent: {
      flex: 1,
    },
    title: {
      fontWeight: '600',
      color: colors.text,
    },
    description: {
      color: colors.textMuted,
      marginTop: 3,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text style={{ fontSize: scale(24), fontWeight: '700', color: colors.text }}>Wellness</Text>
          <Text style={{ fontSize: scale(14), color: colors.textSubtle, marginTop: 4 }}>Tools to support your wellbeing.</Text>
        </View>

        <View style={styles.options}>
          {options.map(option => (
            <TouchableOpacity
              key={option.id}
              onPress={() => navigation.navigate(option.screen)}
              style={styles.option}
              activeOpacity={0.7}>
              <View style={[styles.optionIcon, { backgroundColor: option.color }]}>
                <Feather name={option.icon} size={scale(22)} color={colors.text} />
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.title, { fontSize: scale(16) }]}>{option.title}</Text>
                <Text style={[styles.description, { fontSize: scale(13) }]}>{option.description}</Text>
              </View>
              <Feather name="chevron-right" size={scale(20)} color={colors.textSubtle} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}