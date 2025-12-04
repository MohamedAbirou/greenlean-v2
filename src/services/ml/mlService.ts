/**
 * ML Service Client
 * TypeScript client for AI plan generation via ML service
 */

import { supabase } from '@/lib/supabase';

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

/**
 * OLD: Full user profile with 25+ fields
 * DEPRECATED: Use QuickOnboardingData for new implementations
 */
export interface UserProfile {
  // Demographics
  age: number;
  gender: string;
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg

  // Goals
  mainGoal: string;
  secondaryGoals?: string;
  timeFrame?: string;

  // Lifestyle
  activityLevel: string;
  occupation?: string;
  exerciseFrequency?: string;
  preferredExercise?: string;
  sleepQuality?: string;
  stressLevel?: number;

  // Nutrition preferences
  dietaryStyle?: string;
  dislikedFoods?: string;
  foodAllergies?: string;
  mealsPerDay?: number;
  cookingSkill?: string;
  cookingTime?: string;
  groceryBudget?: string;

  // Health
  healthConditions?: string;
  medications?: string;

  // Location
  country?: string;

  // Motivation
  motivationLevel?: number;
  challenges?: string;
}

export interface GeneratePlansRequest {
  userId: string;
  userProfile: UserProfile;
  aiProvider?: 'openai' | 'anthropic' | 'gemini';
  model?: string;
}

export interface MealPlan {
  planId: string;
  userId: string;
  name: string;
  description: string;
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: Array<{
    type: string;
    name: string;
    description: string;
    ingredients: string[];
    instructions: string[];
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
    };
    prepTime: number;
    cookTime: number;
  }>;
  tips: string[];
  shoppingList: string[];
  createdAt: string;
}

export interface WorkoutPlan {
  planId: string;
  userId: string;
  name: string;
  description: string;
  duration: string;
  difficulty: string;
  workouts: Array<{
    day: string;
    name: string;
    description: string;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      rest: string;
      notes?: string;
    }>;
    warmup?: string;
    cooldown?: string;
    estimatedDuration: number;
  }>;
  tips: string[];
  createdAt: string;
}

export interface GeneratePlansResponse {
  success: boolean;
  mealPlan?: MealPlan;
  workoutPlan?: WorkoutPlan;
  quizResultId?: string;
  message?: string;
  error?: string;
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
    message?: string;
    error?: string;
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
        message: data.message,
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
   * Fetch user profile data from Supabase
   */
  async getUserProfileData(userId: string): Promise<UserProfile | null> {
    try {
      // Fetch profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch micro-survey responses
      const { data: surveys, error: surveysError } = await supabase
        .from('user_micro_surveys')
        .select('*')
        .eq('user_id', userId);

      if (surveysError) console.error('Failed to fetch surveys:', surveysError);

      // Build user profile from available data with sensible defaults for ALL fields
      // Progressive profiling: use what we have, provide defaults for missing data
      const userProfile: UserProfile = {
        // Demographics (from QuickOnboarding)
        age: profile.age || 30,
        gender: profile.gender || 'other',
        height: profile.height_cm || 170,
        currentWeight: profile.weight_kg || 70,
        targetWeight: profile.target_weight_kg || profile.weight_kg || 65,

        // Goals (from QuickOnboarding) - removed body_type and fitness_goal (deprecated fields)
        mainGoal: profile.main_goal || 'lose_weight',
        secondaryGoals: 'Improve overall health and energy levels',
        timeFrame: '3 months',

        // Lifestyle (from QuickOnboarding + defaults)
        activityLevel: profile.activity_level || 'lightly_active',
        lifestyle: 'Moderately active with work-life balance',
        occupation: profile.activity_level === 'sedentary' ? 'Desk job' : 'Active lifestyle',

        // Nutrition preferences (from micro-surveys or defaults)
        dietaryStyle: surveys?.find(s => s.survey_id === 'dietary_restrictions')?.answer || 'balanced',
        dislikedFoods: surveys?.find(s => s.survey_id === 'food_dislikes')?.answer || 'None specified',
        foodAllergies: surveys?.find(s => s.survey_id === 'food_allergies')?.answer || 'None',
        mealsPerDay: parseInt(surveys?.find(s => s.survey_id === 'meals_per_day')?.answer || '3'),
        cookingSkill: surveys?.find(s => s.survey_id === 'cooking_skill')?.answer || 'intermediate',
        cookingTime: surveys?.find(s => s.survey_id === 'cooking_time')?.answer || '30-45 minutes',
        groceryBudget: surveys?.find(s => s.survey_id === 'budget')?.answer || 'medium',

        // Fitness preferences (from micro-surveys or defaults)
        exerciseFrequency: surveys?.find(s => s.survey_id === 'exercise_frequency')?.answer || '3-4 times/week',
        preferredExercise: surveys?.find(s => s.survey_id === 'preferred_exercise')?.answer || 'Mix of cardio and strength',

        // Health & Wellness (from micro-surveys or defaults)
        healthConditions: surveys?.find(s => s.survey_id === 'health_conditions')?.answer || 'None',
        medications: 'None specified',
        sleepQuality: surveys?.find(s => s.survey_id === 'sleep_quality')?.answer || 'good',
        stressLevel: parseInt(surveys?.find(s => s.survey_id === 'stress_level')?.answer || '5'),

        // Location
        country: profile.country || 'United States',

        // Motivation
        motivationLevel: 7,
        challenges: 'Staying consistent with meal prep and workouts',
      };

      return userProfile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      return null;
    }
  }

  /**
   * Generate AI meal and workout plans
   */
  async generatePlans(request: GeneratePlansRequest): Promise<GeneratePlansResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: request.userId,
          answers: request.userProfile,
          aiProvider: request.aiProvider || 'openai',
          model: request.model || 'gpt-4o-mini',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Save plans to Supabase
      if (data.meal_plan) {
        await this.saveMealPlan(request.userId, data.meal_plan);
      }

      if (data.workout_plan) {
        await this.saveWorkoutPlan(request.userId, data.workout_plan);
      }

      return {
        success: true,
        mealPlan: data.meal_plan,
        workoutPlan: data.workout_plan,
        quizResultId: data.quiz_result_id,
        message: 'Plans generated successfully',
      };
    } catch (error) {
      console.error('Failed to generate plans:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate plans',
      };
    }
  }

  /**
   * Generate meal plan only
   */
  async generateMealPlan(userId: string): Promise<MealPlan | null> {
    try {
      const userProfile = await this.getUserProfileData(userId);
      if (!userProfile) {
        throw new Error('Failed to fetch user profile');
      }

      const response = await this.generatePlans({ userId, userProfile });
      return response.mealPlan || null;
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
      return null;
    }
  }

  /**
   * Generate workout plan only
   */
  async generateWorkoutPlan(userId: string): Promise<WorkoutPlan | null> {
    try {
      const userProfile = await this.getUserProfileData(userId);
      if (!userProfile) {
        throw new Error('Failed to fetch user profile');
      }

      const response = await this.generatePlans({ userId, userProfile });
      return response.workoutPlan || null;
    } catch (error) {
      console.error('Failed to generate workout plan:', error);
      return null;
    }
  }

  /**
   * Save meal plan to Supabase
   */
  private async saveMealPlan(userId: string, mealPlan: any): Promise<void> {
    try {
      const { error } = await supabase.from('ai_meal_plans').insert({
        user_id: userId,
        name: mealPlan.name || 'AI Generated Meal Plan',
        description: mealPlan.description || '',
        daily_calories: mealPlan.daily_calories || 2000,
        daily_protein: mealPlan.macros?.protein || 0,
        daily_carbs: mealPlan.macros?.carbs || 0,
        daily_fats: mealPlan.macros?.fats || 0,
        meals: mealPlan.meals || [],
        tips: mealPlan.tips || [],
        shopping_list: mealPlan.shopping_list || [],
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save meal plan:', error);
      throw error;
    }
  }

  /**
   * Save workout plan to Supabase
   */
  private async saveWorkoutPlan(userId: string, workoutPlan: any): Promise<void> {
    try {
      const { error } = await supabase.from('ai_workout_plans').insert({
        user_id: userId,
        name: workoutPlan.name || 'AI Generated Workout Plan',
        description: workoutPlan.description || '',
        duration: workoutPlan.duration || '4 weeks',
        difficulty: workoutPlan.difficulty || 'intermediate',
        workouts: workoutPlan.workouts || [],
        tips: workoutPlan.tips || [],
        created_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save workout plan:', error);
      throw error;
    }
  }

  /**
   * Get user's saved meal plans
   */
  async getUserMealPlans(userId: string): Promise<MealPlan[]> {
    try {
      const { data, error } = await supabase
        .from('ai_meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch meal plans:', error);
      return [];
    }
  }

  /**
   * Get user's saved workout plans
   */
  async getUserWorkoutPlans(userId: string): Promise<WorkoutPlan[]> {
    try {
      const { data, error } = await supabase
        .from('ai_workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to fetch workout plans:', error);
      return [];
    }
  }
}

export const mlService = new MLService();
