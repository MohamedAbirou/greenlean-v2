import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { mealTrackingService } from '@/features/nutrition/api/mealTrackingService';
import { workoutTrackingService } from '@/features/workout/api/workoutTrackingService';

interface WeeklyComparisonProps {
  userId: string;
}

interface WeeklyStats {
  avgCalories: number;
  avgProtein: number;
  totalWorkouts: number;
  totalVolume: number;
}

export function WeeklyComparison({ userId }: WeeklyComparisonProps) {
  const [thisWeek, setThisWeek] = useState<WeeklyStats | null>(null);
  const [lastWeek, setLastWeek] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWeeklyData();
  }, [userId]);

  const loadWeeklyData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const dayOfWeek = today.getDay();

      // This week's start (Sunday)
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - dayOfWeek);

      // Last week's range
      const lastWeekEnd = new Date(thisWeekStart);
      lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);

      const thisWeekStats = await getWeekStats(thisWeekStart, today);
      const lastWeekStats = await getWeekStats(lastWeekStart, lastWeekEnd);

      setThisWeek(thisWeekStats);
      setLastWeek(lastWeekStats);
    } catch (error) {
      console.error('Failed to load weekly comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStats = async (startDate: Date, endDate: Date): Promise<WeeklyStats> => {
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // Get meals
    const mealsResult = await mealTrackingService.getDailyLogs(userId, startStr, endStr, 100, 0);
    const meals = mealsResult.data || [];

    const totalCalories = meals.reduce((sum, day) => sum + (day.total_calories || 0), 0);
    const totalProtein = meals.reduce((sum, day) => sum + (day.total_protein_g || 0), 0);
    const daysWithMeals = meals.length;

    // Get workouts
    const workoutsResult = await workoutTrackingService.getWorkoutHistory(
      userId,
      startStr,
      endStr,
      100,
      0
    );
    const workouts = workoutsResult.data || [];

    const totalVolume = workouts.reduce((sum, workout) => sum + (workout.total_volume_kg || 0), 0);

    return {
      avgCalories: daysWithMeals > 0 ? totalCalories / daysWithMeals : 0,
      avgProtein: daysWithMeals > 0 ? totalProtein / daysWithMeals : 0,
      totalWorkouts: workouts.length,
      totalVolume,
    };
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const renderChange = (current: number, previous: number, higherIsBetter = true) => {
    const change = calculateChange(current, previous);
    const isPositive = change > 0;
    const isBetter = higherIsBetter ? isPositive : !isPositive;

    if (Math.abs(change) < 1) {
      return (
        <Badge variant="outline" className="flex items-center space-x-1">
          <Minus className="h-3 w-3" />
          <span>No change</span>
        </Badge>
      );
    }

    return (
      <Badge
        variant={isBetter ? 'default' : 'destructive'}
        className={`flex items-center space-x-1 ${
          isBetter ? 'bg-green-500' : 'bg-red-500'
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{Math.abs(change).toFixed(0)}%</span>
      </Badge>
    );
  };

  if (loading || !thisWeek || !lastWeek) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-6 w-6 text-primary" />
        <h3 className="text-lg font-semibold">This Week vs Last Week</h3>
      </div>

      <div className="space-y-4">
        {/* Average Calories */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div>
            <div className="text-sm text-muted-foreground">Avg Daily Calories</div>
            <div className="text-2xl font-bold">{Math.round(thisWeek.avgCalories)}</div>
            <div className="text-xs text-muted-foreground">vs {Math.round(lastWeek.avgCalories)}</div>
          </div>
          {renderChange(thisWeek.avgCalories, lastWeek.avgCalories, false)}
        </motion.div>

        {/* Average Protein */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div>
            <div className="text-sm text-muted-foreground">Avg Daily Protein</div>
            <div className="text-2xl font-bold">{Math.round(thisWeek.avgProtein)}g</div>
            <div className="text-xs text-muted-foreground">vs {Math.round(lastWeek.avgProtein)}g</div>
          </div>
          {renderChange(thisWeek.avgProtein, lastWeek.avgProtein, true)}
        </motion.div>

        {/* Total Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div>
            <div className="text-sm text-muted-foreground">Workouts Completed</div>
            <div className="text-2xl font-bold">{thisWeek.totalWorkouts}</div>
            <div className="text-xs text-muted-foreground">vs {lastWeek.totalWorkouts}</div>
          </div>
          {renderChange(thisWeek.totalWorkouts, lastWeek.totalWorkouts, true)}
        </motion.div>

        {/* Total Volume */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between p-4 bg-muted rounded-lg"
        >
          <div>
            <div className="text-sm text-muted-foreground">Total Volume Lifted</div>
            <div className="text-2xl font-bold">{Math.round(thisWeek.totalVolume)}kg</div>
            <div className="text-xs text-muted-foreground">
              vs {Math.round(lastWeek.totalVolume)}kg
            </div>
          </div>
          {renderChange(thisWeek.totalVolume, lastWeek.totalVolume, true)}
        </motion.div>
      </div>
    </Card>
  );
}
