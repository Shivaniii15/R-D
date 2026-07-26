import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import MoodHistoryScreen from '../screens/MoodHistoryScreen';
import { MoodEntry } from '../types/mood.types';

export type HomeStackParamList = {
  HomeMain: undefined;
  MoodHistory: undefined;
  MoodDetails: { entry: MoodEntry };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="MoodHistory" component={MoodHistoryScreen} />
    </Stack.Navigator>
  );
}