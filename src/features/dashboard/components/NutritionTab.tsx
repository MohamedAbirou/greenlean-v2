/**
 * NutritionTab - 2026 Premium Nutrition Experience
 * Inspired by: MyMacros+, Carbon Diet Coach, Apple Health
 * NO MyFitnessPal vibes - Pure premium modern design
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Apple, ChevronRight, Edit2, Flame, PenLine, Plus, RefreshCw, Save, Search, Sparkles, Target, Trash2, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  calculateDailyTotals,
  useActiveMealPlan,
  // useCurrentMacroTargets,
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
  // const { data: targetsData } = useCurrentMacroTargets();
  const { data: mealPlanData } = useActiveMealPlan();
  const [deleteMealItem] = useDeleteMealItem();
  const [updateMealItem] = useUpdateMealItem();

  const [editingFoodItem, setEditingFoodItem] = useState<{ mealId: string; index: number } | null>(null);
  const [swappingFoodItem, setSwappingFoodItem] = useState<{ mealId: string; index: number; mode: SwapMode } | null>(null);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);

  const [editFoodItemForm, setEditFoodItemForm] = useState<FoodItem>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
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
  const activeMealPlan = (mealPlanData as any)?.ai_meal_plansCollection?.edges?.[0]?.node;

  // Parse AI meal plan
  const planData = activeMealPlan?.plan_data
    ? (typeof activeMealPlan.plan_data === 'string' ? JSON.parse(activeMealPlan.plan_data) : activeMealPlan.plan_data)
    : null;
  const dailyMeals = planData?.meals || null;
  const aiPlanFoods: any[] = [];

  if (dailyMeals) {
    Object.entries(dailyMeals).forEach(([day, dayData]: [string, any]) => {
      if (Array.isArray(dayData.foods)) {
        dayData.foods.forEach((food: any) => {
          aiPlanFoods.push({ ...food, day, mealName: dayData.meal_name || day });
        });
      }
    });
  }

  const handleDeleteMeal = async (id: string) => {
    if (confirm('Delete this entire meal?')) {
      await deleteMealItem({ variables: { id } });
      refetch();
    }
  };

  const handleDeleteFoodItem = async (mealId: string, foodItemIndex: number) => {
    if (confirm('Remove this food item?')) {
      const meal = nutritionLogs.find((m: any) => m.id === mealId);
      if (!meal) return;

      const foodItems = parseFoodItems(meal.food_items);
      const updatedFoodItems = foodItems.filter((_: any, idx: number) => idx !== foodItemIndex);

      const totals = recalculateTotals(updatedFoodItems);

      await updateMealItem({
        variables: {
          id: mealId,
          set: {
            food_items: JSON.stringify(updatedFoodItems),
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
          food_items: JSON.stringify(foodItems),
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
      brand: aiFood.brand || 'AI Meal Plan',
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
          food_items: JSON.stringify(foodItems),
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
          food_items: JSON.stringify(foodItems),
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
          food_items: JSON.stringify(foodItems),
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

  const recalculateTotals = (foodItems: FoodItem[]) => ({
    calories: foodItems.reduce((sum, item) => sum + (item.calories || 0), 0),
    protein: foodItems.reduce((sum, item) => sum + (item.protein || 0), 0),
    carbs: foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0),
    fats: foodItems.reduce((sum, item) => sum + (item.fats || 0), 0),
  });

  // Calculate daily totals
  const dailyTotals = calculateDailyTotals(nutritionLogs);

  const mealTypeConfig: Record<string, { emoji: string; gradient: string; bg: string }> = {
    breakfast: { emoji: '🌅', gradient: 'from-orange-500 to-yellow-500', bg: 'from-orange-50 to-yellow-50 dark:from-orange-950/50 dark:to-yellow-950/50' },
    lunch: { emoji: '🌞', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50' },
    dinner: { emoji: '🌙', gradient: 'from-blue-500 to-purple-500', bg: 'from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50' },
    snack: { emoji: '🍎', gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-50 to-rose-50 dark:from-pink-950/50 dark:to-rose-950/50' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-green-200 dark:border-green-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading your nutrition...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Floating Action Header */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-4 backdrop-blur-xl bg-background/50 rounded-xl border-b border-border/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
          <Button
            onClick={() => navigate('/dashboard/log-meal')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Meal
          </Button>
        </div>
      </div>

      {/* Premium Macro Ring */}
      {nutritionLogs.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Calories', value: Math.round(dailyTotals.calories), icon: Flame, gradient: 'from-orange-500 to-red-500', bg: 'from-orange-500/20 to-red-500/20', unit: 'kcal' },
            { label: 'Protein', value: Math.round(dailyTotals.protein), icon: Target, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/20 to-cyan-500/20', unit: 'g' },
            { label: 'Carbs', value: Math.round(dailyTotals.carbs), icon: Apple, gradient: 'from-green-500 to-emerald-500', bg: 'from-green-500/20 to-emerald-500/20', unit: 'g' },
            { label: 'Fats', value: Math.round(dailyTotals.fats), icon: TrendingUp, gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-500/20 to-pink-500/20', unit: 'g' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className={`group relative overflow-hidden border-0 bg-gradient-to-br ${stat.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label} <span className="text-xs">({stat.unit})</span></p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Meals List */}
      {nutritionLogs.length === 0 ? (
        <Card className="border-2 border-dashed border-border hover:border-green-500/50 transition-colors duration-300">
          <CardContent className="py-24 text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Apple className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">Start Tracking Your Nutrition</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Log your first meal and take control of your health journey
            </p>
            <Button
              onClick={() => navigate('/dashboard/log-meal')}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Log First Meal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {nutritionLogs.map((meal: any) => {
            const config = mealTypeConfig[meal.meal_type] || mealTypeConfig.snack;
            const foodItems = parseFoodItems(meal.food_items);
            const isExpanded = expandedMeal === meal.id;

            return (
              <Card
                key={meal.id}
                className="group relative overflow-hidden border border-border hover:border-green-500/50 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-muted/30"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="relative">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shadow-green-500/30 text-2xl`}>
                        {config.emoji}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold capitalize truncate">{meal.meal_type}</h3>
                        <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0`}>
                          {foodItems.length} items
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          {Math.round(meal.total_calories)} cal
                        </span>
                        <span>P: {Math.round(meal.total_protein)}g</span>
                        <span>C: {Math.round(meal.total_carbs)}g</span>
                        <span>F: {Math.round(meal.total_fats)}g</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Food Items */}
                  {isExpanded && foodItems.length > 0 && (
                    <div className="space-y-3 mt-6 pt-4 border-t border-border/50">
                      {foodItems.map((food: FoodItem, idx: number) => {
                        const isEditingThis = editingFoodItem?.mealId === meal.id && editingFoodItem?.index === idx;
                        const isSwappingThis = swappingFoodItem?.mealId === meal.id && swappingFoodItem?.index === idx;

                        if (isSwappingThis) {
                          return (
                            <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                                  <RefreshCw className="h-4 w-4" />
                                  Swap Food
                                </h5>
                                <Button onClick={() => setSwappingFoodItem(null)} size="sm" variant="ghost">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              {!swappingFoodItem.mode ? (
                                <div className="grid grid-cols-3 gap-3">
                                  {[
                                    { mode: 'aiPlan' as SwapMode, icon: Sparkles, label: 'AI Plan', gradient: 'from-purple-500 to-purple-600' },
                                    { mode: 'search' as SwapMode, icon: Search, label: 'Search', gradient: 'from-blue-500 to-blue-600' },
                                    { mode: 'manual' as SwapMode, icon: PenLine, label: 'Manual', gradient: 'from-green-500 to-green-600' },
                                  ].map((option) => {
                                    const Icon = option.icon;
                                    return (
                                      <button
                                        key={option.mode}
                                        onClick={() => setSwappingFoodItem({ ...swappingFoodItem, mode: option.mode })}
                                        className={`p-4 rounded-lg bg-gradient-to-br ${option.gradient} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2`}
                                      >
                                        <Icon className="h-6 w-6" />
                                        <span className="text-xs font-medium">{option.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : swappingFoodItem.mode === 'aiPlan' ? (
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                  {aiPlanFoods.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-8">No AI meal plan found</p>
                                  ) : (
                                    aiPlanFoods.map((aiFood, i) => (
                                      <button
                                        key={i}
                                        onClick={() => handleSwapWithAIPlan(aiFood)}
                                        className="w-full text-left p-3 rounded-lg bg-card border border-border hover:border-green-500 hover:shadow-md transition-all group"
                                      >
                                        <p className="font-medium group-hover:text-green-600 transition-colors">{aiFood.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{aiFood.calories}cal • P:{aiFood.protein}g C:{aiFood.carbs}g F:{aiFood.fats}g</p>
                                      </button>
                                    ))
                                  )}
                                </div>
                              ) : swappingFoodItem.mode === 'search' ? (
                                <FoodSearch onFoodSelect={handleSwapWithSearch} />
                              ) : (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    placeholder="Food name"
                                    value={manualFoodForm.name}
                                    onChange={(e) => setManualFoodForm({ ...manualFoodForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                  />
                                  <div className="grid grid-cols-2 gap-3">
                                    {[
                                      { key: 'calories', label: 'Calories' },
                                      { key: 'protein', label: 'Protein (g)' },
                                      { key: 'carbs', label: 'Carbs (g)' },
                                      { key: 'fats', label: 'Fats (g)' },
                                    ].map((field) => (
                                      <input
                                        key={field.key}
                                        type="number"
                                        placeholder={field.label}
                                        value={manualFoodForm[field.key as keyof typeof manualFoodForm]}
                                        onChange={(e) => setManualFoodForm({ ...manualFoodForm, [field.key]: Number(e.target.value) })}
                                        className="px-3 py-2 rounded-lg border border-border bg-background text-center focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none transition-all"
                                      />
                                    ))}
                                  </div>
                                  <Button onClick={handleSwapWithManual} className="w-full bg-gradient-to-r from-green-600 to-emerald-600">
                                    Swap Food
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (isEditingThis) {
                          return (
                            <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-semibold text-blue-600 dark:text-blue-400">{editFoodItemForm.name}</h5>
                                <div className="flex items-center gap-2">
                                  <Button onClick={saveEditFoodItem} size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button onClick={() => setEditingFoodItem(null)} size="sm" variant="ghost">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                {[
                                  { key: 'calories', label: 'Calories', icon: Flame },
                                  { key: 'protein', label: 'Protein (g)', icon: Target },
                                  { key: 'carbs', label: 'Carbs (g)', icon: Apple },
                                  { key: 'fats', label: 'Fats (g)', icon: TrendingUp },
                                ].map((field) => {
                                  const Icon = field.icon;
                                  return (
                                    <div key={field.key} className="space-y-1">
                                      <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                        <Icon className="h-3 w-3" />
                                        {field.label}
                                      </label>
                                      <input
                                        type="number"
                                        value={editFoodItemForm[field.key as keyof FoodItem]}
                                        onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, [field.key]: Number(e.target.value) })}
                                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-center outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="group/food p-4 rounded-xl bg-gradient-hero hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-base mb-1">{food.name}</h4>
                                {food.brand && (
                                  <p className="text-xs text-muted-foreground mb-2">{food.brand}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover/food:opacity-100 transition-opacity">
                                <Button
                                  onClick={() => startEditFoodItem(meal.id, idx, food)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => startSwapFoodItem(meal.id, idx, null)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteFoodItem(meal.id, idx)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Macros Grid */}
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { label: 'Calories', value: food.calories, color: 'text-orange-600' },
                                { label: 'Protein', value: `${food.protein}g`, color: 'text-blue-600' },
                                { label: 'Carbs', value: `${food.carbs}g`, color: 'text-green-600' },
                                { label: 'Fats', value: `${food.fats}g`, color: 'text-purple-600' },
                              ].map((macro, i) => (
                                <div key={i} className="p-2 rounded-lg bg-card border border-border text-center">
                                  <div className="text-xs text-muted-foreground mb-1">{macro.label}</div>
                                  <div className={`font-semibold text-sm ${macro.color}`}>{macro.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
