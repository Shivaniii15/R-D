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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  getTodaysMood,
  saveMoodEntry,
  getMoodsByDays,
  getWeeklyAverages,
  WeeklyAverage,
} from '../storage/mood.storage';
import { MoodEntry } from '../types/mood.types';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import { homeStyles as styles } from '../styles/home.styles';

const screenWidth = Dimensions.get('window').width;

type HomeNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'HomeMain'>;

type RangeOption = 'Week' | 'Month' | '3 Months';

function calcAverage(entries: MoodEntry[]): string {
  const logged = entries.filter(e => e.mood > 0);
  if (logged.length === 0) return 'N/A';
  return (logged.reduce((sum, e) => sum + e.mood, 0) / logged.length).toFixed(1);
}

function calcAverageFromWeekly(entries: WeeklyAverage[]): string {
  const logged = entries.filter(e => e.average > 0);
  if (logged.length === 0) return 'N/A';
  return (logged.reduce((sum, e) => sum + e.average, 0) / logged.length).toFixed(1);
}

export default function HomeScreen(): React.JSX.Element {
  const [mood, setMood] = useState(5);
  const [todaysMood, setTodaysMood] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<RangeOption>('Week');
  const [weekEntries, setWeekEntries] = useState<MoodEntry[]>([]);
  const [weeklyAverages, setWeeklyAverages] = useState<WeeklyAverage[]>([]);

  const navigation = useNavigation<HomeNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      getTodaysMood().then(setTodaysMood);
      getMoodsByDays(7).then(setWeekEntries);
    }, []),
  );

  async function handleRangeChange(range: RangeOption) {
    setSelectedRange(range);
    if (range === 'Week') {
      getMoodsByDays(7).then(setWeekEntries);
    } else if (range === 'Month') {
      getWeeklyAverages(4).then(setWeeklyAverages);
    } else {
      getWeeklyAverages(12).then(setWeeklyAverages);
    }
  }

  async function handleSave(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await saveMoodEntry({ date: today, mood });
    setTodaysMood(mood);
    if (selectedRange === 'Week') {
      getMoodsByDays(7).then(setWeekEntries);
    } else if (selectedRange === 'Month') {
      getWeeklyAverages(4).then(setWeeklyAverages);
    } else {
      getWeeklyAverages(12).then(setWeeklyAverages);
    }
  }

  const alreadyLogged = todaysMood !== null;
  const isWeek = selectedRange === 'Week';

  const chartLabels = isWeek
    ? weekEntries.map(e => {
        const date = new Date(`${e.date}T00:00:00`);
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      })
    : weeklyAverages.map(e => e.label);

  const chartData = isWeek
    ? weekEntries.map(e => (e.mood === 0 ? 0.1 : e.mood))
    : weeklyAverages.map(e => (e.average === 0 ? 0.1 : e.average));

  const hasAnyData = isWeek
    ? weekEntries.some(e => e.mood > 0)
    : weeklyAverages.some(e => e.average > 0);

  const average = isWeek ? calcAverage(weekEntries) : calcAverageFromWeekly(weeklyAverages);
  const countLogged = isWeek
    ? weekEntries.filter(e => e.mood > 0).length
    : weeklyAverages.filter(e => e.average > 0).length;
  const countLabel = isWeek ? 'Days Logged' : 'Weeks Logged';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.heading}>Mood logging.</Text>
          <Text style={styles.subheading}>How are you feeling today?</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Mood</Text>
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
          <Text style={styles.savedText}>✓ Mood logged for today</Text>
        ) : (
          <TouchableOpacity style={styles.saveButton} activeOpacity={0.8} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Log Mood</Text>
          </TouchableOpacity>
        )}

        

        <View style={styles.section}>
          {/* Range Filters */}
          <View style={styles.rangeRow}>
            {(['Week', 'Month', '3 Months'] as RangeOption[]).map(r => (
              <TouchableOpacity
                key={r}
                style={[styles.rangeButton, selectedRange === r && styles.rangeButtonSelected]}
                onPress={() => handleRangeChange(r)}>
                <Text style={[styles.rangeButtonText, selectedRange === r && styles.rangeButtonTextSelected]}>
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Stats */}
          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Average Mood</Text>
              <Text style={styles.statValue}>{average}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{countLabel}</Text>
              <Text style={styles.statValue}>{countLogged}</Text>
            </View>
          </View>

          {/* Chart */}
          {hasAnyData ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={{ labels: chartLabels, datasets: [{ data: chartData }] }}
                width={screenWidth - 40}
                height={200}
                yAxisSuffix=""
                yAxisInterval={2}
                fromZero
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 1,
                  color: () => '#111',
                  labelColor: () => '#aaa',
                  propsForDots: { r: '5', strokeWidth: '2', stroke: '#111' },
                  propsForBackgroundLines: { stroke: '#f0f0f0' },
                }}
                bezier
                style={{ borderRadius: 12 }}
              />
            </View>
          ) : (
            <Text style={styles.noDataText}>No mood data for this period yet.</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.historyButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MoodHistory')}>
          <Text style={styles.historyButtonText}>View Mood History</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}