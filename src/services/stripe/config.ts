/**
 * Stripe Pricing Configuration
 * Define all subscription tiers and their features
 */

import type { PricingPlan } from './types';

/**
 * Stripe Publishable Key
 * Set this in your .env file as VITE_STRIPE_PUBLISHABLE_KEY
 */
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

/**
 * All Pricing Plans
 * These should match exactly with your Supabase subscription_tiers table
 */
export const PRICING_PLANS: PricingPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceIds: {
      monthly: '', // No Stripe price for free tier
      yearly: '',
    },
    features: [
      '2 AI-generated meal plans per month',
      '2 AI-generated workout plans per month',
      'Basic progress tracking',
      'Nutrition & workout logging',
      'Weight tracking',
      'Community access',
    ],
    limits: {
      aiGenerationsPerMonth: 2,
      mealPlansStorage: 5,
      workoutPlansStorage: 5,
      canAccessBarcodeScanner: false,
      canAccessSocialFeatures: false,
      canUnlockThemes: false,
      prioritySupport: false,
    },
  },
  {
    tier: 'pro',
    name: 'Pro',
    description: 'For serious fitness enthusiasts',
    price: {
      monthly: 999, // $9.99
      yearly: 9990, // $99.90 (save 17%)
    },
    stripePriceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || '',
      yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID || '',
    },
    features: [
      '50 AI-generated plans per month',
      'Unlimited meal & workout plan storage',
      'Barcode food scanner',
      'Social features & friend challenges',
      'Advanced analytics & insights',
      'Unlockable premium themes',
      'Recipe builder & meal prep tools',
      'Exercise video library',
      'Priority email support',
    ],
    limits: {
      aiGenerationsPerMonth: 50,
      mealPlansStorage: null, // unlimited
      workoutPlansStorage: null, // unlimited
      canAccessBarcodeScanner: true,
      canAccessSocialFeatures: true,
      canUnlockThemes: true,
      prioritySupport: false,
    },
    popular: true,
    badge: 'Most Popular',
  },
  {
    tier: 'premium',
    name: 'Premium',
    description: 'Ultimate fitness transformation',
    price: {
      monthly: 1999, // $19.99
      yearly: 19990, // $199.90 (save 17%)
    },
    stripePriceIds: {
      monthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
      yearly: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
    },
    features: [
      '✨ Everything in Pro, plus:',
      '200 AI-generated plans per month',
      'Priority AI plan generation (faster)',
      '1-on-1 nutrition consultation (monthly)',
      'Custom macro cycling strategies',
      'Advanced body recomposition tracking',
      'Exclusive challenges & rewards',
      'Premium themes & avatars',
      'Early access to new features',
      '24/7 priority support',
    ],
    limits: {
      aiGenerationsPerMonth: 200,
      mealPlansStorage: null, // unlimited
      workoutPlansStorage: null, // unlimited
      canAccessBarcodeScanner: true,
      canAccessSocialFeatures: true,
      canUnlockThemes: true,
      prioritySupport: true,
    },
    badge: 'Best Value',
  },
];

/**
 * Get pricing plan by tier
 */
export function getPlanByTier(tier: string): PricingPlan | undefined {
  return PRICING_PLANS.find((plan) => plan.tier === tier);
}

/**
 * Format price for display
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Get monthly price from yearly (for display)
 */
export function getMonthlyFromYearly(yearlyCents: number): string {
  return formatPrice(Math.floor(yearlyCents / 12));
}

/**
 * Calculate savings percentage
 */
export function calculateSavings(monthlyPrice: number, yearlyPrice: number): number {
  const yearlyTotal = monthlyPrice * 12;
  const savings = ((yearlyTotal - yearlyPrice) / yearlyTotal) * 100;
  return Math.round(savings);
}
