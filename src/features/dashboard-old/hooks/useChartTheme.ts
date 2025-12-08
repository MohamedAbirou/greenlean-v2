/**
 * useChartTheme Hook
 * Provides theme-aware colors for Recharts components
 * Automatically adapts to light/dark mode
 */

import { useEffect, useState } from 'react';

export interface ChartTheme {
  text: string;
  textSecondary: string;
  grid: string;
  axis: string;
  tooltip: {
    background: string;
    border: string;
    text: string;
  };
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export function useChartTheme(): ChartTheme {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const root = document.documentElement;
      const isDarkMode = root.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (isDark) {
    // Dark mode colors
    return {
      text: '#e5e7eb', // gray-200
      textSecondary: '#9ca3af', // gray-400
      grid: '#374151', // gray-700
      axis: '#4b5563', // gray-600
      tooltip: {
        background: '#1f2937', // gray-800
        border: '#374151', // gray-700
        text: '#f3f4f6', // gray-100
      },
      colors: {
        primary: '#3b82f6', // blue-500
        secondary: '#f97316', // orange-500
        success: '#10b981', // green-500
        warning: '#eab308', // yellow-500
        error: '#ef4444', // red-500
        info: '#6366f1', // indigo-500
      },
    };
  }

  // Light mode colors
  return {
    text: '#374151', // gray-700
    textSecondary: '#6b7280', // gray-500
    grid: '#e5e7eb', // gray-200
    axis: '#9ca3af', // gray-400
    tooltip: {
      background: '#ffffff',
      border: '#e5e7eb', // gray-200
      text: '#111827', // gray-900
    },
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#f97316', // orange-500
      success: '#10b981', // green-500
      warning: '#eab308', // yellow-500
      error: '#ef4444', // red-500
      info: '#6366f1', // indigo-500
    },
  };
}
