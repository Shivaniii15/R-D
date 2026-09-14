import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'accessibility_large_text';

interface AccessibilityContextType {
  largeText: boolean;
  toggleLargeText: () => void;
  scale: (size: number) => number;
}

const AccessibilityContext = createContext<AccessibilityContextType>({
  largeText: false,
  toggleLargeText: () => {},
  scale: (size: number) => size,
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [largeText, setLargeText] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(value => {
      if (value === 'true') setLargeText(true);
    });
  }, []);

  const toggleLargeText = useCallback(() => {
    setLargeText(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const scale = useCallback(
    (size: number) => (largeText ? Math.round(size * 1.3) : size),
    [largeText],
  );

  return (
    <AccessibilityContext.Provider value={{ largeText, toggleLargeText, scale }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  return useContext(AccessibilityContext);
}