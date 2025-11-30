import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Theme color schemes
export interface ThemeColors {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  preview: string; // CSS gradient for preview
  isLocked: boolean;
  rewardValue?: string; // Matches reward.value from rewards_catalog
}

export const AVAILABLE_THEMES: Record<string, ThemeColors> = {
  default: {
    name: 'default',
    displayName: 'Default',
    description: 'Classic GreenLean theme',
    colors: {
      primary: '#10b981', // emerald-500
      secondary: '#8b5cf6', // violet-500
      accent: '#f59e0b', // amber-500
      background: '#ffffff',
      foreground: '#1f2937',
    },
    preview: 'linear-gradient(135deg, #10b981 0%, #8b5cf6 100%)',
    isLocked: false,
  },
  ocean_theme: {
    name: 'ocean_theme',
    displayName: 'Ocean',
    description: 'Cool blue ocean-inspired color scheme',
    colors: {
      primary: '#0ea5e9', // sky-500
      secondary: '#06b6d4', // cyan-500
      accent: '#3b82f6', // blue-500
      background: '#f0f9ff',
      foreground: '#0c4a6e',
    },
    preview: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #3b82f6 100%)',
    isLocked: true,
    rewardValue: 'ocean_theme',
  },
  forest_theme: {
    name: 'forest_theme',
    displayName: 'Forest',
    description: 'Calming green forest color scheme',
    colors: {
      primary: '#22c55e', // green-500
      secondary: '#84cc16', // lime-500
      accent: '#10b981', // emerald-500
      background: '#f0fdf4',
      foreground: '#14532d',
    },
    preview: 'linear-gradient(135deg, #22c55e 0%, #84cc16 50%, #10b981 100%)',
    isLocked: true,
    rewardValue: 'forest_theme',
  },
  sunset_theme: {
    name: 'sunset_theme',
    displayName: 'Sunset',
    description: 'Warm orange and purple gradient',
    colors: {
      primary: '#f97316', // orange-500
      secondary: '#f59e0b', // amber-500
      accent: '#a855f7', // purple-500
      background: '#fff7ed',
      foreground: '#7c2d12',
    },
    preview: 'linear-gradient(135deg, #f97316 0%, #f59e0b 50%, #a855f7 100%)',
    isLocked: true,
    rewardValue: 'sunset_theme',
  },
  midnight_theme: {
    name: 'midnight_theme',
    displayName: 'Midnight',
    description: 'Deep purple and black dark theme',
    colors: {
      primary: '#6366f1', // indigo-500
      secondary: '#8b5cf6', // violet-500
      accent: '#a855f7', // purple-500
      background: '#0f172a', // slate-900
      foreground: '#e2e8f0',
    },
    preview: 'linear-gradient(135deg, #0f172a 0%, #6366f1 50%, #8b5cf6 100%)',
    isLocked: true,
    rewardValue: 'midnight_theme',
  },
  champion_theme: {
    name: 'champion_theme',
    displayName: 'Champion',
    description: 'Gold and black premium theme',
    colors: {
      primary: '#eab308', // yellow-500
      secondary: '#fbbf24', // amber-400
      accent: '#000000',
      background: '#fefce8', // yellow-50
      foreground: '#422006',
    },
    preview: 'linear-gradient(135deg, #eab308 0%, #fbbf24 50%, #000000 100%)',
    isLocked: true,
    rewardValue: 'champion_theme',
  },
};

interface ThemeState {
  isDarkMode: boolean;
  activeTheme: string; // Theme name
  unlockedThemes: string[]; // Array of unlocked theme names
  toggleTheme: () => void;
  setIsDarkMode: (isDark: boolean) => void;
  setActiveTheme: (themeName: string) => void;
  unlockTheme: (themeName: string) => void;
  isThemeUnlocked: (themeName: string) => boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      activeTheme: 'default',
      unlockedThemes: ['default'], // Default theme is always unlocked

      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      setIsDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),

      setActiveTheme: (themeName: string) => {
        const state = get();
        // Only allow switching to unlocked themes
        if (state.unlockedThemes.includes(themeName)) {
          set({ activeTheme: themeName });
        } else {
          console.warn(`Theme "${themeName}" is locked. Redeem it from the rewards catalog first!`);
        }
      },

      unlockTheme: (themeName: string) =>
        set((state) => {
          if (!state.unlockedThemes.includes(themeName)) {
            return { unlockedThemes: [...state.unlockedThemes, themeName] };
          }
          return state;
        }),

      isThemeUnlocked: (themeName: string) => {
        const state = get();
        return state.unlockedThemes.includes(themeName);
      },
    }),
    {
      name: 'greenlean-theme',
    }
  )
);
