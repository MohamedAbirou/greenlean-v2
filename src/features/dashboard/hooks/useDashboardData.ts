/**
 * Dashboard Data Hooks
 * Apollo hooks for fetching dashboard data
 */

import { useQuery } from '@apollo/client';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  GetMealItemsByDateDocument,
  GetWorkoutSessionsByDateDocument,
  GetWeightHistoryDocument,
  GetDailyWaterIntakeDocument,
  GetActiveMealPlanDocument,
  GetActiveWorkoutPlanDocument,
  GetCurrentMacroTargetsDocument,
  GetUserStreaksDocument,
  GetPersonalRecordsDocument,
  GetWorkoutSessionsRangeDocument,
} from '@/generated/graphql';

// Get today's date in YYYY-MM-DD format
const getToday = () => new Date().toISOString().split('T')[0];

// Get date N days ago
const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

/**
 * Get meal items for a specific date
 */
export function useMealItemsByDate(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery(GetMealItemsByDateDocument, {
    variables: {
      userId: user?.id || '',
      logDate: date,
    },
    skip: !user?.id,
  });
}

/**
 * Get workout sessions for a specific date
 */
export function useWorkoutSessionsByDate(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery(GetWorkoutSessionsByDateDocument, {
    variables: {
      userId: user?.id || '',
      sessionDate: date,
    },
    skip: !user?.id,
  });
}

/**
 * Get workout sessions for a date range
 */
export function useWorkoutSessionsRange(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery(GetWorkoutSessionsRangeDocument, {
    variables: {
      userId: user?.id || '',
      startDate,
      endDate,
    },
    skip: !user?.id || !startDate || !endDate,
  });
}

/**
 * Get weight history
 */
export function useWeightHistory(startDate?: string, endDate?: string) {
  const { user } = useAuth();
  const start = startDate || getDaysAgo(90);
  const end = endDate || getToday();

  return useQuery(GetWeightHistoryDocument, {
    variables: {
      userId: user?.id || '',
      startDate: start,
      endDate: end,
    },
    skip: !user?.id,
  });
}

/**
 * Get daily water intake
 */
export function useDailyWaterIntake(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery(GetDailyWaterIntakeDocument, {
    variables: {
      userId: user?.id || '',
      logDate: date,
    },
    skip: !user?.id,
  });
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
 */
export function useCurrentMacroTargets() {
  const { user } = useAuth();

  return useQuery(GetCurrentMacroTargetsDocument, {
    variables: {
      userId: user?.id || '',
    },
    skip: !user?.id,
  });
}

/**
 * Get user streaks
 */
export function useUserStreaks() {
  const { user } = useAuth();

  return useQuery(GetUserStreaksDocument, {
    variables: {
      userId: user?.id || '',
    },
    skip: !user?.id,
  });
}

/**
 * Get personal records
 */
export function usePersonalRecords() {
  const { user } = useAuth();

  return useQuery(GetPersonalRecordsDocument, {
    variables: {
      userId: user?.id || '',
    },
    skip: !user?.id,
  });
}

/**
 * Calculate daily nutrition totals from meal items
 */
export function calculateDailyTotals(mealItems: any[]) {
  if (!mealItems || mealItems.length === 0) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      fiber: 0,
    };
  }

  return mealItems.reduce(
    (totals, item) => ({
      calories: totals.calories + (item.calories || 0),
      protein: totals.protein + (item.protein || 0),
      carbs: totals.carbs + (item.carbs || 0),
      fats: totals.fats + (item.fats || 0),
      fiber: totals.fiber + (item.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 }
  );
}
