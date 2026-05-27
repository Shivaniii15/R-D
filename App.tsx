import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './scr/navigation/Appnavigator';

export default function App(): React.JSX.Element {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
    </>
  );
}