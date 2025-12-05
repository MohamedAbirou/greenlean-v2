/**
 * useTierUnlock Hook
 * Listens for tier unlock events and manages notification display
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import type { TierUnlockData } from '@/shared/components/notifications/TierUnlockNotification';

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:5001';

export function useTierUnlock() {
  const { user } = useAuth();
  const [tierUnlockData, setTierUnlockData] = useState<TierUnlockData | null>(null);

  useEffect(() => {
    if (!user) return;

    // Listen for tier unlock events from micro survey service
    const handleTierUnlock = (event: CustomEvent<TierUnlockData>) => {
      setTierUnlockData(event.detail);
    };

    window.addEventListener('tier-unlocked', handleTierUnlock as EventListener);

    return () => {
      window.removeEventListener('tier-unlocked', handleTierUnlock as EventListener);
    };
  }, [user]);

  const handleRegenerate = async () => {
    if (!tierUnlockData || !user) return;

    try {
      // Call ML service to regenerate plans
      const response = await fetch(`${ML_SERVICE_URL}/regenerate-plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          regenerate_meal: tierUnlockData.shouldRegenerateMeal ?? false,
          regenerate_workout: tierUnlockData.shouldRegenerateWorkout ?? false,
          reason: 'tier_upgrade'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate plans');
      }

      // Mark regeneration as accepted in tier_unlock_events
      await supabase
        .from('tier_unlock_events')
        .update({
          regeneration_accepted_at: new Date().toISOString(),
          meal_plan_regenerated: tierUnlockData.shouldRegenerateMeal ?? false,
          workout_plan_regenerated: tierUnlockData.shouldRegenerateWorkout ?? false,
        })
        .eq('user_id', user.id)
        .eq('new_tier', tierUnlockData.newTier)
        .is('regeneration_accepted_at', null)
        .order('unlocked_at', { ascending: false })
        .limit(1);

      setTierUnlockData(null);
    } catch (error) {
      console.error('Failed to regenerate plans:', error);
    }
  };

  const handleDismiss = async () => {
    if (!tierUnlockData || !user) return;

    try {
      // Mark regeneration as dismissed
      await supabase
        .from('tier_unlock_events')
        .update({
          regeneration_dismissed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('new_tier', tierUnlockData.newTier)
        .is('regeneration_dismissed_at', null)
        .order('unlocked_at', { ascending: false })
        .limit(1);

      setTierUnlockData(null);
    } catch (error) {
      console.error('Failed to dismiss tier unlock:', error);
      setTierUnlockData(null); // Dismiss anyway
    }
  };

  return {
    tierUnlockData,
    onRegenerate: handleRegenerate,
    onDismiss: handleDismiss,
  };
}
