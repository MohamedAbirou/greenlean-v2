/**
 * Theme Provider - FIXED VERSION
 * Manages dark/light mode theme state across the app
 * This version properly applies theme classes to the HTML element
 */

import { useThemeStore } from '@/store/themeStore';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  isDarkMode: false,
  toggleTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  ...props
}: ThemeProviderProps) {
  const { isDarkMode, toggleTheme: storeToggleTheme } = useThemeStore();

  // Apply theme class to HTML element whenever isDarkMode changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the correct class
    if (isDarkMode) {
      root.classList.add('dark');
      console.log('Theme applied: dark');
    } else {
      root.classList.add('light');
      console.log('Theme applied: light');
    }
  }, [isDarkMode]);

  const setTheme = (newTheme: Theme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      const shouldBeDark = newTheme === 'dark';
      if (isDarkMode !== shouldBeDark) {
        storeToggleTheme();
      }
    }
  };

  const value = {
    theme: isDarkMode ? ('dark' as Theme) : ('light' as Theme),
    setTheme,
    isDarkMode,
    toggleTheme: storeToggleTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};