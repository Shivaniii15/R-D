import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  back: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  date: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: 16,
  },
  body: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
  },
});