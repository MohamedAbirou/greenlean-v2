/**
 * Comprehensive Progress Analytics
 * Inspired by old stats section but adapted for current schema
 * Combines weight tracking with nutrition & workout adherence
 */

import { Card } from '@/shared/components/ui/card';
import { Activity, Award, Calendar, Flame, Target, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { WeightDisplay } from '@/shared/components/display/WeightDisplay';
import { useUnitSystem } from '@/shared/hooks/useUnitSystem';

interface ProgressAnalyticsProps {
  weightHistory: any[];
  mealLogs: any[];
  workoutLogs: any[];
  targetWeight?: number;
  currentWeight?: number;
}

export function ProgressAnalytics({
  weightHistory,
  mealLogs,
  workoutLogs,
  targetWeight,
  currentWeight,
}: ProgressAnalyticsProps) {
  const unitSystem = useUnitSystem();

  // Calculate weekly summary
  const weeklySummary = useMemo(() => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const weekMeals = mealLogs.filter((log) => {
      const logDate = new Date(log.log_date || log.created_at);
      return logDate >= last7Days;
    });

    const weekWorkouts = workoutLogs.filter((log) => {
      const logDate = new Date(log.workout_date || log.created_at);
      return logDate >= last7Days;
    });

    const totalCalories = weekMeals.reduce((sum, log) => sum + (log.total_calories || 0), 0);
    const avgCaloriesPerDay = weekMeals.length > 0 ? Math.round(totalCalories / 7) : 0;

    const totalWorkoutMinutes = weekWorkouts.reduce(
      (sum, log) => sum + (log.duration_minutes || 0),
      0
    );

    return {
      mealsLogged: weekMeals.length,
      workoutsCompleted: weekWorkouts.length,
      avgCaloriesPerDay,
      totalWorkoutMinutes,
    };
  }, [mealLogs, workoutLogs]);

  // Calculate monthly highlights
  const monthlyHighlight = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const monthMeals = mealLogs.filter((log) => {
      const logDate = new Date(log.log_date || log.created_at);
      return logDate >= last30Days;
    });

    const monthWorkouts = workoutLogs.filter((log) => {
      const logDate = new Date(log.workout_date || log.created_at);
      return logDate >= last30Days;
    });

    // Calculate adherence (% of days with logs)
    const daysWithMeals = new Set(
      monthMeals.map((log) => log.log_date || new Date(log.created_at).toISOString().split('T')[0])
    ).size;
    const daysWithWorkouts = new Set(
      monthWorkouts.map((log) =>
        log.workout_date || new Date(log.created_at).toISOString().split('T')[0]
      )
    ).size;

    const mealAdherence = Math.round((daysWithMeals / 30) * 100);
    const workoutAdherence = Math.round((daysWithWorkouts / 30) * 100);

    // Weight change
    const sortedWeights = [...weightHistory].sort(
      (a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
    );
    const monthStart = sortedWeights.find((w) => new Date(w.log_date) >= last30Days);
    const monthEnd = sortedWeights[sortedWeights.length - 1];

    const weightChange = monthStart && monthEnd ? monthEnd.weight_kg - monthStart.weight_kg : 0;

    return {
      mealAdherence,
      workoutAdherence,
      weightChange: Number(weightChange.toFixed(1)),
      totalMeals: monthMeals.length,
      totalWorkouts: monthWorkouts.length,
    };
  }, [mealLogs, workoutLogs, weightHistory]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    const sortedLogs = [...mealLogs]
      .sort((a, b) => {
        const dateA = new Date(a.log_date || a.created_at);
        const dateB = new Date(b.log_date || b.created_at);
        return dateB.getTime() - dateA.getTime();
      });

    if (sortedLogs.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const loggedDates = new Set(
      sortedLogs.map((log) => {
        const date = new Date(log.log_date || log.created_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Check if today has logs
    if (!loggedDates.has(currentDate.getTime())) {
      currentDate.setDate(currentDate.getDate() - 1);
    }

    while (loggedDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }, [mealLogs]);

  // Weight progress vs target
  const weightProgress = useMemo(() => {
    if (!targetWeight || !currentWeight) return null;

    const startWeight = weightHistory[0]?.weight_kg || currentWeight;
    const totalToLose = Math.abs(startWeight - targetWeight);
    const lostSoFar = Math.abs(startWeight - currentWeight);
    const percentage = totalToLose > 0 ? Math.min((lostSoFar / totalToLose) * 100, 100) : 0;

    return {
      startWeight,
      currentWeight,
      targetWeight,
      totalToLose,
      lostSoFar,
      percentage: Math.round(percentage),
      remaining: Math.abs(currentWeight - targetWeight),
    };
  }, [weightHistory, targetWeight, currentWeight]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Progress Analytics</h2>

      {/* Hero Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current Streak */}
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/80 dark:bg-gray-900/80 rounded-lg">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Current Streak
            </span>
          </div>
          <p className="text-3xl font-bold text-foreground">{currentStreak}</p>
          <p className="text-sm text-muted-foreground">days in a row</p>
        </Card>

        {/* Weekly Summary */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-foreground/80">This Week</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{weeklySummary.mealsLogged}</p>
          <p className="text-sm text-muted-foreground">meals logged</p>
        </Card>

        {/* Workout Count */}
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <span className="text-sm font-medium text-foreground/80">Workouts</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{weeklySummary.workoutsCompleted}</p>
          <p className="text-sm text-muted-foreground">this week</p>
        </Card>

        {/* Weight Progress */}
        {weightProgress && (
          <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/80 dark:bg-gray-900/80 rounded-lg">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Goal Progress
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">{weightProgress.percentage}%</p>
            <p className="text-sm text-muted-foreground">
              <WeightDisplay valueKg={weightProgress.remaining} /> to go
            </p>
          </Card>
        )}
      </div>

      {/* Plan Adherence */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Adherence</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meal Adherence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Meal Logging</span>
              <span className="text-2xl font-bold text-foreground">{monthlyHighlight.mealAdherence}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyHighlight.mealAdherence}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {monthlyHighlight.totalMeals} meals logged this month
            </p>
          </div>

          {/* Workout Adherence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Workout Completion</span>
              <span className="text-2xl font-bold text-foreground">
                {monthlyHighlight.workoutAdherence}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyHighlight.workoutAdherence}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {monthlyHighlight.totalWorkouts} workouts completed this month
            </p>
          </div>
        </div>
      </Card>

      {/* Monthly Comparison */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">30-Day Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Weight Change</p>
            <div className="flex items-center justify-center gap-1">
              <p className={`text-2xl font-bold ${monthlyHighlight.weightChange < 0 ? 'text-green-600' : monthlyHighlight.weightChange > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {monthlyHighlight.weightChange > 0 ? '+' : ''}
                <WeightDisplay valueKg={Math.abs(monthlyHighlight.weightChange)} showUnit={false} />
              </p>
              <span className="text-sm text-muted-foreground">{unitSystem === 'imperial' ? 'lbs' : 'kg'}</span>
            </div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Avg Calories</p>
            <p className="text-2xl font-bold text-foreground">{weeklySummary.avgCaloriesPerDay}</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Workout Minutes</p>
            <p className="text-2xl font-bold text-foreground">{weeklySummary.totalWorkoutMinutes}</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Consistency</p>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className={`w-5 h-5 ${currentStreak >= 7 ? 'text-green-500' : 'text-orange-500'}`} />
              <p className="text-2xl font-bold text-foreground">
                {currentStreak >= 7 ? 'Great' : 'Good'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Insights */}
      {weightProgress && (
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 border-2 border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            <h3 className="text-lg font-semibold text-violet-900 dark:text-violet-100">
              Insights & Achievements
            </h3>
          </div>
          <div className="space-y-2">
            {currentStreak >= 7 && (
              <p className="text-sm text-violet-900 dark:text-violet-100">
                🔥 <strong>On Fire!</strong> You've logged for {currentStreak} days straight. Keep it up!
              </p>
            )}
            {monthlyHighlight.mealAdherence >= 80 && (
              <p className="text-sm text-violet-900 dark:text-violet-100">
                📊 <strong>Excellent Tracking!</strong> {monthlyHighlight.mealAdherence}% meal adherence this month.
              </p>
            )}
            {monthlyHighlight.workoutAdherence >= 70 && (
              <p className="text-sm text-violet-900 dark:text-violet-100">
                💪 <strong>Workout Warrior!</strong> You've completed {monthlyHighlight.workoutAdherence}% of your planned workouts.
              </p>
            )}
            {weightProgress.percentage >= 50 && (
              <p className="text-sm text-violet-900 dark:text-violet-100">
                🎯 <strong>Halfway There!</strong> You've achieved {weightProgress.percentage}% of your weight goal.
              </p>
            )}
            {monthlyHighlight.weightChange < 0 && (
              <p className="text-sm text-violet-900 dark:text-violet-100">
                📉 <strong>Progress!</strong> You've lost <WeightDisplay valueKg={Math.abs(monthlyHighlight.weightChange)} /> this month.
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
