/**
 * useMicroSurveys Hook
 * Progressive Profiling: Manages micro-survey state and API calls
 * Updated to use centralized microSurveyService
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  microSurveyService,
  type MicroSurveyQuestion,
  type MicroSurveyResponse,
  type TierUnlockEvent
} from '@/services/ml/microSurveyService';
import { supabase } from '@/lib/supabase';

export function useMicroSurveys(userId: string | undefined) {
  const [currentSurvey, setCurrentSurvey] = useState<MicroSurveyQuestion | null>(null);
  const [pendingUnlock, setPendingUnlock] = useState<TierUnlockEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch next micro-survey using centralized service
  const fetchNextSurvey = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const survey = await microSurveyService.checkAndGetNextSurvey(userId);
      setCurrentSurvey(survey);
    } catch (error) {
      console.error('Error fetching micro-survey:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check for pending tier unlocks using centralized service
  const fetchPendingUnlocks = async () => {
    if (!userId) return;

    try {
      const unlocks = await microSurveyService.getPendingUnlocks(userId);
      if (unlocks.length > 0) {
        setPendingUnlock(unlocks[0]); // Show most recent
      } else {
        setPendingUnlock(null);
      }
    } catch (error) {
      console.error('Error fetching tier unlocks:', error);
    }
  };

  // Submit response using centralized service
  const submitResponse = async (
    questionId: string,
    responseValue: string | string[]
  ): Promise<MicroSurveyResponse | null> => {
    if (!userId) return null;

    try {
      setSubmitting(true);

      const data = await microSurveyService.submitResponse(
        userId,
        questionId,
        responseValue
      );

      if (!data) {
        throw new Error('Failed to submit response');
      }

      // Show success message
      toast.success('Thanks for sharing! Your profile has been updated.');

      // If threshold crossed, the service will dispatch 'tier-unlocked' event
      // which is handled by useTierUnlock hook
      if (data.threshold_crossed) {
        toast.success(`🎉 You unlocked ${data.new_tier} tier!`);
        await fetchPendingUnlocks();
      }

      // Clear current survey and fetch next
      setCurrentSurvey(null);
      setTimeout(() => fetchNextSurvey(), 1000); // Small delay for smooth transition

      return data;
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to save response. Please try again.');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  // Acknowledge tier unlock using centralized service
  const acknowledgeTierUnlock = async (
    unlockEventId: string,
    action: 'accept' | 'dismiss',
    regenerateMeal: boolean = false,
    regenerateWorkout: boolean = false
  ) => {
    if (!userId) return;

    try {
      const success = await microSurveyService.acknowledgeTierUnlock(
        userId,
        unlockEventId,
        action,
        regenerateMeal,
        regenerateWorkout
      );

      if (!success) {
        throw new Error('Failed to acknowledge tier unlock');
      }

      if (action === 'accept') {
        toast.success('Your plans are being regenerated with enhanced personalization!');
      }

      // Clear pending unlock
      setPendingUnlock(null);

      return { success: true };
    } catch (error) {
      console.error('Error acknowledging tier unlock:', error);
      toast.error('Failed to process tier unlock.');
    }
  };

  // Dismiss survey
  const dismissSurvey = () => {
    setCurrentSurvey(null);
  };

  // Fetch on mount and when userId changes
  useEffect(() => {
    if (userId) {
      fetchNextSurvey();
      fetchPendingUnlocks();
    }
  }, [userId]);

  return {
    currentSurvey,
    pendingUnlock,
    loading,
    submitting,
    submitResponse,
    acknowledgeTierUnlock,
    dismissSurvey,
    refetch: fetchNextSurvey,
  };
}

/**
 * Helper function to track events for trigger detection
 * Now uses database tracking instead of localStorage
 * Call this from components to track actions
 */
export async function trackMicroSurveyEvent(
  event: string,
  userId: string,
  metadata?: Record<string, any>
) {
  if (!userId) return;

  try {
    // Track in database using Supabase RPC function
    const featureMap: Record<string, string> = {
      'view_meal_plan': 'meal_plan_view',
      'view_workout_plan': 'workout_plan_view',
      'complete_workout': 'workout_completion',
      'log_meal': 'meal_log',
      'meal_disliked': 'meal_dislike',
      'workout_skipped': 'workout_skip',
    };

    const featureName = featureMap[event];
    if (!featureName) {
      console.warn(`Unknown micro survey event: ${event}`);
      return;
    }

    // Use track_usage function from database
    await supabase.rpc('track_usage', {
      p_user_id: userId,
      p_feature: featureName,
      p_increment: 1
    });

    // For specific events, also log to dedicated tables
    if (event === 'meal_disliked' && metadata?.mealPlanId && metadata?.mealName) {
      await microSurveyService.submitMealFeedback(
        userId,
        metadata.mealPlanId,
        metadata.mealName,
        false, // liked = false
        metadata.feedbackType,
        metadata.notes
      );
    } else if (event === 'workout_skipped' && metadata?.workoutPlanId && metadata?.workoutName) {
      await microSurveyService.submitWorkoutSkip(
        userId,
        metadata.workoutPlanId,
        metadata.workoutName,
        metadata.scheduledDate || new Date().toISOString(),
        metadata.skipReason,
        metadata.notes
      );
    }
  } catch (error) {
    console.error('Error tracking micro survey event:', error);
  }
}
