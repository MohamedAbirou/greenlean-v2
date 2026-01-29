/**
 * Stats Service
 * Handles all stats data operations and calculations
 */

import { supabase } from "@/lib/supabase/client";
import type { DailyNutritionLog } from "@/shared/types/food.types";
import type { WorkoutSession } from "@/shared/types/workout";
import { differenceInDays, format, subDays } from "date-fns";
import type { AIMealPlan, AIWorkoutPlan, StatsData, WaterIntakeLog } from "../types/stats.types";
import {
  calculateCalorieBalance,
  calculateDietAdherence,
  calculateHydrationInsights,
  calculateHydrationTrends,
  calculateMacroDistribution,
  calculateMealConsistency,
  calculateMonthComparisons,
  calculateMonthlyHighlight,
  calculateStreak,
  calculateWeeklyEffort,
  calculateWeeklySummary,
  calculateWorkoutAdherence,
  calculateWorkoutCalendar,
  calculateWorkoutStats,
  generateInsights,
} from "../utils/statsCalculations";

export class StatsService {
  /**
   * Fetch complete stats data for user
   */
  static async getStatsData(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<StatsData> {
    // Calculate period length and previous period start for comparisons
    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1;
    const previousStartDate = format(subDays(new Date(startDate), days), "yyyy-MM-dd");

    // Fetch all data in parallel
    const [nutritionLogs, waterLogs, workoutLogs, mealPlan, workoutPlan] = await Promise.all([
      this.getNutritionLogs(userId, previousStartDate, endDate),
      this.getWaterLogs(userId, previousStartDate, endDate),
      this.getWorkoutLogs(userId, previousStartDate, endDate),
      this.getActiveMealPlan(userId),
      this.getActiveWorkoutPlan(userId),
    ]);

    // Calculate all stats with range
    const currentStreak = calculateStreak(
      nutritionLogs,
      waterLogs,
      workoutLogs,
      startDate,
      endDate
    );
    const weeklySummary = calculateWeeklySummary(
      nutritionLogs,
      waterLogs,
      workoutLogs,
      startDate,
      endDate
    );
    const monthlyHighlight = calculateMonthlyHighlight(
      nutritionLogs,
      waterLogs,
      workoutLogs,
      startDate,
      endDate
    );

    const calorieBalance = calculateCalorieBalance(nutritionLogs, mealPlan, startDate, endDate);
    const macroDistribution = calculateMacroDistribution(nutritionLogs, startDate, endDate);
    const mealConsistency = calculateMealConsistency(nutritionLogs, startDate, endDate);

    const avgMacros =
      macroDistribution.length > 0
        ? {
            protein: Math.round(
              macroDistribution.reduce((sum, d) => sum + d.protein, 0) / macroDistribution.length
            ),
            carbs: Math.round(
              macroDistribution.reduce((sum, d) => sum + d.carbs, 0) / macroDistribution.length
            ),
            fats: Math.round(
              macroDistribution.reduce((sum, d) => sum + d.fats, 0) / macroDistribution.length
            ),
          }
        : { protein: 0, carbs: 0, fats: 0 };

    const hydrationTrends = calculateHydrationTrends(waterLogs, startDate, endDate);
    const hydrationInsights = calculateHydrationInsights(waterLogs, startDate, endDate);

    const workoutCalendar = calculateWorkoutCalendar(workoutLogs, startDate, endDate);
    const workoutStats = calculateWorkoutStats(workoutLogs, startDate, endDate);
    const weeklyEffort = calculateWeeklyEffort(workoutLogs, startDate, endDate);

    const dietAdherence = calculateDietAdherence(nutritionLogs, mealPlan, startDate, endDate);
    const workoutAdherence = calculateWorkoutAdherence(
      workoutLogs,
      workoutPlan,
      startDate,
      endDate
    );

    const monthComparisons = calculateMonthComparisons(
      nutritionLogs,
      waterLogs,
      workoutLogs,
      startDate,
      endDate
    );

    const insights = generateInsights(nutritionLogs, waterLogs, workoutLogs, startDate, endDate);

    return {
      currentStreak,
      weeklySummary,
      monthlyHighlight,
      calorieBalance,
      macroDistribution,
      mealConsistency,
      avgMacros,
      hydrationTrends,
      hydrationInsights,
      workoutCalendar,
      workoutStats,
      weeklyEffort,
      dietAdherence,
      workoutAdherence,
      monthComparisons,
      insights,
    };
  }

  /**
   * Get nutrition logs for user
   */
  static async getNutritionLogs(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<DailyNutritionLog[]> {
    const { data, error } = await supabase
      .from("daily_nutrition_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate)
      .lte("log_date", endDate)
      .order("log_date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get water intake logs for user
   */
  static async getWaterLogs(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<WaterIntakeLog[]> {
    const { data, error } = await supabase
      .from("daily_water_intake")
      .select("*")
      .eq("user_id", userId)
      .gte("log_date", startDate)
      .lte("log_date", endDate)
      .order("log_date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get workout logs for user in date range
   */
  static async getWorkoutLogs(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get active meal plan
   */
  static async getActiveMealPlan(userId: string): Promise<AIMealPlan | null> {
    const { data, error } = await supabase
      .from("ai_meal_plans")
      .select("id, user_id, daily_calories, is_active, generated_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  /**
   * Get active workout plan
   */
  static async getActiveWorkoutPlan(userId: string): Promise<AIWorkoutPlan | null> {
    const { data, error } = await supabase
      .from("ai_workout_plans")
      .select("id, user_id, plan_data, is_active, generated_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
