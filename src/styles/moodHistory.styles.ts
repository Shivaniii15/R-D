import { StyleSheet } from 'react-native';

export const moodHistoryStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    marginBottom: 8,
  },
  backButtonText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  heading: {
    color: '#111',
    fontSize: 24,
    fontWeight: '700',
  },
  subheading: {
    color: '#aaa',
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
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 5,
  },
  entryDescription: {
    color: '#888',
    fontSize: 13,
  },
  moodBadge: {
    minWidth: 62,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#111',
    alignItems: 'center',
  },
  moodBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#111',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeText: {
    color: '#bbb',
    fontSize: 13,
  },
  detailsDate: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 16,
  },
  detailsMood: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '700',
    marginTop: 8,
  },
  detailsDescription: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  notesLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 18,
  },
  notesText: {
    color: '#bbb',
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
    color: '#111',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
});