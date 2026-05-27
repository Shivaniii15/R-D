import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';

import HomeScreen from '../screens/Homescreen.tsx';
import JournalScreen from '../screens/Journalscreen.tsx';
import Tab3Screen from '../screens/Tab3screen.tsx';
import { navigationStyles } from '../styles/Navigation.styles.ts';

type TabName = 'Home' | 'Journal' | 'Tab3';

interface TabIconProps {
  name: TabName;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps): React.JSX.Element {
  const color = focused ? '#111' : '#bbb';
  const iconMap: Record<TabName, string> = {
    Home: 'home',
    Journal: 'book',
    Tab3: 'box',
  };
  return <Feather name={iconMap[name]} size={22} color={color} />;
}

const Tab = createBottomTabNavigator();

export default function AppNavigator(): React.JSX.Element {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }): BottomTabNavigationOptions => ({
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon name={route.name as TabName} focused={focused} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[navigationStyles.tabLabel, { color: focused ? '#111' : '#bbb' }]}>
              {route.name}
            </Text>
          ),
          tabBarStyle: navigationStyles.tabBar,
          tabBarItemStyle: navigationStyles.tabBarItem,
        })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Journal" component={JournalScreen} />
        <Tab.Screen name="Tab3" component={Tab3Screen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}