/**
 * AI Prompt System - TypeScript Types
 * Tiered personalization system (BASIC/STANDARD/PREMIUM)
 */

export type PersonalizationLevel = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface UserProfileData {
  // Core Info (BASIC level)
  mainGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
  currentWeight: number;
  targetWeight?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number;

  // Nutrition Targets
  dailyCalories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;

  // STANDARD level - from micro-surveys
  dietaryStyle?: string;
  foodAllergies?: string[];
  cookingSkill?: 'beginner' | 'intermediate' | 'advanced';
  cookingTime?: string;
  groceryBudget?: 'low' | 'medium' | 'high' | 'premium';
  mealsPerDay?: number;

  // Workout info
  activityLevel?: string;
  workoutFrequency?: number;
  trainingEnvironment?: 'gym' | 'home' | 'outdoor' | 'mixed';
  equipment?: string[];
  injuries?: string[];

  // PREMIUM level - full profile
  healthConditions?: string[];
  medications?: string[];
  sleepQuality?: number;
  stressLevel?: number;
  country?: string;
  dislikedFoods?: string[];
  mealPrepPreference?: string;
  waterIntakeGoal?: number;

  // Inferred data (from ML)
  inferredDietaryPreferences?: {
    value: string;
    confidence: number;
    source: 'inferred';
  };
  inferredCookingSkill?: {
    value: string;
    confidence: number;
    source: 'inferred';
  };
}

export interface MealPlanPromptConfig {
  personalizationLevel: PersonalizationLevel;
  userData: UserProfileData;
  includeShoppingList?: boolean;
  includeMealPrep?: boolean;
}

export interface WorkoutPlanPromptConfig {
  personalizationLevel: PersonalizationLevel;
  userData: UserProfileData;
  includeProgressiveOverload?: boolean;
  includeAlternatives?: boolean;
}

export interface AIPromptResponse {
  prompt: string;
  metadata: {
    personalizationLevel: PersonalizationLevel;
    dataCompleteness: number;
    missingFields: string[];
    usedDefaults: string[];
  };
}
