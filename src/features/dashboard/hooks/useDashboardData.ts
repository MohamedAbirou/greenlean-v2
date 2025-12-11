/**
 * Dashboard Data Hooks
 * Apollo hooks for fetching dashboard data using existing GraphQL queries
 */

import { useQuery } from '@apollo/client/react';
import { useAuth } from '@/features/auth';
import {
  GetDailyNutritionLogsDocument,
  GetDailyWorkoutLogsDocument,
  GetRecentWorkoutLogsDocument,
  GetActiveMealPlanDocument,
  GetActiveWorkoutPlanDocument,
} from '@/generated/graphql';

// Get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split('T')[0];

/**
 * Get nutrition logs for a specific date
 */
export function useMealItemsByDate(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery(GetDailyNutritionLogsDocument, {
    variables: {
      userId: user?.id || '',
      logDate: date,
    },
    skip: !user?.id,
  });
}

/**
 * Get workout logs for a specific date
 */
export function useWorkoutSessionsByDate(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery(GetDailyWorkoutLogsDocument, {
    variables: {
      userId: user?.id || '',
      workoutDate: date,
    },
    skip: !user?.id,
  });
}

/**
 * Get workout sessions for a date range
 */
export function useWorkoutSessionsRange(_startDate: string, _endDate: string) {
  const { user } = useAuth();

  return useQuery(GetRecentWorkoutLogsDocument, {
    variables: {
      userId: user?.id || '',
      first: 100,
    },
    skip: !user?.id,
  });
}

/**
 * Get weight history
 * Note: Weight history is not currently exposed in GraphQL schema
 */
export function useWeightHistory(_startDate?: string, _endDate?: string) {
  // Return empty data since weight_history is not exposed in GraphQL
  return {
    data: { weight_historyCollection: { edges: [] } },
    loading: false,
    refetch: async () => {},
  };
}

/**
 * Get daily water intake
 * Note: Daily water intake is not currently exposed in GraphQL schema
 */
export function useDailyWaterIntake(_date: string = getToday()) {
  // Return empty data since daily_water_intake is not exposed in GraphQL
  return {
    data: null,
    loading: false,
  };
}

/**
 * Get active meal plan
 */
export function useActiveMealPlan() {
  const { user } = useAuth();

  return useQuery(GetActiveMealPlanDocument, {
    variables: {
      userId: user?.id || '',
    },
    skip: !user?.id,
  });
}

/**
 * Get active workout plan
 */
export function useActiveWorkoutPlan() {
  const { user } = useAuth();

  return useQuery(GetActiveWorkoutPlanDocument, {
    variables: {
      userId: user?.id || '',
    },
    skip: !user?.id,
  });
}

/**
 * Get current macro targets
 * Note: User macro targets not currently exposed in GraphQL schema
 */
export function useCurrentMacroTargets() {
  // Return default targets since user_macro_targets is not exposed in GraphQL
  return {
    data: {
      user_macro_targetsCollection: {
        edges: [
          {
            node: {
              daily_calories: 2000,
              daily_protein_g: 150,
              daily_carbs_g: 200,
              daily_fats_g: 60,
              daily_water_ml: 2000,
            },
          },
        ],
      },
    },
    loading: false,
  };
}

/**
 * Get user streaks
 * Note: User streaks not currently exposed in GraphQL schema
 */
export function useUserStreaks() {
  // Return empty data since user_streaks is not exposed in GraphQL
  return {
    data: {
      user_streaksCollection: {
        edges: [],
      },
    },
    loading: false,
  };
}

/**
 * Get personal records
 * Note: Personal records not currently exposed in GraphQL schema
 */
export function usePersonalRecords() {
  // Return empty data since exercise_personal_records is not exposed in GraphQL
  return {
    data: null,
    loading: false,
  };
}

/**
 * Calculate daily nutrition totals from daily_nutrition_logs
 */
export function calculateDailyTotals(nutritionLogs: any[]) {
  if (!nutritionLogs || nutritionLogs.length === 0) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    };
  }

  return nutritionLogs.reduce(
    (totals, log) => ({
      calories: totals.calories + (log.total_calories || 0),
      protein: totals.protein + (log.total_protein || 0),
      carbs: totals.carbs + (log.total_carbs || 0),
      fats: totals.fats + (log.total_fats || 0),
      fiber: totals.fiber + 0, // Not available in daily_nutrition_logs
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );
}
