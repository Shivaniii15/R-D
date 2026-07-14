import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import {
  getTodaysMood,
  saveMoodEntry,
  getWeekMoods,
} from '../storage/mood.storage';
import { MoodEntry } from '../types/mood.types';
import { homeStyles as styles } from '../styles/home.styles';

const screenWidth = Dimensions.get('window').width;

const EMOJIS = [
  { emoji: '😢', value: 2, label: 'Terrible' },
  { emoji: '😕', value: 4, label: 'Bad' },
  { emoji: '😐', value: 6, label: 'Okay' },
  { emoji: '🙂', value: 8, label: 'Good' },
  { emoji: '😄', value: 10, label: 'Great' },
];

export default function HomeScreen(): React.JSX.Element {
  const [mood, setMood] = useState(5);
  const [todaysMood, setTodaysMood] = useState<number | null>(null);
  const [weekMoods, setWeekMoods] = useState<MoodEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getTodaysMood().then(setTodaysMood);
      getWeekMoods().then(setWeekMoods);
    }, []),
  );

  async function handleSave() {
    const today = new Date().toISOString().split('T')[0];
    await saveMoodEntry({ date: today, mood });
    setTodaysMood(mood);
    getWeekMoods().then(setWeekMoods);
  }

  const alreadyLogged = todaysMood !== null;

  const chartLabels = weekMoods.map(e => {
    const date = new Date(e.date + 'T00:00:00');
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  });

  const chartData = weekMoods.map(e => e.mood);
  const hasAnyData = chartData.some(v => v > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.heading}>Mood logging.</Text>
              <Text style={styles.subheading}>How are you feeling today?</Text>
            </View>
            <TouchableOpacity
              style={styles.exitButton}
              onPress={() => BackHandler.exitApp()}>
              <Text style={styles.exitButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Mood Slider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Mood</Text>
          <Text style={styles.moodValue}>
            {alreadyLogged ? todaysMood : mood}/10
          </Text>

          {!alreadyLogged && (
            <>
              {/* Emoji Quick Select */}
              <View style={styles.emojiRow}>
                {EMOJIS.map(item => (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.emojiButton,
                      mood === item.value && styles.emojiButtonSelected,
                    ]}
                    onPress={() => setMood(item.value)}>
                    <Text style={styles.emojiText}>{item.emoji}</Text>
                    <Text style={styles.emojiLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Slider */}
              <Slider
                minimumValue={1}
                maximumValue={10}
                step={1}
                value={mood}
                onValueChange={setMood}
                minimumTrackTintColor="#111"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#111"
              />
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>1</Text>
                <Text style={styles.sliderLabel}>10</Text>
              </View>
            </>
          )}
        </View>

        {/* Save Button */}
        {alreadyLogged ? (
          <Text style={styles.savedText}>✓ Mood logged for today</Text>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Log Mood</Text>
          </TouchableOpacity>
        )}

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          {hasAnyData ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [{ data: chartData.map(v => (v === 0 ? 1 : v)) }],
                }}
                width={screenWidth - 40}
                height={200}
                yAxisSuffix=""
                yAxisInterval={1}
                fromZero
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: () => '#111',
                  labelColor: () => '#aaa',
                  propsForDots: {
                    r: '5',
                    strokeWidth: '2',
                    stroke: '#111',
                  },
                  propsForBackgroundLines: {
                    stroke: '#f0f0f0',
                  },
                }}
                bezier
                style={{ borderRadius: 12 }}
              />
            </View>
          ) : (
            <Text style={styles.noDataText}>
              No mood data this week yet. Start logging!
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}