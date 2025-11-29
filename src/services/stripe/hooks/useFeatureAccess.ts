/**
 * useFeatureAccess Hook
 * Check if user can access a specific feature
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { canAccessFeature, trackFeatureUsage } from '../stripeService';
import { useSubscription } from './useSubscription';

export interface UseFeatureAccessReturn {
  canAccess: boolean;
  isLoading: boolean;
  reason?: string;
  checkAccess: () => Promise<boolean>;
  useFeature: () => Promise<void>;
}

/**
 * Hook to check feature access based on subscription tier and usage limits
 */
export function useFeatureAccess(feature: string): UseFeatureAccessReturn {
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [canAccess, setCanAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reason, setReason] = useState<string | undefined>();

  const checkAccess = async (): Promise<boolean> => {
    if (!user) {
      setCanAccess(false);
      setReason('Please sign in');
      return false;
    }

    setIsLoading(true);

    try {
      const result = await canAccessFeature(user.id, feature);
      setCanAccess(result.allowed);
      setReason(result.reason);
      return result.allowed;
    } catch (error) {
      console.error('Failed to check feature access:', error);
      setCanAccess(false);
      setReason('Failed to check access');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Check access on mount and when tier changes
  useEffect(() => {
    checkAccess();
  }, [user, tier, feature]);

  /**
   * Use the feature (tracks usage and checks limits)
   */
  const useFeature = async (): Promise<void> => {
    if (!user) {
      throw new Error('Please sign in');
    }

    const allowed = await checkAccess();
    if (!allowed) {
      throw new Error(reason || 'Feature access denied');
    }

    // Track usage
    await trackFeatureUsage(user.id, feature);

    // Recheck access (limits may have changed)
    await checkAccess();
  };

  return {
    canAccess,
    isLoading,
    reason,
    checkAccess,
    useFeature,
  };
}
