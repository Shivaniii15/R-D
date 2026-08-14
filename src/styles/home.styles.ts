import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  subheading: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  exitButton: {
    padding: 8,
  },
  exitButtonText: {
    fontSize: 18,
    color: '#aaa',
    fontWeight: '600',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 8,
  },
  emojiButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiButtonSelected: {
    borderColor: '#111',
    backgroundColor: '#f5f5f5',
  },
  emojiText: {
    fontSize: 28,
  },
  emojiLabel: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  moodValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#aaa',
  },
  saveButton: {
    backgroundColor: '#111',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  savedText: {
    textAlign: 'center',
    marginTop: 12,
    color: '#aaa',
    fontSize: 13,
  },
  historyButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  chartContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  noDataText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
    paddingVertical: 20,
  },
  // Range filters
  rangeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  rangeButtonSelected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  rangeButtonText: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '500',
  },
  rangeButtonTextSelected: {
    color: '#fff',
  },
  // Stats
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
});