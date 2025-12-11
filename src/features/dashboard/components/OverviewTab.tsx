/**
 * Overview Tab - MyFitnessPal-level UI
 * Production-grade dashboard with rich data
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { Flame, Dumbbell, Award } from 'lucide-react';
import { DateScroller } from './DateScroller';
import { MacroRing } from './MacroRing';
import {
  useMealItemsByDate,
  useWorkoutSessionsByDate,
  useCurrentMacroTargets,
  useUserStreaks,
  calculateDailyTotals,
} from '../hooks/useDashboardData';

const getToday = () => new Date().toISOString().split('T')[0];

export function OverviewTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data: mealData, loading: mealsLoading } = useMealItemsByDate(selectedDate);
  const { data: workoutData } = useWorkoutSessionsByDate(selectedDate);
  const { data: targetsData } = useCurrentMacroTargets();
  const { data: streaksData } = useUserStreaks();

  const nutritionLogs = (mealData as any)?.daily_nutrition_logsCollection?.edges?.map((e: any) => e.node) || [];
  const dailyTotals = calculateDailyTotals(nutritionLogs);

  const workoutLogs = (workoutData as any)?.workout_logsCollection?.edges?.map((e: any) => e.node) || [];
  const completedWorkouts = workoutLogs.filter((w: any) => w.completed === true).length;

  const targets = (targetsData as any)?.user_macro_targetsCollection?.edges?.[0]?.node;
  const goals = {
    calories: targets?.daily_calories || 2000,
    protein: targets?.daily_protein_g || 150,
    carbs: targets?.daily_carbs_g || 200,
    fats: targets?.daily_fats_g || 60,
    water: targets?.daily_water_ml || 2000,
  };

  const nutritionStreak = (streaksData as any)?.user_streaksCollection?.edges?.find(
    (e: any) => e.node.streak_type === 'nutrition_logging'
  )?.node;

  const caloriesRemaining = goals.calories - dailyTotals.calories;
  const caloriesPercentage = (dailyTotals.calories / goals.calories) * 100;

  // Group meals by type
  const mealsByType = nutritionLogs.reduce((acc: any, log: any) => {
    const type = log.meal_type || 'other';
    if (!acc[type]) acc[type] = { items: [], totals: { calories: 0, protein: 0, carbs: 0, fats: 0 } };
    acc[type].items.push(log);
    acc[type].totals.calories += log.total_calories || 0;
    acc[type].totals.protein += log.total_protein || 0;
    acc[type].totals.carbs += log.total_carbs || 0;
    acc[type].totals.fats += log.total_fats || 0;
    return acc;
  }, {});

  const mealTypeIcons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '🌞',
    dinner: '🌙',
    snack: '🍎',
  };

  if (mealsLoading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Scroller */}
      <DateScroller selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Calories Summary Card */}
      <Card variant="elevated" className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Daily Calories</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate === getToday() ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
            <Badge variant={caloriesPercentage > 100 ? 'error' : caloriesPercentage > 85 ? 'success' : 'primary'} className="text-sm">
              {Math.round(caloriesPercentage)}%
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{Math.round(dailyTotals.calories)}</p>
              <p className="text-xs text-muted-foreground">Consumed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{Math.round(goals.calories)}</p>
              <p className="text-xs text-muted-foreground">Goal</p>
            </div>
            <div className="text-center">
              <p className={`text-3xl font-bold ${caloriesRemaining >= 0 ? 'text-success' : 'text-error'}`}>
                {Math.abs(Math.round(caloriesRemaining))}
              </p>
              <p className="text-xs text-muted-foreground">{caloriesRemaining >= 0 ? 'Remaining' : 'Over'}</p>
            </div>
          </div>

          <Progress value={Math.min(caloriesPercentage, 100)} className="h-3" />
        </div>
      </Card>

      {/* Macro Rings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary-500" />
            Macronutrients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <MacroRing current={dailyTotals.protein} goal={goals.protein} color="#8b5cf6" size={100} />
              <p className="text-sm font-medium mt-2">Protein</p>
              <p className="text-xs text-muted-foreground">{Math.round(goals.protein - dailyTotals.protein)}g left</p>
            </div>
            <div className="flex flex-col items-center">
              <MacroRing current={dailyTotals.carbs} goal={goals.carbs} color="#22c55e" size={100} />
              <p className="text-sm font-medium mt-2">Carbs</p>
              <p className="text-xs text-muted-foreground">{Math.round(goals.carbs - dailyTotals.carbs)}g left</p>
            </div>
            <div className="flex flex-col items-center">
              <MacroRing current={dailyTotals.fats} goal={goals.fats} color="#f59e0b" size={100} />
              <p className="text-sm font-medium mt-2">Fats</p>
              <p className="text-xs text-muted-foreground">{Math.round(goals.fats - dailyTotals.fats)}g left</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meals Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Today's Meals</CardTitle>
            <Button onClick={() => navigate('/dashboard/log-meal')} variant="primary" size="sm">
              + Log Meal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {Object.keys(mealsByType).length > 0 ? (
            <div className="space-y-3">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => {
                const meal = mealsByType[type];
                if (!meal) return null;

                return (
                  <div key={type} className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{mealTypeIcons[type]}</span>
                        <div>
                          <p className="font-semibold capitalize">{type}</p>
                          <p className="text-xs text-muted-foreground">{meal.items.length} items</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{Math.round(meal.totals.calories)} cal</p>
                        <p className="text-xs text-muted-foreground">
                          P: {Math.round(meal.totals.protein)}g • C: {Math.round(meal.totals.carbs)}g • F: {Math.round(meal.totals.fats)}g
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No meals logged yet</p>
              <Button onClick={() => navigate('/dashboard/log-meal')} variant="outline">
                Log Your First Meal
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary-500" />
              Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{completedWorkouts}</p>
                <p className="text-sm text-muted-foreground">Completed today</p>
              </div>
              <Button onClick={() => navigate('/dashboard/log-workout')} variant="outline" size="sm">
                Log Workout
              </Button>
            </div>
          </CardContent>
        </Card>

        {nutritionStreak && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-500" />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">🔥</span>
                    <p className="text-3xl font-bold">{nutritionStreak.current_streak}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Longest: {nutritionStreak.longest_streak} days
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button onClick={() => navigate('/dashboard/log-meal')} variant="primary" size="lg" fullWidth className="h-20">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🍎</span>
            <span className="text-sm font-medium">Log Meal</span>
          </div>
        </Button>
        <Button onClick={() => navigate('/dashboard/log-workout')} variant="secondary" size="lg" fullWidth className="h-20">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">💪</span>
            <span className="text-sm font-medium">Log Workout</span>
          </div>
        </Button>
        <Button onClick={() => {}} variant="accent" size="lg" fullWidth className="h-20">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">⚖️</span>
            <span className="text-sm font-medium">Log Weight</span>
          </div>
        </Button>
        <Button onClick={() => {}} variant="outline" size="lg" fullWidth className="h-20">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">💧</span>
            <span className="text-sm font-medium">Add Water</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
