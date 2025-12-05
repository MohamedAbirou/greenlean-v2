/**
 * Micro Survey Service
 * Centralized service for all micro survey operations
 * Handles communication with ML service backend
 */

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:5001';

export interface MicroSurveyQuestion {
  id: string;
  question_text: string;
  question_type: 'single_choice' | 'multi_choice' | 'text' | 'numeric' | 'scale';
  field_name: string;
  affects: string[]; // ['diet'], ['workout'], or ['both']
  options?: Array<{ value: string; label: string }>;
  trigger_type: string;
  priority?: number;
}

export interface MicroSurveyResponse {
  success: boolean;
  threshold_crossed: boolean;
  old_tier: string;
  new_tier: string;
  old_completeness: number;
  new_completeness: number;
  affects: string[];
}

export interface TierUnlockEvent {
  id: string;
  old_tier: string;
  new_tier: string;
  completeness_percentage: number;
  meal_plan_regenerated: boolean;
  workout_plan_regenerated: boolean;
  regeneration_offered_at: string;
}

export interface ProfileCompletenessData {
  completeness: number;
  personalization_level: 'BASIC' | 'STANDARD' | 'PREMIUM';
  total_fields: number;
  completed_fields: number;
  missing_fields: Array<{
    field: string;
    label: string;
    category: string;
    priority: string;
  }>;
  next_suggestions: string[];
}

class MicroSurveyService {
  /**
   * Check triggers and get next micro survey for user
   */
  async checkAndGetNextSurvey(userId: string): Promise<MicroSurveyQuestion | null> {
    try {
      // 1. Check triggers (time-based, action-based, context-based)
      await fetch(`${ML_SERVICE_URL}/micro-surveys/check-triggers/${userId}`, {
        method: 'POST',
      });

      // 2. Get next survey
      const response = await fetch(`${ML_SERVICE_URL}/micro-surveys/next/${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch micro-survey:', response.statusText);
        return null;
      }

      const data = await response.json();
      return data.has_survey ? data.survey : null;
    } catch (error) {
      console.error('Error fetching micro-survey:', error);
      return null;
    }
  }

  /**
   * Submit survey response
   * Returns response data including whether tier threshold was crossed
   */
  async submitResponse(
    userId: string,
    questionId: string,
    responseValue: string | string[],
    responseMetadata?: Record<string, any>
  ): Promise<MicroSurveyResponse | null> {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/micro-surveys/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          question_id: questionId,
          response_value: Array.isArray(responseValue) ? responseValue.join(',') : responseValue,
          response_metadata: responseMetadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit response: ${response.statusText}`);
      }

      const data: MicroSurveyResponse = await response.json();

      // If threshold crossed, dispatch event for UI to handle
      if (data.threshold_crossed) {
        window.dispatchEvent(new CustomEvent('tier-unlocked', {
          detail: {
            userId,
            oldTier: data.old_tier,
            newTier: data.new_tier,
            completeness: data.new_completeness,
            affects: data.affects
          }
        }));
      }

      return data;
    } catch (error) {
      console.error('Error submitting micro survey response:', error);
      return null;
    }
  }

  /**
   * Get pending tier unlock events
   */
  async getPendingUnlocks(userId: string): Promise<TierUnlockEvent[]> {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/micro-surveys/tier-unlocks/${userId}`);
      if (!response.ok) {
        console.error('Failed to fetch tier unlocks:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.has_unlocks ? data.unlocks : [];
    } catch (error) {
      console.error('Error fetching tier unlocks:', error);
      return [];
    }
  }

  /**
   * Acknowledge tier unlock and optionally trigger plan regeneration
   */
  async acknowledgeTierUnlock(
    userId: string,
    unlockEventId: string,
    action: 'accept' | 'dismiss',
    regenerateMeal: boolean = false,
    regenerateWorkout: boolean = false
  ): Promise<boolean> {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/micro-surveys/acknowledge-tier-unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          unlock_event_id: unlockEventId,
          action,
          regenerate_diet: regenerateMeal,
          regenerate_workout: regenerateWorkout,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to acknowledge tier unlock: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error acknowledging tier unlock:', error);
      return false;
    }
  }

  /**
   * Get user's profile completeness
   */
  async getProfileCompleteness(userId: string): Promise<ProfileCompletenessData | null> {
    try {
      const response = await fetch(`${ML_SERVICE_URL}/user/${userId}/profile-completeness`);
      if (!response.ok) {
        console.error('Failed to fetch profile completeness:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching profile completeness:', error);
      return null;
    }
  }

  /**
   * Submit meal feedback (triggers context-based micro surveys)
   */
  async submitMealFeedback(
    userId: string,
    mealPlanId: string,
    mealName: string,
    liked: boolean,
    feedbackType?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await import('@/lib/supabase').then(m => m.supabase)
        .from('meal_feedback')
        .insert({
          user_id: userId,
          meal_plan_id: mealPlanId,
          meal_name: mealName,
          liked,
          feedback_type: feedbackType,
          notes
        });

      if (error) throw error;

      // Trigger check for new surveys based on feedback
      setTimeout(() => this.checkAndGetNextSurvey(userId), 1000);

      return true;
    } catch (error) {
      console.error('Error submitting meal feedback:', error);
      return false;
    }
  }

  /**
   * Submit workout skip (triggers context-based micro surveys)
   */
  async submitWorkoutSkip(
    userId: string,
    workoutPlanId: string,
    workoutName: string,
    scheduledDate: string,
    skipReason?: string,
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await import('@/lib/supabase').then(m => m.supabase)
        .from('workout_skips')
        .insert({
          user_id: userId,
          workout_plan_id: workoutPlanId,
          workout_name: workoutName,
          scheduled_date: scheduledDate,
          skip_reason: skipReason,
          notes
        });

      if (error) throw error;

      // Trigger check for new surveys based on skips
      setTimeout(() => this.checkAndGetNextSurvey(userId), 1000);

      return true;
    } catch (error) {
      console.error('Error submitting workout skip:', error);
      return false;
    }
  }

  /**
   * Log daily energy level (triggers context-based micro surveys)
   */
  async logEnergyLevel(
    userId: string,
    energyLevel: number,
    sleepHours?: number,
    notes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await import('@/lib/supabase').then(m => m.supabase)
        .from('daily_energy_logs')
        .upsert({
          user_id: userId,
          log_date: new Date().toISOString().split('T')[0],
          energy_level: energyLevel,
          sleep_hours: sleepHours,
          notes
        }, {
          onConflict: 'user_id,log_date'
        });

      if (error) throw error;

      // Trigger check for new surveys based on low energy
      if (energyLevel <= 3) {
        setTimeout(() => this.checkAndGetNextSurvey(userId), 1000);
      }

      return true;
    } catch (error) {
      console.error('Error logging energy level:', error);
      return false;
    }
  }
}

export const microSurveyService = new MicroSurveyService();
