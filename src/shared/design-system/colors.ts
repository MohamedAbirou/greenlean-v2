/**
 * GreenLean Design System - Color Palette V2
 * Complete transformation with sophisticated, modern colors
 * Inspired by premium fitness apps (Calm, Headspace, MyFitnessPal)
 */

export const colorPalette = {
  // PRIMARY: Emerald Green (sophisticated, trustworthy)
  primary: {
    50: '#ECFDF5',   // Ultra light - backgrounds, hover states
    100: '#D1FAE5',  // Light - badges, pills
    200: '#A7F3D0',  // Soft - disabled states
    300: '#6EE7B7',  // Medium light - accents
    400: '#34D399',  // Medium - secondary buttons
    500: '#10B981',  // MAIN - primary buttons, links, focus (HSL: 158, 64%, 52%)
    600: '#059669',  // Dark - hover states
    700: '#047857',  // Darker - active states
    800: '#065F46',  // Deep - text on light backgrounds
    900: '#064E3B',  // Deepest - headings, dark mode text
    950: '#022C22',  // Almost black
  },

  // SECONDARY: Deep Blue (calmness, focus, contrast)
  secondary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // MAIN - secondary CTAs, info states
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    950: '#172554',
  },

  // ACCENT: Vibrant Orange (energy, motivation, rewards)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',  // MAIN - badges, streaks, celebrations
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
    950: '#431407',
  },

  // SEMANTIC COLORS
  success: {
    light: '#D1FAE5',
    DEFAULT: '#10B981',
    dark: '#047857',
  },

  error: {
    light: '#FEE2E2',
    DEFAULT: '#EF4444',
    dark: '#B91C1C',
  },

  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#B45309',
  },

  info: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#1E40AF',
  },

  // NEUTRALS (for text, backgrounds, borders)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },

  // DARK MODE SPECIFIC
  dark: {
    bg: {
      primary: '#0A0E13',      // Main background (deep navy-black)
      secondary: '#111827',    // Cards, elevated surfaces
      tertiary: '#1F2937',     // Hover states, inputs
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',   // Subtle borders
      secondary: 'rgba(255, 255, 255, 0.12)',  // Elevated borders
    },
    text: {
      primary: '#F9FAFB',      // Main text (near white)
      secondary: '#D1D5DB',    // Secondary text
      tertiary: '#9CA3AF',     // Muted text, placeholders
    },
  },
};

// Export as CSS variables for use in CSS files
export const cssVariables = `
  :root {
    /* Primary Colors */
    --color-primary-50: ${colorPalette.primary[50]};
    --color-primary-100: ${colorPalette.primary[100]};
    --color-primary-200: ${colorPalette.primary[200]};
    --color-primary-300: ${colorPalette.primary[300]};
    --color-primary-400: ${colorPalette.primary[400]};
    --color-primary-500: ${colorPalette.primary[500]};
    --color-primary-600: ${colorPalette.primary[600]};
    --color-primary-700: ${colorPalette.primary[700]};
    --color-primary-800: ${colorPalette.primary[800]};
    --color-primary-900: ${colorPalette.primary[900]};

    /* Secondary Colors */
    --color-secondary-50: ${colorPalette.secondary[50]};
    --color-secondary-500: ${colorPalette.secondary[500]};
    --color-secondary-900: ${colorPalette.secondary[900]};

    /* Accent Colors */
    --color-accent-50: ${colorPalette.accent[50]};
    --color-accent-500: ${colorPalette.accent[500]};
    --color-accent-900: ${colorPalette.accent[900]};

    /* Semantic Colors */
    --color-success: ${colorPalette.success.DEFAULT};
    --color-error: ${colorPalette.error.DEFAULT};
    --color-warning: ${colorPalette.warning.DEFAULT};
    --color-info: ${colorPalette.info.DEFAULT};

    /* Spacing scale (4px base) */
    --spacing-0: 0;
    --spacing-1: 0.25rem;  /* 4px */
    --spacing-2: 0.5rem;   /* 8px */
    --spacing-3: 0.75rem;  /* 12px */
    --spacing-4: 1rem;     /* 16px */
    --spacing-5: 1.25rem;  /* 20px */
    --spacing-6: 1.5rem;   /* 24px */
    --spacing-8: 2rem;     /* 32px */
    --spacing-10: 2.5rem;  /* 40px */
    --spacing-12: 3rem;    /* 48px */
    --spacing-16: 4rem;    /* 64px */
    --spacing-20: 5rem;    /* 80px */
    --spacing-24: 6rem;    /* 96px */

    /* Typography scale */
    --font-size-xs: 0.75rem;      /* 12px */
    --font-size-sm: 0.875rem;     /* 14px */
    --font-size-base: 1rem;       /* 16px */
    --font-size-lg: 1.125rem;     /* 18px */
    --font-size-xl: 1.25rem;      /* 20px */
    --font-size-2xl: 1.5rem;      /* 24px */
    --font-size-3xl: 1.875rem;    /* 30px */
    --font-size-4xl: 2.25rem;     /* 36px */
    --font-size-5xl: 3rem;        /* 48px */

    /* Font weights */
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;

    /* Line heights */
    --line-height-tight: 1.25;
    --line-height-snug: 1.375;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    --line-height-loose: 2;

    /* Border radius */
    --radius-sm: 0.25rem;   /* 4px */
    --radius-md: 0.5rem;    /* 8px */
    --radius-lg: 0.75rem;   /* 12px */
    --radius-xl: 1rem;      /* 16px */
    --radius-2xl: 1.5rem;   /* 24px */
    --radius-full: 9999px;

    /* Shadows (subtle, modern) */
    --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

    /* Z-index scale */
    --z-dropdown: 1000;
    --z-sticky: 1020;
    --z-fixed: 1030;
    --z-modal-backdrop: 1040;
    --z-modal: 1050;
    --z-popover: 1060;
    --z-tooltip: 1070;
  }

  .dark {
    --color-bg-primary: ${colorPalette.dark.bg.primary};
    --color-bg-secondary: ${colorPalette.dark.bg.secondary};
    --color-bg-tertiary: ${colorPalette.dark.bg.tertiary};
    --color-text-primary: ${colorPalette.dark.text.primary};
    --color-text-secondary: ${colorPalette.dark.text.secondary};
    --color-text-tertiary: ${colorPalette.dark.text.tertiary};
    --color-border-primary: ${colorPalette.dark.border.primary};
    --color-border-secondary: ${colorPalette.dark.border.secondary};
  }
`;
