/**
 * Food Feature Types
 */

export interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  foods: TemplateFoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  last_used_at: string;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  is_favorite: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateFoodItem {
  food_name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
}

export interface RecentFood {
  id: string;
  user_id: string;
  food_name: string;
  brand_name?: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  frequency_count: number;
  last_logged_at: string;
  nutritionix_id?: string;
  created_at: string;
}

export interface VoiceInputResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface FoodLogEntry {
  food_name: string;
  serving_size: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  logged_at: string;
}
