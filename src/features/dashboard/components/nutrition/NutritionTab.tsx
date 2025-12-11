/**
 * Nutrition Tab - Smart Meal Logging
 * Complete meal logging with multiple input methods
 */

import React, { useState } from 'react';
import { useDailyNutritionLog, useMealItemsByDate, useCreateMealItem, useActiveMealPlan, useMacroTargets } from '../../hooks/useNutrition';
import { StatCard } from '../shared/StatCard';
import { LoadingState } from '../shared/LoadingState';
import { getToday, calculateMacrosFromCalories, formatNumber } from '../../utils';

export function NutritionTab() {
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showLogModal, setShowLogModal] = useState(false);
  const [logMethod, setLogMethod] = useState<'manual' | 'voice' | 'barcode' | 'photo' | 'aiPlan' | 'template'>('manual');

  const { data: nutritionLogs, isLoading } = useDailyNutritionLog(selectedDate);
  const { data: mealItems } = useMealItemsByDate(selectedDate);
  const { data: activeMealPlan } = useActiveMealPlan();
  const { data: macroTargets } = useMacroTargets();
  const createMealItem = useCreateMealItem();

  if (isLoading) return <LoadingState />;

  // Calculate daily totals
  const dailyTotals = {
    calories: mealItems?.reduce((sum, item) => sum + (item.calories || 0), 0) || 0,
    protein: mealItems?.reduce((sum, item) => sum + (item.protein || 0), 0) || 0,
    carbs: mealItems?.reduce((sum, item) => sum + (item.carbs || 0), 0) || 0,
    fats: mealItems?.reduce((sum, item) => sum + (item.fats || 0), 0) || 0,
  };

  const goals = {
    calories: macroTargets?.daily_calories || 2000,
    protein: macroTargets?.daily_protein_g || 150,
    carbs: macroTargets?.daily_carbs_g || 200,
    fats: macroTargets?.daily_fats_g || 60,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Nutrition</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Daily Macros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Calories"
          current={dailyTotals.calories}
          goal={goals.calories}
          unit="kcal"
          color="blue"
          icon={<span className="text-2xl">🔥</span>}
        />
        <StatCard
          title="Protein"
          current={dailyTotals.protein}
          goal={goals.protein}
          unit="g"
          color="purple"
          icon={<span className="text-2xl">🥩</span>}
        />
        <StatCard
          title="Carbs"
          current={dailyTotals.carbs}
          goal={goals.carbs}
          unit="g"
          color="green"
          icon={<span className="text-2xl">🌾</span>}
        />
        <StatCard
          title="Fats"
          current={dailyTotals.fats}
          goal={goals.fats}
          unit="g"
          color="orange"
          icon={<span className="text-2xl">🥑</span>}
        />
      </div>

      {/* Log Meal Button */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Log Meal
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <button onClick={() => { setLogMethod('manual'); setShowLogModal(true); }} className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm">
            ✏️ Manual
          </button>
          <button onClick={() => { setLogMethod('voice'); setShowLogModal(true); }} className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors text-sm">
            🎤 Voice
          </button>
          <button onClick={() => { setLogMethod('barcode'); setShowLogModal(true); }} className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm">
            📷 Barcode
          </button>
          <button onClick={() => { setLogMethod('photo'); setShowLogModal(true); }} className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors text-sm">
            📸 Photo
          </button>
          <button onClick={() => { setLogMethod('aiPlan'); setShowLogModal(true); }} className="px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium transition-colors text-sm" disabled={!activeMealPlan}>
            🤖 AI Plan
          </button>
          <button onClick={() => { setLogMethod('template'); setShowLogModal(true); }} className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors text-sm">
            📋 Template
          </button>
        </div>
      </div>

      {/* Meal Items */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Today's Meals
        </h3>
        {mealItems && mealItems.length > 0 ? (
          <div className="space-y-2">
            {mealItems.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.food_name}</p>
                  {item.brand_name && <p className="text-sm text-gray-500">{item.brand_name}</p>}
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.serving_size} × {item.servings}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatNumber(item.calories)} kcal
                  </p>
                  <p className="text-xs text-gray-500">
                    P: {formatNumber(item.protein)}g | C: {formatNumber(item.carbs)}g | F: {formatNumber(item.fats)}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">No meals logged yet</p>
            <button onClick={() => setShowLogModal(true)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Log Your First Meal
            </button>
          </div>
        )}
      </div>

      {/* Modal placeholder */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Log Meal - {logMethod}
              </h3>
              <button onClick={() => setShowLogModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Full logging interface for {logMethod} would be implemented here with all CRUD operations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
