/**
 * Modern Nutrition Tab - Premium Food Tracking
 * Beautiful UI with timeline view and macro visualization
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Apple, Plus, ChevronRight, Trash2, Edit, TrendingUp, Target } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  calculateDailyTotals,
  useCurrentMacroTargets,
  useMealItemsByDate,
} from '../hooks/useDashboardData';
import { useDeleteMealItem } from '../hooks/useDashboardMutations';
import { DatePicker } from './DatePicker';

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

  const caloriesPercentage = Math.min((dailyTotals.calories / goals.calories) * 100, 100);
  const proteinPercentage = Math.min((dailyTotals.protein / goals.protein) * 100, 100);
  const carbsPercentage = Math.min((dailyTotals.carbs / goals.carbs) * 100, 100);
  const fatsPercentage = Math.min((dailyTotals.fats / goals.fats) * 100, 100);

  const remaining = goals.calories - dailyTotals.calories;
  const isOverGoal = remaining < 0;

  const mealTypeEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return '🌅';
      case 'lunch': return '🌞';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading nutrition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Date Picker */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Apple className="h-6 w-6 text-green-600" />
            Nutrition Tracker
          </h2>
          <p className="text-muted-foreground mt-1">Track your daily food intake</p>
        </div>
        <Button onClick={() => navigate('/dashboard/log-meal')} className="bg-gradient-to-r from-green-500 to-emerald-600">
          <Plus className="h-4 w-4 mr-2" />
          Log Meal
        </Button>
      </div>

      {/* Date Picker */}
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Daily Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calories Card */}
        <Card className="relative overflow-hidden border-2 border-green-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Calories</p>
                <h3 className="text-4xl font-bold">
                  {Math.round(dailyTotals.calories)}
                  <span className="text-lg text-muted-foreground font-normal ml-2">/ {goals.calories}</span>
                </h3>
              </div>
              <Badge variant={isOverGoal ? 'destructive' : 'success'} className="text-lg px-3 py-1">
                {Math.round(caloriesPercentage)}%
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-2">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                  isOverGoal ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                }`}
                style={{ width: `${caloriesPercentage}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {isOverGoal ? 'Over by' : 'Remaining'}
              </span>
              <span className={`font-semibold ${isOverGoal ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                {Math.abs(Math.round(remaining))} cal
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Macros Card */}
        <Card className="relative overflow-hidden border-2 border-purple-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Macronutrients</p>
              <Target className="h-5 w-5 text-purple-500" />
            </div>

            <div className="space-y-3">
              {/* Protein */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm font-bold">{Math.round(dailyTotals.protein)}g / {goals.protein}g</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${proteinPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm font-bold">{Math.round(dailyTotals.carbs)}g / {goals.carbs}g</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${carbsPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Fats */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Fats</span>
                  <span className="text-sm font-bold">{Math.round(dailyTotals.fats)}g / {goals.fats}g</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${fatsPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Meals Timeline */}
      <div>
        <h3 className="text-xl font-bold mb-4">Today's Meals</h3>

        {nutritionLogs.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
                <Apple className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Meals Logged Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your nutrition to hit your goals!
              </p>
              <Button onClick={() => navigate('/dashboard/log-meal')} className="bg-gradient-to-r from-green-500 to-emerald-600">
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Meal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
              const meals = mealsByType[mealType] || [];
              if (meals.length === 0) return null;

              const mealTotals = {
                calories: meals.reduce((sum: number, m: any) => sum + (m.total_calories || 0), 0),
                protein: meals.reduce((sum: number, m: any) => sum + (m.total_protein || 0), 0),
                carbs: meals.reduce((sum: number, m: any) => sum + (m.total_carbs || 0), 0),
                fats: meals.reduce((sum: number, m: any) => sum + (m.total_fats || 0), 0),
              };

              return (
                <div key={mealType}>
                  {/* Meal Type Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl">
                      {mealTypeEmoji(mealType)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold capitalize">{mealType}</h4>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(mealTotals.calories)} calories •{' '}
                        {Math.round(mealTotals.protein)}g protein
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate(`/dashboard/log-meal?meal_type=${mealType}&date=${selectedDate}`)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add More
                    </Button>
                  </div>

                  {/* Meal Cards */}
                  <div className="space-y-2 ml-6 pl-6 border-l-2 border-green-500/30">
                    {meals.map((meal: any) => (
                      <Card key={meal.id} className="group hover:shadow-md transition-all hover:border-green-500/40">
                        <CardContent className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              {/* Food Items */}
                              <div className="space-y-1">
                                {Array.isArray(meal.food_items) && meal.food_items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{item.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {Math.round(item.calories)} cal
                                    </span>
                                  </div>
                                ))}
                              </div>

                              {/* Meal Totals */}
                              <div className="mt-3 pt-3 border-t border-border flex items-center gap-6 text-xs">
                                <div>
                                  <span className="text-muted-foreground">Total: </span>
                                  <span className="font-bold">{Math.round(meal.total_calories)} cal</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">P: </span>
                                  <span className="font-semibold">{Math.round(meal.total_protein)}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">C: </span>
                                  <span className="font-semibold">{Math.round(meal.total_carbs)}g</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">F: </span>
                                  <span className="font-semibold">{Math.round(meal.total_fats)}g</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                onClick={() => handleDeleteMeal(meal.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {nutritionLogs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Math.round(dailyTotals.protein)}</p>
              <p className="text-sm text-muted-foreground mt-1">Protein (g)</p>
              <p className="text-xs text-muted-foreground mt-1">{Math.round(proteinPercentage)}% of goal</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 border-orange-200 dark:border-orange-800">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{Math.round(dailyTotals.carbs)}</p>
              <p className="text-sm text-muted-foreground mt-1">Carbs (g)</p>
              <p className="text-xs text-muted-foreground mt-1">{Math.round(carbsPercentage)}% of goal</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200 dark:border-pink-800">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-pink-600 dark:text-pink-400">{Math.round(dailyTotals.fats)}</p>
              <p className="text-sm text-muted-foreground mt-1">Fats (g)</p>
              <p className="text-xs text-muted-foreground mt-1">{Math.round(fatsPercentage)}% of goal</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{nutritionLogs.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Meals Logged</p>
              <p className="text-xs text-muted-foreground mt-1">Today</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
