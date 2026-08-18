import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather';
import DisclaimerNotice from '../components/DisclaimerNotice';
import JournalNavigator from './JournalNavigator';
import WellnessNavigator from './WellnessNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import { navigationStyles } from '../styles/Navigation.styles';
import HomeNavigator from './HomeNavigator';

type TabName = 'Home' | 'Journal' | 'Settings' | 'Wellness';

interface TabIconProps {
  name: TabName;
  focused: boolean;
}

function TabIcon({ name, focused }: TabIconProps): React.JSX.Element {
  const color = focused ? '#111' : '#bbb';
  const iconMap: Record<TabName, string> = {
    Home: 'home',
    Journal: 'book',
    Settings: 'settings',
    Wellness: 'heart',
  };
  return <Feather name={iconMap[name]} size={22} color={color} />;
}

const Tab = createBottomTabNavigator();

export default function AppNavigator(): React.JSX.Element {
  return (
    <>
      <DisclaimerNotice />
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
          <Tab.Screen name="Home" component={HomeNavigator} />
          <Tab.Screen name="Journal" component={JournalNavigator} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
          <Tab.Screen name="Wellness" component={WellnessNavigator} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}