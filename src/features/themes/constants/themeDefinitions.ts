/**
 * Theme Definitions
 * All available themes in the app
 */

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlockable: boolean;
  rewardValue?: string; // Matches reward_value in database
  colors: {
    primary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
  };
  preview: {
    gradient: string;
  };
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  {
    id: 'default',
    name: 'GreenLean Default',
    description: 'Our classic green theme',
    icon: '🌿',
    isUnlockable: false,
    colors: {
      primary: '#10b981', // emerald-500
      accent: '#3b82f6',  // blue-500
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#f8fafc',
      border: '#e2e8f0',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
    },
  },
  {
    id: 'ocean_theme',
    name: 'Ocean',
    description: 'Cool blue ocean-inspired colors',
    icon: '🌊',
    isUnlockable: true,
    rewardValue: 'ocean_theme',
    colors: {
      primary: '#0891b2', // cyan-600
      accent: '#06b6d4',  // cyan-500
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#f0f9ff',
      border: '#bae6fd',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
    },
  },
  {
    id: 'forest_theme',
    name: 'Forest',
    description: 'Calming green forest vibes',
    icon: '🌲',
    isUnlockable: true,
    rewardValue: 'forest_theme',
    colors: {
      primary: '#059669', // emerald-600
      accent: '#10b981',  // emerald-500
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#f0fdf4',
      border: '#bbf7d0',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    },
  },
  {
    id: 'sunset_theme',
    name: 'Sunset',
    description: 'Warm orange and purple gradient',
    icon: '🌅',
    isUnlockable: true,
    rewardValue: 'sunset_theme',
    colors: {
      primary: '#f97316', // orange-500
      accent: '#a855f7',  // purple-500
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#fff7ed',
      border: '#fed7aa',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #f97316 0%, #a855f7 100%)',
    },
  },
  {
    id: 'midnight_theme',
    name: 'Midnight',
    description: 'Deep purple and black dark theme',
    icon: '🌙',
    isUnlockable: true,
    rewardValue: 'midnight_theme',
    colors: {
      primary: '#8b5cf6', // violet-500
      accent: '#a78bfa',  // violet-400
      background: '#0f0a1e',
      foreground: '#f8fafc',
      card: '#1e1b2e',
      border: '#4c1d95',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #0f0a1e 0%, #8b5cf6 100%)',
    },
  },
  {
    id: 'champion_theme',
    name: 'Champion',
    description: 'Gold and black premium theme',
    icon: '👑',
    isUnlockable: true,
    rewardValue: 'champion_theme',
    colors: {
      primary: '#eab308', // yellow-500
      accent: '#fbbf24',  // yellow-400
      background: '#09090b',
      foreground: '#f8fafc',
      card: '#18181b',
      border: '#713f12',
    },
    preview: {
      gradient: 'linear-gradient(135deg, #09090b 0%, #eab308 100%)',
    },
  },
];

export function getThemeById(id: string): ThemeDefinition | undefined {
  return AVAILABLE_THEMES.find(theme => theme.id === id);
}

export function getThemeByRewardValue(rewardValue: string): ThemeDefinition | undefined {
  return AVAILABLE_THEMES.find(theme => theme.rewardValue === rewardValue);
}

export function getUnlockableThemes(): ThemeDefinition[] {
  return AVAILABLE_THEMES.filter(theme => theme.isUnlockable);
}
