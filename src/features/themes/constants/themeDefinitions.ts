/**
 * Theme Definitions - Single Source of Truth
 * All available themes with light AND dark mode variants
 */

export interface ThemeColors {
  light: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  dark: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlockable: boolean;
  rewardValue?: string;
  colors: ThemeColors;
  preview: {
    gradient: string;
  };
}

export const AVAILABLE_THEMES: ThemeDefinition[] = [
  {
    id: "default",
    name: "GreenLean Default",
    description: "Our classic green theme",
    icon: "🌿",
    isUnlockable: false,
    colors: {
      light: {
        background: "#ffffff",
        foreground: "#0f172a",
        card: "#ffffff",
        cardForeground: "#0f172a",
        popover: "#ffffff",
        popoverForeground: "#0f172a",
        primary: "#10b981",
        primaryForeground: "#ffffff",
        secondary: "#f1f5f9",
        secondaryForeground: "#0f172a",
        muted: "#f1f5f9",
        mutedForeground: "#64748b",
        accent: "#f97316",
        accentForeground: "#ffffff",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#10b981",
      },
      dark: {
        background: "#0f172a",
        foreground: "#f1f5f9",
        card: "#1e293b",
        cardForeground: "#f1f5f9",
        popover: "#1e293b",
        popoverForeground: "#f1f5f9",
        primary: "#34d399",
        primaryForeground: "#022c22",
        secondary: "#334155",
        secondaryForeground: "#f1f5f9",
        muted: "#334155",
        mutedForeground: "#cbd5e1",
        accent: "#fb923c",
        accentForeground: "#431407",
        destructive: "#f87171",
        destructiveForeground: "#ffffff",
        border: "#334155",
        input: "#334155",
        ring: "#34d399",
      },
    },
    preview: {
      gradient: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
    },
  },
  {
    id: "ocean_theme",
    name: "Ocean",
    description: "Cool blue ocean-inspired colors",
    icon: "🌊",
    isUnlockable: true,
    rewardValue: "ocean_theme",
    colors: {
      light: {
        background: "#ffffff",
        foreground: "#0c4a6e",
        card: "#ffffff",
        cardForeground: "#0c4a6e",
        popover: "#ffffff",
        popoverForeground: "#0c4a6e",
        primary: "#0ea5e9",
        primaryForeground: "#ffffff",
        secondary: "#f0f9ff",
        secondaryForeground: "#0c4a6e",
        muted: "#f0f9ff",
        mutedForeground: "#475569",
        accent: "#06b6d4",
        accentForeground: "#ffffff",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
        border: "#bae6fd",
        input: "#bae6fd",
        ring: "#0ea5e9",
      },
      dark: {
        background: "#0c1821",
        foreground: "#e0f2fe",
        card: "#164e63",
        cardForeground: "#e0f2fe",
        popover: "#164e63",
        popoverForeground: "#e0f2fe",
        primary: "#38bdf8",
        primaryForeground: "#082f49",
        secondary: "#0e7490",
        secondaryForeground: "#e0f2fe",
        muted: "#0e7490",
        mutedForeground: "#bae6fd",
        accent: "#22d3ee",
        accentForeground: "#082f49",
        destructive: "#f87171",
        destructiveForeground: "#ffffff",
        border: "#0e7490",
        input: "#0e7490",
        ring: "#38bdf8",
      },
    },
    preview: {
      gradient: "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
    },
  },
  {
    id: "forest_theme",
    name: "Forest",
    description: "Calming green forest vibes",
    icon: "🌲",
    isUnlockable: true,
    rewardValue: "forest_theme",
    colors: {
      light: {
        background: "#ffffff",
        foreground: "#14532d",
        card: "#ffffff",
        cardForeground: "#14532d",
        popover: "#ffffff",
        popoverForeground: "#14532d",
        primary: "#22c55e",
        primaryForeground: "#ffffff",
        secondary: "#f0fdf4",
        secondaryForeground: "#14532d",
        muted: "#f0fdf4",
        mutedForeground: "#4d7c0f",
        accent: "#84cc16",
        accentForeground: "#ffffff",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
        border: "#bbf7d0",
        input: "#bbf7d0",
        ring: "#22c55e",
      },
      dark: {
        background: "#0a1f0f",
        foreground: "#dcfce7",
        card: "#14532d",
        cardForeground: "#dcfce7",
        popover: "#14532d",
        popoverForeground: "#dcfce7",
        primary: "#4ade80",
        primaryForeground: "#052e16",
        secondary: "#166534",
        secondaryForeground: "#dcfce7",
        muted: "#166534",
        mutedForeground: "#bbf7d0",
        accent: "#a3e635",
        accentForeground: "#1a2e05",
        destructive: "#f87171",
        destructiveForeground: "#ffffff",
        border: "#166534",
        input: "#166534",
        ring: "#4ade80",
      },
    },
    preview: {
      gradient: "linear-gradient(135deg, #22c55e 0%, #84cc16 100%)",
    },
  },
  {
    id: "sunset_theme",
    name: "Sunset",
    description: "Warm orange and purple gradient",
    icon: "🌅",
    isUnlockable: true,
    rewardValue: "sunset_theme",
    colors: {
      light: {
        background: "#ffffff",
        foreground: "#7c2d12",
        card: "#ffffff",
        cardForeground: "#7c2d12",
        popover: "#ffffff",
        popoverForeground: "#7c2d12",
        primary: "#f97316",
        primaryForeground: "#ffffff",
        secondary: "#fff7ed",
        secondaryForeground: "#7c2d12",
        muted: "#fff7ed",
        mutedForeground: "#9a3412",
        accent: "#a855f7",
        accentForeground: "#ffffff",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
        border: "#fed7aa",
        input: "#fed7aa",
        ring: "#f97316",
      },
      dark: {
        background: "#1c0a00",
        foreground: "#ffedd5",
        card: "#431407",
        cardForeground: "#ffedd5",
        popover: "#431407",
        popoverForeground: "#ffedd5",
        primary: "#fb923c",
        primaryForeground: "#431407",
        secondary: "#7c2d12",
        secondaryForeground: "#ffedd5",
        muted: "#7c2d12",
        mutedForeground: "#fed7aa",
        accent: "#c084fc",
        accentForeground: "#3b0764",
        destructive: "#f87171",
        destructiveForeground: "#ffffff",
        border: "#7c2d12",
        input: "#7c2d12",
        ring: "#fb923c",
      },
    },
    preview: {
      gradient: "linear-gradient(135deg, #f97316 0%, #a855f7 100%)",
    },
  },
  {
    id: "midnight_theme",
    name: "Midnight",
    description: "Deep purple and black dark theme",
    icon: "🌙",
    isUnlockable: true,
    rewardValue: "midnight_theme",
    colors: {
      light: {
        background: "#faf5ff",
        foreground: "#4c1d95",
        card: "#ffffff",
        cardForeground: "#4c1d95",
        popover: "#ffffff",
        popoverForeground: "#4c1d95",
        primary: "#8b5cf6",
        primaryForeground: "#ffffff",
        secondary: "#f5f3ff",
        secondaryForeground: "#4c1d95",
        muted: "#f5f3ff",
        mutedForeground: "#6b21a8",
        accent: "#a78bfa",
        accentForeground: "#ffffff",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
        border: "#e9d5ff",
        input: "#e9d5ff",
        ring: "#8b5cf6",
      },
      dark: {
        background: "#0f0a1e",
        foreground: "#f5f3ff",
        card: "#1e1b2e",
        cardForeground: "#f5f3ff",
        popover: "#1e1b2e",
        popoverForeground: "#f5f3ff",
        primary: "#a78bfa",
        primaryForeground: "#2e1065",
        secondary: "#4c1d95",
        secondaryForeground: "#f5f3ff",
        muted: "#4c1d95",
        mutedForeground: "#e9d5ff",
        accent: "#c4b5fd",
        accentForeground: "#2e1065",
        destructive: "#f87171",
        destructiveForeground: "#ffffff",
        border: "#4c1d95",
        input: "#4c1d95",
        ring: "#a78bfa",
      },
    },
    preview: {
      gradient: "linear-gradient(135deg, #0f0a1e 0%, #8b5cf6 100%)",
    },
  },
  {
    id: "champion_theme",
    name: "Champion",
    description: "Gold and black premium theme",
    icon: "👑",
    isUnlockable: true,
    rewardValue: "champion_theme",
    colors: {
      light: {
        background: "#fefce8",
        foreground: "#422006",
        card: "#ffffff",
        cardForeground: "#422006",
        popover: "#ffffff",
        popoverForeground: "#422006",
        primary: "#eab308",
        primaryForeground: "#422006",
        secondary: "#fef9c3",
        secondaryForeground: "#422006",
        muted: "#fef9c3",
        mutedForeground: "#713f12",
        accent: "#fbbf24",
        accentForeground: "#422006",
        destructive: "#ef4444",
        destructiveForeground: "#ffffff",
        border: "#fde047",
        input: "#fde047",
        ring: "#eab308",
      },
      dark: {
        background: "#09090b",
        foreground: "#fef9c3",
        card: "#18181b",
        cardForeground: "#fef9c3",
        popover: "#18181b",
        popoverForeground: "#fef9c3",
        primary: "#fbbf24",
        primaryForeground: "#422006",
        secondary: "#713f12",
        secondaryForeground: "#fef9c3",
        muted: "#713f12",
        mutedForeground: "#fde047",
        accent: "#fde047",
        accentForeground: "#422006",
        destructive: "#f87171",
        destructiveForeground: "#ffffff",
        border: "#713f12",
        input: "#713f12",
        ring: "#fbbf24",
      },
    },
    preview: {
      gradient: "linear-gradient(135deg, #09090b 0%, #eab308 100%)",
    },
  },
];

export function getThemeById(id: string): ThemeDefinition | undefined {
  return AVAILABLE_THEMES.find((theme) => theme.id === id);
}

export function getThemeByRewardValue(rewardValue: string): ThemeDefinition | undefined {
  return AVAILABLE_THEMES.find((theme) => theme.rewardValue === rewardValue);
}

export function getUnlockableThemes(): ThemeDefinition[] {
  return AVAILABLE_THEMES.filter((theme) => theme.isUnlockable);
}

/**
 * Apply theme colors to CSS custom properties
 */
export function applyThemeColors(themeId: string, isDarkMode: boolean): void {
  const theme = getThemeById(themeId);
  if (!theme) return;

  const colors = isDarkMode ? theme.colors.dark : theme.colors.light;
  const root = document.documentElement;

  // Apply all color variables
  Object.entries(colors).forEach(([key, value]) => {
    // Convert camelCase to kebab-case
    const cssVar = key.replace(/([A-Z])/g, "-$1").toLowerCase();
    root.style.setProperty(`--${cssVar}`, value);
  });
}
