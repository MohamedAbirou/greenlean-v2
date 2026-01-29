/**
 * Stats Calculations
 * Pure functions for calculating statistics
 */

import type { DailyNutritionLog } from "@/shared/types/food.types";
import type { WorkoutSession } from "@/shared/types/workout";
import { addDays, differenceInDays, format, subDays } from "date-fns";
import type {
  AdherenceScore,
  AIMealPlan,
  AIWorkoutPlan,
  CalorieBalance,
  HydrationTrend,
  Insight,
  MacroDistribution,
  MealConsistency,
  MonthComparison,
  MonthlyHighlight,
  WaterIntakeLog,
  WeeklyEffort,
  WeeklySummary,
  WorkoutCalendarDay,
  WorkoutStats,
} from "../types/stats.types";

export function getDatesInRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(format(current, "yyyy-MM-dd"));
    current = addDays(current, 1);
  }
  return dates;
}

export function calculateStreak(
  nutritionLogs: DailyNutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutSession[],
  startDate: string,
  endDate: string
): number {
  const dates = getDatesInRange(startDate, endDate);
  let streak = 0;

  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    const hasNutrition = nutritionLogs.some((log) => log.log_date === date);
    const hasWater = waterLogs.some((log) => log.log_date === date);
    const hasWorkout = workoutLogs.some((log) => log.session_date === date);

    if (hasNutrition || hasWater || hasWorkout) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateWeeklySummary(
  nutritionLogs: DailyNutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutSession[],
  startDate: string,
  endDate: string
): WeeklySummary {
  const dates = getDatesInRange(startDate, endDate);

  const periodNutrition = nutritionLogs.filter((log) => dates.includes(log.log_date));
  const periodWater = waterLogs.filter((log) => dates.includes(log.log_date));
  const periodWorkouts = workoutLogs.filter((log) => dates.includes(log.session_date));

  const totalCalories = periodNutrition.reduce((sum, log) => sum + (log.total_calories || 0), 0);
  const avgCalories = dates.length > 0 ? totalCalories / dates.length : 0;

  const totalHydration = periodWater.reduce((sum, log) => sum + (log.glasses || 0), 0);
  const avgHydration = dates.length > 0 ? totalHydration / dates.length : 0;

  const daysActive = new Set([
    ...periodNutrition.map((l) => l.log_date),
    ...periodWater.map((l) => l.log_date),
    ...periodWorkouts.map((l) => l.session_date),
  ]).size;

  return {
    totalCalories: Math.round(totalCalories),
    avgCalories: Math.round(avgCalories),
    workoutsCompleted: periodWorkouts.filter((w) => w.status === "completed").length,
    avgHydration: Math.round(avgHydration * 10) / 10,
    daysActive,
  };
}

export function calculateMonthlyHighlight(
  nutritionLogs: DailyNutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutSession[],
  startDate: string,
  endDate: string
): MonthlyHighlight {
  const dates = getDatesInRange(startDate, endDate);
  let bestWeekStart = 0;
  let bestWeekScore = 0;

  const windowSize = Math.min(7, dates.length);

  for (let i = 0; i <= dates.length - windowSize; i++) {
    const weekDates = dates.slice(i, i + windowSize);
    const score = weekDates.filter(
      (date) =>
        nutritionLogs.some((l) => l.log_date === date) ||
        waterLogs.some((l) => l.log_date === date) ||
        workoutLogs.some((l) => l.session_date === date)
    ).length;

    if (score > bestWeekScore) {
      bestWeekScore = score;
      bestWeekStart = i;
    }
  }

  const startHighlight = dates[bestWeekStart];
  const endHighlight = dates[bestWeekStart + windowSize - 1];

  return {
    title: "Most Active Period",
    description: `${format(new Date(startHighlight), "MMM d")} - ${format(new Date(endHighlight), "MMM d")}`,
    value: `${bestWeekScore}/${windowSize} days`,
    icon: "trophy",
  };
}

export function calculateCalorieBalance(
  nutritionLogs: DailyNutritionLog[],
  mealPlan: AIMealPlan | null,
  startDate: string,
  endDate: string
): CalorieBalance[] {
  const dates = getDatesInRange(startDate, endDate);
  const goal = mealPlan?.daily_calories || 2000;

  return dates.map((date) => {
    const dayLogs = nutritionLogs.filter((log) => log.log_date === date);
    const consumed = dayLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0);

    return { date, consumed, goal };
  });
}

export function calculateMacroDistribution(
  nutritionLogs: DailyNutritionLog[],
  startDate: string,
  endDate: string
): MacroDistribution[] {
  const dates = getDatesInRange(startDate, endDate);

  return dates
    .map((date) => {
      const dayLogs = nutritionLogs.filter((log) => log.log_date === date);
      if (dayLogs.length === 0) return null;

      const protein = dayLogs.reduce((sum, log) => sum + Number(log.total_protein || 0), 0);
      const carbs = dayLogs.reduce((sum, log) => sum + Number(log.total_carbs || 0), 0);
      const fats = dayLogs.reduce((sum, log) => sum + Number(log.total_fats || 0), 0);

      return { date, protein, carbs, fats };
    })
    .filter((item): item is MacroDistribution => item !== null);
}

export function calculateMealConsistency(
  nutritionLogs: DailyNutritionLog[],
  startDate: string,
  endDate: string
): MealConsistency[] {
  const dates = getDatesInRange(startDate, endDate);
  const expectedMeals = 3; // breakfast, lunch, dinner

  return dates.map((date) => {
    const dayLogs = nutritionLogs.filter((log) => log.log_date === date);
    const uniqueMealTypes = new Set(dayLogs.map((log) => log.meal_type)).size;

    return {
      date,
      mealsLogged: uniqueMealTypes,
      expectedMeals,
    };
  });
}

export function calculateHydrationTrends(
  waterLogs: WaterIntakeLog[],
  startDate: string,
  endDate: string
): HydrationTrend[] {
  const dates = getDatesInRange(startDate, endDate);
  const goal = 8; // 8 glasses per day

  return dates.map((date) => {
    const log = waterLogs.find((l) => l.log_date === date);
    return {
      date,
      glasses: log?.glasses || 0,
      goal,
    };
  });
}

export function calculateHydrationInsights(
  waterLogs: WaterIntakeLog[],
  startDate: string,
  endDate: string
) {
  const dates = getDatesInRange(startDate, endDate);
  const length = dates.length;
  const goal = 8;

  const previousEnd = format(subDays(new Date(startDate), 1), "yyyy-MM-dd");
  const previousStart = format(subDays(new Date(previousEnd), length - 1), "yyyy-MM-dd");
  const previousDates = getDatesInRange(previousStart, previousEnd);

  const currentLogs = waterLogs.filter((l) => dates.includes(l.log_date));
  const lastMonthLogs = waterLogs.filter((l) => previousDates.includes(l.log_date));

  // Best day
  let bestDay = { date: "", glasses: 0 };
  currentLogs.forEach((log) => {
    if (log.glasses > bestDay.glasses) {
      bestDay = { date: log.log_date, glasses: log.glasses };
    }
  });

  // Current streak
  let currentStreak = 0;
  for (let i = dates.length - 1; i >= 0; i--) {
    const log = currentLogs.find((l) => l.log_date === dates[i]);
    if (log && log.glasses >= goal) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Averages
  const currentSum = currentLogs.reduce((sum, l) => sum + l.glasses, 0);
  const avgGlassesPerDay = length > 0 ? currentSum / length : 0;

  const lastSum = lastMonthLogs.reduce((sum, l) => sum + l.glasses, 0);
  const lastMonthAvg = length > 0 ? lastSum / length : 0;

  return {
    bestDay,
    currentStreak,
    avgGlassesPerDay: Math.round(avgGlassesPerDay * 10) / 10,
    lastMonthAvg: Math.round(lastMonthAvg * 10) / 10,
  };
}

export function calculateWorkoutCalendar(
  workoutLogs: WorkoutSession[],
  startDate: string,
  endDate: string
): WorkoutCalendarDay[] {
  const dates = getDatesInRange(startDate, endDate);

  return dates.map((date) => {
    const workout = workoutLogs.find((w) => w.session_date === date);
    return {
      date,
      workoutType: workout?.workout_type || null,
      duration: workout?.duration_minutes || 0,
      caloriesBurned: workout?.calories_burned || 0,
    };
  });
}

export function calculateWorkoutStats(
  workoutLogs: WorkoutSession[],
  startDate: string,
  endDate: string
): WorkoutStats {
  const dates = getDatesInRange(startDate, endDate);
  const periodWorkouts = workoutLogs.filter((w) => dates.includes(w.session_date));

  const totalWorkouts = periodWorkouts.length;
  const totalMinutes = periodWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
  const totalCaloriesBurned = periodWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

  const avgCaloriesPerSession = totalWorkouts > 0 ? totalCaloriesBurned / totalWorkouts : 0;

  // Most common type
  const typeCounts: Record<string, number> = {};
  periodWorkouts.forEach((w) => {
    typeCounts[w.workout_type] = (typeCounts[w.workout_type] || 0) + 1;
  });
  const mostCommonType =
    Object.keys(typeCounts).length > 0
      ? Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : "None";

  const longestWorkout = Math.max(...periodWorkouts.map((w) => w.duration_minutes || 0), 0);

  return {
    totalWorkouts,
    totalMinutes,
    totalCaloriesBurned,
    avgCaloriesPerSession: Math.round(avgCaloriesPerSession),
    mostCommonType,
    longestWorkout,
  };
}

export function calculateWeeklyEffort(
  workoutLogs: WorkoutSession[],
  startDate: string,
  endDate: string
): WeeklyEffort[] {
  const weeks: WeeklyEffort[] = [];
  const end = new Date(endDate);
  const start = new Date(startDate);
  const diffDays = differenceInDays(end, start);
  const numWeeks = Math.ceil((diffDays + 1) / 7);

  for (let i = 0; i < numWeeks; i++) {
    const weekEnd = subDays(end, i * 7);
    const weekStart = addDays(weekEnd, -6);
    const effectiveWeekStart = weekStart < start ? start : weekStart;

    const weekWorkouts = workoutLogs.filter((w) => {
      const date = new Date(w.session_date);
      return date >= effectiveWeekStart && date <= weekEnd;
    });

    const totalMinutes = weekWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const totalCalories = weekWorkouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);

    weeks.unshift({
      week: format(weekStart, "MMM d"),
      totalMinutes,
      totalCalories,
    });
  }

  return weeks;
}

export function calculateDietAdherence(
  nutritionLogs: DailyNutritionLog[],
  mealPlan: AIMealPlan | null,
  startDate: string,
  endDate: string
): AdherenceScore {
  const dates = getDatesInRange(startDate, endDate);
  const goal = mealPlan?.daily_calories || 2000;
  const tolerance = 200; // +/- 200 calories is acceptable

  const dailyScores = dates.map((date) => {
    const dayLogs = nutritionLogs.filter((log) => log.log_date === date);
    if (dayLogs.length === 0) return { date, score: 0 };

    const consumed = dayLogs.reduce((sum, log) => sum + (log.total_calories || 0), 0);
    const diff = Math.abs(consumed - goal);
    const score = diff <= tolerance ? 100 : Math.max(0, 100 - (diff - tolerance) / 10);

    return { date, score: Math.round(score) };
  });

  const overall =
    dailyScores.length > 0
      ? Math.round(dailyScores.reduce((sum, d) => sum + d.score, 0) / dailyScores.length)
      : 0;

  // Weekly trend
  const numWeeks = Math.ceil(dates.length / 7);
  const weeklyTrend: number[] = [];
  for (let i = 0; i < numWeeks; i++) {
    const weekScores = dailyScores.slice(i * 7, (i + 1) * 7);
    const weekAvg =
      weekScores.length > 0
        ? Math.round(weekScores.reduce((sum, d) => sum + d.score, 0) / weekScores.length)
        : 0;
    weeklyTrend.push(weekAvg);
  }

  return { overall, dailyScores, weeklyTrend };
}

export function calculateWorkoutAdherence(
  workoutLogs: WorkoutSession[],
  workoutPlan: AIWorkoutPlan | null,
  startDate: string,
  endDate: string
): AdherenceScore {
  const dates = getDatesInRange(startDate, endDate);
  const plannedPerWeek = workoutPlan?.plan_data?.weekly_summary?.total_workout_days || 3;

  const dailyScores = dates.map((date) => {
    const hasWorkout = workoutLogs.some((w) => w.session_date === date && w.status === "completed");
    return { date, score: hasWorkout ? 100 : 0 };
  });

  // Weekly trend
  const numWeeks = Math.ceil(dates.length / 7);
  const weeklyTrend: number[] = [];
  for (let i = 0; i < numWeeks; i++) {
    const weekDates = dates.slice(i * 7, (i + 1) * 7);
    const weekWorkouts = workoutLogs.filter(
      (w) => weekDates.includes(w.session_date) && w.status === "completed"
    ).length;
    const adherence = Math.min(100, (weekWorkouts / plannedPerWeek) * 100);
    weeklyTrend.push(Math.round(adherence));
  }

  const overall =
    weeklyTrend.length > 0
      ? Math.round(weeklyTrend.reduce((sum, v) => sum + v, 0) / weeklyTrend.length)
      : 0;

  return { overall, dailyScores, weeklyTrend };
}

export function calculateMonthComparisons(
  nutritionLogs: DailyNutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutSession[],
  startDate: string,
  endDate: string
) {
  const dates = getDatesInRange(startDate, endDate);
  const length = dates.length;

  const previousEnd = format(subDays(new Date(startDate), 1), "yyyy-MM-dd");
  const previousStart = format(subDays(new Date(previousEnd), length - 1), "yyyy-MM-dd");
  const previousDates = getDatesInRange(previousStart, previousEnd);

  // Nutrition comparisons
  const thisNutrition = nutritionLogs.filter((l) => dates.includes(l.log_date));
  const lastNutrition = nutritionLogs.filter((l) => previousDates.includes(l.log_date));

  const thisAvgCal =
    length > 0 ? thisNutrition.reduce((sum, l) => sum + l.total_calories, 0) / length : 0;
  const lastAvgCal =
    length > 0 ? lastNutrition.reduce((sum, l) => sum + l.total_calories, 0) / length : 0;

  const nutrition: MonthComparison[] = [
    {
      metric: "Avg Daily Calories",
      thisMonth: Math.round(thisAvgCal),
      lastMonth: Math.round(lastAvgCal),
      change: lastAvgCal > 0 ? Math.round(((thisAvgCal - lastAvgCal) / lastAvgCal) * 100) : 0,
      unit: "cal",
    },
    {
      metric: "Days Logged",
      thisMonth: thisNutrition.length,
      lastMonth: lastNutrition.length,
      change:
        lastNutrition.length > 0
          ? Math.round(((thisNutrition.length - lastNutrition.length) / lastNutrition.length) * 100)
          : 0,
      unit: "days",
    },
  ];

  // Hydration comparisons
  const thisWater = waterLogs.filter((l) => dates.includes(l.log_date));
  const lastWater = waterLogs.filter((l) => previousDates.includes(l.log_date));

  const thisAvgGlasses = length > 0 ? thisWater.reduce((sum, l) => sum + l.glasses, 0) / length : 0;
  const lastAvgGlasses = length > 0 ? lastWater.reduce((sum, l) => sum + l.glasses, 0) / length : 0;

  const hydration: MonthComparison[] = [
    {
      metric: "Avg Glasses/Day",
      thisMonth: Math.round(thisAvgGlasses * 10) / 10,
      lastMonth: Math.round(lastAvgGlasses * 10) / 10,
      change:
        lastAvgGlasses > 0
          ? Math.round(((thisAvgGlasses - lastAvgGlasses) / lastAvgGlasses) * 100)
          : 0,
      unit: "glasses",
    },
  ];

  // Fitness comparisons
  const thisWorkouts = workoutLogs.filter((w) => dates.includes(w.session_date));
  const lastWorkouts = workoutLogs.filter((w) => previousDates.includes(w.session_date));

  const thisTotalMin = thisWorkouts.reduce((sum, w) => sum + w.duration_minutes!, 0);
  const lastTotalMin = lastWorkouts.reduce((sum, w) => sum + w.duration_minutes!, 0);

  const fitness: MonthComparison[] = [
    {
      metric: "Total Minutes",
      thisMonth: thisTotalMin,
      lastMonth: lastTotalMin,
      change:
        lastTotalMin > 0 ? Math.round(((thisTotalMin - lastTotalMin) / lastTotalMin) * 100) : 0,
      unit: "min",
    },
    {
      metric: "Workouts Completed",
      thisMonth: thisWorkouts.length,
      lastMonth: lastWorkouts.length,
      change:
        lastWorkouts.length > 0
          ? Math.round(((thisWorkouts.length - lastWorkouts.length) / lastWorkouts.length) * 100)
          : 0,
      unit: "workouts",
    },
  ];

  return { nutrition, hydration, fitness };
}

export function generateInsights(
  nutritionLogs: DailyNutritionLog[],
  waterLogs: WaterIntakeLog[],
  workoutLogs: WorkoutSession[],
  startDate: string,
  endDate: string
): Insight[] {
  const insights: Insight[] = [];

  const dates = getDatesInRange(startDate, endDate);
  const length = dates.length;

  const previousEnd = format(subDays(new Date(startDate), 1), "yyyy-MM-dd");
  const previousStart = format(subDays(new Date(previousEnd), length - 1), "yyyy-MM-dd");
  const previousDates = getDatesInRange(previousStart, previousEnd);

  // Weekend logging pattern
  const weekendDates = dates.filter((date) => {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  });
  const weekdayDates = dates.filter((date) => {
    const day = new Date(date).getDay();
    return day !== 0 && day !== 6;
  });

  const weekendLogs = nutritionLogs.filter((l) => weekendDates.includes(l.log_date)).length;
  const weekdayLogs = nutritionLogs.filter((l) => weekdayDates.includes(l.log_date)).length;

  if (weekdayLogs > weekendLogs * 2) {
    insights.push({
      id: "weekend-logging",
      type: "warning",
      title: "Weekend Logging Gap",
      description: "You log fewer meals on weekends. Try meal prep to stay consistent!",
    });
  }

  // Hydration on workout days
  const workoutDates = workoutLogs.map((w) => w.session_date).filter((d) => dates.includes(d));
  const waterOnWorkoutDays = waterLogs.filter((l) => workoutDates.includes(l.log_date));
  const avgWaterWorkout =
    waterOnWorkoutDays.length > 0
      ? waterOnWorkoutDays.reduce((sum, l) => sum + l.glasses, 0) / waterOnWorkoutDays.length
      : 0;

  const allWaterLogs = waterLogs.filter((l) => dates.includes(l.log_date));
  const allWaterAvg =
    allWaterLogs.length > 0 ? allWaterLogs.reduce((sum, l) => sum + l.glasses, 0) / length : 0;

  if (avgWaterWorkout > allWaterAvg * 1.2) {
    insights.push({
      id: "hydration-workout",
      type: "success",
      title: "Great Hydration Habit",
      description: "You drink more water on workout days - keep it up!",
    });
  }

  // Calorie burn progress
  const thisBurn = workoutLogs
    .filter((w) => dates.includes(w.session_date))
    .reduce((sum, w) => sum + w.calories_burned!, 0);
  const lastBurn = workoutLogs
    .filter((w) => previousDates.includes(w.session_date))
    .reduce((sum, w) => sum + w.calories_burned!, 0);

  if (thisBurn > lastBurn * 1.1) {
    insights.push({
      id: "calorie-progress",
      type: "success",
      title: "Impressive Progress",
      description: `You've burned ${thisBurn - lastBurn} more calories this period!`,
    });
  }

  // Consistency insight
  const streak = calculateStreak(nutritionLogs, waterLogs, workoutLogs, startDate, endDate);
  if (streak >= 7) {
    insights.push({
      id: "consistency",
      type: "success",
      title: `${streak}-Day Streak!`,
      description: "Your consistency is paying off. Don't break the chain!",
    });
  }

  return insights;
}
