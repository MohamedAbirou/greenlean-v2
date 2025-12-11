/**
 * Overview Tab - Dashboard Summary
 * Shows today's progress, weekly stats, and key metrics
 */

import React, { useState } from 'react';
import { useDashboardStats } from '../../hooks/useProgress';
import { useDailyNutritionLog } from '../../hooks/useNutrition';
import { useWorkoutSessionsByDate } from '../../hooks/useWorkout';
import { StatCard } from '../shared/StatCard';
import { LoadingState } from '../shared/LoadingState';
import { getToday, formatNumber } from '../../utils';

export function OverviewTab() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const { data: stats, isLoading } = useDashboardStats(selectedDate);
  const { data: nutritionLogs } = useDailyNutritionLog(selectedDate);
  const { data: workoutSessions } = useWorkoutSessionsByDate(selectedDate);

  if (isLoading) return <LoadingState />;

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        Unable to load dashboard stats
      </div>
    );
  }

  const { today, week, month } = stats;

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Overview
        </h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Today's Nutrition */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Today's Nutrition
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Calories"
            current={today.calories}
            goal={today.caloriesGoal}
            unit="kcal"
            color="blue"
            icon={<span className="text-2xl">🔥</span>}
          />
          <StatCard
            title="Protein"
            current={today.protein}
            goal={today.proteinGoal}
            unit="g"
            color="purple"
            icon={<span className="text-2xl">🥩</span>}
          />
          <StatCard
            title="Carbs"
            current={today.carbs}
            goal={today.carbsGoal}
            unit="g"
            color="green"
            icon={<span className="text-2xl">🌾</span>}
          />
          <StatCard
            title="Fats"
            current={today.fats}
            goal={today.fatsGoal}
            unit="g"
            color="orange"
            icon={<span className="text-2xl">🥑</span>}
          />
        </div>
      </div>

      {/* Water & Workouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Water Intake"
          current={today.water}
          goal={today.waterGoal}
          unit="ml"
          color="blue"
          icon={<span className="text-2xl">💧</span>}
        />
        <StatCard
          title="Workouts Today"
          current={today.workoutsCompleted}
          showProgress={false}
          color="green"
          icon={<span className="text-2xl">💪</span>}
        />
      </div>

      {/* Weekly Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          This Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Workouts Completed
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {week.workoutsCompleted}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Volume
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(week.totalVolume)} kg
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Current Streak
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              {week.streakDays} days
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          This Month
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Workouts
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {month.workoutsCompleted}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Volume
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(month.totalVolume)} kg
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              PRs Achieved
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              🏆 {month.prsAchieved}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
            📝 Log Meal
          </button>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
            💪 Log Workout
          </button>
          <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
            ⚖️ Log Weight
          </button>
          <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors">
            💧 Add Water
          </button>
        </div>
      </div>
    </div>
  );
}
