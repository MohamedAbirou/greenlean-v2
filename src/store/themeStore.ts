import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setIsDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false, // Default to light mode
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setIsDarkMode: (isDark: boolean) => set({ isDarkMode: isDark }),
    }),
    {
      name: 'greenlean-theme',
    }
  )
);