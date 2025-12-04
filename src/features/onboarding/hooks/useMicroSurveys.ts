/**
 * useMicroSurveys Hook
 * Progressive Profiling: Manages micro-survey state and API calls
 * Updated to work with new backend micro-survey endpoints
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface MicroSurveyQuestion {
  id: string;
  question_text: string;
  question_type: 'single_choice' | 'multi_choice' | 'text' | 'numeric' | 'scale';
  field_name: string;
  affects: string[];
  options?: Array<{ value: string; label: string }>;
  trigger_type: string;
}

interface MicroSurveyResponse {
  success: boolean;
  threshold_crossed: boolean;
  old_tier: string;
  new_tier: string;
  old_completeness: number;
  new_completeness: number;
  affects: string[];
}

interface TierUnlockEvent {
  id: string;
  old_tier: string;
  new_tier: string;
  completeness_percentage: number;
  regeneration_offered_at: string;
}

export function useMicroSurveys(userId: string | undefined) {
  const [currentSurvey, setCurrentSurvey] = useState<MicroSurveyQuestion | null>(null);
  const [pendingUnlock, setPendingUnlock] = useState<TierUnlockEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

  // Fetch next micro-survey
  const fetchNextSurvey = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Check for triggers first
      await fetch(`${ML_API_URL}/micro-surveys/check-triggers/${userId}`, {
        method: 'POST',
      });

      // Get next survey
      const response = await fetch(`${ML_API_URL}/micro-surveys/next/${userId}`);

      if (!response.ok) throw new Error('Failed to fetch micro-survey');

      const data = await response.json();

      if (data.has_survey) {
        setCurrentSurvey(data.survey);
      } else {
        setCurrentSurvey(null);
      }
    } catch (error) {
      console.error('Error fetching micro-survey:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check for pending tier unlocks
  const fetchPendingUnlocks = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`${ML_API_URL}/micro-surveys/tier-unlocks/${userId}`);

      if (!response.ok) throw new Error('Failed to fetch tier unlocks');

      const data = await response.json();

      if (data.has_unlocks && data.unlocks.length > 0) {
        setPendingUnlock(data.unlocks[0]); // Show most recent
      } else {
        setPendingUnlock(null);
      }
    } catch (error) {
      console.error('Error fetching tier unlocks:', error);
    }
  };

  // Submit response
  const submitResponse = async (
    questionId: string,
    responseValue: string
  ): Promise<MicroSurveyResponse | null> => {
    if (!userId) return null;

    try {
      setSubmitting(true);

      const response = await fetch(`${ML_API_URL}/micro-surveys/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          question_id: questionId,
          response_value: responseValue,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit response');

      const data: MicroSurveyResponse = await response.json();

      // Show success message
      toast.success('Thanks for sharing! Your profile has been updated.');

      // If threshold crossed, fetch pending unlocks
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

  // Acknowledge tier unlock
  const acknowledgeTierUnlock = async (
    unlockEventId: string,
    action: 'accept' | 'dismiss',
    regenerateDiet: boolean = false,
    regenerateWorkout: boolean = false
  ) => {
    if (!userId) return;

    try {
      const response = await fetch(`${ML_API_URL}/micro-surveys/acknowledge-tier-unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          unlock_event_id: unlockEventId,
          action,
          regenerate_diet: regenerateDiet,
          regenerate_workout: regenerateWorkout,
        }),
      });

      if (!response.ok) throw new Error('Failed to acknowledge tier unlock');

      const data = await response.json();

      if (action === 'accept') {
        toast.success('Your plans are being regenerated with enhanced personalization!');
      }

      // Clear pending unlock
      setPendingUnlock(null);

      return data;
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
 * Helper function to track analytics events for trigger detection
 * Call this from components to track actions
 */
export function trackMicroSurveyEvent(event: string) {
  // Events tracked for action-based and context-based triggers
  switch (event) {
    case 'view_meal_plan':
      localStorage.setItem('viewed_meal_plan', 'true');
      const mealPlanViews = parseInt(localStorage.getItem('meal_plan_views') || '0', 10);
      localStorage.setItem('meal_plan_views', String(mealPlanViews + 1));
      break;
    case 'view_workout_plan':
      localStorage.setItem('viewed_workout_plan', 'true');
      const workoutPlanViews = parseInt(localStorage.getItem('workout_plan_views') || '0', 10);
      localStorage.setItem('workout_plan_views', String(workoutPlanViews + 1));
      break;
    case 'complete_workout':
      const workoutsCompleted = parseInt(localStorage.getItem('workouts_completed') || '0', 10);
      localStorage.setItem('workouts_completed', String(workoutsCompleted + 1));
      break;
    case 'log_meal':
      const mealsLogged = parseInt(localStorage.getItem('meals_logged') || '0', 10);
      localStorage.setItem('meals_logged', String(mealsLogged + 1));
      break;
    case 'meal_disliked':
      const mealDislikes = parseInt(localStorage.getItem('meal_dislikes') || '0', 10);
      localStorage.setItem('meal_dislikes', String(mealDislikes + 1));
      break;
    case 'workout_skipped':
      const workoutSkips = parseInt(localStorage.getItem('workout_skips') || '0', 10);
      localStorage.setItem('workout_skips', String(workoutSkips + 1));
      break;
  }
}
