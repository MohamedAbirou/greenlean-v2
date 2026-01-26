/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dashboard Data Hooks
 * Apollo hooks for fetching dashboard data using existing GraphQL queries
 * UPDATED: Now fetches real macro targets and weight history
 */

import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import type { DailyNutritionLog } from "@/shared/types/food.types";
import { useEffect, useState } from "react";

// Get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split("T")[0];

/**
 * Get nutrition logs for a specific date
 */
export function useMealItemsByDate(date: string = getToday()) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchNutritionLogs = async () => {
      try {
        setLoading(true);
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
          .order("created_at", { ascending: true });

        if (error) throw error;

        setData(logsData);
      } catch (error) {
        console.error("Error fetching nutrition logs:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionLogs();
  }, [user?.id, date]);

  const refetch = async () => {
    if (!user?.id) return;
    try {
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
        .order("created_at", { ascending: true });

      if (error) throw error;

      setData(logsData);
    } catch (error) {
      console.error("Error refetching nutrition logs:", error);
    }
  };

  return { data, loading, refetch };
}

/**
 * Get weight history
 */
export function useWeightHistory(startDate?: string, endDate?: string) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchWeightHistory = async () => {
      try {
        setLoading(true);

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

        setData(weightData);
      } catch (error) {
        console.error("Error fetching weight history:", error);
        setData({ weight_historyCollection: { edges: [] } });
      } finally {
        setLoading(false);
      }
    };

    fetchWeightHistory();
  }, [user?.id, startDate, endDate]);

  const refetch = async () => {
    if (!user?.id) return;

    try {
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

      setData(weightData);
    } catch (error) {
      console.error("Error refetching weight history:", error);
    }
  };

  return { data, loading, refetch };
}

/**
 * Get workout sessions for a date range
 */
export function useWorkoutSessionsRange(startDate?: string, endDate?: string) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchWorkoutSessions = async () => {
      try {
        setLoading(true);

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

        setData(workoutData);
      } catch (error) {
        console.error("Error fetching weight history:", error);
        setData({ weight_historyCollection: { edges: [] } });
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutSessions();
  }, [user?.id, startDate, endDate]);

  const refetch = async () => {
    if (!user?.id) return;

    try {
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

      setData(workoutData);
    } catch (error) {
      console.error("Error refetching weight history:", error);
    }
  };

  return { data, loading, refetch };
}

/**
 * Get daily workout sessions
 */
export function useWorkoutSessionsByDate(date: string = getToday()) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchWorkoutSessions = async () => {
      try {
        setLoading(true);

        const { data: workoutData, error } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("user_id", user.id)
          .eq("session_date", date);

        if (error) throw error;

        setData(workoutData);
      } catch (error) {
        console.error("Error fetching water intake:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutSessions();
  }, [user?.id, date]);

  const refetch = async () => {
    if (!user?.id) return;

    try {
      let query = supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("session_date", { ascending: true });

      if (date) {
        query = query.eq("session_date", date);
      }

      const { data: workoutData, error } = await query;

      if (error) throw error;

      setData(workoutData);
    } catch (error) {
      console.error("Error refetching workout sessions:", error);
    }
  };

  return { data, refetch, loading };
}

/**
 * Get daily water intake
 */
export function useDailyWaterIntake(date: string = getToday()) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchWaterIntake = async () => {
      try {
        setLoading(true);

        const { data: waterData, error } = await supabase
          .from("daily_water_intake")
          .select("*")
          .eq("user_id", user.id)
          .eq("log_date", date)
          .maybeSingle();

        if (error) throw error;

        setData(waterData);
      } catch (error) {
        console.error("Error fetching water intake:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWaterIntake();
  }, [user?.id, date]);

  return { data, loading };
}

/**
 * Get active meal plan
 */
export function useActiveMealPlan() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchActiveMealPlan = async () => {
      try {
        setLoading(true);

        const { data: mealData, error: mealError } = await supabase
          .from("ai_meal_plans")
          .select("*")
          .eq("user_id", user.id)
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (mealError) throw mealError;

        setData(mealData);
      } catch (error) {
        console.error("Error fetching active meal plan:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveMealPlan();
  }, [user?.id]);

  return { data, loading };
}

/**
 * Get active workout plan
 */
export function useActiveWorkoutPlan() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchActiveWorkoutPlan = async () => {
      try {
        setLoading(true);

        const { data: mealData, error: mealError } = await supabase
          .from("ai_workout_plans")
          .select("*")
          .eq("user_id", user.id)
          .order("generated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (mealError) throw mealError;

        setData(mealData);
      } catch (error) {
        console.error("Error fetching active workout plan:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveWorkoutPlan();
  }, [user?.id]);

  return { data, loading };
}

/**
 * Get current macro targets WITH REAL DATA
 */
export function useCurrentMacroTargets() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchMacroTargets = async () => {
      try {
        setLoading(true);

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
          setData(macroData);
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

            setData(calc);
          } else {
            // Return defaults if nothing found
            setData({
              daily_calories: 2000,
              daily_protein_g: 150,
              daily_carbs_g: 200,
              daily_fats_g: 60,
              daily_water_ml: 2500,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching macro targets:", error);
        // Return defaults on error
        setData({
          daily_calories: 2000,
          daily_protein_g: 150,
          daily_carbs_g: 200,
          daily_fats_g: 60,
          daily_water_ml: 2500,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMacroTargets();
  }, [user?.id]);

  return { data, loading };
}

/**
 * Get user streaks
 */
export function useUserStreaks() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchStreaks = async () => {
      try {
        setLoading(true);

        const { data: streakData, error } = await supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        setData(streakData);
      } catch (error) {
        console.error("Error fetching user streaks:", error);
        setData({ user_streaksCollection: { edges: [] } });
      } finally {
        setLoading(false);
      }
    };

    fetchStreaks();
  }, [user?.id]);

  return { data, loading };
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
