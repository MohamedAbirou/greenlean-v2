/**
 * useSubscription Hook
 * Manage user subscription state
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import type { Subscription, SubscriptionTier } from '../types';
import { getPlanByTier } from '../config';

export interface UseSubscriptionReturn {
  subscription: Subscription | null;
  tier: SubscriptionTier;
  isPro: boolean;
  isPremium: boolean;
  isFree: boolean;
  isActive: boolean;
  isLoading: boolean;
  plan: ReturnType<typeof getPlanByTier>;
  limits: ReturnType<typeof getPlanByTier>['limits'] | null;
  refetch: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    fetchSubscription();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      // If no subscription, create a free one
      if (!data) {
        const { data: newSub, error: createError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            tier: 'free',
            status: 'active',
          })
          .select()
          .single();

        if (createError) throw createError;
        setSubscription(newSub);
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tier: SubscriptionTier = subscription?.tier || 'free';
  const plan = getPlanByTier(tier);

  return {
    subscription,
    tier,
    isPro: tier === 'pro',
    isPremium: tier === 'premium',
    isFree: tier === 'free',
    isActive: subscription?.status === 'active',
    isLoading,
    plan,
    limits: plan?.limits || null,
    refetch: fetchSubscription,
  };
}
