/**
 * Subscription Plan Provider
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

interface PlanContextProps {
  planId: string;
  planName: string;
  aiGenQuizCount: number;
  allowed: number;
  renewal: string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const PlanContext = createContext<PlanContextProps | undefined>(undefined);

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
};

export default function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user?.id) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } else {
      setSubscription(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user?.id]);

  // Map tier to plan name and allowed generations
  const planId = subscription?.tier || 'free';
  let planName = 'Free';
  let allowed = 1; // Free tier: 1 AI generation per month

  if (planId === 'pro') {
    planName = 'Pro';
    allowed = 20; // Pro tier: 20 AI generations per month
  } else if (planId === 'premium') {
    planName = 'Premium';
    allowed = 999; // Premium tier: Unlimited (999 as proxy)
  }

  // Get AI generation count from metadata
  const metadata = subscription?.metadata as any;
  const aiGenQuizCount = metadata?.ai_gen_quiz_count ?? 0;

  // Get renewal date
  const renewal = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toISOString()
    : '';

  // Refresh function
  const refresh = async () => {
    await fetchSubscription();
  };

  return (
    <PlanContext.Provider
      value={{
        planId,
        planName,
        aiGenQuizCount,
        allowed,
        renewal,
        loading,
        refresh,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};