/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Overview Tab - 2026 INSANE Modern UI/UX
 * Premium dashboard experience with engaging stats and quick actions
 * UPDATED: Now uses real macro targets and calculated progress
 */

import { useAuth } from '@/features/auth';
import type { FoodItem } from '@/features/nutrition/api/usdaService';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import { Activity, Apple, Calendar, Dumbbell, Flame, Minus, Sparkles, Target, TrendingDown, TrendingUp, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateDailyTotals, useActiveWorkoutPlan, useCurrentMacroTargets, useMealItemsByDate, useWorkoutSessionsByDate } from '../hooks/useDashboardData';

const getToday = () => new Date().toISOString().split('T')[0];

export function OverviewTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate] = useState(getToday());

  // Fetch today's data
  const { data: mealData } = useMealItemsByDate(selectedDate);
  const { data: workoutData } = useWorkoutSessionsByDate(selectedDate);

  // Fetch REAL macro targets from database
  const { data: macroTargetsData, loading: macroLoading } = useCurrentMacroTargets();

  // Fetch active workout plan
  const { data: workoutPlanData } = useActiveWorkoutPlan();
  const activeWorkoutPlan = (workoutPlanData as any)?.ai_workout_plansCollection?.edges?.[0]?.node;
  const planData = activeWorkoutPlan?.plan_data
    ? (typeof activeWorkoutPlan.plan_data === 'string' ? JSON.parse(activeWorkoutPlan.plan_data) : activeWorkoutPlan.plan_data)
    : null;

  // Parse nutrition data
  const nutritionLogs = (mealData as any)?.daily_nutrition_logsCollection?.edges?.map((e: any) => e.node) || [];
  const dailyTotals = calculateDailyTotals(nutritionLogs);

  // Parse workout data
  const workoutLogs = (workoutData as any)?.workout_logsCollection?.edges?.map((e: any) => e.node) || [];
  const totalWorkouts = workoutLogs.length;
  const totalDuration = workoutLogs.reduce((sum: number, w: any) => sum + (w.duration_minutes || 0), 0);
  const totalCaloriesBurned = workoutLogs.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0);

  // Get REAL macro targets from database (no more hardcoded values!)
  const macroTargets = macroTargetsData?.user_macro_targetsCollection?.edges?.[0]?.node;
  const calorieGoal = macroTargets?.daily_calories || 2000;
  const proteinGoal = macroTargets?.daily_protein_g || 150;
  const carbsGoal = macroTargets?.daily_carbs_g || 200;
  const fatsGoal = macroTargets?.daily_fats_g || 60;
  const workoutGoal = planData?.weekly_summary.total_time_minutes; // minutes

  // Calculate progress percentages
  const calorieProgress = Math.min((dailyTotals.calories / calorieGoal) * 100, 100);
  const proteinProgress = Math.min((dailyTotals.protein / proteinGoal) * 100, 100);
  const carbsProgress = Math.min((dailyTotals.carbs / carbsGoal) * 100, 100);
  const fatsProgress = Math.min((dailyTotals.fats / fatsGoal) * 100, 100);
  const workoutProgress = Math.min((totalDuration / workoutGoal) * 100, 100);

  // Calculate net energy
  const netCalories = Math.round(dailyTotals.calories - totalCaloriesBurned);

  const mealTypeConfig: Record<string, { emoji: string; gradient: string; bg: string }> = {
    breakfast: { emoji: '🌅', gradient: 'from-orange-500 to-yellow-500', bg: 'from-orange-50 to-yellow-50 dark:from-orange-950/50 dark:to-yellow-950/50' },
    lunch: { emoji: '🌞', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50' },
    dinner: { emoji: '🌙', gradient: 'from-blue-500 to-purple-500', bg: 'from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50' },
    snack: { emoji: '🍎', gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50' },
  };

  const parseFoodItems = (foodItems: any): FoodItem[] => {
    if (Array.isArray(foodItems)) return foodItems;
    if (typeof foodItems === 'string') {
      try {
        return JSON.parse(foodItems);
      } catch (e) {
        console.error(e);
        return [];
      }
    }
    return [];
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Premium Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600 p-10 text-white shadow-2xl border border-primary-400/20">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <span className="text-xs font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-3 flex items-center gap-3">
            Welcome back, {user?.email?.split('@')[0] || 'Champion'}!
            <Trophy className="h-10 w-10 text-yellow-300 drop-shadow-lg" />
          </h1>

          <p className="text-primary-100 text-xl mb-8 max-w-2xl leading-relaxed">
            Let's make today count. Track your progress and smash your goals! 💪
          </p>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/dashboard/log-meal')}
              className="bg-white text-primary-600 hover:bg-primary-50 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-6 py-6 text-base"
              size="lg"
            >
              <Apple className="h-5 w-5 mr-2" />
              Log Meal
            </Button>
            <Button
              onClick={() => navigate('/dashboard/log-workout')}
              className="bg-white/20 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/30 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-6 py-6 text-base"
              size="lg"
            >
              <Dumbbell className="h-5 w-5 mr-2" />
              Log Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Progress Rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nutrition Ring - NOW WITH REAL DATA */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-green-500/50 to-emerald-500/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="pt-8 pb-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                    <Apple className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">Nutrition</p>
                </div>
                <h3 className="text-4xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {Math.round(dailyTotals.calories)}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  of {calorieGoal} cal goal
                </p>
                {macroLoading && (
                  <p className="text-xs text-muted-foreground mt-1">Loading targets...</p>
                )}
              </div>

              {/* Enhanced Circular Progress */}
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90" width="96" height="96">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/10"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#greenGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - calorieProgress / 100)}`}
                    className="transition-all duration-500 drop-shadow-lg"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                      <stop offset="100%" stopColor="rgb(16, 185, 129)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(calorieProgress)}%</span>
                </div>
              </div>
            </div>

            {/* Macros Grid - WITH REAL TARGETS AND PROGRESS */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Protein</p>
                <p className="text-base font-bold text-blue-500">
                  {Math.round(dailyTotals.protein)}g
                </p>
                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{proteinGoal}g goal</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Carbs</p>
                <p className="text-base font-bold text-amber-500">
                  {Math.round(dailyTotals.carbs)}g
                </p>
                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(carbsProgress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{carbsGoal}g goal</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Fats</p>
                <p className="text-base font-bold text-purple-500">
                  {Math.round(dailyTotals.fats)}g
                </p>
                <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min(fatsProgress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{fatsGoal}g goal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Ring */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-purple-500/50  to-pink-500/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="pt-8 pb-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <Dumbbell className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">Workout</p>
                </div>
                <h3 className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {totalDuration}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  of {workoutGoal} min goal
                </p>
              </div>

              {/* Enhanced Circular Progress */}
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90" width="96" height="96">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted/10"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#purpleGradient)"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - workoutProgress / 100)}`}
                    className="transition-all duration-500 drop-shadow-lg"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgb(168, 85, 247)" />
                      <stop offset="100%" stopColor="rgb(236, 72, 153)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{Math.round(workoutProgress)}%</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Sessions</p>
                <p className="text-base font-bold">{totalWorkouts}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Burned</p>
                <p className="text-base font-bold text-orange-600">{totalCaloriesBurned} cal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Balance - WITH REAL CALCULATIONS */}
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-orange-500/50 to-red-500/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
          <CardContent className="pt-8 pb-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">Net Energy</p>
                </div>
                <h3 className="text-4xl font-bold bg-gradient-to-br from-orange-600 to-red-600 bg-clip-text text-transparent">
                  {netCalories >= 0 ? '+' : ''}{netCalories}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  net calories
                </p>
              </div>

              {/* Status Indicator */}
              <div className="text-center">
                {dailyTotals.calories > totalCaloriesBurned ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="bg-green-500/10 text-green-700 border-green-500/20 font-semibold">
                      Surplus
                    </Badge>
                  </div>
                ) : dailyTotals.calories < totalCaloriesBurned ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                      <TrendingDown className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="bg-orange-500/10 text-orange-700 border-orange-500/20 font-semibold">
                      Deficit
                    </Badge>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                      <Minus className="h-8 w-8 text-white" />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20 font-semibold">
                      Balanced
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Consumed</p>
                <p className="text-base font-bold text-green-600">+{Math.round(dailyTotals.calories)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Burned</p>
                <p className="text-base font-bold text-orange-600">-{totalCaloriesBurned}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Premium Quick Actions Grid */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold">Quick Actions</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/dashboard/log-meal')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-100 duration-300"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Apple className="h-10 w-10 mb-3 drop-shadow-lg" />
              <p className="font-bold text-xl mb-1">Log Meal</p>
              <p className="text-sm text-white/80">Track nutrition</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/log-workout')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 p-8 text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-100 duration-300"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Dumbbell className="h-10 w-10 mb-3 drop-shadow-lg" />
              <p className="font-bold text-xl mb-1">Log Workout</p>
              <p className="text-sm text-white/80">Track exercise</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/challenges')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 p-8 text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-100 duration-300"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Target className="h-10 w-10 mb-3 drop-shadow-lg" />
              <p className="font-bold text-xl mb-1">Challenges</p>
              <p className="text-sm text-white/80">Join & compete</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/plans')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-8 text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-100 duration-300"
          >
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <Sparkles className="h-10 w-10 mb-3 drop-shadow-lg" />
              <p className="font-bold text-xl mb-1">AI Plans</p>
              <p className="text-sm text-white/80">Get personalized</p>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Activity Summary */}
      {(nutritionLogs.length > 0 || workoutLogs.length > 0) && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold">Today's Activity</h2>
          </div>

          <div className="overflow-y-auto max-h-[20rem] bg-card rounded-xl shadow-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-background">
                  <TableHead>Activity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Nutrition Logs */}
                {nutritionLogs.map((log: any, idx: number) => {
                  const config = mealTypeConfig[log.meal_type] || mealTypeConfig.snack;
                  const foodItems = parseFoodItems(log.food_items);
                  return (
                    <TableRow
                      key={`nutrition-${idx}`}
                      className="group hover:bg-green-50/50 transition-all duration-300 border-b border-primary hover:shadow-md"
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg text-lg`}>
                            {config.emoji}
                          </div>
                          <span className="text-lg font-medium capitalize">{log.meal_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {Array.isArray(foodItems) ? foodItems.length : 0} items
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-2xl font-bold bg-gradient-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {Math.round(log.total_calories)}
                        </span>
                        <p className="text-xs text-muted-foreground">calories</p>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {/* Workout Logs */}
                {workoutLogs.map((log: any, idx: number) => (
                  <TableRow
                    key={`workout-${idx}`}
                    className="group hover:bg-purple-50/50 transition-all duration-300 border-b border-tip hover:shadow-md"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-md">
                          <Dumbbell className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-lg font-medium capitalize">{log.workout_type} Workout</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.duration_minutes} min • {Array.isArray(log.exercises) ? log.exercises.length : 0} exercises
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {log.calories_burned || 0}
                      </span>
                      <p className="text-xs text-muted-foreground">burned</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Premium Empty State */}
      {nutritionLogs.length === 0 && workoutLogs.length === 0 && (
        <Card className="border-2 border-dashed border-border/50 bg-gradient-to-br from-slate-50/50 to-slate-100/50/50/50">
          <CardContent className="py-20 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-500 mb-6 shadow-xl">
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Activity Yet Today</h3>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              Start tracking your nutrition and workouts to see your progress!
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => navigate('/dashboard/log-meal')}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-6 py-6 text-base"
                size="lg"
              >
                <Apple className="h-5 w-5 mr-2" />
                Log First Meal
              </Button>
              <Button
                onClick={() => navigate('/dashboard/log-workout')}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 px-6 py-6 text-base"
                size="lg"
              >
                <Dumbbell className="h-5 w-5 mr-2" />
                Log First Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
