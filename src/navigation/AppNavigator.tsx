import React from 'react';
import { Text } from 'react-native';
import {
  NavigationContainer,
} from '@react-navigation/native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import type {
  BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';

import HomeScreen from '../screens/HomeScreen';
import JournalNavigator from './JournalNavigator';
import TodayRemindersScreen from '../screens/TodayRemindersScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ActivitySuggestionScreen from '../screens/ActivitySuggestionScreen';
import { navigationStyles } from '../styles/Navigation.styles';

import {
  handleNavigationReady,
  navigationRef,
} from './navigation.service';
import type {
  RootStackParamList,
} from './navigation.types';

type TabName =
  | 'Home'
  | 'Journal'
  | 'Reminders'
  | 'Settings';

interface TabIconProps {
  name: TabName;
  focused: boolean;
}

const Tab = createBottomTabNavigator();
const RootStack =
  createNativeStackNavigator<RootStackParamList>();

function TabIcon({
  name,
  focused,
}: TabIconProps): React.JSX.Element {
  const color = focused ? '#111' : '#bbb';

  const iconMap: Record<TabName, string> = {
    Home: 'home',
    Journal: 'book',
    Reminders: 'check-circle',
    Settings: 'settings',
  };

  return (
    <Feather
      name={iconMap[name]}
      size={22}
      color={color}
    />
  );
}

function MainTabs(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }): BottomTabNavigationOptions => ({
        headerShown: false,

        tabBarIcon: ({ focused }) => (
          <TabIcon
            name={route.name as TabName}
            focused={focused}
          />
        ),

        tabBarLabel: ({ focused }) => (
          <Text
            style={[
              navigationStyles.tabLabel,
              {
                color: focused
                  ? '#111'
                  : '#bbb',
              },
            ]}>
            {route.name}
          </Text>
        ),

        tabBarStyle:
          navigationStyles.tabBar,

        tabBarItemStyle:
          navigationStyles.tabBarItem,
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
      />

      <Tab.Screen
        name="Journal"
        component={JournalNavigator}
      />

      <Tab.Screen
        name="Reminders"
        component={TodayRemindersScreen}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={handleNavigationReady}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <RootStack.Screen
          name="MainTabs"
          component={MainTabs}
        />

        <RootStack.Screen
          name="ActivitySuggestion"
          component={ActivitySuggestionScreen}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}