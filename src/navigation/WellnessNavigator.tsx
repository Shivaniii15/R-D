import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WellnessScreen from '../screens/WellnessScreen';
import ResourcesScreen from '../screens/ResourcesScreen';
import BreathingScreen from '../screens/BreathingScreen';
import MoodPlantScreen from '../screens/MoodPlantScreen';

const Stack = createNativeStackNavigator();

export default function WellnessNavigator(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WellnessHome" component={WellnessScreen} />
      <Stack.Screen name="Resources" component={ResourcesScreen} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="MoodPlant" component={MoodPlantScreen} />
    </Stack.Navigator>
  );
}