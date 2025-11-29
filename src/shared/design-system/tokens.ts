/**
 * Design Tokens
 * Single source of truth for all design values
 * Tailwind v4 compatible
 */

export const colorPalette = {
  // PRIMARY: Emerald Green (sophisticated, trustworthy)
  primary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // MAIN - HSL: 158, 64%, 52%
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // SECONDARY: Deep Blue (calmness, focus)
  secondary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // MAIN
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // ACCENT: Vibrant Orange (energy, motivation)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // MAIN
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
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

  // NEUTRALS
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
  },

  // DARK MODE SPECIFIC
  dark: {
    bg: {
      primary: '#0A0E13',
      secondary: '#111827',
      tertiary: '#1F2937',
    },
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.12)',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
    },
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
} as const;

export const typography = {
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  fontFamily: {
    sans: ['Inter Variable', 'system-ui', 'sans-serif'],
    display: ['Cal Sans', 'Inter Variable', 'system-ui'],
  },
} as const;

export const borderRadius = {
  sm: '0.25rem',   // 4px
  DEFAULT: '0.5rem',    // 8px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
} as const;

export const shadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const zIndex = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// Export as CSS variables (Tailwind v4 compatible)
export const cssVariables = `
  @theme {
    /* Colors */
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

    --color-secondary-50: ${colorPalette.secondary[50]};
    --color-secondary-100: ${colorPalette.secondary[100]};
    --color-secondary-200: ${colorPalette.secondary[200]};
    --color-secondary-300: ${colorPalette.secondary[300]};
    --color-secondary-400: ${colorPalette.secondary[400]};
    --color-secondary-500: ${colorPalette.secondary[500]};
    --color-secondary-600: ${colorPalette.secondary[600]};
    --color-secondary-700: ${colorPalette.secondary[700]};
    --color-secondary-800: ${colorPalette.secondary[800]};
    --color-secondary-900: ${colorPalette.secondary[900]};

    --color-accent-50: ${colorPalette.accent[50]};
    --color-accent-100: ${colorPalette.accent[100]};
    --color-accent-200: ${colorPalette.accent[200]};
    --color-accent-300: ${colorPalette.accent[300]};
    --color-accent-400: ${colorPalette.accent[400]};
    --color-accent-500: ${colorPalette.accent[500]};
    --color-accent-600: ${colorPalette.accent[600]};
    --color-accent-700: ${colorPalette.accent[700]};
    --color-accent-800: ${colorPalette.accent[800]};
    --color-accent-900: ${colorPalette.accent[900]};

    /* Semantic Colors */
    --color-success: ${colorPalette.success.DEFAULT};
    --color-success-light: ${colorPalette.success.light};
    --color-success-dark: ${colorPalette.success.dark};

    --color-error: ${colorPalette.error.DEFAULT};
    --color-error-light: ${colorPalette.error.light};
    --color-error-dark: ${colorPalette.error.dark};

    --color-warning: ${colorPalette.warning.DEFAULT};
    --color-warning-light: ${colorPalette.warning.light};
    --color-warning-dark: ${colorPalette.warning.dark};

    --color-info: ${colorPalette.info.DEFAULT};
    --color-info-light: ${colorPalette.info.light};
    --color-info-dark: ${colorPalette.info.dark};

    /* Spacing */
    --spacing-0: ${spacing[0]};
    --spacing-1: ${spacing[1]};
    --spacing-2: ${spacing[2]};
    --spacing-3: ${spacing[3]};
    --spacing-4: ${spacing[4]};
    --spacing-5: ${spacing[5]};
    --spacing-6: ${spacing[6]};
    --spacing-8: ${spacing[8]};
    --spacing-10: ${spacing[10]};
    --spacing-12: ${spacing[12]};
    --spacing-16: ${spacing[16]};
    --spacing-20: ${spacing[20]};
    --spacing-24: ${spacing[24]};

    /* Typography */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    --font-size-5xl: 3rem;

    --font-weight-normal: ${typography.fontWeight.normal};
    --font-weight-medium: ${typography.fontWeight.medium};
    --font-weight-semibold: ${typography.fontWeight.semibold};
    --font-weight-bold: ${typography.fontWeight.bold};

    --line-height-tight: ${typography.lineHeight.tight};
    --line-height-snug: ${typography.lineHeight.snug};
    --line-height-normal: ${typography.lineHeight.normal};
    --line-height-relaxed: ${typography.lineHeight.relaxed};
    --line-height-loose: ${typography.lineHeight.loose};

    /* Border Radius */
    --radius-sm: ${borderRadius.sm};
    --radius-md: ${borderRadius.md};
    --radius-lg: ${borderRadius.lg};
    --radius-xl: ${borderRadius.xl};
    --radius-2xl: ${borderRadius['2xl']};
    --radius-full: ${borderRadius.full};

    /* Shadows */
    --shadow-xs: ${shadows.xs};
    --shadow-sm: ${shadows.sm};
    --shadow-md: ${shadows.md};
    --shadow-lg: ${shadows.lg};
    --shadow-xl: ${shadows.xl};
    --shadow-inner: ${shadows.inner};

    /* Transitions */
    --transition-fast: ${transitions.fast};
    --transition-base: ${transitions.base};
    --transition-slow: ${transitions.slow};

    /* Z-Index */
    --z-dropdown: ${zIndex.dropdown};
    --z-sticky: ${zIndex.sticky};
    --z-fixed: ${zIndex.fixed};
    --z-modal-backdrop: ${zIndex.modalBackdrop};
    --z-modal: ${zIndex.modal};
    --z-popover: ${zIndex.popover};
    --z-tooltip: ${zIndex.tooltip};
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
