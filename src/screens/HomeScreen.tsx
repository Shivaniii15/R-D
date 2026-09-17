import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  BackHandler,
  Linking,
  AppState,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import Slider from '@react-native-community/slider';

import {
  LineChart,
} from 'react-native-chart-kit';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';

import {
  getTodaysMood,
  saveMoodEntry,
  getMoodsByDays,
  getWeeklyAverages,
  WeeklyAverage,
} from '../storage/mood.storage';

import {
  MoodEntry,
} from '../types/mood.types';

import {
  cancelMoodReminder,
  updateMoodReminder,
} from '../services/notification.service';

import {
  HomeStackParamList,
} from '../navigation/HomeNavigator';

import {
  homeStyles as styles,
} from '../styles/home.styles';

import {
  getLocalDateString,
} from '../utils/date.utils';

const screenWidth =
  Dimensions.get('window').width;

const EMOJIS = [
  {
    emoji: '😢',
    value: 1,
    label: 'Terrible',
  },
  {
    emoji: '😕',
    value: 2,
    label: 'Bad',
  },
  {
    emoji: '😐',
    value: 3,
    label: 'Okay',
  },
  {
    emoji: '🙂',
    value: 4,
    label: 'Good',
  },
  {
    emoji: '😄',
    value: 5,
    label: 'Great',
  },
];

type HomeNavigationProp =
  NativeStackNavigationProp<
    HomeStackParamList,
    'HomeMain'
  >;

type RangeOption =
  | 'Week'
  | 'Month'
  | '3 Months';

function calcAverage(
  entries: MoodEntry[],
): string {
  const logged =
    entries.filter(
      entry =>
        entry.mood > 0,
    );

  if (
    logged.length === 0
  ) {
    return 'N/A';
  }

  const total =
    logged.reduce(
      (sum, entry) =>
        sum + entry.mood,
      0,
    );

  return (
    total / logged.length
  ).toFixed(1);
}

function calcAverageFromWeekly(
  entries: WeeklyAverage[],
): string {
  const logged =
    entries.filter(
      entry =>
        entry.average > 0,
    );

  if (
    logged.length === 0
  ) {
    return 'N/A';
  }

  const total =
    logged.reduce(
      (sum, entry) =>
        sum + entry.average,
      0,
    );

  return (
    total / logged.length
  ).toFixed(1);
}

export default function HomeScreen():
  React.JSX.Element {
  const [
    mood,
    setMood,
  ] = useState(3);

  const [
    todaysMood,
    setTodaysMood,
  ] =
    useState<number | null>(
      null,
    );

  const [
    selectedRange,
    setSelectedRange,
  ] =
    useState<RangeOption>(
      'Week',
    );

  const [
    weekEntries,
    setWeekEntries,
  ] =
    useState<MoodEntry[]>([]);

  const [
    weeklyAverages,
    setWeeklyAverages,
  ] =
    useState<
      WeeklyAverage[]
    >([]);

  const [
    saveConfirmation,
    setSaveConfirmation,
  ] =
    useState<
      string | null
    >(null);

  const confirmationTimer =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const navigation =
    useNavigation<
      HomeNavigationProp
    >();

  /*
   * Refresh the existing graph.
   */
  async function refreshChartData():
    Promise<void> {
    if (
      selectedRange ===
      'Week'
    ) {
      const savedWeekEntries =
        await getMoodsByDays(
          7,
        );

      setWeekEntries(
        savedWeekEntries,
      );

      return;
    }

    if (
      selectedRange ===
      'Month'
    ) {
      const savedWeeklyAverages =
        await getWeeklyAverages(
          4,
        );

      setWeeklyAverages(
        savedWeeklyAverages,
      );

      return;
    }

    const savedWeeklyAverages =
      await getWeeklyAverages(
        12,
      );

    setWeeklyAverages(
      savedWeeklyAverages,
    );
  }

  /*
   * Reload today's latest mood
   * and the graph data.
   */
  async function refreshMoodData():
    Promise<void> {
    try {
      const savedTodaysMood =
        await getTodaysMood();

      setTodaysMood(
        savedTodaysMood,
      );

      if (
        savedTodaysMood !==
        null
      ) {
        setMood(
          savedTodaysMood,
        );
      }

      await refreshChartData();
    } catch (error) {
      console.error(
        'Failed to refresh mood data:',
        error,
      );
    }
  }

  /*
   * Refresh whenever HomeScreen
   * becomes focused.
   */
  useFocusEffect(
    useCallback(() => {
      async function loadMoodData():
        Promise<void> {
        try {
          await refreshMoodData();

          await updateMoodReminder();
        } catch (error) {
          console.error(
            'Failed to load mood data:',
            error,
          );
        }
      }

      loadMoodData();

      return () => {
        if (
          confirmationTimer.current
        ) {
          clearTimeout(
            confirmationTimer.current,
          );

          confirmationTimer.current =
            null;
        }
      };

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRange]),
  );

  /*
   * Refresh whenever the Android
   * app returns to the foreground.
   *
   * This ensures mood entries logged
   * from the home-screen widget are
   * immediately shown in the app.
   */
  useEffect(() => {
    const subscription =
      AppState.addEventListener(
        'change',
        async nextAppState => {
          if (
            nextAppState !==
            'active'
          ) {
            return;
          }

          try {
            await refreshMoodData();
          } catch (error) {
            console.error(
              'Failed to refresh mood data when app became active:',
              error,
            );
          }
        },
      );

    return () => {
      subscription.remove();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRange]);

  /*
   * Change graph range.
   */
  async function handleRangeChange(
    range: RangeOption,
  ): Promise<void> {
    setSelectedRange(range);

    try {
      if (
        range === 'Week'
      ) {
        const savedWeekEntries =
          await getMoodsByDays(
            7,
          );

        setWeekEntries(
          savedWeekEntries,
        );

        return;
      }

      if (
        range === 'Month'
      ) {
        const savedWeeklyAverages =
          await getWeeklyAverages(
            4,
          );

        setWeeklyAverages(
          savedWeeklyAverages,
        );

        return;
      }

      const savedWeeklyAverages =
        await getWeeklyAverages(
          12,
        );

      setWeeklyAverages(
        savedWeeklyAverages,
      );
    } catch (error) {
      console.error(
        'Failed to load range data:',
        error,
      );
    }
  }

  /*
   * Save a mood from the app.
   */
  async function handleSave():
    Promise<void> {
    try {
      /*
       * IMPORTANT:
       *
       * This now uses the device's
       * local date rather than UTC.
       */
      const today =
        getLocalDateString();

      await saveMoodEntry({
        date: today,
        mood,
      });

      setTodaysMood(mood);

      await cancelMoodReminder();

      await refreshChartData();

      setSaveConfirmation(
        `✓ Mood logged: ${mood}/5`,
      );

      if (
        confirmationTimer.current
      ) {
        clearTimeout(
          confirmationTimer.current,
        );
      }

      confirmationTimer.current =
        setTimeout(() => {
          setSaveConfirmation(
            null,
          );

          confirmationTimer.current =
            null;
        }, 3000);
    } catch (error) {
      console.error(
        'Failed to save mood:',
        error,
      );
    }
  }

  const isWeek =
    selectedRange === 'Week';

  const chartLabels =
    isWeek
      ? weekEntries.map(
          entry => {
            const date =
              new Date(
                `${entry.date}T00:00:00`,
              );

            return [
              'Sun',
              'Mon',
              'Tue',
              'Wed',
              'Thu',
              'Fri',
              'Sat',
            ][date.getDay()];
          },
        )
      : weeklyAverages.map(
          entry =>
            entry.label,
        );

  const chartData =
    isWeek
      ? weekEntries.map(
          entry =>
            entry.mood === 0
              ? 0.1
              : entry.mood,
        )
      : weeklyAverages.map(
          entry =>
            entry.average === 0
              ? 0.1
              : entry.average,
        );

  const hasAnyData =
    isWeek
      ? weekEntries.some(
          entry =>
            entry.mood > 0,
        )
      : weeklyAverages.some(
          entry =>
            entry.average > 0,
        );

  const average =
    isWeek
      ? calcAverage(
          weekEntries,
        )
      : calcAverageFromWeekly(
          weeklyAverages,
        );

  const countLogged =
    isWeek
      ? weekEntries.filter(
          entry =>
            entry.mood > 0,
        ).length
      : weeklyAverages.filter(
          entry =>
            entry.average > 0,
        ).length;

  const countLabel =
    isWeek
      ? 'Days Logged'
      : 'Weeks Logged';

  return (
    <SafeAreaView
      style={
        styles.container
      }>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }>

        {/* Crisis Support */}

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              'tel:1737',
            )
          }
          activeOpacity={0.8}
          style={{
            backgroundColor:
              '#FFF3CD',
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 4,
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor:
              '#FFE082',
          }}>

          <Text
            style={{
              fontSize: 20,
              marginRight: 10,
            }}>
            🆘
          </Text>

          <View
            style={{
              flex: 1,
            }}>

            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                color: '#111',
              }}>
              Need help now?
            </Text>

            <Text
              style={{
                fontSize: 12,
                color: '#555',
                marginTop: 2,
              }}>
              Call or text 1737 -
              free NZ mental health
              support, available
              24/7
            </Text>

          </View>

          <Text
            style={{
              fontSize: 12,
              color: '#888',
              marginLeft: 8,
            }}>
            Tap to call
          </Text>

        </TouchableOpacity>

        {/* Header */}

        <View
          style={
            styles.header
          }>

          <View
            style={
              styles.headerRow
            }>

            <View>

              <Text
                style={
                  styles.heading
                }>
                Mood logging.
              </Text>

              <Text
                style={
                  styles.subheading
                }>
                How are you feeling
                today?
              </Text>

            </View>

            <TouchableOpacity
              style={
                styles.exitButton
              }
              onPress={() =>
                BackHandler.exitApp()
              }>

              <Text
                style={
                  styles.exitButtonText
                }>
                ✕
              </Text>

            </TouchableOpacity>

          </View>

        </View>

        {/* Mood logging */}

        <View
          style={
            styles.section
          }>

          <Text
            style={
              styles.sectionTitle
            }>
            Today&apos;s Mood
          </Text>

          <Text
            style={
              styles.moodValue
            }>
            {mood}/5
          </Text>

          <View
            style={
              styles.emojiRow
            }>

            {EMOJIS.map(
              item => (
                <TouchableOpacity
                  key={
                    item.value
                  }
                  style={[
                    styles.emojiButton,

                    mood ===
                      item.value &&
                      styles.emojiButtonSelected,
                  ]}
                  onPress={() =>
                    setMood(
                      item.value,
                    )
                  }>

                  <Text
                    style={
                      styles.emojiText
                    }>
                    {item.emoji}
                  </Text>

                  <Text
                    style={
                      styles.emojiLabel
                    }>
                    {item.label}
                  </Text>

                </TouchableOpacity>
              ),
            )}

          </View>

          <Slider
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={mood}
            onValueChange={
              setMood
            }
            minimumTrackTintColor="#111"
            maximumTrackTintColor="#e0e0e0"
            thumbTintColor="#111"
          />

          <View
            style={
              styles.sliderRow
            }>

            <Text
              style={
                styles.sliderLabel
              }>
              1
            </Text>

            <Text
              style={
                styles.sliderLabel
              }>
              5
            </Text>

          </View>

          {todaysMood !==
            null && (
            <Text
              style={{
                marginTop: 10,
                color: '#777',
                fontSize: 12,
              }}>
              Latest logged mood:{' '}
              {todaysMood}/5
            </Text>
          )}

        </View>

        {/* Save confirmation */}

        {saveConfirmation && (
          <Text
            style={
              styles.savedText
            }>
            {saveConfirmation}
          </Text>
        )}

        {/* Log Mood */}

        <TouchableOpacity
          style={
            styles.saveButton
          }
          activeOpacity={0.8}
          onPress={
            handleSave
          }>

          <Text
            style={
              styles.saveButtonText
            }>
            Log Mood
          </Text>

        </TouchableOpacity>

        {/* Mood History */}

        <TouchableOpacity
          style={
            styles.historyButton
          }
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(
              'MoodHistory',
            )
          }>

          <Text
            style={
              styles.historyButtonText
            }>
            View Mood History
          </Text>

        </TouchableOpacity>

        {/* Graph */}

        <View
          style={
            styles.section
          }>

          <View
            style={
              styles.rangeRow
            }>

            {(
              [
                'Week',
                'Month',
                '3 Months',
              ] as RangeOption[]
            ).map(
              range => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.rangeButton,

                    selectedRange ===
                      range &&
                      styles.rangeButtonSelected,
                  ]}
                  onPress={() =>
                    handleRangeChange(
                      range,
                    )
                  }>

                  <Text
                    style={[
                      styles.rangeButtonText,

                      selectedRange ===
                        range &&
                        styles.rangeButtonTextSelected,
                    ]}>
                    {range}
                  </Text>

                </TouchableOpacity>
              ),
            )}

          </View>

          {/* Statistics */}

          <View
            style={
              styles.statRow
            }>

            <View
              style={
                styles.statBox
              }>

              <Text
                style={
                  styles.statLabel
                }>
                Average Mood
              </Text>

              <Text
                style={
                  styles.statValue
                }>
                {average}
              </Text>

            </View>

            <View
              style={
                styles.statBox
              }>

              <Text
                style={
                  styles.statLabel
                }>
                {countLabel}
              </Text>

              <Text
                style={
                  styles.statValue
                }>
                {countLogged}
              </Text>

            </View>

          </View>

          {/* Chart */}

          {hasAnyData ? (
            <View
              style={
                styles.chartContainer
              }>

              <LineChart
                data={{
                  labels:
                    chartLabels,

                  datasets: [
                    {
                      data:
                        chartData,
                    },
                  ],
                }}

                width={
                  screenWidth -
                  40
                }

                height={200}

                yAxisSuffix=""

                yAxisInterval={1}

                fromZero

                chartConfig={{
                  backgroundColor:
                    '#fff',

                  backgroundGradientFrom:
                    '#fff',

                  backgroundGradientTo:
                    '#fff',

                  decimalPlaces: 1,

                  color: () =>
                    '#111',

                  labelColor: () =>
                    '#aaa',

                  propsForDots: {
                    r: '5',
                    strokeWidth:
                      '2',
                    stroke:
                      '#111',
                  },

                  propsForBackgroundLines:
                    {
                      stroke:
                        '#f0f0f0',
                    },
                }}

                bezier

                style={{
                  borderRadius: 12,
                }}
              />

            </View>
          ) : (
            <Text
              style={
                styles.noDataText
              }>
              No mood data for
              this period yet.
            </Text>
          )}

        </View>

        <View
          style={{
            height: 32,
          }}
        />

      </ScrollView>

    </SafeAreaView>
  );
}