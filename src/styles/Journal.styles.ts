import { StyleSheet } from 'react-native';

export const journalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  newButton: {
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cancel: {
    fontSize: 15,
    color: '#aaa',
    width: 60,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    width: 60,
    textAlign: 'right',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  deleteButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: '#e74c3c',
    fontSize: 13,
    fontWeight: '500',
  },
  form: {
    padding: 20,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111',
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  bodyInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 300,
  },
  backText: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  viewTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  viewBody: {
    fontSize: 16,
    color: '#333',
    lineHeight: 26,
  },
});
