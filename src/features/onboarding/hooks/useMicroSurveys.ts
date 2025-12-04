/**
 * useMicroSurveys Hook
 * Manages micro-survey triggering and display logic
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { mlService } from '@/services/ml/mlService';
import type { MicroSurvey } from '../services/microSurveys.config';
import { MICRO_SURVEYS } from '../services/microSurveys.config';
import { toast } from 'sonner';

export interface MicroSurveyState {
  pendingSurvey: MicroSurvey | null;
  isLoading: boolean;
  handleAnswer: (surveyId: string, answer: string | string[]) => Promise<void>;
  handleSkip: (surveyId: string) => void;
  handleDismiss: () => void;
}

/**
 * Hook to manage micro-survey display and responses
 */
export function useMicroSurveys(): MicroSurveyState {
  const { user } = useAuth();
  const [pendingSurvey, setPendingSurvey] = useState<MicroSurvey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedSurveys, setCompletedSurveys] = useState<string[]>([]);
  const [skippedSurveys, setSkippedSurveys] = useState<string[]>([]);

  /**
   * Load completed and skipped surveys from database
   */
  useEffect(() => {
    if (!user) return;

    loadUserSurveyHistory();
  }, [user]);

  const loadUserSurveyHistory = async () => {
    if (!user) return;

    try {
      // Load completed surveys
      const { data: completed } = await supabase
        .from('user_micro_surveys')
        .select('survey_id')
        .eq('user_id', user.id);

      if (completed) {
        setCompletedSurveys(completed.map((s) => s.survey_id));
      }

      // Load skipped surveys from user metadata or separate table
      // For now, we'll use localStorage as a simple solution
      const skipped = localStorage.getItem(`skipped_surveys_${user.id}`);
      if (skipped) {
        setSkippedSurveys(JSON.parse(skipped));
      }
    } catch (error) {
      console.error('Failed to load survey history:', error);
    }
  };

  /**
   * Check if a survey should be triggered
   */
  const shouldTriggerSurvey = useCallback(
    (survey: MicroSurvey): boolean => {
      // Already completed or skipped
      if (completedSurveys.includes(survey.id)) return false;
      if (skippedSurveys.includes(survey.id)) return false;

      // Check trigger conditions
      switch (survey.trigger) {
        case 'action_based':
          return checkActionTrigger(survey.triggerCondition);
        case 'time_based':
          return checkTimeTrigger(survey.triggerCondition);
        case 'context_based':
          return checkContextTrigger(survey.triggerCondition);
        default:
          return false;
      }
    },
    [completedSurveys, skippedSurveys]
  );

  /**
   * Find next survey to show
   */
  useEffect(() => {
    if (!user || pendingSurvey) return;

    // Find highest priority unanswered survey that's triggered
    const nextSurvey = MICRO_SURVEYS.filter((survey) =>
      shouldTriggerSurvey(survey)
    ).sort((a, b) => b.priority - a.priority)[0];

    if (nextSurvey) {
      // Small delay so it doesn't feel intrusive
      const timer = setTimeout(() => {
        setPendingSurvey(nextSurvey);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, pendingSurvey, shouldTriggerSurvey]);

  /**
   * Handle survey answer submission
   */
  const handleAnswer = async (surveyId: string, answer: string | string[]) => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Save answer to database
      const answerValue = Array.isArray(answer) ? answer.join(', ') : answer;

      await supabase.from('user_micro_surveys').insert({
        user_id: user.id,
        survey_id: surveyId,
        question: pendingSurvey?.question || '',
        answer: answerValue,
        category: pendingSurvey?.category || 'nutrition',
        priority: pendingSurvey?.priority || 5,
        source: 'micro_survey',
        confidence: 1.0,
      });

      // Update profile completeness
      await supabase.rpc('calculate_profile_completeness', {
        p_user_id: user.id,
      });

      // Update local state
      setCompletedSurveys((prev) => [...prev, surveyId]);
      setPendingSurvey(null);

      // If high priority survey, regenerate plans (fire and forget)
      if (pendingSurvey && pendingSurvey.priority >= 8) {
        triggerPlanRegeneration(user.id, pendingSurvey.category);
      }
    } catch (error) {
      console.error('Failed to save survey answer:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle survey skip
   */
  const handleSkip = useCallback(
    (surveyId: string) => {
      if (!user) return;

      const updated = [...skippedSurveys, surveyId];
      setSkippedSurveys(updated);
      localStorage.setItem(`skipped_surveys_${user.id}`, JSON.stringify(updated));
      setPendingSurvey(null);

      // Skipped surveys can be asked again after 7 days
      setTimeout(() => {
        const filtered = updated.filter((id) => id !== surveyId);
        setSkippedSurveys(filtered);
        localStorage.setItem(`skipped_surveys_${user.id}`, JSON.stringify(filtered));
      }, 7 * 24 * 60 * 60 * 1000); // 7 days
    },
    [user, skippedSurveys]
  );

  /**
   * Dismiss without skipping (for immediate re-trigger)
   */
  const handleDismiss = useCallback(() => {
    setPendingSurvey(null);
  }, []);

  return {
    pendingSurvey,
    isLoading,
    handleAnswer,
    handleSkip,
    handleDismiss,
  };
}

// ═══════════════════════════════════════════════════════════
// TRIGGER CONDITION CHECKERS
// ═══════════════════════════════════════════════════════════

function checkActionTrigger(condition: string): boolean {
  // These would be tracked via analytics/events in a real app
  // For now, we'll use simple localStorage checks

  switch (condition) {
    case 'user_views_meal_plan':
      return localStorage.getItem('viewed_meal_plan') === 'true';
    case 'user_views_recipe':
      return (
        parseInt(localStorage.getItem('recipe_views') || '0', 10) >= 1
      );
    case 'user_views_workout_plan':
      return localStorage.getItem('viewed_workout_plan') === 'true';
    case 'user_views_shopping_list':
      return localStorage.getItem('viewed_shopping_list') === 'true';
    case 'user_completes_3_workouts':
      return (
        parseInt(localStorage.getItem('workouts_completed') || '0', 10) >= 3
      );
    case 'user_views_meal_plan_twice':
      return (
        parseInt(localStorage.getItem('meal_plan_views') || '0', 10) >= 2
      );
    case 'user_views_workout_twice':
      return (
        parseInt(localStorage.getItem('workout_plan_views') || '0', 10) >= 2
      );
    default:
      return false;
  }
}

function checkTimeTrigger(condition: string): boolean {
  const signupDate = localStorage.getItem('user_signup_date');
  if (!signupDate) return false;

  const daysSinceSignup = Math.floor(
    (Date.now() - new Date(signupDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  switch (condition) {
    case 'after_3_days':
      return daysSinceSignup >= 3;
    case 'after_5_days':
      return daysSinceSignup >= 5;
    case 'after_7_days':
      return daysSinceSignup >= 7;
    default:
      return false;
  }
}

function checkContextTrigger(condition: string): boolean {
  // Context-based triggers (e.g., time of day, device, etc.)
  // Not implemented for now
  return false;
}

/**
 * Helper function to track analytics events
 * Call this from components to trigger surveys
 */
export function trackMicroSurveyEvent(event: string) {
  switch (event) {
    case 'view_meal_plan':
      localStorage.setItem('viewed_meal_plan', 'true');
      const mealPlanViews = parseInt(localStorage.getItem('meal_plan_views') || '0', 10);
      localStorage.setItem('meal_plan_views', String(mealPlanViews + 1));
      break;
    case 'view_recipe':
      const recipeViews = parseInt(localStorage.getItem('recipe_views') || '0', 10);
      localStorage.setItem('recipe_views', String(recipeViews + 1));
      break;
    case 'view_workout_plan':
      localStorage.setItem('viewed_workout_plan', 'true');
      const workoutPlanViews = parseInt(localStorage.getItem('workout_plan_views') || '0', 10);
      localStorage.setItem('workout_plan_views', String(workoutPlanViews + 1));
      break;
    case 'view_shopping_list':
      localStorage.setItem('viewed_shopping_list', 'true');
      break;
    case 'complete_workout':
      const workoutsCompleted = parseInt(localStorage.getItem('workouts_completed') || '0', 10);
      localStorage.setItem('workouts_completed', String(workoutsCompleted + 1));
      break;
  }
}

/**
 * Trigger AI plan regeneration after high-priority survey
 * Fire and forget - doesn't block user experience
 */
async function triggerPlanRegeneration(userId: string, category: string) {
  try {
    // Show toast notification
    toast.info('🤖 Updating your plans based on your preferences...');

    // Get updated user profile with new survey data
    const userProfile = await mlService.getUserProfileData(userId);

    if (!userProfile) {
      console.error('Failed to fetch user profile for plan regeneration');
      return;
    }

    // Trigger plan generation (async, fire and forget)
    mlService.generatePlans({
      userId,
      userProfile,
      aiProvider: 'openai',
      model: 'gpt-4o-mini',
    }).then(() => {
      toast.success('✨ Your plans have been updated!');
    }).catch((error) => {
      console.error('Plan regeneration failed:', error);
      // Don't show error toast - this is a background operation
      // User can manually regenerate if needed
    });

  } catch (error) {
    console.error('Failed to trigger plan regeneration:', error);
  }
}
