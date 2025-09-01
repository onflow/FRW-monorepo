import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

import NativeFRWBridge from '@/bridge/NativeFRWBridge';

interface ThemeContextType {
  isDark: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    const getThemeFromBridge = () => {
      try {
        // Try to get theme from main Android app first
        const bridgeTheme = NativeFRWBridge.getTheme();
        setIsDark(bridgeTheme === 'dark');
        console.log('[ThemeContext] Using theme from main app:', bridgeTheme);
      } catch (error) {
        // Fallback to system color scheme if bridge method fails
        console.log('[ThemeContext] Bridge theme unavailable, using system theme:', systemColorScheme);
        setIsDark(systemColorScheme === 'dark');
      }
    };

    getThemeFromBridge();
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, theme: isDark ? 'dark' : 'light', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
