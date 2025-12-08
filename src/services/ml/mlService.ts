/**
 * ML Service Client
 * TypeScript client for AI plan generation via ML service
 */

import { supabase } from "@/lib/supabase";

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:5001';

/**
 * QuickOnboarding Data - 9 essential fields for progressive profiling
 * Matches backend QuickOnboardingData model exactly
 */
export interface QuickOnboardingData {
  main_goal: string;           // "lose_weight", "gain_muscle", "maintain", "improve_health"
  dietary_style: string;       // "balanced", "vegetarian", "vegan", "keto", etc.
  exercise_frequency: string;  // "3-4 times/week", "1-2 times/week", "Daily", etc.
  target_weight: number;       // kg (internal storage)
  activity_level: string;      // "sedentary", "lightly_active", "moderately_active", etc.
  weight: number;              // kg (internal storage)
  height: number;              // cm (internal storage)
  age: number;
  gender: string;              // "male", "female", "other"
}

interface ProfileCompletenessData {
  completeness: number;
  personalization_level: 'BASIC' | 'PREMIUM';
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

class MLService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = ML_SERVICE_URL;
  }

  /**
   * Check if ML service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      const data = await response.json();
      return data.status === 'healthy';
    } catch (error) {
      console.error('ML service health check failed:', error);
      return false;
    }
  }


  /**
   * NEW: Generate plans using unified endpoint with progressive profiling
   * Replaces separate /calculate-nutrition and /generate-plans calls
   *
   * @param userId - User ID
   * @param quizResultId - Quiz result ID from Supabase
   * @param quizData - 9 essential fields from QuickOnboarding
   * @param aiProvider - AI provider (default: 'openai')
   * @param model - AI model (default: 'gpt-4o-mini')
   */
  async generatePlansUnified(
    userId: string,
    quizResultId: string,
    quizData: QuickOnboardingData,
    aiProvider: string = 'openai',
    model: string = 'gpt-4o-mini'
  ): Promise<{
    success: boolean;
    calculations?: any;
    macros?: any;
    meal_plan_status?: string;
    workout_plan_status?: string;
    message?: string;
    metadata?: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          quiz_result_id: quizResultId,
          quiz_data: quizData,
          preferences: {
            provider: aiProvider,
            model: model,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        calculations: data.calculations,
        macros: data.macros,
        meal_plan_status: data.meal_plan_status,
        workout_plan_status: data.workout_plan_status,
        message: data.message,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Failed to generate plans (unified):', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate plans',
      };
    }
  }

  /**
   * Regenerate plans 
   *
   * @param userId - User ID
   * @param regenerate_meal - boolean
   * @param regenerate_workout - boolean
   * @param reason - "tier_upgrade" | "manual_request" | "critical_field_update"
   */
  async regeneratePlans(
    userId: string,
    regenerate_meal: boolean,
    regenerate_workout: boolean,
    reason: string,
  ): Promise<{
    success: boolean;
    meal_regenerating?: any;
    workout_regenerating?: any;
    message?: string;
    reason?: string;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/regenerate-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          regenerate_meal,
          regenerate_workout,
          reason
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message,
        meal_regenerating: data.meal_regenerating,
        workout_regenerating: data.workout_regenerating,
        reason: data.reason
      };
    } catch (error) {
      console.error('Failed to generate plans (unified):', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate plans',
      };
    }
  }

  /**
   * Get user's profile completeness
   */
  async getProfileCompleteness(userId: string): Promise<ProfileCompletenessData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/user/${userId}/profile-completeness`);
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
   * Submit meal feedback
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
      const { error } = await supabase
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

      return true;
    } catch (error) {
      console.error('Error submitting meal feedback:', error);
      return false;
    }
  }

  /**
   * Submit workout skip
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
      const { error } = await supabase
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

      return true;
    } catch (error) {
      console.error('Error submitting workout skip:', error);
      return false;
    }
  }
}

export const mlService = new MLService();
