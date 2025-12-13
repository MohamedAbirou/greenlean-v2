/**
 * Nutrition Tab - INSANE UI/UX for Food Item Management
 * Clean, intuitive edit/swap/delete for food items with smart AI integration
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Apple, Plus, Trash2, Target, Edit2, X, Save, RefreshCw, Sparkles, Search, PenLine } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  calculateDailyTotals,
  useActiveMealPlan,
  useCurrentMacroTargets,
  useMealItemsByDate,
} from '../hooks/useDashboardData';
import { useDeleteMealItem, useUpdateMealItem } from '../hooks/useDashboardMutations';
import { DatePicker } from './DatePicker';
import { FoodSearch } from './FoodSearch';

const getToday = () => new Date().toISOString().split('T')[0];

interface FoodItem {
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size?: string;
  quantity?: number;
  serving_qty?: number;
  serving_unit?: string;
}

type SwapMode = 'aiPlan' | 'search' | 'manual' | null;

export function NutritionTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data: mealData, loading, refetch } = useMealItemsByDate(selectedDate);
  const { data: targetsData } = useCurrentMacroTargets();
  const { data: mealPlanData } = useActiveMealPlan();
  const [deleteMealItem] = useDeleteMealItem();
  const [updateMealItem] = useUpdateMealItem();

  // State for food item management
  const [editingFoodItem, setEditingFoodItem] = useState<{ mealId: string; index: number } | null>(null);
  const [swappingFoodItem, setSwappingFoodItem] = useState<{ mealId: string; index: number; mode: SwapMode } | null>(null);

  // Form state
  const [editFoodItemForm, setEditFoodItemForm] = useState<FoodItem>({
    name: '',
    brand: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    serving_size: '',
    quantity: 1,
  });

  const [manualFoodForm, setManualFoodForm] = useState({
    name: '',
    brand: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const nutritionLogs = (mealData as any)?.daily_nutrition_logsCollection?.edges?.map((e: any) => e.node) || [];
  const dailyTotals = calculateDailyTotals(nutritionLogs);

  const targets = (targetsData as any)?.user_macro_targetsCollection?.edges?.[0]?.node;
  const goals = {
    calories: targets?.daily_calories || 2000,
    protein: targets?.daily_protein_g || 150,
    carbs: targets?.daily_carbs_g || 200,
    fats: targets?.daily_fats_g || 60,
  };

  const activeMealPlan = (mealPlanData as any)?.ai_meal_plansCollection?.edges?.[0]?.node;

  // Parse AI meal plan food items
  const aiPlanFoods: any[] = [];
  if (activeMealPlan?.daily_meals) {
    try {
      const dailyMeals = typeof activeMealPlan.daily_meals === 'string'
        ? JSON.parse(activeMealPlan.daily_meals)
        : activeMealPlan.daily_meals;

      Object.values(dailyMeals || {}).forEach((meal: any) => {
        if (Array.isArray(meal.foods)) {
          meal.foods.forEach((food: any) => {
            if (!aiPlanFoods.some(f => f.name === food.name)) {
              aiPlanFoods.push(food);
            }
          });
        }
      });
    } catch (e) {
      console.error('Error parsing AI plan:', e);
    }
  }

  const handleDeleteMeal = async (id: string) => {
    if (confirm('Delete this entire meal log?')) {
      await deleteMealItem({ variables: { id } });
      refetch();
    }
  };

  const handleDeleteFoodItem = async (mealId: string, foodItemIndex: number) => {
    if (confirm('Remove this food item from the meal?')) {
      const meal = nutritionLogs.find((m: any) => m.id === mealId);
      if (!meal) return;

      const foodItems = parseFoodItems(meal.food_items);
      const updatedFoodItems = foodItems.filter((_: any, idx: number) => idx !== foodItemIndex);

      const totals = recalculateTotals(updatedFoodItems);

      await updateMealItem({
        variables: {
          id: mealId,
          set: {
            food_items: updatedFoodItems,
            total_calories: totals.calories,
            total_protein: totals.protein,
            total_carbs: totals.carbs,
            total_fats: totals.fats,
          },
        },
      });
      refetch();
    }
  };

  const startEditFoodItem = (mealId: string, foodItemIndex: number, foodItem: FoodItem) => {
    setEditingFoodItem({ mealId, index: foodItemIndex });
    setEditFoodItemForm(JSON.parse(JSON.stringify(foodItem)));
  };

  const saveEditFoodItem = async () => {
    if (!editingFoodItem) return;

    const meal = nutritionLogs.find((m: any) => m.id === editingFoodItem.mealId);
    if (!meal) return;

    const foodItems = parseFoodItems(meal.food_items);
    foodItems[editingFoodItem.index] = editFoodItemForm;

    const totals = recalculateTotals(foodItems);

    await updateMealItem({
      variables: {
        id: editingFoodItem.mealId,
        set: {
          food_items: foodItems,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
        },
      },
    });
    setEditingFoodItem(null);
    refetch();
  };

  const startSwapFoodItem = (mealId: string, index: number, mode: SwapMode) => {
    setSwappingFoodItem({ mealId, index, mode });
  };

  const handleSwapWithAIPlan = async (aiFood: any) => {
    if (!swappingFoodItem) return;

    const meal = nutritionLogs.find((m: any) => m.id === swappingFoodItem.mealId);
    if (!meal) return;

    const foodItems = parseFoodItems(meal.food_items);
    const oldFood = foodItems[swappingFoodItem.index];

    foodItems[swappingFoodItem.index] = {
      name: aiFood.name,
      brand: aiFood.brand || '',
      calories: aiFood.calories || 0,
      protein: aiFood.protein || 0,
      carbs: aiFood.carbs || 0,
      fats: aiFood.fats || 0,
      serving_size: aiFood.serving_size || oldFood.serving_size,
      quantity: oldFood.quantity || oldFood.serving_qty || 1,
    };

    const totals = recalculateTotals(foodItems);

    await updateMealItem({
      variables: {
        id: swappingFoodItem.mealId,
        set: {
          food_items: foodItems,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
        },
      },
    });
    setSwappingFoodItem(null);
    refetch();
  };

  const handleSwapWithSearch = async (searchedFood: any) => {
    if (!swappingFoodItem) return;

    const meal = nutritionLogs.find((m: any) => m.id === swappingFoodItem.mealId);
    if (!meal) return;

    const foodItems = parseFoodItems(meal.food_items);
    const oldFood = foodItems[swappingFoodItem.index];

    foodItems[swappingFoodItem.index] = {
      name: searchedFood.name,
      brand: searchedFood.brand || '',
      calories: searchedFood.calories || 0,
      protein: searchedFood.protein || 0,
      carbs: searchedFood.carbs || 0,
      fats: searchedFood.fats || 0,
      serving_size: searchedFood.serving_size || oldFood.serving_size,
      quantity: oldFood.quantity || oldFood.serving_qty || 1,
    };

    const totals = recalculateTotals(foodItems);

    await updateMealItem({
      variables: {
        id: swappingFoodItem.mealId,
        set: {
          food_items: foodItems,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
        },
      },
    });
    setSwappingFoodItem(null);
    refetch();
  };

  const handleSwapWithManual = async () => {
    if (!swappingFoodItem || !manualFoodForm.name.trim()) return;

    const meal = nutritionLogs.find((m: any) => m.id === swappingFoodItem.mealId);
    if (!meal) return;

    const foodItems = parseFoodItems(meal.food_items);
    const oldFood = foodItems[swappingFoodItem.index];

    foodItems[swappingFoodItem.index] = {
      name: manualFoodForm.name.trim(),
      brand: manualFoodForm.brand || '',
      calories: manualFoodForm.calories,
      protein: manualFoodForm.protein,
      carbs: manualFoodForm.carbs,
      fats: manualFoodForm.fats,
      serving_size: '1 serving',
      quantity: oldFood.quantity || oldFood.serving_qty || 1,
    };

    const totals = recalculateTotals(foodItems);

    await updateMealItem({
      variables: {
        id: swappingFoodItem.mealId,
        set: {
          food_items: foodItems,
          total_calories: totals.calories,
          total_protein: totals.protein,
          total_carbs: totals.carbs,
          total_fats: totals.fats,
        },
      },
    });
    setSwappingFoodItem(null);
    setManualFoodForm({ name: '', brand: '', calories: 0, protein: 0, carbs: 0, fats: 0 });
    refetch();
  };

  // Helper to parse food items from JSONB
  const parseFoodItems = (foodItems: any): FoodItem[] => {
    if (Array.isArray(foodItems)) return foodItems;
    if (typeof foodItems === 'string') {
      try {
        return JSON.parse(foodItems);
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  // Helper to recalculate totals
  const recalculateTotals = (foodItems: FoodItem[]) => {
    return foodItems.reduce(
      (acc: any, item: any) => {
        const qty = item.quantity || item.serving_qty || 1;
        return {
          calories: acc.calories + (item.calories || 0) * qty,
          protein: acc.protein + (item.protein || 0) * qty,
          carbs: acc.carbs + (item.carbs || 0) * qty,
          fats: acc.fats + (item.fats || 0) * qty,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading nutrition data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Apple className="h-6 w-6 text-green-600" />
            Nutrition Tracker
          </h2>
          <p className="text-muted-foreground mt-1">View and manage your meals</p>
        </div>
        <Button onClick={() => navigate('/dashboard/log-meal')} className="bg-gradient-to-r from-green-500 to-emerald-600">
          <Plus className="h-4 w-4 mr-2" />
          Log Meal
        </Button>
      </div>

      {/* Date Picker */}
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Daily Summary */}
      {nutritionLogs.length > 0 && (
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
      )}

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
              };

              return (
                <div key={mealType}>
                  {/* Meal Type Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl shadow-lg">
                      {mealTypeEmoji(mealType)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold capitalize">{mealType}</h4>
                      <p className="text-sm text-muted-foreground">
                        {Math.round(mealTotals.calories)} cal • {Math.round(mealTotals.protein)}g protein
                      </p>
                    </div>
                  </div>

                  {/* Meal Cards */}
                  <div className="space-y-2 ml-6 pl-6 border-l-2 border-green-500/30">
                    {meals.map((meal: any) => {
                      const foodItems = parseFoodItems(meal.food_items);

                      return (
                        <Card key={meal.id} className="group hover:shadow-md transition-all hover:border-green-500/40">
                          <CardContent className="py-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                  <span>Total: {Math.round(meal.total_calories)} cal</span>
                                  <span>P:{Math.round(meal.total_protein)}g C:{Math.round(meal.total_carbs)}g F:{Math.round(meal.total_fats)}g</span>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleDeleteMeal(meal.id)}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Food Items */}
                            <div className="space-y-2">
                              {foodItems.map((item: FoodItem, idx: number) => {
                                const isEditingThisFoodItem = editingFoodItem?.mealId === meal.id && editingFoodItem?.index === idx;
                                const isSwappingThisFoodItem = swappingFoodItem?.mealId === meal.id && swappingFoodItem?.index === idx;
                                const qty = item.quantity || item.serving_qty || 1;

                                if (isSwappingThisFoodItem) {
                                  return (
                                    <Card key={idx} className="border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                                      <CardContent className="pt-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h5 className="font-semibold flex items-center gap-2">
                                            <RefreshCw className="h-4 w-4 text-green-600" />
                                            Swap: {item.name}
                                          </h5>
                                          <Button onClick={() => setSwappingFoodItem(null)} size="sm" variant="ghost">
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        {/* Swap Options */}
                                        {!swappingFoodItem.mode && (
                                          <div className="grid grid-cols-3 gap-2">
                                            <Button
                                              onClick={() => setSwappingFoodItem({ ...swappingFoodItem, mode: 'aiPlan' })}
                                              variant="outline"
                                              className="flex flex-col items-center gap-2 h-auto py-4"
                                            >
                                              <Sparkles className="h-5 w-5 text-purple-600" />
                                              <span className="text-xs">AI Plan</span>
                                            </Button>
                                            <Button
                                              onClick={() => setSwappingFoodItem({ ...swappingFoodItem, mode: 'search' })}
                                              variant="outline"
                                              className="flex flex-col items-center gap-2 h-auto py-4"
                                            >
                                              <Search className="h-5 w-5 text-blue-600" />
                                              <span className="text-xs">Search</span>
                                            </Button>
                                            <Button
                                              onClick={() => setSwappingFoodItem({ ...swappingFoodItem, mode: 'manual' })}
                                              variant="outline"
                                              className="flex flex-col items-center gap-2 h-auto py-4"
                                            >
                                              <PenLine className="h-5 w-5 text-green-600" />
                                              <span className="text-xs">Manual</span>
                                            </Button>
                                          </div>
                                        )}

                                        {/* AI Plan Selection */}
                                        {swappingFoodItem.mode === 'aiPlan' && (
                                          <div className="space-y-2 max-h-64 overflow-y-auto">
                                            <p className="text-sm text-muted-foreground mb-2">Choose from your AI meal plan:</p>
                                            {aiPlanFoods.length === 0 ? (
                                              <div className="p-4 bg-muted/30 rounded-lg text-center">
                                                <p className="text-sm text-muted-foreground">No AI meal plan found. Create one first!</p>
                                              </div>
                                            ) : (
                                              aiPlanFoods.map((aiFood, aiIdx) => (
                                                <button
                                                  key={aiIdx}
                                                  onClick={() => handleSwapWithAIPlan(aiFood)}
                                                  className="w-full text-left p-3 rounded-lg border border-border hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all"
                                                >
                                                  <p className="font-medium">{aiFood.name}</p>
                                                  <p className="text-xs text-muted-foreground mt-1">
                                                    {aiFood.calories}cal • P:{aiFood.protein}g C:{aiFood.carbs}g F:{aiFood.fats}g
                                                  </p>
                                                </button>
                                              ))
                                            )}
                                          </div>
                                        )}

                                        {/* Search Mode */}
                                        {swappingFoodItem.mode === 'search' && (
                                          <div className="mt-3">
                                            <FoodSearch onSelect={handleSwapWithSearch} />
                                          </div>
                                        )}

                                        {/* Manual Entry Mode */}
                                        {swappingFoodItem.mode === 'manual' && (
                                          <div className="space-y-3 mt-3">
                                            <div>
                                              <label className="text-sm font-medium mb-1 block">Food Name</label>
                                              <input
                                                type="text"
                                                value={manualFoodForm.name}
                                                onChange={(e) => setManualFoodForm({ ...manualFoodForm, name: e.target.value })}
                                                placeholder="e.g., Chicken Breast"
                                                className="w-full px-3 py-2 border rounded-lg"
                                              />
                                            </div>
                                            <div className="grid grid-cols-4 gap-2">
                                              <div>
                                                <label className="text-sm font-medium mb-1 block">Calories</label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={manualFoodForm.calories}
                                                  onChange={(e) => setManualFoodForm({ ...manualFoodForm, calories: Number(e.target.value) })}
                                                  className="w-full px-3 py-2 border rounded-lg text-center"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium mb-1 block">Protein (g)</label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={manualFoodForm.protein}
                                                  onChange={(e) => setManualFoodForm({ ...manualFoodForm, protein: Number(e.target.value) })}
                                                  className="w-full px-3 py-2 border rounded-lg text-center"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium mb-1 block">Carbs (g)</label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={manualFoodForm.carbs}
                                                  onChange={(e) => setManualFoodForm({ ...manualFoodForm, carbs: Number(e.target.value) })}
                                                  className="w-full px-3 py-2 border rounded-lg text-center"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium mb-1 block">Fats (g)</label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  value={manualFoodForm.fats}
                                                  onChange={(e) => setManualFoodForm({ ...manualFoodForm, fats: Number(e.target.value) })}
                                                  className="w-full px-3 py-2 border rounded-lg text-center"
                                                />
                                              </div>
                                            </div>
                                            <Button
                                              onClick={handleSwapWithManual}
                                              disabled={!manualFoodForm.name.trim()}
                                              className="w-full"
                                            >
                                              Swap Food
                                            </Button>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  );
                                }

                                if (isEditingThisFoodItem) {
                                  return (
                                    <Card key={idx} className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                                      <CardContent className="pt-4">
                                        <h5 className="font-semibold mb-3 flex items-center gap-2">
                                          <Edit2 className="h-4 w-4 text-blue-600" />
                                          Edit Food Item
                                        </h5>
                                        <div className="space-y-3">
                                          <div>
                                            <label className="text-sm font-medium mb-1 block">Food Name</label>
                                            <input
                                              type="text"
                                              value={editFoodItemForm.name}
                                              onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, name: e.target.value })}
                                              className="w-full px-3 py-2 border rounded-lg"
                                            />
                                          </div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <label className="text-sm font-medium mb-1 block">Brand</label>
                                              <input
                                                type="text"
                                                value={editFoodItemForm.brand || ''}
                                                onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, brand: e.target.value })}
                                                className="w-full px-3 py-2 border rounded-lg"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium mb-1 block">Quantity</label>
                                              <input
                                                type="number"
                                                value={editFoodItemForm.quantity || 1}
                                                onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, quantity: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border rounded-lg"
                                              />
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-4 gap-2">
                                            <div>
                                              <label className="text-sm font-medium mb-1 block">Cal</label>
                                              <input
                                                type="number"
                                                value={editFoodItemForm.calories}
                                                onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, calories: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border rounded-lg text-center"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium mb-1 block">Protein</label>
                                              <input
                                                type="number"
                                                value={editFoodItemForm.protein}
                                                onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, protein: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border rounded-lg text-center"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium mb-1 block">Carbs</label>
                                              <input
                                                type="number"
                                                value={editFoodItemForm.carbs}
                                                onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, carbs: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border rounded-lg text-center"
                                              />
                                            </div>
                                            <div>
                                              <label className="text-sm font-medium mb-1 block">Fats</label>
                                              <input
                                                type="number"
                                                value={editFoodItemForm.fats}
                                                onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, fats: Number(e.target.value) })}
                                                className="w-full px-3 py-2 border rounded-lg text-center"
                                              />
                                            </div>
                                          </div>
                                          <div className="flex gap-2 pt-2">
                                            <Button onClick={saveEditFoodItem} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                                              <Save className="h-4 w-4 mr-1" />
                                              Save
                                            </Button>
                                            <Button onClick={() => setEditingFoodItem(null)} size="sm" variant="outline">
                                              <X className="h-4 w-4 mr-1" />
                                              Cancel
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                }

                                return (
                                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group border border-transparent hover:border-green-200 dark:hover:border-green-800">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{item.name}</span>
                                        {item.brand && (
                                          <span className="text-xs text-muted-foreground">({item.brand})</span>
                                        )}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {Math.round(item.calories * qty)} cal • P:{Math.round(item.protein * qty)}g C:{Math.round(item.carbs * qty)}g F:{Math.round(item.fats * qty)}g
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                                      <Button
                                        onClick={() => startEditFoodItem(meal.id, idx, item)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                        title="Edit food item"
                                      >
                                        <Edit2 className="h-3 w-3 text-blue-600" />
                                      </Button>
                                      <Button
                                        onClick={() => startSwapFoodItem(meal.id, idx, null)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20"
                                        title="Swap food item"
                                      >
                                        <RefreshCw className="h-3 w-3 text-green-600" />
                                      </Button>
                                      <Button
                                        onClick={() => handleDeleteFoodItem(meal.id, idx)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                                        title="Delete food item"
                                      >
                                        <Trash2 className="h-3 w-3 text-red-600" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Notes */}
                            {meal.notes && (
                              <div className="mt-3 p-2 bg-muted/30 rounded text-xs">
                                <span className="text-muted-foreground">Note: </span>
                                {meal.notes}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
