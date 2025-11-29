/**
 * GraphQL-based Plan Provider
 * Replaces REST-based PlanProvider with Apollo Client
 */

import { useGetUserSubscriptionQuery } from '@/generated/graphql';
import { useAuth } from '@/features/auth';
import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

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

export const PlanProviderGraphQL = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  // Fetch subscription data via GraphQL
  const {
    data: subscriptionData,
    loading,
    refetch,
  } = useGetUserSubscriptionQuery({
    variables: { userId: user?.id ?? '' },
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });

  // Extract subscription from GraphQL response
  const subscription =
    subscriptionData?.subscriptionsCollection?.edges?.[0]?.node ?? null;

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
    await refetch();
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
