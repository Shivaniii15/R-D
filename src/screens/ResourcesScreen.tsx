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
      subtitle: 'Guide · 3 min read',
      type: 'Guide',
      color: '#FFF3CD',
      url: 'https://www.aut.ac.nz/student-life/student-support',
    },
    {
      id: '2',
      title: 'Cultural adaptation tips',
      subtitle: 'Article · NZ life',
      type: 'Article',
      color: '#D4EDDA',
      url: 'https://www.aut.ac.nz/student-life/international-students',
    },
    {
      id: '3',
      title: 'Time-zone family calls',
      subtitle: 'Tips · staying connected',
      type: 'Tips',
      color: '#CCE5FF',
    },
    {
      id: '4',
      title: 'AUT Counselling services',
      subtitle: 'Link · external',
      type: 'Link',
      color: '#E2D9F3',
      url: 'https://www.aut.ac.nz/student-life/student-support/counselling',
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
      title: 'Managing exam stress',
      subtitle: 'Guide · 5 min read',
      type: 'Guide',
      color: '#FFF3CD',
    },
    {
      id: '7',
      title: 'Sleep and wellbeing',
      subtitle: 'Article · health tips',
      type: 'Article',
      color: '#D4EDDA',
    },
    {
      id: '8',
      title: 'AUT Student Health',
      subtitle: 'Link · external',
      type: 'Link',
      color: '#CCE5FF',
      url: 'https://www.aut.ac.nz/student-life/student-support/student-health',
    },
    {
      id: '9',
      title: 'Mindfulness for students',
      subtitle: 'Exercise · offline',
      type: 'Exercise',
      color: '#E2D9F3',
    },
    {
      id: '10',
      title: 'Building social connections',
      subtitle: 'Guide · campus life',
      type: 'Guide',
      color: '#FFE0E0',
    },
  ],
  Staff: [
    {
      id: '11',
      title: 'Managing workload stress',
      subtitle: 'Guide · 4 min read',
      type: 'Guide',
      color: '#FFF3CD',
    },
    {
      id: '12',
      title: 'Work-life balance tips',
      subtitle: 'Article · wellbeing',
      type: 'Article',
      color: '#D4EDDA',
    },
    {
      id: '13',
      title: 'AUT Staff support services',
      subtitle: 'Link · external',
      type: 'Link',
      color: '#CCE5FF',
      url: 'https://www.aut.ac.nz/about/working-at-aut/staff-support',
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