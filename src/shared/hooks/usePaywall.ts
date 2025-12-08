/**
 * usePaywall Hook
 * Manages paywall modal state and subscription checks
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface PaywallState {
  isOpen: boolean;
  featureName: string;
  limitMessage?: string;
}

export function usePaywall(currentTier: 'free' | 'pro' | 'premium' = 'free') {
  const navigate = useNavigate();
  const [paywallState, setPaywallState] = useState<PaywallState>({
    isOpen: false,
    featureName: '',
    limitMessage: undefined,
  });

  const showPaywall = useCallback((featureName: string, limitMessage?: string) => {
    setPaywallState({
      isOpen: true,
      featureName,
      limitMessage,
    });
  }, []);

  const hidePaywall = useCallback(() => {
    setPaywallState({
      isOpen: false,
      featureName: '',
      limitMessage: undefined,
    });
  }, []);

  const handleUpgrade = useCallback((tier: 'pro' | 'premium') => {
    // Navigate to pricing page with selected tier
    navigate(`/pricing?tier=${tier}`);
    toast.success(`Redirecting to ${tier === 'pro' ? 'Pro' : 'Premium'} checkout...`);
  }, [navigate]);

  return {
    isPaywallOpen: paywallState.isOpen,
    paywallFeatureName: paywallState.featureName,
    paywallLimitMessage: paywallState.limitMessage,
    showPaywall,
    hidePaywall,
    handleUpgrade,
    currentTier,
  };
}

/**
 * Helper function to check if feature is available for tier
 */
export function canAccessFeature(
  feature: 'unlimited_regenerations' | 'premium_personalization' | 'advanced_analytics',
  tier: 'free' | 'pro' | 'premium'
): boolean {
  const featureAccess = {
    unlimited_regenerations: ['pro', 'premium'],
    premium_personalization: ['premium'],
    advanced_analytics: ['premium'],
  };

  return featureAccess[feature]?.includes(tier) ?? false;
}
