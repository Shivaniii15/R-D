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
import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  getTodaysMood,
  saveMoodEntry,
  getWeekMoods,
} from '../storage/mood.storage';
import { MoodEntry } from '../types/mood.types';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import { homeStyles as styles } from '../styles/home.styles';

const screenWidth = Dimensions.get('window').width;

type HomeNavigationProp = NativeStackNavigationProp<
  HomeStackParamList,
  'HomeMain'
>;

export default function HomeScreen(): React.JSX.Element {
  const [mood, setMood] = useState(5);
  const [todaysMood, setTodaysMood] = useState<number | null>(null);
  const [weekMoods, setWeekMoods] = useState<MoodEntry[]>([]);

  const navigation = useNavigation<HomeNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      getTodaysMood().then(setTodaysMood);
      getWeekMoods().then(setWeekMoods);
    }, []),
  );

  async function handleSave(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    await saveMoodEntry({
      date: today,
      mood,
    });

    setTodaysMood(mood);

    const updatedWeekMoods = await getWeekMoods();
    setWeekMoods(updatedWeekMoods);
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
          <Text style={styles.sectionTitle}>Today&apos;s Mood</Text>

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
            <Text style={styles.saveButtonText}>Log Mood</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.historyButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MoodHistory')}>
          <Text style={styles.historyButtonText}>
            View Mood History
          </Text>
        </TouchableOpacity>

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