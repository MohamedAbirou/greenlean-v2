/**
 * Component Variants System
 * Using class-variance-authority (CVA)
 * Tailwind v4 compatible - NO hardcoded values
 */

import { cva, type VariantProps } from 'class-variance-authority';

// ============================================
// BUTTON VARIANTS
// ============================================
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-x-2 rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // New design system variants
        primary:
          'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500 shadow-sm',
        secondary:
          'bg-secondary-500 text-white hover:bg-secondary-600 active:bg-secondary-700 focus-visible:ring-secondary-500 shadow-sm',
        outline:
          'border border-primary-500 text-primary-600 hover:bg-primary/10',
        ghost:
          'hover:bg-muted hover:text-foreground active:bg-muted/80 dark:hover:bg-muted dark:hover:text-foreground',
        danger:
          'bg-error text-white hover:bg-error-dark active:opacity-90 focus-visible:ring-error shadow-sm',
        success:
          'bg-success text-white hover:bg-success-dark active:opacity-90 focus-visible:ring-success shadow-sm',
        link: 'text-primary-600 underline-offset-4 hover:underline dark:text-primary-400',
        accent:
          'bg-accent-500 text-white hover:bg-accent-600 active:bg-accent-700 focus-visible:ring-accent-500 shadow-sm',
        // Backwards compatibility aliases
        default:
          'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus-visible:ring-primary-500 shadow-sm',
        destructive:
          'bg-error text-white hover:bg-error-dark active:opacity-90 focus-visible:ring-error shadow-sm',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-11 px-6 text-lg',
        xl: 'h-12 px-8 text-xl',
        icon: 'h-10 w-10',
        // Backwards compatibility aliases
        default: 'h-10 px-4 text-base',
        xs: 'h-8 px-2 text-xs',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
      loading: {
        true: 'opacity-60 cursor-not-allowed',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

// ============================================
// CARD VARIANTS
// ============================================
export const cardVariants = cva(
  'rounded-xl border transition-all',
  {
    variants: {
      variant: {
        default:
          'bg-card border-border shadow-sm',
        elevated:
          'bg-card border-border shadow-md hover:shadow-lg',
        glass:
          'bg-card/80 backdrop-blur-xl border-border/20 shadow-lg',
        outline:
          'bg-transparent border-border hover:border-muted-foreground',
        gradient:
          'bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200 dark:from-primary-950 dark:to-secondary-950 dark:border-primary-800',
      },
      hover: {
        true: 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        false: '',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
      hover: false,
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;

// ============================================
// BADGE VARIANTS
// ============================================
export const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 font-medium transition-colors',
  {
    variants: {
      variant: {
        // New design system variants
        primary: 'bg-primary/20 text-primary',
        secondary: 'bg-secondary/20 text-secondary',
        accent: 'bg-accent/20 text-accent',
        success: 'bg-success/20 text-success',
        error: 'bg-error/20 text-error',
        warning: 'bg-warning/20 text-warning',
        info: 'bg-info/20 text-info',
        tip: 'bg-tip/20 text-tip',
        gray: 'bg-muted text-muted-foreground',
        outline: 'border border-current bg-transparent',
        // Backwards compatibility aliases
        default: 'bg-primary/10 text-primary',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-sm',
        lg: 'px-3 py-1 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

// ============================================
// INPUT VARIANTS
// ============================================
export const inputVariants = cva(
  'flex w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
  {
    variants: {
      variant: {
        default:
          'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
        error:
          'border-error focus:border-error focus:ring-2 focus:ring-error/20 dark:border-error-dark',
        success:
          'border-success focus:border-success focus:ring-2 focus:ring-success/20 dark:border-success-dark',
      },
      inputSize: {
        sm: 'h-8 text-xs',
        md: 'h-10 text-sm',
        lg: 'h-12 text-base',
      },
      disabled: {
        true: 'cursor-not-allowed opacity-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      disabled: false,
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;

// ============================================
// ALERT VARIANTS
// ============================================
export const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm',
  {
    variants: {
      variant: {
        default:
          'bg-card border-border text-foreground',
        info: 'bg-info-light border-info text-info-dark dark:bg-info-dark/20 dark:border-info dark:text-info-light',
        success:
          'bg-success-light border-success text-success-dark dark:bg-success-dark/20 dark:border-success dark:text-success-light',
        warning:
          'bg-warning-light border-warning text-warning-dark dark:bg-warning-dark/20 dark:border-warning dark:text-warning-light',
        error:
          'bg-error-light border-error text-error-dark dark:bg-error-dark/20 dark:border-error dark:text-error-light',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type AlertVariants = VariantProps<typeof alertVariants>;

// ============================================
// SKELETON VARIANTS
// ============================================
export const skeletonVariants = cva(
  'animate-pulse rounded-md bg-muted',
  {
    variants: {
      variant: {
        default: '',
        circular: 'rounded-full',
        text: 'h-4 w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;
