/**
 * ML Service Client
 * TypeScript client for AI plan generation via ML service
 */

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
   * Detect user's country from browser locale
   * Returns ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'FR')
   */
  detectUserCountry(): string {
    try {
      // Get browser locale (e.g., 'en-US', 'en-GB', 'fr-FR')
      const locale = navigator.language || 'en-US';

      // Extract country code (e.g., 'en-US' -> 'US')
      const parts = locale.split('-');
      if (parts.length >= 2) {
        return parts[1].toUpperCase();
      }

      // Default to US if no country code found
      return 'US';
    } catch (error) {
      console.error('Failed to detect country:', error);
      return 'US';
    }
  }

  /**
   * Detect user's preferred unit system from browser locale
   * Returns 'metric' or 'imperial'
   *
   * Only 3 countries use imperial: US, LR (Liberia), MM (Myanmar)
   */
  getUnitSystem(): 'metric' | 'imperial' {
    const IMPERIAL_COUNTRIES = ['US', 'LR', 'MM'];
    const country = this.detectUserCountry();
    return IMPERIAL_COUNTRIES.includes(country) ? 'imperial' : 'metric';
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
}

export const mlService = new MLService();
