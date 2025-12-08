/**
 * Complete Profile Data Types
 */

export interface CompleteProfileData {
  // Basic Info (profiles table + quiz_results.answers)
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  height?: number;
  weight?: number;
  target_weight?: number;
  main_goal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health'; // → quiz_results.answers.mainGoal
  activity_level?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  dietary_preference?: 'balanced' | 'keto' | 'vegetarian' | 'vegan' | 'paleo' | 'mediterranean' | 'other'; // → quiz_results.answers.dietaryStyle
  // Note: exercise_frequency is NOT stored directly - it's derived from activity_level

  // Nutrition (from user_profile_extended)
  cooking_skill?: 'beginner' | 'intermediate' | 'advanced';
  cooking_time?: '15-30 min' | '30-45 min' | '45-60 min' | '60+ min';
  grocery_budget?: 'low' | 'medium' | 'high';
  meals_per_day?: number;
  meal_prep_preference?: 'no_prep' | 'some_prep' | 'batch_cooking';
  food_allergies?: string[];
  disliked_foods?: string[];

  // Fitness (from user_profile_extended)
  gym_access?: boolean;
  equipment_available?: string[];
  workout_location_preference?: 'home' | 'gym' | 'outdoor' | 'mixed';
  injuries_limitations?: string[];
  fitness_experience?: 'beginner' | 'intermediate' | 'advanced';

  // Health & Lifestyle (from user_profile_extended)
  health_conditions?: string[];
  medications?: string[];
  sleep_quality?: number; // 1-10
  stress_level?: number; // 1-10
  dietary_restrictions?: string[];
}
