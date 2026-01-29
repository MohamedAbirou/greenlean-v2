/**
 * Dashboard Data Hooks
 * React Query hooks for fetching dashboard data using Supabase
 * UPDATED: Now fetches real macro targets and weight history
 */

import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import type { DailyNutritionLog } from "@/shared/types/food.types";
import { useQuery } from "@tanstack/react-query";

// Get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split("T")[0];

/**
 * Get nutrition logs for a specific date
 */
export function useMealItemsByDate(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mealItemsByDate", user?.id, date],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: logsData, error } = await supabase
        .from("daily_nutrition_logs")
        .select(
          `
          *,
          meal_items:meal_items!fk_nutrition_log (
            id,
            food_id,
            food_name,
            brand_name,
            serving_qty,
            serving_unit,
            calories,
            protein,
            carbs,
            fats,
            fiber,
            sugar,
            sodium,
            notes,
            created_at
          )
          `
        )
        .eq("user_id", user.id)
        .eq("log_date", date)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return logsData;
    },
    enabled: !!user?.id,
  });
}

/**
 * Get weight history
 */
export function useWeightHistory(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weightHistory", user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user?.id) return null;

      let query = supabase
        .from("weight_history")
        .select("*")
        .eq("user_id", user.id)
        .order("log_date", { ascending: true });

      if (startDate) {
        query = query.gte("log_date", startDate);
      }
      if (endDate) {
        query = query.lte("log_date", endDate);
      }

      const { data: weightData, error } = await query;

      if (error) throw error;
      return weightData;
    },
    enabled: !!user?.id,
  });
}

/**
 * Get workout sessions for a date range
 */
export function useWorkoutSessionsRange(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workoutSessionsRange", user?.id, startDate, endDate],
    queryFn: async () => {
      if (!user?.id) return null;

      let query = supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: true });

      if (startDate) {
        query = query.gte("session_date", startDate);
      }
      if (endDate) {
        query = query.lte("session_date", endDate);
      }

      const { data: workoutData, error } = await query;

      if (error) throw error;
      return workoutData;
    },
    enabled: !!user?.id,
  });
}

/**
 * Get daily workout sessions
 */
export function useWorkoutSessionsByDate(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workoutSessionsByDate", user?.id, date],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: workoutData, error } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("session_date", date);

      if (error) throw error;
      return workoutData;
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch daily water intake log for a user for a given date (defaults to today)
 */
export function useDailyWaterIntake(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dailyWaterIntake", user?.id, date],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: waterData, error } = await supabase
        .from("daily_water_intake")
        .select("*")
        .eq("user_id", user.id)
        .eq("log_date", date)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error; // ignore row not found
      return waterData;
    },
    enabled: !!user?.id,
  });
}

/**
 * Get active meal plan
 */
export function useActiveMealPlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activeMealPlan", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: mealData, error: mealError } = await supabase
        .from("ai_meal_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mealError) throw mealError;
      return mealData;
    },
    enabled: !!user?.id,
  });
}

/**
 * Get active workout plan
 */
export function useActiveWorkoutPlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activeWorkoutPlan", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: mealData, error: mealError } = await supabase
        .from("ai_workout_plans")
        .select("*")
        .eq("user_id", user.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mealError) throw mealError;
      return mealData;
    },
    enabled: !!user?.id,
  });
}

/**
 * Get current macro targets WITH REAL DATA
 */
export function useCurrentMacroTargets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["currentMacroTargets", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get current macro targets (most recent effective date <= today)
      const { data: macroData, error } = await supabase
        .from("user_macro_targets")
        .select("daily_calories, daily_protein_g, daily_carbs_g, daily_fats_g, daily_water_ml")
        .eq("user_id", user.id)
        .lte("effective_date", new Date().toISOString().split("T")[0])
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (macroData) {
        return macroData;
      } else {
        // No macro targets found - try to get from quiz results
        const { data: quizData, error: quizError } = await supabase
          .from("quiz_results")
          .select("calculations")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (quizError) throw quizError;

        if (quizData?.calculations) {
          const calc =
            typeof quizData.calculations === "string"
              ? JSON.parse(quizData.calculations)
              : quizData.calculations;
          return calc;
        } else {
          // Return defaults if nothing found
          return {
            daily_calories: 2000,
            daily_protein_g: 150,
            daily_carbs_g: 200,
            daily_fats_g: 60,
            daily_water_ml: 2500,
          };
        }
      }
    },
    enabled: !!user?.id,
  });
}

/**
 * Get user streaks
 */
export function useUserStreaks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userStreaks", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: streakData, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return streakData;
    },
    enabled: !!user?.id,
  });
}

/**
 * Calculate daily nutrition totals from daily_nutrition_logs
 */
export function calculateDailyTotals(nutritionLogs: DailyNutritionLog[]) {
  // Updated type
  if (!nutritionLogs || nutritionLogs.length === 0)
    return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };

  return nutritionLogs.reduce(
    (totals, log) => ({
      calories: totals.calories + log.total_calories,
      protein: totals.protein + log.total_protein,
      carbs: totals.carbs + log.total_carbs,
      fats: totals.fats + log.total_fats,
      fiber:
        totals.fiber + (log.meal_items?.reduce((sum, item) => sum + (item.fiber || 0), 0) || 0), // NEW: From items if needed
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );
}
