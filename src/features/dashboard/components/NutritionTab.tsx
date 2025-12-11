/**
 * Nutrition Tab
 * View and manage daily nutrition with quick logging
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { StatCard } from './StatCard';
import {
  useMealItemsByDate,
  useCurrentMacroTargets,
  calculateDailyTotals,
} from '../hooks/useDashboardData';
import { useDeleteMealItem } from '../hooks/useDashboardMutations';

const getToday = () => new Date().toISOString().split('T')[0];

export function NutritionTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data: mealData, loading, refetch } = useMealItemsByDate(selectedDate);
  const { data: targetsData } = useCurrentMacroTargets();
  const [deleteMealItem] = useDeleteMealItem();

  const nutritionLogs = (mealData as any)?.daily_nutrition_logsCollection?.edges?.map((e: any) => e.node) || [];
  const dailyTotals = calculateDailyTotals(nutritionLogs);

  const targets = (targetsData as any)?.user_macro_targetsCollection?.edges?.[0]?.node;
  const goals = {
    calories: targets?.daily_calories || 2000,
    protein: targets?.daily_protein_g || 150,
    carbs: targets?.daily_carbs_g || 200,
    fats: targets?.daily_fats_g || 60,
  };

  const handleDeleteMeal = async (id: string) => {
    if (confirm('Delete this nutrition log?')) {
      await deleteMealItem({ variables: { id } });
      refetch();
    }
  };

  // Group meals by meal_type
  const mealsByType = nutritionLogs.reduce((acc: any, log: any) => {
    const type = log.meal_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(log);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Nutrition</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        />
      </div>

      {/* Daily Macros */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Daily Macros</h3>
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

      {/* Quick Log Button */}
      <Button
        onClick={() => navigate('/dashboard/log-meal')}
        variant="primary"
        size="lg"
        fullWidth
      >
        ➕ Log Meal
      </Button>

      {/* Meals by Type */}
      {Object.entries(mealsByType).map(([type, logs]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="capitalize">{type}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(logs as any[]).map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{log.meal_type} - {log.food_items?.length || 0} items</p>
                    {log.notes && (
                      <p className="text-sm text-muted-foreground">{log.notes}</p>
                    )}
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-semibold">{Math.round(log.total_calories)} kcal</p>
                    <p className="text-xs text-muted-foreground">
                      P: {Math.round(log.total_protein)}g | C: {Math.round(log.total_carbs)}g | F:{' '}
                      {Math.round(log.total_fats)}g
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDeleteMeal(log.id)}
                    variant="ghost"
                    size="sm"
                  >
                    🗑️
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {nutritionLogs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No meals logged yet</p>
            <Button onClick={() => navigate('/dashboard/log-meal')} variant="primary">
              Log Your First Meal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
