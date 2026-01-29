/**
 * Stats Types
 * Type definitions for stats dashboard
 */

export interface WaterIntakeLog {
  id: string;
  user_id: string;
  log_date: string;
  glasses: number;
  total_ml: number;
  created_at: string;
  updated_at: string;
}

export interface AIMealPlan {
  id: string;
  user_id: string;
  daily_calories: number;
  is_active: boolean;
  generated_at: string;
}

export interface AIWorkoutPlan {
  id: string;
  user_id: string;
  plan_data: PlanData;
  is_active: boolean;
  generated_at: string;
}

interface PlanData {
  weekly_summary: {
    total_workout_days: number;
  };
}

// Aggregated Stats
export interface DailyNutritionStats {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealsLogged: number;
}

export interface WeeklySummary {
  totalCalories: number;
  avgCalories: number;
  workoutsCompleted: number;
  avgHydration: number;
  daysActive: number;
}

export interface MonthlyHighlight {
  title: string;
  description: string;
  value: string;
  icon: string;
}

export interface CalorieBalance {
  date: string;
  consumed: number;
  goal: number;
}

export interface MacroDistribution {
  date: string;
  protein: number;
  carbs: number;
  fats: number;
}

export interface MealConsistency {
  date: string;
  mealsLogged: number;
  expectedMeals: number;
}

export interface HydrationTrend {
  date: string;
  glasses: number;
  goal: number;
}

export interface WorkoutCalendarDay {
  date: string;
  workoutType: string | null;
  duration: number;
  caloriesBurned: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalMinutes: number;
  totalCaloriesBurned: number;
  avgCaloriesPerSession: number;
  mostCommonType: string;
  longestWorkout: number;
}

export interface WeeklyEffort {
  week: string;
  totalMinutes: number;
  totalCalories: number;
}

export interface AdherenceScore {
  overall: number;
  dailyScores: { date: string; score: number }[];
  weeklyTrend: number[];
}

export interface MonthComparison {
  metric: string;
  thisMonth: number;
  lastMonth: number;
  change: number;
  unit: string;
}

export interface Insight {
  id: string;
  type: "success" | "warning" | "info";
  title: string;
  description: string;
}

export interface StatsData {
  // Hero Summary
  currentStreak: number;
  weeklySummary: WeeklySummary;
  monthlyHighlight: MonthlyHighlight;

  // Nutrition
  calorieBalance: CalorieBalance[];
  macroDistribution: MacroDistribution[];
  mealConsistency: MealConsistency[];
  avgMacros: { protein: number; carbs: number; fats: number };

  // Hydration
  hydrationTrends: HydrationTrend[];
  hydrationInsights: {
    bestDay: { date: string; glasses: number };
    currentStreak: number;
    avgGlassesPerDay: number;
    lastMonthAvg: number;
  };

  // Workouts
  workoutCalendar: WorkoutCalendarDay[];
  workoutStats: WorkoutStats;
  weeklyEffort: WeeklyEffort[];

  // Adherence
  dietAdherence: AdherenceScore;
  workoutAdherence: AdherenceScore;

  // Comparisons
  monthComparisons: {
    nutrition: MonthComparison[];
    hydration: MonthComparison[];
    fitness: MonthComparison[];
  };

  // Insights
  insights: Insight[];
}

export type TimeRange = "7d" | "30d" | "90d";
