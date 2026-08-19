import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Feather from 'react-native-vector-icons/Feather';

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#f0f0f0',
        }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#111' }}>Wellness</Text>
          <Text style={{ fontSize: 14, color: '#aaa', marginTop: 4 }}>Tools to support your wellbeing.</Text>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          {options.map(option => (
            <TouchableOpacity
              key={option.id}
              onPress={() => navigation.navigate(option.screen)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: '#f0f0f0',
                marginBottom: 14,
                backgroundColor: '#fff',
              }}
              activeOpacity={0.7}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 14,
                backgroundColor: option.color,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}>
                <Feather name={option.icon} size={22} color="#111" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#111' }}>{option.title}</Text>
                <Text style={{ fontSize: 13, color: '#aaa', marginTop: 3 }}>{option.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#bbb" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}