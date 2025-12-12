/**
 * Modern Overview Tab - Premium Fitness Dashboard
 * Gorgeous UI inspired by Apple Fitness+, Strava, and Whoop
 */

import { useAuth } from '@/features/auth';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Flame, Zap, Apple, Dumbbell, Target, Calendar, Activity } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealItemsByDate, useWorkoutSessionsByDate, calculateDailyTotals } from '../hooks/useDashboardData';

const getToday = () => new Date().toISOString().split('T')[0];

export function OverviewTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate] = useState(getToday());

  // Fetch today's data
  const { data: mealData } = useMealItemsByDate(selectedDate);
  const { data: workoutData } = useWorkoutSessionsByDate(selectedDate);

  // Parse nutrition data
  const nutritionLogs = (mealData as any)?.daily_nutrition_logsCollection?.edges?.map((e: any) => e.node) || [];
  const dailyTotals = calculateDailyTotals(nutritionLogs);

  // Parse workout data
  const workoutLogs = (workoutData as any)?.workout_logsCollection?.edges?.map((e: any) => e.node) || [];
  const totalWorkouts = workoutLogs.length;
  const totalDuration = workoutLogs.reduce((sum: number, w: any) => sum + (w.duration_minutes || 0), 0);
  const totalCaloriesBurned = workoutLogs.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0);

  // Goals (these would come from user profile in production)
  const calorieGoal = 2000;
  const proteinGoal = 150;
  const workoutGoal = 60; // minutes

  const calorieProgress = Math.min((dailyTotals.calories / calorieGoal) * 100, 100);
  const proteinProgress = Math.min((dailyTotals.protein / proteinGoal) * 100, 100);
  const workoutProgress = Math.min((totalDuration / workoutGoal) * 100, 100);

  return (
    <div className="space-y-6 pb-8">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Champion'}! 👋
          </h1>
          <p className="text-primary-100 text-lg mb-6">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/dashboard/log-meal')}
              className="bg-white text-primary-600 hover:bg-primary-50 font-semibold shadow-lg"
            >
              <Apple className="h-5 w-5 mr-2" />
              Log Meal
            </Button>
            <Button
              onClick={() => navigate('/dashboard/log-workout')}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 font-semibold"
            >
              <Dumbbell className="h-5 w-5 mr-2" />
              Log Workout
            </Button>
          </div>
        </div>
      </div>

      {/* Today's Progress - Ring Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Nutrition Ring */}
        <Card className="relative overflow-hidden border-2 border-primary-500/20 hover:border-primary-500/40 transition-all hover:shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  Nutrition
                </p>
                <h3 className="text-3xl font-bold">
                  {Math.round(dailyTotals.calories)}
                  <span className="text-sm text-muted-foreground font-normal ml-1">/ {calorieGoal}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">calories</p>
              </div>

              {/* Circular Progress */}
              <div className="relative w-20 h-20">
                <svg className="transform -rotate-90" width="80" height="80">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - calorieProgress / 100)}`}
                    className="text-primary-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{Math.round(calorieProgress)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protein</span>
                <span className="font-semibold">{Math.round(dailyTotals.protein)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Carbs</span>
                <span className="font-semibold">{Math.round(dailyTotals.carbs)}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fats</span>
                <span className="font-semibold">{Math.round(dailyTotals.fats)}g</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Ring */}
        <Card className="relative overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  Workout
                </p>
                <h3 className="text-3xl font-bold">
                  {totalDuration}
                  <span className="text-sm text-muted-foreground font-normal ml-1">/ {workoutGoal}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-1">minutes</p>
              </div>

              {/* Circular Progress */}
              <div className="relative w-20 h-20">
                <svg className="transform -rotate-90" width="80" height="80">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-muted/20"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    strokeDashoffset={`${2 * Math.PI * 32 * (1 - workoutProgress / 100)}`}
                    className="text-purple-500 transition-all duration-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{Math.round(workoutProgress)}%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessions</span>
                <span className="font-semibold">{totalWorkouts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Calories Burned</span>
                <span className="font-semibold">{totalCaloriesBurned}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Energy Balance */}
        <Card className="relative overflow-hidden border-2 border-orange-500/20 hover:border-orange-500/40 transition-all hover:shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Net Energy
                </p>
                <h3 className="text-3xl font-bold">
                  {Math.round(dailyTotals.calories - totalCaloriesBurned)}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">net calories</p>
              </div>

              <div className="text-right">
                {dailyTotals.calories > totalCaloriesBurned ? (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-semibold">Surplus</span>
                  </div>
                ) : dailyTotals.calories < totalCaloriesBurned ? (
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <TrendingDown className="h-5 w-5" />
                    <span className="text-sm font-semibold">Deficit</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <Minus className="h-5 w-5" />
                    <span className="text-sm font-semibold">Balanced</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consumed</span>
                <span className="font-semibold text-green-600 dark:text-green-400">+{Math.round(dailyTotals.calories)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Burned</span>
                <span className="font-semibold text-orange-600 dark:text-orange-400">-{totalCaloriesBurned}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary-500" />
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate('/dashboard/log-meal')}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white transition-all hover:scale-105 hover:shadow-xl active:scale-100"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div className="relative">
              <Apple className="h-8 w-8 mb-2" />
              <p className="font-bold text-lg">Log Meal</p>
              <p className="text-xs text-white/80 mt-1">Track nutrition</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/dashboard/log-workout')}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white transition-all hover:scale-105 hover:shadow-xl active:scale-100"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div className="relative">
              <Dumbbell className="h-8 w-8 mb-2" />
              <p className="font-bold text-lg">Log Workout</p>
              <p className="text-xs text-white/80 mt-1">Track exercise</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/challenges')}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white transition-all hover:scale-105 hover:shadow-xl active:scale-100"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div className="relative">
              <Target className="h-8 w-8 mb-2" />
              <p className="font-bold text-lg">Challenges</p>
              <p className="text-xs text-white/80 mt-1">Join & compete</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/plans')}
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 text-white transition-all hover:scale-105 hover:shadow-xl active:scale-100"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            <div className="relative">
              <Activity className="h-8 w-8 mb-2" />
              <p className="font-bold text-lg">AI Plans</p>
              <p className="text-xs text-white/80 mt-1">Get personalized</p>
            </div>
          </button>
        </div>
      </div>

      {/* Today's Summary */}
      {(nutritionLogs.length > 0 || workoutLogs.length > 0) && (
        <div>
          <h2 className="text-xl font-bold mb-4">Today's Activity</h2>

          <div className="space-y-3">
            {/* Meal Logs */}
            {nutritionLogs.map((log: any, idx: number) => (
              <Card key={idx} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <Apple className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{log.meal_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {Array.isArray(log.food_items) ? log.food_items.length : 0} items
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">{Math.round(log.total_calories)}</p>
                      <p className="text-xs text-muted-foreground">calories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Workout Logs */}
            {workoutLogs.map((log: any, idx: number) => (
              <Card key={idx} className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <Dumbbell className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{log.workout_type} Workout</p>
                        <p className="text-sm text-muted-foreground">
                          {log.duration_minutes} minutes • {Array.isArray(log.exercises) ? log.exercises.length : 0} exercises
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold">{log.calories_burned || 0}</p>
                      <p className="text-xs text-muted-foreground">burned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {nutritionLogs.length === 0 && workoutLogs.length === 0 && (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Activity Yet Today</h3>
            <p className="text-muted-foreground mb-6">
              Start tracking your nutrition and workouts to see your progress!
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard/log-meal')}>
                <Apple className="h-4 w-4 mr-2" />
                Log First Meal
              </Button>
              <Button onClick={() => navigate('/dashboard/log-workout')} variant="outline">
                <Dumbbell className="h-4 w-4 mr-2" />
                Log First Workout
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
