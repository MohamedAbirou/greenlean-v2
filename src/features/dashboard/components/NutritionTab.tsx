/**
 * Modern Nutrition Tab - Premium Food Tracking
 * Full edit/swap/delete functionality for food items
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Apple, Plus, Trash2, TrendingUp, Target, Edit2, X, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  calculateDailyTotals,
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
}

export function NutritionTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data: mealData, loading, refetch } = useMealItemsByDate(selectedDate);
  const { data: targetsData } = useCurrentMacroTargets();
  const [deleteMealItem] = useDeleteMealItem();
  const [updateMealItem] = useUpdateMealItem();

  // Edit state
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editingFoodItem, setEditingFoodItem] = useState<{ mealId: string; index: number } | null>(null);
  const [swappingFoodItem, setSwappingFoodItem] = useState<{ mealId: string; index: number } | null>(null);

  // Form state
  const [editMealForm, setEditMealForm] = useState({
    meal_type: '',
    notes: '',
  });

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

  const handleDeleteFoodItem = async (mealId: string, foodItemIndex: number) => {
    if (confirm('Delete this food item?')) {
      const meal = nutritionLogs.find((m: any) => m.id === mealId);
      if (!meal) return;

      const foodItems = Array.isArray(meal.food_items) ? meal.food_items : [];
      const updatedFoodItems = foodItems.filter((_: any, idx: number) => idx !== foodItemIndex);

      // Recalculate totals
      const totals = updatedFoodItems.reduce(
        (acc: any, item: any) => ({
          calories: acc.calories + (item.calories || 0),
          protein: acc.protein + (item.protein || 0),
          carbs: acc.carbs + (item.carbs || 0),
          fats: acc.fats + (item.fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

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

  const startEditMeal = (meal: any) => {
    setEditingMealId(meal.id);
    setEditMealForm({
      meal_type: meal.meal_type || '',
      notes: meal.notes || '',
    });
  };

  const saveEditMeal = async (mealId: string) => {
    await updateMealItem({
      variables: {
        id: mealId,
        set: {
          meal_type: editMealForm.meal_type,
          notes: editMealForm.notes,
        },
      },
    });
    setEditingMealId(null);
    refetch();
  };

  const startEditFoodItem = (mealId: string, foodItemIndex: number, foodItem: FoodItem) => {
    setEditingFoodItem({ mealId, index: foodItemIndex });
    setEditFoodItemForm(JSON.parse(JSON.stringify(foodItem))); // Deep clone
  };

  const saveEditFoodItem = async () => {
    if (!editingFoodItem) return;

    const meal = nutritionLogs.find((m: any) => m.id === editingFoodItem.mealId);
    if (!meal) return;

    const foodItems = Array.isArray(meal.food_items) ? [...meal.food_items] : [];
    foodItems[editingFoodItem.index] = editFoodItemForm;

    // Recalculate totals
    const totals = foodItems.reduce(
      (acc: any, item: any) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fats: acc.fats + (item.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

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

  const startSwapFoodItem = (mealId: string, foodItemIndex: number) => {
    setSwappingFoodItem({ mealId, index: foodItemIndex });
  };

  const handleSwapFoodItem = async (selectedFood: any) => {
    if (!swappingFoodItem) return;

    const meal = nutritionLogs.find((m: any) => m.id === swappingFoodItem.mealId);
    if (!meal) return;

    const foodItems = Array.isArray(meal.food_items) ? [...meal.food_items] : [];
    const oldFoodItem = foodItems[swappingFoodItem.index];

    // Replace food item but keep quantity
    foodItems[swappingFoodItem.index] = {
      name: selectedFood.name,
      brand: selectedFood.brand || '',
      calories: selectedFood.calories || 0,
      protein: selectedFood.protein || 0,
      carbs: selectedFood.carbs || 0,
      fats: selectedFood.fats || 0,
      serving_size: selectedFood.serving_size || '',
      quantity: oldFoodItem.quantity || 1,
    };

    // Recalculate totals
    const totals = foodItems.reduce(
      (acc: any, item: any) => ({
        calories: acc.calories + (item.calories || 0),
        protein: acc.protein + (item.protein || 0),
        carbs: acc.carbs + (item.carbs || 0),
        fats: acc.fats + (item.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

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
                    {meals.map((meal: any) => {
                      const isEditingMeal = editingMealId === meal.id;
                      const foodItems = Array.isArray(meal.food_items) ? meal.food_items : [];

                      return (
                        <Card key={meal.id} className="group hover:shadow-md transition-all hover:border-green-500/40">
                          <CardContent className="py-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {/* Edit Meal Form */}
                                {isEditingMeal ? (
                                  <div className="space-y-3 mb-4">
                                    <h5 className="font-semibold">Edit Meal Details</h5>
                                    <div>
                                      <label className="text-sm font-medium mb-1 block">Meal Type</label>
                                      <select
                                        value={editMealForm.meal_type}
                                        onChange={(e) => setEditMealForm({ ...editMealForm, meal_type: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                      >
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snack">Snack</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium mb-1 block">Notes</label>
                                      <textarea
                                        value={editMealForm.notes}
                                        onChange={(e) => setEditMealForm({ ...editMealForm, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                        rows={2}
                                      />
                                    </div>
                                    <div className="flex gap-2">
                                      <Button onClick={() => saveEditMeal(meal.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                      </Button>
                                      <Button onClick={() => setEditingMealId(null)} size="sm" variant="outline">
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : null}

                                {/* Food Items */}
                                {!isEditingMeal && (
                                  <div className="space-y-2">
                                    {foodItems.map((item: FoodItem, idx: number) => {
                                      const isEditingThisFoodItem = editingFoodItem?.mealId === meal.id && editingFoodItem?.index === idx;
                                      const isSwappingThisFoodItem = swappingFoodItem?.mealId === meal.id && swappingFoodItem?.index === idx;

                                      if (isSwappingThisFoodItem) {
                                        return (
                                          <div key={idx} className="p-4 border-2 border-green-500 rounded-lg bg-green-50 dark:bg-green-950/20">
                                            <div className="flex items-center justify-between mb-3">
                                              <h5 className="font-semibold">Replace Food: {item.name}</h5>
                                              <Button onClick={() => setSwappingFoodItem(null)} size="sm" variant="ghost">
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            <FoodSearch onSelect={handleSwapFoodItem} />
                                          </div>
                                        );
                                      }

                                      if (isEditingThisFoodItem) {
                                        return (
                                          <div key={idx} className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                            <h5 className="font-semibold mb-3">Edit Food Item</h5>
                                            <div className="space-y-3">
                                              <div>
                                                <label className="text-sm font-medium mb-1 block">Food Name</label>
                                                <input
                                                  type="text"
                                                  value={editFoodItemForm.name}
                                                  onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, name: e.target.value })}
                                                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                                />
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium mb-1 block">Brand (optional)</label>
                                                <input
                                                  type="text"
                                                  value={editFoodItemForm.brand || ''}
                                                  onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, brand: e.target.value })}
                                                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                                />
                                              </div>
                                              <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">Calories</label>
                                                  <input
                                                    type="number"
                                                    value={editFoodItemForm.calories}
                                                    onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, calories: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">Quantity</label>
                                                  <input
                                                    type="number"
                                                    value={editFoodItemForm.quantity || 1}
                                                    onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, quantity: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                                  />
                                                </div>
                                              </div>
                                              <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">Protein (g)</label>
                                                  <input
                                                    type="number"
                                                    value={editFoodItemForm.protein}
                                                    onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, protein: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">Carbs (g)</label>
                                                  <input
                                                    type="number"
                                                    value={editFoodItemForm.carbs}
                                                    onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, carbs: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">Fats (g)</label>
                                                  <input
                                                    type="number"
                                                    value={editFoodItemForm.fats}
                                                    onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, fats: Number(e.target.value) })}
                                                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                                  />
                                                </div>
                                              </div>
                                              <div>
                                                <label className="text-sm font-medium mb-1 block">Serving Size</label>
                                                <input
                                                  type="text"
                                                  value={editFoodItemForm.serving_size || ''}
                                                  onChange={(e) => setEditFoodItemForm({ ...editFoodItemForm, serving_size: e.target.value })}
                                                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                                  placeholder="e.g., 100g, 1 cup"
                                                />
                                              </div>
                                              <div className="flex gap-2">
                                                <Button onClick={saveEditFoodItem} size="sm" className="bg-green-600 hover:bg-green-700">
                                                  <Save className="h-4 w-4 mr-1" />
                                                  Save
                                                </Button>
                                                <Button onClick={() => setEditingFoodItem(null)} size="sm" variant="outline">
                                                  <X className="h-4 w-4 mr-1" />
                                                  Cancel
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      }

                                      return (
                                        <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm font-medium">{item.name}</span>
                                              {item.brand && (
                                                <span className="text-xs text-muted-foreground">({item.brand})</span>
                                              )}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              {Math.round(item.calories)} cal • P:{Math.round(item.protein)}g • C:{Math.round(item.carbs)}g • F:{Math.round(item.fats)}g
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                              onClick={() => startEditFoodItem(meal.id, idx, item)}
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0"
                                            >
                                              <Edit2 className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              onClick={() => startSwapFoodItem(meal.id, idx)}
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0 text-green-600"
                                            >
                                              <RefreshCw className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              onClick={() => handleDeleteFoodItem(meal.id, idx)}
                                              size="sm"
                                              variant="ghost"
                                              className="h-8 w-8 p-0 text-red-600"
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {/* Meal Totals */}
                                {!isEditingMeal && (
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
                                )}

                                {/* Notes */}
                                {meal.notes && !isEditingMeal && (
                                  <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                                    <span className="text-muted-foreground">Note: </span>
                                    {meal.notes}
                                  </div>
                                )}
                              </div>

                              {/* Meal Actions */}
                              {!isEditingMeal && (
                                <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    onClick={() => startEditMeal(meal)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteMeal(meal.id)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
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
