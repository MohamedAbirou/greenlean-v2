/**
 * Dashboard Types and Interfaces
 * Complete type definitions for dashboard feature
 */

// ========== NUTRITION TYPES ==========

export interface NutritionLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fiber?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MealItem {
  id: string;
  user_id: string;
  nutrition_log_id?: string;
  food_id?: string;
  ai_meal_plan_id?: string;
  voice_log_id?: string;
  photo_log_id?: string;
  food_name: string;
  brand_name?: string;
  serving_size: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  from_ai_plan: boolean;
  from_template: boolean;
  from_barcode: boolean;
  from_photo: boolean;
  from_voice: boolean;
  barcode?: string;
  created_at: string;
  updated_at: string;
}

export interface MealTemplate {
  id: string;
  user_id: string;
  template_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description?: string;
  items: MealTemplateItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  is_favorite: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface MealTemplateItem {
  food_name: string;
  brand_name?: string;
  serving_size: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}

export interface VoiceMealLog {
  id: string;
  user_id: string;
  nutrition_log_id?: string;
  transcription: string;
  parsed_data: any;
  confidence_score?: number;
  audio_url?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface MealPhotoLog {
  id: string;
  user_id: string;
  nutrition_log_id?: string;
  photo_url: string;
  estimated_macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  confidence_score?: number;
  food_items_detected: string[];
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface AIMealPlan {
  id: string;
  user_id: string;
  plan_data: AIMealPlanData;
  daily_calories: number;
  status: string;
  is_active: boolean;
  generated_at: string;
  created_at: string;
}

export interface AIMealPlanData {
  meals: AIMeal[];
  daily_totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  shopping_list: {
    proteins: string[];
    vegetables: string[];
    fruits?: string[];
    carbs: string[];
    fats: string[];
    pantry_staples: string[];
  };
}

export interface AIMeal {
  meal_type: string;
  meal_name: string;
  prep_time_minutes: number;
  difficulty: string;
  meal_timing: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fiber: number;
  tags: string[];
  foods: AIMealFood[];
  recipe?: string;
  tips?: string[];
}

export interface AIMealFood {
  name: string;
  portion: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

// ========== WORKOUT TYPES ==========

export interface WorkoutSession {
  id: string;
  user_id: string;
  workout_plan_id?: string;
  workout_date: string;
  workout_name: string;
  workout_type: string;
  duration_minutes?: number;
  total_exercises: number;
  total_sets: number;
  total_reps: number;
  total_volume_kg: number;
  calories_burned?: number;
  notes?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'skipped';
  rating?: number;
  energy_level?: number;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSet {
  id: string;
  user_id: string;
  workout_session_id: string;
  exercise_id: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  rest_seconds?: number;
  rpe?: number;
  is_warmup: boolean;
  is_dropset: boolean;
  is_pr_weight: boolean;
  is_pr_reps: boolean;
  is_pr_volume: boolean;
  notes?: string;
  created_at: string;
}

export interface ExerciseLibrary {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment_needed: string[];
  difficulty: string;
  instructions?: string;
  video_url?: string;
  created_at: string;
}

export interface ExercisePersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  max_weight_kg?: number;
  max_weight_date?: string;
  max_weight_set_id?: string;
  max_reps?: number;
  max_reps_date?: string;
  max_reps_set_id?: string;
  max_volume_kg?: number;
  max_volume_date?: string;
  max_volume_set_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  template_name: string;
  workout_type: string;
  description?: string;
  exercises: WorkoutTemplateExercise[];
  estimated_duration_minutes: number;
  difficulty: string;
  is_favorite: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplateExercise {
  exercise_id: string;
  exercise_name: string;
  order_index: number;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
}

export interface AIWorkoutPlan {
  id: string;
  user_id: string;
  plan_data: AIWorkoutPlanData;
  status: string;
  is_active: boolean;
  generated_at: string;
  created_at: string;
}

export interface AIWorkoutPlanData {
  weekly_plan: AIWorkoutDay[];
  weekly_summary: {
    total_workout_days: number;
    strength_days: number;
    cardio_days: number;
    rest_days: number;
    total_time_minutes: number;
    difficulty_level: string;
    training_split: string;
  };
}

export interface AIWorkoutDay {
  day: string;
  workout_type: string;
  training_location: string;
  focus: string;
  duration_minutes: number;
  intensity: string;
  exercises: AIExercise[];
  warmup?: {
    duration_minutes: number;
    activities: string[];
  };
  cooldown?: {
    duration_minutes: number;
    activities: string[];
  };
}

export interface AIExercise {
  name: string;
  category: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  tempo?: string;
  instructions: string;
  muscle_groups: string[];
  difficulty: string;
  equipment_needed: string[];
  alternatives?: {
    home?: string;
    outdoor?: string;
    easier?: string;
    harder?: string;
  };
}

export interface CardioSession {
  id: string;
  user_id: string;
  workout_session_id?: string;
  cardio_type: string;
  duration_minutes: number;
  distance_km?: number;
  calories_burned?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  notes?: string;
  created_at: string;
}

// ========== PROGRESS TYPES ==========

export interface WeightHistory {
  id: string;
  user_id: string;
  weight_kg: number;
  log_date: string;
  notes?: string;
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  measurement_date: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  chest_cm?: number;
  waist_cm?: number;
  hips_cm?: number;
  thighs_cm?: number;
  arms_cm?: number;
  created_at: string;
}

export interface NutritionTrend {
  id: string;
  user_id: string;
  trend_date: string;
  avg_calories_7d: number;
  avg_calories_30d: number;
  avg_protein_7d: number;
  avg_protein_30d: number;
  avg_carbs_7d: number;
  avg_carbs_30d: number;
  avg_fats_7d: number;
  avg_fats_30d: number;
  protein_percentage: number;
  carbs_percentage: number;
  fats_percentage: number;
  created_at: string;
}

export interface WorkoutAnalytics {
  id: string;
  user_id: string;
  analysis_date: string;
  total_workouts: number;
  total_volume_kg: number;
  total_time_minutes: number;
  avg_workout_duration: number;
  exercises_performed: number;
  prs_achieved: number;
  consistency_score: number;
  created_at: string;
}

// ========== USER TYPES ==========

export interface UserMacroTargets {
  id: string;
  user_id: string;
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fats_g: number;
  daily_fiber_g?: number;
  daily_water_ml?: number;
  effective_date: string;
  end_date?: string;
  created_at: string;
}

export interface UserStreak {
  id: string;
  user_id: string;
  streak_type: 'nutrition_logging' | 'workout_logging' | 'daily_weigh_in';
  current_streak: number;
  longest_streak: number;
  last_logged_date: string;
  streak_start_date: string;
  total_days_logged: number;
  created_at: string;
  updated_at: string;
}

export interface WaterIntakeLog {
  id: string;
  user_id: string;
  log_date: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export interface DailyWaterIntake {
  id: string;
  user_id: string;
  log_date: string;
  total_ml: number;
  glasses: number;
  goal_ml: number;
  created_at: string;
  updated_at: string;
}

// ========== API TYPES ==========

export interface USDAFoodSearchResult {
  fdcId: number;
  description: string;
  brandName?: string;
  dataType: string;
  foodCategory?: string;
  foodNutrients: USDANutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

export interface USDANutrient {
  nutrientId: number;
  nutrientName: string;
  nutrientNumber: string;
  unitName: string;
  value: number;
}

export interface ExerciseDBExercise {
  id: string;
  name: string;
  target: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  instructions: string[];
}

// ========== DASHBOARD STATE TYPES ==========

export interface DashboardStats {
  today: {
    calories: number;
    caloriesGoal: number;
    protein: number;
    proteinGoal: number;
    carbs: number;
    carbsGoal: number;
    fats: number;
    fatsGoal: number;
    water: number;
    waterGoal: number;
    workoutsCompleted: number;
  };
  week: {
    caloriesAvg: number;
    proteinAvg: number;
    workoutsCompleted: number;
    totalVolume: number;
    streakDays: number;
  };
  month: {
    weightChange: number;
    workoutsCompleted: number;
    totalVolume: number;
    prsAchieved: number;
  };
}

export interface DateRange {
  startDate: string;
  endDate: string;
  preset?: 'today' | 'week' | 'month' | '3months' | '6months' | 'year' | 'custom';
}

export type DashboardTab = 'overview' | 'nutrition' | 'workout' | 'progress';

export interface LogMealOptions {
  type: 'manual' | 'voice' | 'barcode' | 'photo' | 'aiPlan' | 'template' | 'previous';
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
}

export interface LogWorkoutOptions {
  type: 'manual' | 'voice' | 'aiPlan' | 'template' | 'previous';
  date: string;
}
