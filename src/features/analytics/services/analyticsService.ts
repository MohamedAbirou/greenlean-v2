/**
 * Analytics Service
 * Generates weekly summaries, insights, and trend analysis
 * Powers the Analytics & Insights Dashboard
 */

import { supabase } from '@/lib/supabase';
import type { Insight } from '@/features/dashboard/components/OverviewTab/PersonalizedInsights';

export interface WeeklySummary {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;

  // Nutrition stats
  avg_daily_calories: number | null;
  avg_daily_protein: number | null;
  avg_daily_carbs: number | null;
  avg_daily_fats: number | null;
  total_meals_logged: number | null;

  // Workout stats
  total_workouts: number | null;
  total_workout_minutes: number | null;
  total_calories_burned: number | null;

  // Weight progress
  starting_weight_kg: number | null;
  ending_weight_kg: number | null;
  weight_change_kg: number | null;

  // Streaks
  perfect_logging_days: number | null;
  workout_consistency_percentage: number | null;

  // AI insights
  insights: string[];
  recommendations: string[];

  generated_at: string;
}

export interface DailyActivitySummary {
  id: string;
  user_id: string;
  activity_date: string;

  calories_consumed: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  water_glasses: number;
  meals_logged: number;

  workouts_completed: number;
  workout_duration_minutes: number;
  calories_burned: number;

  logged_nutrition: boolean;
  logged_workout: boolean;
  logged_weight: boolean;
  completed_all_goals: boolean;
}

export interface UserMacroTarget {
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fats_g: number;
  daily_water_ml: number;
}

export interface WeightEntry {
  weight_kg: number;
  log_date: string;
  notes?: string;
}

/**
 * Generate weekly summary from daily activity data
 */
export async function generateWeeklySummary(
  userId: string,
  weekStartDate: Date
): Promise<WeeklySummary | null> {
  try {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Fetch daily activity for the week
    const { data: dailyData, error: dailyError } = await supabase
      .from('daily_activity_summary')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', weekStartDate.toISOString().split('T')[0])
      .lte('activity_date', weekEndDate.toISOString().split('T')[0])
      .order('activity_date');

    if (dailyError) throw dailyError;

    if (!dailyData || dailyData.length === 0) {
      console.log('No daily activity data for week');
      return null;
    }

    // Calculate nutrition averages
    const totalCalories = dailyData.reduce((sum, day) => sum + (day.calories_consumed || 0), 0);
    const totalProtein = dailyData.reduce((sum, day) => sum + (day.protein_g || 0), 0);
    const totalCarbs = dailyData.reduce((sum, day) => sum + (day.carbs_g || 0), 0);
    const totalFats = dailyData.reduce((sum, day) => sum + (day.fats_g || 0), 0);
    const totalMeals = dailyData.reduce((sum, day) => sum + (day.meals_logged || 0), 0);

    const daysWithData = dailyData.filter(d => d.meals_logged > 0).length;
    const avgCalories = daysWithData > 0 ? Math.round(totalCalories / daysWithData) : 0;
    const avgProtein = daysWithData > 0 ? Math.round(totalProtein / daysWithData) : 0;
    const avgCarbs = daysWithData > 0 ? Math.round(totalCarbs / daysWithData) : 0;
    const avgFats = daysWithData > 0 ? Math.round(totalFats / daysWithData) : 0;

    // Calculate workout stats
    const totalWorkouts = dailyData.reduce((sum, day) => sum + (day.workouts_completed || 0), 0);
    const totalWorkoutMinutes = dailyData.reduce((sum, day) => sum + (day.workout_duration_minutes || 0), 0);
    const totalCaloriesBurned = dailyData.reduce((sum, day) => sum + (day.calories_burned || 0), 0);

    // Calculate perfect logging days (all goals met)
    const perfectDays = dailyData.filter(d => d.completed_all_goals).length;

    // Calculate workout consistency
    const workoutDays = dailyData.filter(d => d.workouts_completed > 0).length;
    const workoutConsistency = Math.round((workoutDays / 7) * 100);

    // Fetch weight data for the week
    const { data: weightData } = await supabase
      .from('weight_history')
      .select('weight_kg, log_date')
      .eq('user_id', userId)
      .gte('log_date', weekStartDate.toISOString().split('T')[0])
      .lte('log_date', weekEndDate.toISOString().split('T')[0])
      .order('log_date');

    let startWeight: number | null = null;
    let endWeight: number | null = null;
    let weightChange: number | null = null;

    if (weightData && weightData.length > 0) {
      startWeight = weightData[0].weight_kg;
      endWeight = weightData[weightData.length - 1].weight_kg;
      if (startWeight !== null && endWeight !== null) {
        weightChange = endWeight - startWeight;
      }
    }

    // Generate insights and recommendations
    const { insights, recommendations } = await generateInsights(userId, {
      avgCalories,
      avgProtein,
      avgCarbs,
      avgFats,
      totalWorkouts,
      workoutConsistency,
      weightChange,
      perfectDays,
    });

    // Upsert weekly summary
    const { data, error } = await supabase
      .from('weekly_summaries')
      .upsert({
        user_id: userId,
        week_start_date: weekStartDate.toISOString().split('T')[0],
        week_end_date: weekEndDate.toISOString().split('T')[0],
        avg_daily_calories: avgCalories,
        avg_daily_protein: avgProtein,
        avg_daily_carbs: avgCarbs,
        avg_daily_fats: avgFats,
        total_meals_logged: totalMeals,
        total_workouts: totalWorkouts,
        total_workout_minutes: totalWorkoutMinutes,
        total_calories_burned: totalCaloriesBurned,
        starting_weight_kg: startWeight,
        ending_weight_kg: endWeight,
        weight_change_kg: weightChange,
        perfect_logging_days: perfectDays,
        workout_consistency_percentage: workoutConsistency,
        insights,
        recommendations,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,week_start_date',
      })
      .select()
      .maybeSingle();

    if (error) throw error;

    return data as WeeklySummary;
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return null;
  }
}

/**
 * Generate AI-powered insights and recommendations
 */
async function generateInsights(
  userId: string,
  weekData: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFats: number;
    totalWorkouts: number;
    workoutConsistency: number;
    weightChange: number | null;
    perfectDays: number;
  }
): Promise<{ insights: string[]; recommendations: string[] }> {
  const insights: string[] = [];
  const recommendations: string[] = [];

  try {
    // Fetch user's macro targets
    const { data: macroTargets } = await supabase
      .from('user_macro_targets')
      .select('*')
      .eq('user_id', userId)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    // Fetch user's goal
    const { data: profile } = await supabase
      .from('profiles')
      .select('target_weight_kg, weight_kg')
      .eq('id', userId)
      .single();

    // Analyze nutrition adherence
    if (macroTargets) {
      const calorieAdherence = weekData.avgCalories / macroTargets.daily_calories;
      const proteinAdherence = weekData.avgProtein / macroTargets.daily_protein_g;

      if (calorieAdherence >= 0.95 && calorieAdherence <= 1.05) {
        insights.push("Perfect calorie tracking! You're right on target.");
      } else if (calorieAdherence < 0.90) {
        insights.push("You're eating below your calorie target. Make sure you're fueling properly!");
        recommendations.push("Add a healthy snack between meals to reach your calorie goal");
      } else if (calorieAdherence > 1.15) {
        insights.push("Calorie intake is above target. Let's bring it back on track.");
        recommendations.push("Focus on portion control and track meals consistently");
      }

      if (proteinAdherence < 0.80) {
        recommendations.push("Boost protein intake: Try Greek yogurt, eggs, or lean meats");
      } else if (proteinAdherence >= 1.0) {
        insights.push("Excellent protein intake! Great for muscle recovery and satiety.");
      }
    }

    // Analyze workout consistency
    if (weekData.totalWorkouts === 0) {
      recommendations.push("No workouts this week. Even a 15-minute walk counts!");
    } else if (weekData.totalWorkouts >= 4) {
      insights.push(`Amazing! You completed ${weekData.totalWorkouts} workouts this week.`);
    } else if (weekData.totalWorkouts >= 2) {
      insights.push("Good workout consistency. Try adding one more session next week!");
    }

    // Analyze weight progress
    if (weekData.weightChange !== null && profile) {
      if (Math.abs(weekData.weightChange) < 0.3) {
        insights.push("Weight is stable this week. Consistency is key!");
      } else if (weekData.weightChange < 0) {
        insights.push(`You lost ${Math.abs(weekData.weightChange).toFixed(1)} kg this week!`);
        if (profile.target_weight_kg && profile.weight_kg) {
          const remaining = profile.weight_kg - profile.target_weight_kg;
          if (remaining > 0) {
            insights.push(`Only ${remaining.toFixed(1)} kg to go to reach your goal!`);
          }
        }
      } else if (weekData.weightChange > 0) {
        insights.push(`Weight increased by ${weekData.weightChange.toFixed(1)} kg this week.`);
      }
    }

    // Analyze perfect logging days
    if (weekData.perfectDays >= 6) {
      insights.push("🔥 Nearly perfect week! You hit all your goals 6+ days!");
    } else if (weekData.perfectDays >= 4) {
      insights.push("Strong week! You're building great habits.");
    } else if (weekData.perfectDays <= 2) {
      recommendations.push("Try to complete all daily goals at least 4 days this week");
    }

    // General encouragement if no insights
    if (insights.length === 0) {
      insights.push("Keep logging consistently to unlock personalized insights!");
    }

  } catch (error) {
    console.error('Error generating insights:', error);
  }

  return { insights, recommendations };
}

/**
 * Get current week's summary (or generate if missing)
 */
export async function getCurrentWeekSummary(userId: string): Promise<WeeklySummary | null> {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - dayOfWeek); // Go to Sunday
    weekStart.setHours(0, 0, 0, 0);

    // Try to fetch existing summary
    const { data: existing } = await supabase
      .from('weekly_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .maybeSingle();

    if (existing) {
      return existing as WeeklySummary;
    }

    // Generate new summary
    return await generateWeeklySummary(userId, weekStart);
  } catch (error) {
    console.error('Error getting current week summary:', error);
    return null;
  }
}

/**
 * Get insights in format for PersonalizedInsights component
 */
export async function getUserInsights(userId: string): Promise<Insight[]> {
  try {
    const summary = await getCurrentWeekSummary(userId);

    if (!summary) {
      return [];
    }

    const insights: Insight[] = [];

    // Add insights from weekly summary
    summary.insights.forEach((message, index) => {
      insights.push({
        id: `insight-${index}`,
        type: 'success',
        title: 'Weekly Insight',
        message,
      });
    });

    // Add recommendations
    summary.recommendations.forEach((message, index) => {
      insights.push({
        id: `rec-${index}`,
        type: 'tip',
        title: 'Recommendation',
        message,
        action: 'Learn More',
      });
    });

    return insights;
  } catch (error) {
    console.error('Error getting user insights:', error);
    return [];
  }
}

/**
 * Fetch weight history for charts
 */
export async function getWeightHistory(
  userId: string,
  days: number = 90
): Promise<WeightEntry[]> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('weight_history')
      .select('weight_kg, log_date, notes')
      .eq('user_id', userId)
      .gte('log_date', startDate.toISOString().split('T')[0])
      .order('log_date');

    if (error) throw error;

    return (data || []) as WeightEntry[];
  } catch (error) {
    console.error('Error fetching weight history:', error);
    return [];
  }
}

/**
 * Log weight entry
 */
export async function logWeight(
  userId: string,
  weightKg: number,
  date?: Date,
  notes?: string
): Promise<boolean> {
  try {
    const logDate = date || new Date();

    const { error } = await supabase
      .from('weight_history')
      .upsert({
        user_id: userId,
        weight_kg: weightKg,
        log_date: logDate.toISOString().split('T')[0],
        notes,
        source: 'manual',
      }, {
        onConflict: 'user_id,log_date',
      });

    if (error) throw error;

    // Update streak
    await supabase.rpc('update_user_streak', {
      p_user_id: userId,
      p_streak_type: 'daily_weigh_in',
      p_log_date: logDate.toISOString().split('T')[0],
    });

    // Update daily activity summary
    await supabase
      .from('daily_activity_summary')
      .upsert({
        user_id: userId,
        activity_date: logDate.toISOString().split('T')[0],
        logged_weight: true,
      }, {
        onConflict: 'user_id,activity_date',
      });

    return true;
  } catch (error) {
    console.error('Error logging weight:', error);
    return false;
  }
}

/**
 * Get streak data
 */
export async function getStreakData(userId: string, streakType: string) {
  try {
    const { data, error } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', userId)
      .eq('streak_type', streakType)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error fetching streak data:', error);
    return null;
  }
}
