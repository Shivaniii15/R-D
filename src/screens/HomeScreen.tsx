import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
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
import {
  cancelMoodReminder,
  updateMoodReminder,
} from '../services/notification.service';
import { homeStyles as styles } from '../styles/home.styles';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen(): React.JSX.Element {
  const [mood, setMood] = useState(5);
  const [todaysMood, setTodaysMood] =
    useState<number | null>(null);
  const [weekMoods, setWeekMoods] =
    useState<MoodEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadMoodData(): Promise<void> {
        try {
          const savedTodaysMood = await getTodaysMood();
          const savedWeekMoods = await getWeekMoods();

          setTodaysMood(savedTodaysMood);
          setWeekMoods(savedWeekMoods);

          /*
           * Recheck the reminder whenever the Home screen becomes
           * active.
           */
          await updateMoodReminder();
        } catch (error) {
          console.error('Failed to load mood data:', error);
        }
      }

      loadMoodData();
    }, []),
  );

  async function handleSave(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      await saveMoodEntry({
        date: today,
        mood,
      });

      setTodaysMood(mood);

      /*
       * The user has now logged today's mood, so any pending
       * reminder should be cancelled.
       */
      await cancelMoodReminder();

      const updatedWeekMoods = await getWeekMoods();
      setWeekMoods(updatedWeekMoods);
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  }

  const alreadyLogged = todaysMood !== null;

  const chartLabels = weekMoods.map(entry => {
    const date = new Date(`${entry.date}T00:00:00`);

    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][
      date.getDay()
    ];
  });

  const chartData = weekMoods.map(entry => entry.mood);
  const hasAnyData = chartData.some(value => value > 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>Mood logging.</Text>

          <Text style={styles.subheading}>
            How are you feeling today?
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Today&apos;s Mood
          </Text>

          <Text style={styles.moodValue}>
            {alreadyLogged ? todaysMood : mood}/10
          </Text>

          {!alreadyLogged && (
            <>
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

        {alreadyLogged ? (
          <Text style={styles.savedText}>
            ✓ Mood logged for today
          </Text>
        ) : (
          <TouchableOpacity
            style={styles.saveButton}
            activeOpacity={0.8}
            onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              Log Mood
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>

          {hasAnyData ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: chartLabels,
                  datasets: [
                    {
                      data: chartData.map(value =>
                        value === 0 ? 1 : value,
                      ),
                    },
                  ],
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
                style={{
                  borderRadius: 12,
                }}
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