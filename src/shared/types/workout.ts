/**
 * UNIFIED WORKOUT TYPES
 * Single source of truth for all workout-related types
 * Matches database schema exactly
 */

// ============================================================================
// CORE EXERCISE TYPES
// ============================================================================

export interface ExerciseSet {
  id?: string;
  workout_session_id?: string;
  user_id?: string;
  exercise_id?: string;
  exercise_name: string;
  exercise_category?: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  duration_seconds?: number;
  distance_meters?: number;
  rpe?: number;
  rest_seconds?: number;
  tempo?: string;
  is_warmup?: boolean;
  is_dropset?: boolean;
  is_failure?: boolean;
  is_pr_weight?: boolean;
  is_pr_reps?: boolean;
  is_pr_volume?: boolean;
  notes?: string;
  created_at?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group?: string;
  equipment: string | string[];
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  sets: ExerciseSet[];
  gif_url?: string;
  youtube_url?: string;
  instructions?: string[];
  secondary_muscles?: string[];
  calories_per_minute?: number;
  notes?: string;
}

// ============================================================================
// WORKOUT SESSION TYPES (matches workout_sessions table)
// ============================================================================

export interface WorkoutSession {
  id?: string;
  user_id: string;
  session_date: string;
  session_start_time?: string;
  session_end_time?: string;
  duration_minutes?: number;
  workout_name: string;
  workout_type: string;
  workout_plan_id?: string;
  from_ai_plan?: boolean;
  plan_day_name?: string;
  total_exercises?: number;
  total_sets?: number;
  total_reps?: number;
  total_volume_kg?: number;
  calories_burned?: number;
  location?: string;
  weather?: string;
  difficulty_rating?: number;
  energy_level?: number;
  mood_after?: string;
  status?: 'planned' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  skip_reason?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// PERSONAL RECORDS (matches exercise_personal_records table)
// ============================================================================

export interface PersonalRecord {
  id?: string;
  user_id: string;
  exercise_id: string;
  max_weight_kg?: number;
  max_weight_date?: string;
  max_weight_set_id?: string;
  max_reps?: number;
  max_reps_date?: string;
  max_reps_set_id?: string;
  max_volume_kg?: number;
  max_volume_date?: string;
  max_volume_set_id?: string;
  best_1rm_kg?: number;
  best_1rm_date?: string;
  max_distance_meters?: number;
  max_distance_date?: string;
  best_time_seconds?: number;
  best_time_date?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// EXERCISE HISTORY (matches workout_exercise_history table)
// ============================================================================

export interface ExerciseHistoryRecord {
  id?: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
  completed_at: string;
  created_at?: string;
}

// ============================================================================
// WORKOUT LOGGING TYPES
// ============================================================================

export interface LogWorkoutInput {
  user_id: string;
  session_date: string;
  workout_type: string;
  workout_name?: string;
  exercises: Exercise[];
  duration_minutes?: number;
  calories_burned?: number;
  notes?: string;
  from_ai_plan?: boolean;
  workout_plan_id?: string;
  plan_day_name?: string;
}

export interface WorkoutStats {
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalVolume: number;
  estimatedDuration: number;
  estimatedCalories: number;
}

// ============================================================================
// PR DETECTION TYPES
// ============================================================================

export interface PRDetectionResult {
  isWeightPR: boolean;
  isRepsPR: boolean;
  isVolumePR: boolean;
  previousWeightPR?: number;
  previousRepsPR?: number;
  previousVolumePR?: number;
  newWeightPR?: number;
  newRepsPR?: number;
  newVolumePR?: number;
}

export interface SetWithPRFlags extends ExerciseSet {
  is_pr_weight: boolean;
  is_pr_reps: boolean;
  is_pr_volume: boolean;
}