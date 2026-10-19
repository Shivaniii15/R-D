import { StyleSheet, ViewStyle } from 'react-native';

export const navigationStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#F9F3EA',
    borderTopWidth: 1,
    borderTopColor: '#E7D9C6',
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    elevation: 0,
    shadowOpacity: 0,
  } as ViewStyle,
  tabBarItem: {
    paddingTop: 4,
  } as ViewStyle,
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});