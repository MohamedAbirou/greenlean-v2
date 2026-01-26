/**
 * Theme Provider - ENHANCED VERSION
 * Manages dark/light mode AND named theme color schemes
 * Applies theme classes and CSS custom properties to the HTML element
 */

import { AVAILABLE_THEMES, useThemeStore } from '@/store/themeStore';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: ReactNode;
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
  ...props
}: ThemeProviderProps) {
  const { isDarkMode, toggleTheme: storeToggleTheme, activeTheme } = useThemeStore();

  // Apply theme class to HTML element whenever isDarkMode changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Add the correct class
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, [isDarkMode]);

  // Apply active theme colors as CSS custom properties
  useEffect(() => {
    const root = window.document.documentElement;
    const themeColors = AVAILABLE_THEMES[activeTheme];

    if (themeColors) {
      // Apply theme colors as CSS variables
      root.style.setProperty('--theme-primary', themeColors.colors.primary);
      root.style.setProperty('--theme-secondary', themeColors.colors.secondary);
      root.style.setProperty('--theme-accent', themeColors.colors.accent);
      root.style.setProperty('--theme-background', themeColors.colors.background);
      root.style.setProperty('--theme-foreground', themeColors.colors.foreground);
      root.style.setProperty('--theme-preview', themeColors.preview);

      console.log(`Theme colors applied: ${themeColors.displayName} (${activeTheme})`);
    }
  }, [activeTheme]);

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