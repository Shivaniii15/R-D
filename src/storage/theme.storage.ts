import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_MODE_KEY = 'dark-mode-enabled';

export async function getDarkModeEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(DARK_MODE_KEY)) === 'true';
  } catch (error) {
    console.error('Failed to retrieve dark mode preference:', error);
    return false;
  }
}

export async function setDarkModeEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(DARK_MODE_KEY, enabled.toString());
  } catch (error) {
    console.error('Failed to save dark mode preference:', error);
    throw error;
  }
}
