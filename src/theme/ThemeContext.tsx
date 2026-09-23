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
  background: '#ffffff',
  surface: '#ffffff',
  surfaceMuted: '#f7f7f7',
  border: '#f0f0f0',
  text: '#111111',
  textMuted: '#666666',
  textSubtle: '#888888',
  accent: '#111111',
  accentText: '#ffffff',
  tabInactive: '#bbbbbb',
};

const darkColors: ThemeColors = {
  background: '#111111',
  surface: '#1d1d1d',
  surfaceMuted: '#242424',
  border: '#353535',
  text: '#f5f5f5',
  textMuted: '#c5c5c5',
  textSubtle: '#999999',
  accent: '#f5f5f5',
  accentText: '#111111',
  tabInactive: '#777777',
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
