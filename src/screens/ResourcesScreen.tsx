import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { resourceStyles as styles } from '../styles/resources.styles';

type Category = 'International' | 'All Students' | 'Staff';

interface Resource {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  color: string;
  url?: string;
}

const resources: Record<Category, Resource[]> = {
  International: [
    {
      id: '1',
      title: 'Dealing with homesickness',
      subtitle: 'Guide · AUT Student Life',
      type: 'Guide',
      color: '#FFF3CD',
      url: 'https://www.aut.ac.nz/student-life/new-students/homesickness-and-how-to-overcome-it',
    },
    {
      id: '2',
      title: 'Cultural adaptation tips',
      subtitle: 'Guide · AUT International',
      type: 'Guide',
      color: '#D4EDDA',
      url: 'https://www.aut.ac.nz/international/international-student-support/new-zealand-values-and-customs-info-for-international-students/culture-shock-if-youre-an-international-student',
    },
    {
      id: '3',
      title: 'Settling into Auckland',
      subtitle: 'Guide · AUT International',
      type: 'Guide',
      color: '#CCE5FF',
      url: 'https://www.aut.ac.nz/international/international-student-support/starting-your-life-in-auckland-as-an-international-student',
    },
    {
      id: '4',
      title: 'AUT International Student Support',
      subtitle: 'Link · AUT Student Hub',
      type: 'Link',
      color: '#E2D9F3',
      url: 'https://www.aut.ac.nz/international/international-student-support',
    },
    {
      id: '5',
      title: 'Breathing exercises',
      subtitle: 'Exercise · offline',
      type: 'Exercise',
      color: '#FFE0E0',
    },
  ],
  'All Students': [
    {
      id: '6',
      title: 'AUT Counselling services',
      subtitle: 'Link · free & confidential',
      type: 'Link',
      color: '#FFF3CD',
      url: 'https://www.aut.ac.nz/student-life/student-health-and-wellbeing/counselling-and-mental-health-support',
    },
    {
      id: '7',
      title: 'Student health and wellbeing',
      subtitle: 'Guide · AUT Student Life',
      type: 'Guide',
      color: '#D4EDDA',
      url: 'https://www.aut.ac.nz/student-life/student-health-and-wellbeing',
    },
    {
      id: '8',
      title: 'Self-help tools and resources',
      subtitle: 'Link · AUT Wellbeing',
      type: 'Link',
      color: '#CCE5FF',
      url: 'https://student.aut.ac.nz/support-services/counselling-and-mental-health-support/wellbeing-self-help-tools-and-resources',
    },
    {
      id: '9',
      title: 'Loneliness and making friends',
      subtitle: 'Guide · AUT Student Life',
      type: 'Guide',
      color: '#E2D9F3',
      url: 'https://www.aut.ac.nz/student-life/support-services',
    },
    {
      id: '10',
      title: 'Breathing exercises',
      subtitle: 'Exercise · offline',
      type: 'Exercise',
      color: '#FFE0E0',
    },
  ],
  Staff: [
    {
      id: '11',
      title: 'AUT Staff benefits and support',
      subtitle: 'Link · AUT Working at AUT',
      type: 'Link',
      color: '#FFF3CD',
      url: 'https://www.aut.ac.nz/about/careers-at-aut/working-at-aut/staff-benefits',
    },
    {
      id: '12',
      title: 'Employee assistance programme',
      subtitle: 'Link · free counselling for staff',
      type: 'Link',
      color: '#D4EDDA',
      url: 'https://www.aut.ac.nz/about/careers-at-aut/working-at-aut/staff-benefits',
    },
    {
      id: '13',
      title: 'AUT Counselling services',
      subtitle: 'Link · AUT Student Life',
      type: 'Link',
      color: '#CCE5FF',
      url: 'https://www.aut.ac.nz/student-life/student-health-and-wellbeing/counselling-and-mental-health-support',
    },
    {
      id: '14',
      title: 'Breathing exercises',
      subtitle: 'Exercise · offline',
      type: 'Exercise',
      color: '#E2D9F3',
    },
  ],
};

export default function ResourcesScreen(): React.JSX.Element {
  const [activeCategory, setActiveCategory] = useState<Category>('International');

  const categories: Category[] = ['International', 'All Students', 'Staff'];

  function handlePress(resource: Resource) {
    if (resource.url) {
      Linking.openURL(resource.url);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Resources</Text>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryRow}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              activeCategory === cat && styles.categoryButtonActive,
            ]}
            onPress={() => setActiveCategory(cat)}>
            <Text
              style={[
                styles.categoryText,
                activeCategory === cat && styles.categoryTextActive,
              ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Resource Cards */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {resources[activeCategory].map(resource => (
          <TouchableOpacity
            key={resource.id}
            style={styles.card}
            onPress={() => handlePress(resource)}
            activeOpacity={resource.url ? 0.7 : 1}>
            <View style={[styles.cardIcon, { backgroundColor: resource.color }]} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{resource.title}</Text>
              <Text style={styles.cardSubtitle}>{resource.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}