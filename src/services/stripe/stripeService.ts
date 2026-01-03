/**
 * Stripe Service
 * Handles all Stripe-related operations
 */

import { supabase } from '@/lib/supabase';
import type { Stripe } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from './config';
import type { CheckoutSession, SubscriptionTier } from './types';

let stripePromise: Promise<Stripe | null>;

/**
 * Get Stripe instance (singleton)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  tier: SubscriptionTier
): Promise<CheckoutSession> {
  try {
    // Call Supabase Edge Function to create checkout session
    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: {
          userId,
          priceId,
          tier,
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing`,
        },
      }
    );

    if (error) throw error;
    if (!data?.sessionId || !data?.url) {
      throw new Error('Invalid checkout session response');
    }

    return data as CheckoutSession;
  } catch (error) {
    console.error('Failed to create checkout session:', error);
    throw error;
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(checkoutUrl: string): Promise<void> {
  if (!checkoutUrl) {
    throw new Error('Checkout URL is required');
  }

  window.location.href = checkoutUrl;
}

/**
 * Create checkout and redirect (all in one)
 */
export async function startCheckoutFlow(
  userId: string,
  priceId: string,
  tier: SubscriptionTier
): Promise<void> {
  const session = await createCheckoutSession(userId, priceId, tier);
  await redirectToCheckout(session.url);
}

/**
 * Create Stripe Customer Portal session
 * For managing subscription, payment methods, billing history
 */
export async function createPortalSession(userId: string): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'create-portal-session',
      {
        body: {
          userId,
          returnUrl: `${window.location.origin}/settings/billing`,
        },
      }
    );

    if (error) throw error;
    if (!data?.url) {
      throw new Error('Invalid portal session response');
    }

    return data.url;
  } catch (error) {
    console.error('Failed to create portal session:', error);
    throw error;
  }
}

/**
 * Open Stripe Customer Portal
 */
export async function openCustomerPortal(userId: string): Promise<void> {
  const url = await createPortalSession(userId);
  window.location.href = url;
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(userId: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('cancel-subscription', {
      body: { userId },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to cancel subscription:', error);
    throw error;
  }
}

/**
 * Resume canceled subscription
 */
export async function resumeSubscription(userId: string): Promise<void> {
  try {
    const { error } = await supabase.functions.invoke('resume-subscription', {
      body: { userId },
    });

    if (error) throw error;
  } catch (error) {
    console.error('Failed to resume subscription:', error);
    throw error;
  }
}

/**
 * Get user's usage metrics for current billing period
 */
export async function getUserUsage(userId: string) {
  try {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('usage_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('period_start', periodStart.toISOString())
      .lte('period_end', periodEnd.toISOString());

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Failed to fetch usage metrics:', error);
    return [];
  }
}

/**
 * Check if user can access a feature based on their subscription tier
 */
export async function canAccessFeature(
  userId: string,
  feature: string
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const { data, error } = await supabase.rpc('can_use_feature', {
      p_user_id: userId,
      p_feature: feature,
    });

    if (error) throw error;

    return {
      allowed: data === true,
      reason: data === false ? 'Feature limit reached or tier restricted' : undefined,
    };
  } catch (error) {
    console.error('Failed to check feature access:', error);
    return { allowed: false, reason: 'Failed to check permissions' };
  }
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  userId: string,
  feature: string
): Promise<void> {
  try {
    await supabase.rpc('track_usage', {
      p_user_id: userId,
      p_feature: feature,
      p_increment: 1,
    });
  } catch (error) {
    console.error('Failed to track usage:', error);
    // Don't throw - usage tracking shouldn't block the user
  }
}
