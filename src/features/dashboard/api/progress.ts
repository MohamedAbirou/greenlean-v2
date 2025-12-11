/**
 * Progress API Layer
 * Track weight, body measurements, and analytics
 */

import { supabase } from '@/lib/supabase/client';
import type {
  WeightHistory,
  BodyMeasurement,
  NutritionTrend,
  WorkoutAnalytics,
  UserStreak,
} from '../types';

// ========== WEIGHT TRACKING ==========

export async function getWeightHistory(
  userId: string,
  startDate?: string,
  endDate?: string,
  limit = 100
) {
  let query = supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('log_date', startDate);
  }

  if (endDate) {
    query = query.lte('log_date', endDate);
  }

  const { data, error } = await query
    .order('log_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as WeightHistory[];
}

export async function getLatestWeight(userId: string) {
  const { data, error } = await supabase
    .from('weight_history')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as WeightHistory | null;
}

export async function addWeightEntry(entry: Partial<WeightHistory>) {
  const { data, error } = await supabase
    .from('weight_history')
    .insert([entry])
    .select()
    .single();

  if (error) throw error;
  return data as WeightHistory;
}

export async function updateWeightEntry(id: string, updates: Partial<WeightHistory>) {
  const { data, error } = await supabase
    .from('weight_history')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as WeightHistory;
}

export async function deleteWeightEntry(id: string) {
  const { error } = await supabase.from('weight_history').delete().eq('id', id);

  if (error) throw error;
}

// ========== BODY MEASUREMENTS ==========

export async function getBodyMeasurements(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('body_measurements_simple')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('measurement_date', startDate);
  }

  if (endDate) {
    query = query.lte('measurement_date', endDate);
  }

  const { data, error } = await query.order('measurement_date', {
    ascending: false,
  });

  if (error) throw error;
  return data as BodyMeasurement[];
}

export async function getLatestMeasurement(userId: string) {
  const { data, error } = await supabase
    .from('body_measurements_simple')
    .select('*')
    .eq('user_id', userId)
    .order('measurement_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as BodyMeasurement | null;
}

export async function addBodyMeasurement(measurement: Partial<BodyMeasurement>) {
  const { data, error } = await supabase
    .from('body_measurements_simple')
    .insert([measurement])
    .select()
    .single();

  if (error) throw error;
  return data as BodyMeasurement;
}

export async function updateBodyMeasurement(
  id: string,
  updates: Partial<BodyMeasurement>
) {
  const { data, error } = await supabase
    .from('body_measurements_simple')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as BodyMeasurement;
}

export async function deleteBodyMeasurement(id: string) {
  const { error} = await supabase
    .from('body_measurements_simple')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========== NUTRITION TRENDS ==========

export async function getNutritionTrends(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('nutrition_trends')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('trend_date', startDate);
  }

  if (endDate) {
    query = query.lte('trend_date', endDate);
  }

  const { data, error } = await query.order('trend_date', { ascending: false });

  if (error) throw error;
  return data as NutritionTrend[];
}

export async function getLatestNutritionTrend(userId: string) {
  const { data, error } = await supabase
    .from('nutrition_trends')
    .select('*')
    .eq('user_id', userId)
    .order('trend_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as NutritionTrend | null;
}

// ========== WORKOUT ANALYTICS ==========

export async function getWorkoutAnalytics(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('workout_analytics')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('analysis_date', startDate);
  }

  if (endDate) {
    query = query.lte('analysis_date', endDate);
  }

  const { data, error } = await query.order('analysis_date', { ascending: false });

  if (error) throw error;
  return data as WorkoutAnalytics[];
}

export async function getLatestWorkoutAnalytics(userId: string) {
  const { data, error } = await supabase
    .from('workout_analytics')
    .select('*')
    .eq('user_id', userId)
    .order('analysis_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as WorkoutAnalytics | null;
}

// ========== USER STREAKS ==========

export async function getUserStreaks(userId: string) {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data as UserStreak[];
}

export async function getStreakByType(userId: string, streakType: string) {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('streak_type', streakType)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as UserStreak | null;
}

// ========== COMPREHENSIVE STATS ==========

export async function getDashboardStats(userId: string, date: string) {
  const [
    todayNutrition,
    todayWorkouts,
    weekWorkouts,
    monthWorkouts,
    streaks,
    latestWeight,
    macroTargets,
    todayWater,
  ] = await Promise.all([
    // Today's nutrition
    supabase
      .from('daily_nutrition_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date),

    // Today's workouts
    supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('workout_date', date)
      .eq('status', 'completed'),

    // Week workouts
    supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('workout_date', getDateDaysAgo(7))
      .eq('status', 'completed'),

    // Month workouts
    supabase
      .from('workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('workout_date', getDateDaysAgo(30))
      .eq('status', 'completed'),

    // Streaks
    supabase.from('user_streaks').select('*').eq('user_id', userId),

    // Latest weight
    supabase
      .from('weight_history')
      .select('*')
      .eq('user_id', userId)
      .order('log_date', { ascending: false })
      .limit(1)
      .single(),

    // Macro targets
    supabase
      .from('user_macro_targets')
      .select('*')
      .eq('user_id', userId)
      .lte('effective_date', date)
      .or(`end_date.is.null,end_date.gte.${date}`)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single(),

    // Today's water
    supabase
      .from('daily_water_intake')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', date)
      .single(),
  ]);

  // Calculate today's totals
  const todayCalories =
    todayNutrition.data?.reduce((sum, log) => sum + (log.total_calories || 0), 0) || 0;
  const todayProtein =
    todayNutrition.data?.reduce((sum, log) => sum + (log.total_protein || 0), 0) || 0;
  const todayCarbs =
    todayNutrition.data?.reduce((sum, log) => sum + (log.total_carbs || 0), 0) || 0;
  const todayFats =
    todayNutrition.data?.reduce((sum, log) => sum + (log.total_fats || 0), 0) || 0;

  // Calculate week averages
  const weekCaloriesAvg =
    weekWorkouts.data && weekWorkouts.data.length > 0
      ? Math.round(
          weekWorkouts.data.reduce((sum, w) => sum + (w.total_volume_kg || 0), 0) /
            weekWorkouts.data.length
        )
      : 0;

  // Find nutrition streak
  const nutritionStreak = streaks.data?.find(s => s.streak_type === 'nutrition_logging');

  return {
    today: {
      calories: Math.round(todayCalories),
      caloriesGoal: macroTargets.data?.daily_calories || 2000,
      protein: Math.round(todayProtein),
      proteinGoal: Math.round(macroTargets.data?.daily_protein_g || 150),
      carbs: Math.round(todayCarbs),
      carbsGoal: Math.round(macroTargets.data?.daily_carbs_g || 200),
      fats: Math.round(todayFats),
      fatsGoal: Math.round(macroTargets.data?.daily_fats_g || 60),
      water: todayWater.data?.total_ml || 0,
      waterGoal: macroTargets.data?.daily_water_ml || 2000,
      workoutsCompleted: todayWorkouts.data?.length || 0,
    },
    week: {
      caloriesAvg: weekCaloriesAvg,
      proteinAvg: 0, // TODO: Calculate from nutrition logs
      workoutsCompleted: weekWorkouts.data?.length || 0,
      totalVolume:
        weekWorkouts.data?.reduce((sum, w) => sum + (w.total_volume_kg || 0), 0) || 0,
      streakDays: nutritionStreak?.current_streak || 0,
    },
    month: {
      weightChange: 0, // TODO: Calculate from weight history
      workoutsCompleted: monthWorkouts.data?.length || 0,
      totalVolume:
        monthWorkouts.data?.reduce((sum, w) => sum + (w.total_volume_kg || 0), 0) || 0,
      prsAchieved: 0, // TODO: Calculate from exercise sets
    },
  };
}

// ========== HELPER FUNCTIONS ==========

function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

export async function getProgressSummary(
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase.rpc('get_progress_summary', {
    p_user_id: userId,
    p_start_date: startDate,
    p_end_date: endDate,
  });

  if (error) {
    // Fallback if function doesn't exist - calculate manually
    const [weights, workouts, meals, prs] = await Promise.all([
      getWeightHistory(userId, startDate, endDate),
      supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('workout_date', startDate)
        .lte('workout_date', endDate)
        .eq('status', 'completed'),
      supabase
        .from('daily_nutrition_logs')
        .select('log_date')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate),
      supabase
        .from('exercise_sets')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .or('is_pr_weight.eq.true,is_pr_reps.eq.true,is_pr_volume.eq.true'),
    ]);

    const weightChange =
      weights.length >= 2
        ? weights[weights.length - 1].weight_kg - weights[0].weight_kg
        : 0;

    const uniqueMealDays = new Set(meals.data?.map(m => m.log_date) || []).size;

    return {
      weight_change_kg: weightChange,
      total_workouts: workouts.data?.length || 0,
      total_meals_logged: uniqueMealDays,
      prs_achieved: prs.data?.length || 0,
    };
  }

  return data[0];
}
