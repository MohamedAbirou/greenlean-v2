/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * NutritionTab - 2026 Premium Nutrition Experience
 * Inspired by: MyMacros+, Carbon Diet Coach, Apple Health
 * NO MyFitnessPal vibes - Pure premium modern design
 * Upgraded UX/UI: More details with progress tracking, extended macros (fiber/sugar/sodium), serving info,
 * source badges, macro percentages, without overwhelming the user. Uses progressive disclosure with tooltips and expandables.
 */

import { convertAIPlanFoodToMealItem, convertManualInputToMealItem, mealTrackingService } from '@/features/nutrition';
import { FoodSearch } from '@/features/nutrition/components/FoodSearch';
import { DatePicker } from '@/shared/components/DatePicker';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { DailyNutritionLog, MealItem } from '@/shared/types/food.types';
import { Apple, ChevronDown, ChevronRight, Edit2, Flame, Info, PenLine, Plus, RefreshCw, Save, Search, Sparkles, Target, Trash2, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useActiveMealPlan,
  useCurrentMacroTargets,
  useMealItemsByDate
} from '../hooks/useDashboardData';

// Extended totals interface for more nutrients
interface ExtendedTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

const getToday = () => new Date().toISOString().split('T')[0];

type SwapMode = 'aiPlan' | 'search' | 'manual' | null;

export function NutritionTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data: nutritionLogs, isLoading, refetch } = useMealItemsByDate(selectedDate);
  const { data: activeMealPlan } = useActiveMealPlan();
  const { data: targetsData } = useCurrentMacroTargets();

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [swappingItemId, setSwappingItemId] = useState<{ logId: string; itemId: string; mode: SwapMode } | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null); // New: For item details expansion

  const [editItemForm, setEditItemForm] = useState({
    food_name: "",
    brand_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    serving_qty: "1",
    serving_unit: "serving",
    fiber: "",
    sugar: "",
    sodium: "",
  });

  const [manualItemForm, setManualItemForm] = useState({
    food_name: "",
    brand_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    serving_qty: "1",
    serving_unit: "serving",
    fiber: "",
    sugar: "",
    sodium: "",
  });

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
          aiPlanFoods.push({ ...food, day, meal_plan_id: activeMealPlan?.id, mealName: dayData.meal_name || day });
        });
      }
    });
  }

  const handleDeleteLog = async (id: string) => {
    if (confirm('Delete this entire meal?')) {
      await mealTrackingService.deleteNutritionLog(id);
      refetch();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Remove this food item?')) {
      await mealTrackingService.deleteMealItem(itemId);
      refetch();
    }
  };

  const startEditItem = (item: MealItem) => {
    setEditingItemId(item.id!);
    setEditItemForm({
      food_name: item.food_name,
      brand_name: item.brand_name || '',
      calories: String(item.calories),
      protein: String(item.protein),
      carbs: String(item.carbs),
      fats: String(item.fats),
      serving_qty: String(item.serving_qty),
      serving_unit: item.serving_unit,
      fiber: String(item.fiber || ''),
      sugar: String(item.sugar || ''),
      sodium: String(item.sodium || ''),
    });
  };

  const saveEditItem = async () => {
    if (!editingItemId) return;

    await mealTrackingService.updateMealItem({
      id: editingItemId,
      set: {
        food_name: editItemForm.food_name,
        brand_name: editItemForm.brand_name,
        calories: editItemForm.calories,
        protein: editItemForm.protein,
        carbs: editItemForm.carbs,
        fats: editItemForm.fats,
        serving_qty: editItemForm.serving_qty,
        serving_unit: editItemForm.serving_unit,
        fiber: editItemForm.fiber || null,
        sugar: editItemForm.sugar || null,
        sodium: editItemForm.sodium || null,
      }
    });
    setEditingItemId(null);
    refetch();
  };

  const startSwapItem = (logId: string, itemId: string, mode: SwapMode) => {
    setSwappingItemId({ logId, itemId, mode });
  };

  const handleSwapWithAIPlan = async (aiFood: any) => {
    if (!swappingItemId) return;

    const item = convertAIPlanFoodToMealItem(
      aiFood,
      aiFood.meal_plan_id,
      aiFood.mealName
    );

    await mealTrackingService.updateMealItem({
      id: swappingItemId.itemId,
      set: {
        food_name: item.food_name,
        brand_name: item.brand_name || 'AI Meal Plan',
        calories: item.calories || 0,
        protein: item.protein || 0,
        carbs: item.carbs || 0,
        fats: item.fats || 0,
        serving_unit: item.serving_unit || editItemForm.serving_unit,
        serving_qty: item.serving_qty || 1,
        source: 'ai-plan',
        from_ai_plan: true,
        ai_meal_plan_id: aiFood.meal_plan_id,
        plan_meal_name: aiFood.mealName,
        fiber: item.fiber || null,
        sugar: item.sugar || null,
        sodium: item.sodium || null,
      },
    });
    setSwappingItemId(null);
    refetch();
  };

  const handleSwapWithSearch = async (searchedFood: MealItem) => {
    if (!swappingItemId) return;

    await mealTrackingService.updateMealItem({
      id: swappingItemId.itemId,
      set: {
        food_name: searchedFood.food_name,
        brand_name: searchedFood.brand_name || '',
        calories: searchedFood.calories,
        protein: searchedFood.protein,
        carbs: searchedFood.carbs,
        fats: searchedFood.fats,
        serving_unit: searchedFood.serving_unit || editItemForm.serving_unit,
        serving_qty: editItemForm.serving_qty || 1,
        source: 'search',
        fiber: searchedFood.fiber || null,
        sugar: searchedFood.sugar || null,
        sodium: searchedFood.sodium || null,
      },
    });
    setSwappingItemId(null);
    refetch();
  };

  const handleSwapWithManual = async () => {
    if (!swappingItemId || !manualItemForm.food_name.trim()) return;

    const item = convertManualInputToMealItem({
      food_name: manualItemForm.food_name.trim(),
      brand_name: manualItemForm.brand_name,
      calories: Number(manualItemForm.calories) || 0,
      protein: Number(manualItemForm.protein) || 0,
      carbs: Number(manualItemForm.carbs) || 0,
      fats: Number(manualItemForm.fats) || 0,
      serving_qty: Number(manualItemForm.serving_qty) || 1,
      serving_unit: manualItemForm.serving_unit || 'serving',
      fiber: Number(manualItemForm.fiber) || undefined,
      sugar: Number(manualItemForm.sugar) || undefined,
      sodium: Number(manualItemForm.sodium) || undefined,
    });

    await mealTrackingService.updateMealItem({
      id: swappingItemId.itemId,
      set: {
        food_name: item.food_name,
        brand_name: item.brand_name || '',
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        serving_unit: item.serving_unit || 'serving',
        serving_qty: item.serving_qty || 1,
        source: 'manual',
        fiber: item.fiber || null,
        sugar: item.sugar || null,
        sodium: item.sodium || null,
      },
    });
    setSwappingItemId(null);
    setManualItemForm({ food_name: '', brand_name: '', calories: '', protein: '', carbs: '', fats: '', serving_qty: '1', serving_unit: 'serving', fiber: '', sugar: '', sodium: '' });
    refetch();
  };

  // Extended calculateDailyTotals to include fiber, sugar, sodium
  const extendedDailyTotals: ExtendedTotals = nutritionLogs?.reduce((acc: ExtendedTotals, log: DailyNutritionLog) => {
    const items = log.meal_items || [];
    return items.reduce((innerAcc: ExtendedTotals, item: MealItem) => ({
      calories: innerAcc.calories + (item.calories || 0),
      protein: innerAcc.protein + (item.protein || 0),
      carbs: innerAcc.carbs + (item.carbs || 0),
      fats: innerAcc.fats + (item.fats || 0),
      fiber: innerAcc.fiber + (item.fiber || 0),
      sugar: innerAcc.sugar + (item.sugar || 0),
      sodium: innerAcc.sodium + (item.sodium || 0),
    }), acc);
  }, { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, sugar: 0, sodium: 0 });

  // Calculate macro percentages
  const totalMacros = extendedDailyTotals?.protein * 4 + extendedDailyTotals?.carbs * 4 + extendedDailyTotals?.fats * 9;
  const proteinPct = totalMacros > 0 ? Math.round((extendedDailyTotals?.protein * 4 / totalMacros) * 100) : 0;
  const carbsPct = totalMacros > 0 ? Math.round((extendedDailyTotals?.carbs * 4 / totalMacros) * 100) : 0;
  const fatsPct = totalMacros > 0 ? Math.round((extendedDailyTotals?.fats * 9 / totalMacros) * 100) : 0;

  const mealTypeConfig: Record<string, { emoji: string; gradient: string; bg: string }> = {
    breakfast: { emoji: '🌅', gradient: 'from-orange-500 to-yellow-500', bg: 'from-orange-500/50 to-yellow-500/50' },
    lunch: { emoji: '🌞', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-500/50 to-emerald-500/50' },
    dinner: { emoji: '🌙', gradient: 'from-blue-500 to-purple-500', bg: 'from-blue-500/50 to-purple-500/50' },
    snack: { emoji: '🍎', gradient: 'from-pink-500 to-rose-500', bg: 'from-pink-500/50 to-rose-500/50' },
  };

  if (isLoading) {
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
    <TooltipProvider>
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

        {/* Enhanced Daily Summary with Progress and Percentages */}
        {nutritionLogs && nutritionLogs.length > 0 && (
          <Card className="p-4 border-0 shadow-xl">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Daily Summary</h3>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="text-xs">
                      {proteinPct}%P / {carbsPct}%C / {fatsPct}%F
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Macro split based on caloric contribution</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Calories', value: Math.round(extendedDailyTotals.calories), target: targetsData?.calories, icon: Flame, gradient: 'from-orange-500 to-red-500', bg: 'from-orange-500/20 to-red-500/20', unit: 'kcal' },
                  { label: 'Protein', value: Math.round(extendedDailyTotals.protein), target: targetsData?.protein, icon: Target, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/20 to-cyan-500/20', unit: 'g' },
                  { label: 'Carbs', value: Math.round(extendedDailyTotals.carbs), target: targetsData?.carbs, icon: Apple, gradient: 'from-green-500 to-emerald-500', bg: 'from-green-500/20 to-emerald-500/20', unit: 'g' },
                  { label: 'Fats', value: Math.round(extendedDailyTotals.fats), target: targetsData?.fats, icon: TrendingUp, gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-500/20 to-pink-500/20', unit: 'g' },
                ].map((stat, idx) => {
                  const Icon = stat.icon;
                  const progress = stat.target ? Math.min((stat.value / stat.target) * 100, 100) : 0;
                  return (
                    <Card key={idx} className={`group relative overflow-hidden border-0 bg-gradient-to-br ${stat.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                      <CardContent className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          {stat.target && (
                            <Tooltip>
                              <TooltipTrigger>
                                <div className="text-xs text-muted-foreground">
                                  {progress.toFixed(0)}%
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{stat.value} / {stat.target} {stat.unit}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-3xl font-bold mb-1">{stat.value}</p>
                        <p className="text-sm font-medium text-muted-foreground">{stat.label} <span className="text-xs">({stat.unit})</span></p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              {/* Additional Nutrients Row */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { label: 'Fiber', value: Math.round(extendedDailyTotals.fiber), unit: 'g', color: 'text-green-600' },
                  { label: 'Sugar', value: Math.round(extendedDailyTotals.sugar), unit: 'g', color: 'text-amber-600' },
                  { label: 'Sodium', value: Math.round(extendedDailyTotals.sodium), unit: 'mg', color: 'text-red-600' },
                ].map((nutrient, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-card border border-border text-center">
                    <p className={`font-bold text-lg ${nutrient.color}`}>{nutrient.value}{nutrient.unit}</p>
                    <p className="text-xs text-muted-foreground mt-1">{nutrient.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meals List */}
        {nutritionLogs && nutritionLogs.length === 0 ? (
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
            {nutritionLogs && nutritionLogs.map((log: DailyNutritionLog) => {
              const config = mealTypeConfig[log.meal_type] || mealTypeConfig.snack;
              const items = log.meal_items || [];
              const isExpanded = expandedLog === log.id;

              return (
                <Card
                  key={log.id}
                  className="group relative overflow-hidden border border-border hover:border-green-500/50 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-muted/30"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <CardContent className="relative">
                    {/* Header */}
                    <div className="flex items-start gap-4 transition-all" onClick={() => setExpandedLog(isExpanded ? null : log.id)}>
                      <div className="relative">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shadow-green-500/30 text-2xl`}>
                          {config.emoji}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold capitalize truncate">{log.meal_type}</h3>
                          <Badge className={`bg-gradient-to-r ${config.gradient} text-white border-0`}>
                            {items.length} items
                          </Badge>
                          {log.notes && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{log.notes}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Flame className="h-4 w-4" />
                            {Math.round(log.total_calories)} cal
                          </span>
                          <span>P: {Math.round(log.total_protein)}g</span>
                          <span>C: {Math.round(log.total_carbs)}g</span>
                          <span>F: {Math.round(log.total_fats)}g</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLog(log.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Food Items */}
                    {isExpanded && items.length > 0 && (
                      <div className="space-y-3 mt-6 pt-4 border-t border-border/50">
                        {items.map((item: MealItem) => {
                          const isEditingThis = editingItemId === item.id;
                          const isSwappingThis = swappingItemId?.itemId === item.id;
                          const isExpandedItem = expandedItemId === item.id;
                          const sourceBadge = item.source ? (
                            <Badge variant="outline" className="text-xs capitalize">
                              {item.source}
                            </Badge>
                          ) : null;

                          if (isSwappingThis) {
                            return (
                              <div key={item.id} className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <RefreshCw className="h-4 w-4" />
                                    Swap Food
                                  </h5>
                                  <Button onClick={() => setSwappingItemId(null)} size="sm" variant="ghost">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>

                                {swappingItemId && (!swappingItemId.mode ? (
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
                                          onClick={() => setSwappingItemId({ ...swappingItemId, mode: option.mode })}
                                          className={`p-4 rounded-lg bg-gradient-to-br ${option.gradient} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2`}
                                        >
                                          <Icon className="h-6 w-6" />
                                          <span className="text-xs font-medium">{option.label}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : swappingItemId.mode === 'aiPlan' ? (
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
                                ) : swappingItemId.mode === 'search' ? (
                                  <FoodSearch onFoodSelect={handleSwapWithSearch} />
                                ) : (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="col-span-2">
                                        <label className="block text-sm font-semibold mb-2">Food Name *</label>
                                        <input
                                          type="text"
                                          value={manualItemForm.food_name}
                                          onChange={(e) => setManualItemForm({ ...manualItemForm, food_name: e.target.value })}
                                          placeholder="e.g., Chicken Breast"
                                          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                      </div>

                                      <div className="col-span-2">
                                        <label className="block text-sm font-semibold mb-2">
                                          Brand (Optional)
                                        </label>
                                        <input
                                          type="text"
                                          value={manualItemForm.brand_name}
                                          onChange={(e) =>
                                            setManualItemForm({ ...manualItemForm, brand_name: e.target.value })
                                          }
                                          placeholder="e.g., Tyson"
                                          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2 text-orange-600 dark:text-orange-400">
                                          Calories *
                                        </label>
                                        <input
                                          type="number"
                                          value={manualItemForm.calories}
                                          onChange={(e) =>
                                            setManualItemForm({ ...manualItemForm, calories: e.target.value })
                                          }
                                          placeholder="0"
                                          className="w-full px-4 py-3 border-2 border-orange-200 dark:border-orange-900/30 rounded-xl bg-background hover:border-orange-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2 text-blue-600 dark:text-blue-400">
                                          Protein (g) *
                                        </label>
                                        <input
                                          type="number"
                                          value={manualItemForm.protein}
                                          onChange={(e) =>
                                            setManualItemForm({ ...manualItemForm, protein: e.target.value })
                                          }
                                          placeholder="0"
                                          className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-900/30 rounded-xl bg-background hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2 text-amber-600 dark:text-amber-400">
                                          Carbs (g) *
                                        </label>
                                        <input
                                          type="number"
                                          value={manualItemForm.carbs}
                                          onChange={(e) =>
                                            setManualItemForm({ ...manualItemForm, carbs: e.target.value })
                                          }
                                          placeholder="0"
                                          className="w-full px-4 py-3 border-2 border-amber-200 dark:border-amber-900/30 rounded-xl bg-background hover:border-amber-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2 text-purple-600 dark:text-purple-400">
                                          Fats (g) *
                                        </label>
                                        <input
                                          type="number"
                                          value={manualItemForm.fats}
                                          onChange={(e) => setManualItemForm({ ...manualItemForm, fats: e.target.value })}
                                          placeholder="0"
                                          className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-900/30 rounded-xl bg-background hover:border-purple-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2 text-green-600 dark:text-green-400">
                                          Fiber (g)
                                        </label>
                                        <input
                                          type="number"
                                          value={manualItemForm.fiber}
                                          onChange={(e) => setManualItemForm({ ...manualItemForm, fiber: e.target.value })}
                                          placeholder="0"
                                          className="w-full px-4 py-3 border-2 border-green-200 dark:border-green-900/30 rounded-xl bg-background hover:border-green-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2 text-amber-600 dark:text-amber-400">
                                          Sugar (g)
                                        </label>
                                        <input
                                          type="number"
                                          value={manualItemForm.sugar}
                                          onChange={(e) => setManualItemForm({ ...manualItemForm, sugar: e.target.value })}
                                          placeholder="0"
                                          className="w-full px-4 py-3 border-2 border-amber-200 dark:border-amber-900/30 rounded-xl bg-background hover:border-amber-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2 text-red-600 dark:text-red-400">
                                          Sodium (mg)
                                        </label>
                                        <input
                                          type="number"
                                          value={manualItemForm.sodium}
                                          onChange={(e) => setManualItemForm({ ...manualItemForm, sodium: e.target.value })}
                                          placeholder="0"
                                          className="w-full px-4 py-3 border-2 border-red-200 dark:border-red-900/30 rounded-xl bg-background hover:border-red-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2">Serving Size</label>
                                        <input
                                          type="number"
                                          value={manualItemForm.serving_qty}
                                          onChange={(e) =>
                                            setManualItemForm({ ...manualItemForm, serving_qty: e.target.value })
                                          }
                                          placeholder="e.g., 100 (g), 1 (cup)"
                                          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-sm font-semibold mb-2">Serving Unit</label>
                                        <input
                                          type="text"
                                          value={manualItemForm.serving_unit}
                                          onChange={(e) =>
                                            setManualItemForm({ ...manualItemForm, serving_unit: e.target.value })
                                          }
                                          placeholder="e.g., g, cup, large, serving"
                                          className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        />
                                      </div>
                                    </div>

                                    <Button
                                      onClick={handleSwapWithManual}
                                      disabled={!manualItemForm.food_name || !manualItemForm.calories}
                                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-6 text-base font-semibold"
                                    >
                                      <RefreshCw className="h-5 w-5 mr-2" />
                                      Swap Food
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            );
                          }

                          if (isEditingThis) {
                            return (
                              <div key={item.id} className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/50 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center justify-between mb-4">
                                  <h5 className="font-semibold text-blue-600 dark:text-blue-400">{editItemForm.food_name}</h5>
                                  <div className="flex items-center gap-2">
                                    <Button onClick={saveEditItem} size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                      <Save className="h-4 w-4 mr-1" />
                                      Save
                                    </Button>
                                    <Button onClick={() => setEditingItemId(null)} size="sm" variant="ghost">
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
                                    { key: 'fiber', label: 'Fiber (g)', icon: Apple },
                                    { key: 'sugar', label: 'Sugar (g)', icon: Flame },
                                    { key: 'sodium', label: 'Sodium (mg)', icon: Target },
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
                                          value={Number(editItemForm[field.key as keyof typeof editItemForm]) || 0}
                                          onChange={(e) => setEditItemForm({ ...editItemForm, [field.key]: Number(e.target.value) })}
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
                            <div key={item.id} className="group/food p-4 rounded-xl bg-gradient-hero hover:shadow-md transition-all duration-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-base">{item.food_name}</h4>
                                    {sourceBadge}
                                  </div>
                                  {item.brand_name && (
                                    <p className="text-xs text-muted-foreground mb-1">{item.brand_name}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {item.serving_qty} × {/(\D+)$/.exec(item.serving_unit)?.[1] || item.serving_unit}
                                    {item.confidence && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            Confidence: {(item.confidence * 100).toFixed(0)}%
                                          </Badge>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>AI recognition confidence</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover/food:opacity-100 transition-opacity">
                                  <Button
                                    onClick={() => startEditItem(item)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => startSwapItem(log.id, item.id!, null)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteItem(item.id!)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Macros Grid - Primary */}
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                {[
                                  { label: 'Calories', value: item.calories, color: 'text-orange-600' },
                                  { label: 'Protein', value: `${item.protein}g`, color: 'text-blue-600' },
                                  { label: 'Carbs', value: `${item.carbs}g`, color: 'text-green-600' },
                                  { label: 'Fats', value: `${item.fats}g`, color: 'text-purple-600' },
                                ].map((macro, i) => (
                                  <div key={i} className="p-2 rounded-lg bg-card border border-border text-center">
                                    <div className="text-xs text-muted-foreground mb-1">{macro.label}</div>
                                    <div className={`font-semibold text-sm ${macro.color}`}>{macro.value}</div>
                                  </div>
                                ))}
                              </div>

                              {/* Expandable Additional Details */}
                              {(item.fiber || item.sugar || item.sodium || item.notes || item.portion_estimate) && (
                                <button
                                  onClick={() => setExpandedItemId(isExpandedItem ? null : (item.id ?? null))}
                                  className="w-full flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors mt-2"
                                >
                                  {isExpandedItem ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                                  {isExpandedItem ? 'Hide Details' : 'Show More Details'}
                                </button>
                              )}
                              {isExpandedItem && (
                                <div className="mt-4 p-4 rounded-xl bg-muted/50 space-y-2 animate-in fade-in">
                                  {item.fiber && (
                                    <div className="flex justify-between text-sm">
                                      <span>Fiber</span>
                                      <span className="font-medium text-green-600">{item.fiber}g</span>
                                    </div>
                                  )}
                                  {item.sugar && (
                                    <div className="flex justify-between text-sm">
                                      <span>Sugar</span>
                                      <span className="font-medium text-amber-600">{item.sugar}g</span>
                                    </div>
                                  )}
                                  {item.sodium && (
                                    <div className="flex justify-between text-sm">
                                      <span>Sodium</span>
                                      <span className="font-medium text-red-600">{item.sodium}mg</span>
                                    </div>
                                  )}
                                  {item.notes && (
                                    <div className="text-sm text-muted-foreground">
                                      Notes: {item.notes}
                                    </div>
                                  )}
                                  {item.portion_estimate && (
                                    <div className="text-sm text-muted-foreground">
                                      Portion Estimate: {item.portion_estimate}
                                    </div>
                                  )}
                                </div>
                              )}
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
    </TooltipProvider>
  );
}