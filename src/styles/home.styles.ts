import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../theme/ThemeContext';

export function createHomeStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subheading: {
    fontSize: 14,
    color: colors.textSubtle,
    marginTop: 4,
  },
  exitButton: {
    padding: 8,
  },
  exitButtonText: {
    fontSize: 18,
    color: colors.textSubtle,
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
    borderColor: colors.text,
    backgroundColor: colors.surfaceMuted,
  },
  emojiText: {
    fontSize: 28,
  },
  emojiLabel: {
    fontSize: 10,
    color: colors.textSubtle,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  moodValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
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
    color: colors.textSubtle,
  },
  saveButton: {
    backgroundColor: colors.accent,
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
    color: colors.accentText,
    fontWeight: '600',
    fontSize: 15,
  },
  savedText: {
    textAlign: 'center',
    marginTop: 12,
    color: colors.textSubtle,
    fontSize: 13,
  },
  historyButton: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.text,
    borderRadius: 12,
    alignItems: 'center',
  },
  historyButtonText: {
    color: colors.text,
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
    color: colors.textSubtle,
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
    borderColor: colors.border,
  },
  rangeButtonSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  rangeButtonText: {
    fontSize: 13,
    color: colors.textSubtle,
    fontWeight: '500',
  },
  rangeButtonTextSelected: {
    color: colors.accentText,
  },
  // Stats
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSubtle,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  });
}