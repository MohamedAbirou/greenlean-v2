/**
 * Overview Tab
 * Dashboard summary with today's stats and quick actions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { StatCard } from './StatCard';
import {
  useMealItemsByDate,
  useWorkoutSessionsByDate,
  useDailyWaterIntake,
  useCurrentMacroTargets,
  useUserStreaks,
  calculateDailyTotals,
} from '../hooks/useDashboardData';

const getToday = () => new Date().toISOString().split('T')[0];

export function OverviewTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data: mealData, loading: mealsLoading } = useMealItemsByDate(selectedDate);
  const { data: workoutData, loading: workoutsLoading } =
    useWorkoutSessionsByDate(selectedDate);
  const { data: waterData } = useDailyWaterIntake(selectedDate);
  const { data: targetsData } = useCurrentMacroTargets();
  const { data: streaksData } = useUserStreaks();

  const mealItems = mealData?.meal_itemsCollection?.edges?.map((e) => e.node) || [];
  const dailyTotals = calculateDailyTotals(mealItems);

  const workoutSessions =
    workoutData?.workout_sessionsCollection?.edges?.map((e) => e.node) || [];
  const completedWorkouts = workoutSessions.filter((w) => w.status === 'completed').length;

  const waterIntake =
    waterData?.daily_water_intakeCollection?.edges?.[0]?.node?.total_ml || 0;

  const targets = targetsData?.user_macro_targetsCollection?.edges?.[0]?.node;
  const goals = {
    calories: targets?.daily_calories || 2000,
    protein: targets?.daily_protein_g || 150,
    carbs: targets?.daily_carbs_g || 200,
    fats: targets?.daily_fats_g || 60,
    water: targets?.daily_water_ml || 2000,
  };

  const nutritionStreak =
    streaksData?.user_streaksCollection?.edges?.find(
      (e) => e.node.streak_type === 'nutrition_logging'
    )?.node;

  if (mealsLoading || workoutsLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Overview</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Today's Nutrition */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Today's Nutrition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Calories"
            current={dailyTotals.calories}
            goal={goals.calories}
            unit="kcal"
            icon="🔥"
          />
          <StatCard
            title="Protein"
            current={dailyTotals.protein}
            goal={goals.protein}
            unit="g"
            icon="🥩"
          />
          <StatCard
            title="Carbs"
            current={dailyTotals.carbs}
            goal={goals.carbs}
            unit="g"
            icon="🌾"
          />
          <StatCard
            title="Fats"
            current={dailyTotals.fats}
            goal={goals.fats}
            unit="g"
            icon="🥑"
          />
        </div>
      </div>

      {/* Water & Workouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Water Intake"
          current={waterIntake}
          goal={goals.water}
          unit="ml"
          icon="💧"
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts Today</CardTitle>
            <span className="text-2xl">💪</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedWorkouts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {workoutSessions.length} total sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Streak */}
      {nutritionStreak && (
        <Card>
          <CardHeader>
            <CardTitle>Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🔥</span>
              <div>
                <p className="text-2xl font-bold">{nutritionStreak.current_streak} days</p>
                <p className="text-sm text-muted-foreground">
                  Longest: {nutritionStreak.longest_streak} days
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={() => navigate('/dashboard/log-meal')}
              variant="primary"
              size="lg"
              fullWidth
            >
              📝 Log Meal
            </Button>
            <Button
              onClick={() => navigate('/dashboard/log-workout')}
              variant="secondary"
              size="lg"
              fullWidth
            >
              💪 Log Workout
            </Button>
            <Button onClick={() => {}} variant="accent" size="lg" fullWidth>
              ⚖️ Log Weight
            </Button>
            <Button onClick={() => {}} variant="ghost" size="lg" fullWidth>
              💧 Add Water
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
