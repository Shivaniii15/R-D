import { StyleSheet } from 'react-native';
import { ThemeColors } from '../theme/ThemeContext';

export function createMoodHistoryStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 18,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingVertical: 6,
      marginBottom: 8,
    },
    backButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    heading: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    subheading: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 4,
    },
    list: {
      padding: 20,
      paddingBottom: 36,
    },
    entryCard: {
      minHeight: 82,
      padding: 16,
      marginBottom: 12,
      borderRadius: 12,
      backgroundColor: colors.surfaceMuted,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    entryDate: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 5,
    },
    entryDescription: {
      color: colors.textSubtle,
      fontSize: 13,
    },
    moodBadge: {
      minWidth: 62,
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 20,
      backgroundColor: colors.accent,
      alignItems: 'center',
    },
    moodBadgeText: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: '700',
    },
    detailsCard: {
      marginHorizontal: 20,
      marginTop: 20,
      padding: 18,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    detailsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailsTitle: {
      color: colors.accentText,
      fontSize: 16,
      fontWeight: '700',
    },
    closeText: {
      color: colors.tabInactive,
      fontSize: 13,
    },
    detailsDate: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 16,
    },
    detailsMood: {
      color: colors.accentText,
      fontSize: 38,
      fontWeight: '700',
      marginTop: 8,
    },
    detailsDescription: {
      color: colors.tabInactive,
      fontSize: 14,
      marginTop: 2,
    },
    notesLabel: {
      color: colors.accentText,
      fontSize: 14,
      fontWeight: '600',
      marginTop: 18,
    },
    notesText: {
      color: colors.tabInactive,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 5,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 36,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
      marginTop: 8,
    },
    clearButton: {
      marginHorizontal: 20,
      marginVertical: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: '#e74c3c',
      borderRadius: 12,
      alignItems: 'center',
    },
    clearButtonText: {
      color: '#e74c3c',
      fontSize: 15,
      fontWeight: '600',
    },
  });
}