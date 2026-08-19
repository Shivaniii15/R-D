import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  BackHandler,
  Linking,
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
import { cancelMoodReminder, updateMoodReminder } from '../services/notification.service';
import { HomeStackParamList } from '../navigation/HomeNavigator';
import { homeStyles as styles } from '../styles/home.styles';
import { refreshMentalHealthWidget } from '../widgets/widgetUpdate.service';

const screenWidth = Dimensions.get('window').width;

const EMOJIS = [
  { emoji: '😢', value: 1, label: 'Terrible' },
  { emoji: '😕', value: 2, label: 'Bad' },
  { emoji: '😐', value: 3, label: 'Okay' },
  { emoji: '🙂', value: 4, label: 'Good' },
  { emoji: '😄', value: 5, label: 'Great' },
];

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
  const [mood, setMood] = useState(3);
  const [todaysMood, setTodaysMood] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<RangeOption>('Week');
  const [weekEntries, setWeekEntries] = useState<MoodEntry[]>([]);
  const [weeklyAverages, setWeeklyAverages] = useState<WeeklyAverage[]>([]);

  const navigation = useNavigation<HomeNavigationProp>();

  useFocusEffect(
    useCallback(() => {
      async function loadMoodData(): Promise<void> {
        try {
          const savedTodaysMood = await getTodaysMood();
          setTodaysMood(savedTodaysMood);

          if (selectedRange === 'Week') {
            const savedWeekEntries = await getMoodsByDays(7);
            setWeekEntries(savedWeekEntries);
          } else if (selectedRange === 'Month') {
            const savedWeeklyAverages = await getWeeklyAverages(4);
            setWeeklyAverages(savedWeeklyAverages);
          } else {
            const savedWeeklyAverages = await getWeeklyAverages(12);
            setWeeklyAverages(savedWeeklyAverages);
          }

          await updateMoodReminder();
        } catch (error) {
          console.error('Failed to load mood data:', error);
        }
      }

      loadMoodData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRange]),
  );

  async function handleRangeChange(range: RangeOption): Promise<void> {
    setSelectedRange(range);
    try {
      if (range === 'Week') {
        const savedWeekEntries = await getMoodsByDays(7);
        setWeekEntries(savedWeekEntries);
      } else if (range === 'Month') {
        const savedWeeklyAverages = await getWeeklyAverages(4);
        setWeeklyAverages(savedWeeklyAverages);
      } else {
        const savedWeeklyAverages = await getWeeklyAverages(12);
        setWeeklyAverages(savedWeeklyAverages);
      }
    } catch (error) {
      console.error('Failed to load range data:', error);
    }
  }

  async function handleSave(): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];

      await saveMoodEntry({ date: today, mood });
      setTodaysMood(mood);

      await refreshMentalHealthWidget();
      await cancelMoodReminder();

      if (selectedRange === 'Week') {
        const updatedWeekEntries = await getMoodsByDays(7);
        setWeekEntries(updatedWeekEntries);
      } else if (selectedRange === 'Month') {
        const updatedWeeklyAverages = await getWeeklyAverages(4);
        setWeeklyAverages(updatedWeeklyAverages);
      } else {
        const updatedWeeklyAverages = await getWeeklyAverages(12);
        setWeeklyAverages(updatedWeeklyAverages);
      }
    } catch (error) {
      console.error('Failed to save mood:', error);
    }
  }

  const alreadyLogged = todaysMood !== null;
  const isWeek = selectedRange === 'Week';

  const chartLabels = isWeek
    ? weekEntries.map(entry => {
        const date = new Date(`${entry.date}T00:00:00`);
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
      })
    : weeklyAverages.map(entry => entry.label);

  const chartData = isWeek
    ? weekEntries.map(entry => (entry.mood === 0 ? 0.1 : entry.mood))
    : weeklyAverages.map(entry => (entry.average === 0 ? 0.1 : entry.average));

  const hasAnyData = isWeek
    ? weekEntries.some(entry => entry.mood > 0)
    : weeklyAverages.some(entry => entry.average > 0);

  const average = isWeek ? calcAverage(weekEntries) : calcAverageFromWeekly(weeklyAverages);
  const countLogged = isWeek
    ? weekEntries.filter(entry => entry.mood > 0).length
    : weeklyAverages.filter(entry => entry.average > 0).length;
  const countLabel = isWeek ? 'Days Logged' : 'Weeks Logged';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Crisis Support Banner */}
        <TouchableOpacity
          onPress={() => Linking.openURL('tel:1737')}
          activeOpacity={0.8}
          style={{
            backgroundColor: '#FFF3CD',
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 4,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#FFE082',
          }}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>🆘</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111' }}>
              Need help now?
            </Text>
            <Text style={{ fontSize: 12, color: '#555', marginTop: 2 }}>
              Call or text 1737 - free NZ mental health support, available 24/7
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>Tap to call</Text>
        </TouchableOpacity>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Mood</Text>
          <Text style={styles.moodValue}>
            {alreadyLogged ? todaysMood : mood}/5
          </Text>

          {!alreadyLogged && (
            <>
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

              <Slider
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={mood}
                onValueChange={setMood}
                minimumTrackTintColor="#111"
                maximumTrackTintColor="#e0e0e0"
                thumbTintColor="#111"
              />
              <View style={styles.sliderRow}>
                <Text style={styles.sliderLabel}>1</Text>
                <Text style={styles.sliderLabel}>5</Text>
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

        <TouchableOpacity
          style={styles.historyButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MoodHistory')}>
          <Text style={styles.historyButtonText}>View Mood History</Text>
        </TouchableOpacity>

        <View style={styles.section}>
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

          {hasAnyData ? (
            <View style={styles.chartContainer}>
              <LineChart
                data={{ labels: chartLabels, datasets: [{ data: chartData }] }}
                width={screenWidth - 40}
                height={200}
                yAxisSuffix=""
                yAxisInterval={1}
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

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}