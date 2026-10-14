import AsyncStorage from '@react-native-async-storage/async-storage';

const TUTORIAL_COMPLETED_KEY = 'tutorial-completed';

export async function getTutorialCompleted(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(TUTORIAL_COMPLETED_KEY)) === 'true';
  } catch (error) {
    console.error('Failed to retrieve tutorial completion:', error);
    throw error;
  }
}

export async function setTutorialCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
  } catch (error) {
    console.error('Failed to save tutorial completion:', error);
    throw error;
  }
}

export async function resetTutorialCompleted(): Promise<void> {
  try {
    await AsyncStorage.setItem(TUTORIAL_COMPLETED_KEY, 'false');
  } catch (error) {
    console.error('Failed to reset tutorial completion:', error);
    throw error;
  }
}
