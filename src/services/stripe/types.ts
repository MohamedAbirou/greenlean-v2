/**
 * Stripe Service Types
 * Type definitions for subscription and billing
 */

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_start: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: {
    monthly: number; // in cents
    yearly: number; // in cents
  };
  stripePriceIds: {
    monthly: string;
    yearly: string;
  };
  features: string[];
  limits: {
    aiGenerationsPerMonth: number;
    mealPlansStorage: number | null; // null = unlimited
    workoutPlansStorage: number | null;
    canAccessBarcodeScanner: boolean;
    canAccessSocialFeatures: boolean;
    canUnlockThemes: boolean;
    prioritySupport: boolean;
  };
  popular?: boolean;
  badge?: string;
}

export interface UsageMetrics {
  feature: string;
  usageCount: number;
  limit: number;
  periodStart: string;
  periodEnd: string;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}
