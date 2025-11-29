/**
 * ML Service Client
 * TypeScript client for AI plan generation via ML service
 */

import { supabase } from '@/lib/supabase';

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:5001';

export interface UserProfile {
  // Demographics
  age: number;
  gender: string;
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  bodyType?: string;

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

      // Build user profile from available data
      const userProfile: UserProfile = {
        age: profile.age || 30,
        gender: profile.gender || 'other',
        height: profile.height_cm || 170,
        currentWeight: profile.weight_kg || 70,
        targetWeight: profile.target_weight_kg || 65,
        bodyType: profile.body_type,
        mainGoal: profile.fitness_goal || 'lose_weight',
        activityLevel: profile.activity_level || 'moderate',
        country: profile.country || 'United States',

        // Extract from surveys if available
        dietaryStyle: surveys?.find(s => s.survey_id === 'dietary_preference')?.answer,
        dislikedFoods: surveys?.find(s => s.survey_id === 'food_dislikes')?.answer,
        foodAllergies: surveys?.find(s => s.survey_id === 'food_allergies')?.answer,
        cookingSkill: surveys?.find(s => s.survey_id === 'cooking_skill')?.answer,
        exerciseFrequency: surveys?.find(s => s.survey_id === 'exercise_frequency')?.answer,
        preferredExercise: surveys?.find(s => s.survey_id === 'preferred_exercise')?.answer,
        healthConditions: surveys?.find(s => s.survey_id === 'health_conditions')?.answer,
        mealsPerDay: parseInt(surveys?.find(s => s.survey_id === 'meals_per_day')?.answer || '3'),

        // Defaults
        cookingTime: '30-60 minutes',
        groceryBudget: 'moderate',
        motivationLevel: 7,
        stressLevel: 5,
        sleepQuality: 'good',
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
