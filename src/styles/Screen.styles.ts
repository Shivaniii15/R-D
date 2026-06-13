import { StyleSheet } from 'react-native';

export const screenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#111',
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#aaa',
    letterSpacing: 0.2,
  },
});