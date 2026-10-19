import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getDarkModeEnabled, setDarkModeEnabled } from '../storage/theme.storage';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  accent: string;
  accentText: string;
  tabInactive: string;
}

const lightColors: ThemeColors = {
  background: '#F9F3EA',
  surface: '#FFFDF9',
  surfaceMuted: '#EEF5EF',
  border: '#D9E8DD',
  text: '#21362F',
  textMuted: '#49645B',
  textSubtle: '#738B82',
  accent: '#4C7F6B',
  accentText: '#F7FCF9',
  tabInactive: '#A2B4AE',
};

const darkColors: ThemeColors = {
  background: '#14241E',
  surface: '#1C2F2A',
  surfaceMuted: '#233C35',
  border: '#33564D',
  text: '#ECF7F2',
  textMuted: '#C3DAD0',
  textSubtle: '#9AB6AE',
  accent: '#587F69',
  accentText: '#122821',
  tabInactive: '#70897F',
};

interface ThemeContextValue {
  isDarkMode: boolean;
  colors: ThemeColors;
  setDarkMode: (enabled: boolean) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    getDarkModeEnabled().then(setIsDarkMode);
  }, []);

  async function updateDarkMode(enabled: boolean): Promise<void> {
    setIsDarkMode(enabled);
    await setDarkModeEnabled(enabled);
  }

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        colors: isDarkMode ? darkColors : lightColors,
        setDarkMode: updateDarkMode,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
}
