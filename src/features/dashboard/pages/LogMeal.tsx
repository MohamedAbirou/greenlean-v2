/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Log Meal Page - REVOLUTIONARY 2026 UX/UI
 * The most intuitive, feature-rich meal logging experience ever created
 * Features: AI Plan, Search, Manual, Voice, Barcode, Photo, Real-time Macros, Templates
 */

import { useAuth } from "@/features/auth";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";

import { mealTrackingService, useMealTemplates } from "@/features/nutrition";
import { BarcodeScanner } from "@/features/nutrition/components/BarcodeScanner";
import { FoodSearch } from "@/features/nutrition/components/FoodSearch";
import { MealTemplates } from "@/features/nutrition/components/MealTemplates";
import { PhotoAnalysis } from "@/features/nutrition/components/PhotoAnalysis";
import SaveTemplateDialog from "@/features/nutrition/components/SaveTemplateDialog";
import { VoiceInput } from "@/features/nutrition/components/VoiceInput";
import { FeatureGate } from "@/shared/components/billing/FeatureGate";
import { DatePicker } from "@/shared/components/DatePicker";
import type { LogMethod, MealItem } from "@/shared/types/food.types";
import {
  Apple,
  ArrowLeft,
  Barcode,
  Book,
  Calendar,
  Camera,
  Check,
  Edit2,
  Flame,
  Mic,
  Plus,
  Replace,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useActiveMealPlan } from "../hooks/useDashboardData";

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const getToday = () => new Date().toISOString().split("T")[0];

// REVOLUTIONARY AI MEAL PLAN COMPONENT
function AIMealPlanSelector({
  mealPlan,
  onMealSelect,
  onFoodSelect,
  replacingFood,
}: {
  mealPlan: any;
  onMealSelect: (foods: MealItem[]) => void;
  onFoodSelect: (food: MealItem) => void;
  replacingFood: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"meals" | "foods">("meals");

  // Parse plan_data from GraphQL response
  const planData = mealPlan?.plan_data
    ? typeof mealPlan.plan_data === "string"
      ? JSON.parse(mealPlan.plan_data)
      : mealPlan.plan_data
    : null;

  const meals = planData?.meals || [];

  // Extract all food items from all meals
  const allFoods: any[] = [];
  meals.forEach((meal: any) => {
    if (Array.isArray(meal.foods)) {
      meal.foods.forEach((food: any) => {
        allFoods.push({
          ...food,
          mealName: meal.meal_name,
          mealType: meal.meal_type,
          recipe: meal.recipe,
        });
      });
    }
  });

  // Filter
  const filteredMeals = searchQuery.trim()
    ? meals.filter(
      (meal: any) =>
        meal.meal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.meal_type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : meals;

  const filteredFoods = searchQuery.trim()
    ? allFoods.filter(
      (food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.mealName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allFoods;

  const handleAddFood = (aiFood: any) => {
    const item: MealItem = {
      food_name: aiFood.name,
      brand_name: "AI Meal Plan",
      calories: aiFood.calories || 0,
      protein: aiFood.protein || 0,
      carbs: aiFood.carbs || 0,
      fats: aiFood.fats || 0,
      fiber: aiFood.fiber || 0,
      serving_unit: aiFood.portion || aiFood.serving_size || "serving",
      serving_qty: 1,
      source: 'ai-plan',
      base_calories: aiFood.calories || 0,
      base_protein: aiFood.protein || 0,
      base_carbs: aiFood.carbs || 0,
      base_fats: aiFood.fats || 0,
      base_serving_unit: 'serving',
    };
    onFoodSelect(item);
  };

  const handleSelectWholeMeal = (meal: any) => {
    const items: MealItem[] = meal.foods.map((food: any) => ({  // CHANGED: To MealItem[]
      food_name: food.name,
      brand_name: "AI Meal Plan",
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      fiber: food.fiber || 0,
      serving_unit: food.portion || food.serving_size || "serving",
      serving_qty: 1,
      source: 'ai-plan',
      base_calories: food.calories || 0,
      base_protein: food.protein || 0,
      base_carbs: food.carbs || 0,
      base_fats: food.fats || 0,
      base_serving_unit: 'serving',
    }));
    onMealSelect(items);
  };

  const mealTypeEmoji: Record<string, string> = {
    breakfast: "🌅",
    lunch: "🌞",
    dinner: "🌙",
    snack: "🍎",
  };

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-xl">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <p className="font-semibold text-lg mb-2">No AI Meal Plan Found</p>
        <p className="text-muted-foreground text-sm">
          Create an AI meal plan first to use this feature
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meals or foods from AI plan..."
            className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          />
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setViewMode("meals")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${viewMode === "meals"
              ? "bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md"
              : "hover:bg-background"
              }`}
          >
            Full Meals
          </button>
          <button
            onClick={() => setViewMode("foods")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${viewMode === "foods"
              ? "bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md"
              : "hover:bg-background"
              }`}
          >
            Individual Foods
          </button>
        </div>
      </div>

      {replacingFood && (
        <Badge variant="tip" className="text-xs">
          <Replace className='w-3 h-3 me-1' /> Replacing Food
        </Badge>
      )}

      {/* Meals View */}
      {viewMode === "meals" && (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredMeals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No meals match your search</p>
          ) : (
            filteredMeals.map((meal: any, idx: number) => (
              <Card
                key={idx}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{mealTypeEmoji[meal.meal_type] || "🍽️"}</span>
                        <div>
                          <h3 className="font-bold text-lg">{meal.meal_name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {meal.meal_type}
                          </p>
                        </div>
                      </div>

                      {/* Macros Summary */}
                      <div className="flex gap-4 mb-3">
                        <div className="text-sm">
                          <span className="text-orange-600 dark:text-orange-400 font-bold">
                            {meal.total_calories}
                          </span>
                          <span className="text-muted-foreground ml-1">cal</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">
                            {meal.total_protein}g
                          </span>
                          <span className="text-muted-foreground ml-1">protein</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">
                            {meal.total_carbs}g
                          </span>
                          <span className="text-muted-foreground ml-1">carbs</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-purple-600 dark:text-purple-400 font-bold">
                            {meal.total_fats}g
                          </span>
                          <span className="text-muted-foreground ml-1">fats</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {meal.tags && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {meal.tags.slice(0, 3).map((tag: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Food Items Count */}
                      <p className="text-sm text-muted-foreground">
                        {meal.foods?.length || 0} ingredients • {meal.prep_time_minutes || 0} min
                        prep
                      </p>
                    </div>

                    <Button
                      onClick={() => handleSelectWholeMeal(meal)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Meal
                    </Button>
                  </div>

                  {/* Expandable Foods List */}
                  {meal.foods && meal.foods.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                        View {meal.foods.length} ingredients
                      </summary>
                      <div className="mt-3 space-y-2 pl-4 border-l-2 border-green-500/30">
                        {meal.foods.map((food: any, foodIdx: number) => (
                          <div
                            key={foodIdx}
                            className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{food.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {food.portion || food.serving_size}
                              </p>
                            </div>
                            <button
                              onClick={() => handleAddFood(food)}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors text-xs font-semibold"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Individual Foods View */}
      {viewMode === "foods" && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {filteredFoods.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No foods match your search</p>
          ) : (
            filteredFoods.map((food: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handleAddFood(food)}
                className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">{food.name}</p>
                    <div className="flex gap-2 flex-wrap text-xs mb-2">
                      <Badge variant="outline" className="text-xs">
                        {mealTypeEmoji[food.mealType]} {food.mealName}
                      </Badge>
                      <span className="text-muted-foreground">
                        {food.portion || food.serving_size}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="text-orange-600 font-semibold">{food.calories}cal</span>
                      <span className="text-blue-600">P:{food.protein}g</span>
                      <span className="text-amber-600">C:{food.carbs}g</span>
                      <span className="text-purple-600">F:{food.fats}g</span>
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {!replacingFood && (viewMode === "meals" ? filteredMeals : filteredFoods).length > 0 && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-500/20">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            AI-Powered Meal Planning
          </p>
          <p className="text-sm text-muted-foreground">
            {viewMode === "meals"
              ? "Select entire meals or individual ingredients from your personalized meal plan"
              : "Browse all ingredients across your meal plan and add them individually"}
          </p>
        </div>
      )}
    </div>
  );
}

// MAIN LOG MEAL COMPONENT
export function LogMeal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [logMethod, setLogMethod] = useState<LogMethod>("search");
  const [logDate, setLogDate] = useState(getToday());
  const [mealType, setMealType] = useState<MealType>((searchParams.get("meal") as MealType | null) || "breakfast");
  const [selectedItems, setSelectedItems] = useState<MealItem[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [replacingItemIndex, setReplacingItemIndex] = useState<number | null>(null);
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [creatingLog, setCreatingLog] = useState(false);


  const { createTemplate, isCreating: isCreatingTemplate } = useMealTemplates();

  const { data: activeMealPlan } = useActiveMealPlan();

  // Edit form state
  const [editForm, setEditForm] = useState({
    food_name: "",
    brand_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    fiber: "",
    serving_qty: "",
    serving_unit: "",
  });

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    food_name: "",
    brand_name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    fiber: "",
    serving_qty: "",
    serving_unit: "",
  });

  // NEW: Recalc macros when qty/unit changes (basic - assumes per serving; for per g, adjust if base_unit='g')
  const recalcMacros = (item: MealItem, newQty: number, newUnit?: string): MealItem => {
    const multiplier = newQty / (item.base_serving_qty || 1);  // Assume base is per 1 unit
    return {
      ...item,
      serving_qty: newQty,
      serving_unit: newUnit || item.serving_unit,
      calories: (item.base_calories || item.calories) * multiplier,
      protein: (item.base_protein || item.protein) * multiplier,
      carbs: (item.base_carbs || item.carbs) * multiplier,
      fats: (item.base_fats || item.fats) * multiplier,
      fiber: (item.base_fiber || item.fiber || 0) * multiplier,
      sugar: (item.base_sugar || item.sugar || 0) * multiplier,
      sodium: (item.base_sodium || item.sodium || 0) * multiplier,
    };
  };

  const handleItemSelect = (item: MealItem) => {
    if (replacingItemIndex !== null) {
      const updated = [...selectedItems];
      updated[replacingItemIndex] = {
        ...item,
        serving_qty: updated[replacingItemIndex].serving_qty,
      };
      setSelectedItems(updated);
      setReplacingItemIndex(null);
      setLogMethod("search");
      return;
    }

    setSelectedItems([...selectedItems, item]);
  };

  const handleMealSelect = (items: MealItem[]) => {
    setSelectedItems(items);
    setLogMethod("search");
  };

  const handleBarcodeScanned = (scannedItem: any) => {
    const item: MealItem = {
      food_id: scannedItem.id,
      food_name: scannedItem.name,
      brand_name: scannedItem.brand,
      calories: scannedItem.calories,
      protein: scannedItem.protein,
      carbs: scannedItem.carbs,
      fats: scannedItem.fats,
      fiber: scannedItem.fiber,
      serving_unit: scannedItem.serving_size,
      serving_qty: 1,
      base_calories: scannedItem.calories,
      base_protein: scannedItem.protein,
      base_carbs: scannedItem.carbs,
      base_fats: scannedItem.fats,
      base_serving_unit: scannedItem.serving_size,
      source: 'barcode',
    };
    setSelectedItems([...selectedItems, item]);
    setShowBarcodeScanner(false);
  };

  const handleTemplateSelect = (items: MealItem[]) => {
    setSelectedItems([...selectedItems, ...items]);
    setLogMethod("template");
  };

  const handleVoiceRecognized = (foods: any[]) => {
    const items: MealItem[] = foods.map((food) => ({
      food_name: food.name,
      brand_name: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      serving_unit: food.unit || "serving",
      serving_qty: food.quantity || 1,
      base_calories: food.calories / (food.quantity || 1),
      base_protein: food.protein / (food.quantity || 1),
      base_carbs: food.carbs / (food.quantity || 1),
      base_fats: food.fats / (food.quantity || 1),
      base_serving_unit: food.unit || "serving",
      source: 'voice',
    }));
    setSelectedItems([...selectedItems, ...items]);
    setLogMethod("search");
  };

  const handlePhotoRecognized = (foods: any[]) => {
    const items: MealItem[] = foods.map((food) => ({
      food_name: food.name,
      brand_name: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      serving_unit: food.serving_size || "serving",
      serving_qty: food.quantity || 1,
      base_calories: food.calories / (food.quantity || 1),
      base_protein: food.protein / (food.quantity || 1),
      base_carbs: food.carbs / (food.quantity || 1),
      base_fats: food.fats / (food.quantity || 1),
      base_serving_unit: food.serving_size || "serving",
      source: 'photo'
    }));
    setSelectedItems([...selectedItems, ...items]);
    setLogMethod("search");
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleEditItem = (index: number) => {
    const item = selectedItems[index];
    setEditForm({
      food_name: item.food_name,
      brand_name: item.brand_name || "",
      calories: String(item.calories),
      protein: String(item.protein),
      carbs: String(item.carbs),
      fats: String(item.fats),
      fiber: String(item.fiber || 0),
      serving_qty: String(item.serving_qty),
      serving_unit: item.serving_unit || "serving",
    });
    setEditingItemIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingItemIndex === null) return;

    const updated = [...selectedItems];
    const newItem = {
      ...updated[editingItemIndex],
      food_name: editForm.food_name,
      brand_name: editForm.brand_name || undefined,
      calories: Number(editForm.calories) || 0,
      protein: Number(editForm.protein) || 0,
      carbs: Number(editForm.carbs) || 0,
      fats: Number(editForm.fats) || 0,
      fiber: Number(editForm.fiber) || 0,
      serving_qty: Number(editForm.serving_qty) || 1,
      serving_unit: editForm.serving_unit,
      // Update bases for future recalc
      base_calories: Number(editForm.calories) / (Number(editForm.serving_qty) || 1),
      base_protein: Number(editForm.protein) / (Number(editForm.serving_qty) || 1),
      base_carbs: Number(editForm.carbs) / (Number(editForm.serving_qty) || 1),
      base_fats: Number(editForm.fats) / (Number(editForm.serving_qty) || 1),
      base_serving_unit: editForm.serving_unit,
    };
    updated[editingItemIndex] = newItem;
    setSelectedItems(updated);
    setEditingItemIndex(null);
  };

  const handleReplaceItem = (index: number) => {
    setReplacingItemIndex(index);
    setLogMethod("search");
  };

  const handleManualItemAdd = () => {
    if (!manualForm.food_name.trim()) return;

    const qty = 1;
    const item: MealItem = {
      food_name: manualForm.food_name.trim(),
      brand_name: manualForm.brand_name || undefined,
      calories: Number(manualForm.calories) || 0,
      protein: Number(manualForm.protein) || 0,
      carbs: Number(manualForm.carbs) || 0,
      fats: Number(manualForm.fats) || 0,
      fiber: Number(manualForm.fiber) || 0,
      serving_unit: manualForm.serving_unit || "serving",
      serving_qty: qty,
      base_calories: Number(manualForm.calories) || 0,
      base_protein: Number(manualForm.protein) || 0,
      base_carbs: Number(manualForm.carbs) || 0,
      base_fats: Number(manualForm.fats) || 0,
      base_serving_unit: manualForm.serving_unit || "serving",
      source: 'manual',
    };

    setSelectedItems([...selectedItems, item]);

    // Reset form
    setManualForm({
      food_name: "",
      brand_name: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      fiber: "",
      serving_qty: "",
      serving_unit: "",
    });
  };

  const handleUpdateQty = (index: number, qty: number) => {
    const updated = [...selectedItems];
    updated[index] = recalcMacros(updated[index], qty);
    setSelectedItems(updated);
  };

  // const handleUpdateUnit = (index: number, unit: string) => {
  //   const updated = [...selectedItems];
  //   updated[index].serving_unit = unit;
  //   // For now, no auto-convert - user edits macros manually if needed
  //   toast.info("Unit changed - please verify and edit macros if necessary.");
  //   setSelectedItems(updated);
  // };

  const calculateTotals = () => {
    return selectedItems.reduce(
      (totals, item) => ({
        calories: totals.calories + item.calories,
        protein: totals.protein + item.protein,
        carbs: totals.carbs + item.carbs,
        fats: totals.fats + item.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const handleLogMeal = async () => {
    if (!user?.id || selectedItems.length === 0) return;

    try {
      setCreatingLog(true);
      const { error } = await mealTrackingService.logMeal(user.id, mealType, selectedItems, logDate, 'notes');

      if (error) throw error;

      toast.success("Meal logged!");
      navigate("/dashboard?tab=nutrition");
    } catch (error) {
      console.error("Error logging meal:", error);
      toast.error("Failed to log meal. Please try again.");
    } finally {
      setCreatingLog(false);
    }
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.warning("Please enter a template name");
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("Please add items before saving as template");
      return;
    }

    await createTemplate(templateName, templateDescription, selectedItems, mealType);

    setTemplateName("");
    setTemplateDescription("");
    setShowSaveTemplateDialog(false);
  };

  const totals = calculateTotals();

  const mealTypeConfig: Record<MealType, { emoji: string; gradient: string; bg: string }> = {
    breakfast: {
      emoji: "🌅",
      gradient: "from-orange-500 to-amber-500",
      bg: "from-orange-500/20 to-amber-500/20",
    },
    lunch: {
      emoji: "🌞",
      gradient: "from-yellow-500 to-amber-500",
      bg: "from-yellow-500/20 to-amber-500/20",
    },
    dinner: {
      emoji: "🌙",
      gradient: "from-blue-500 to-indigo-500",
      bg: "from-blue-500/20 to-indigo-500/20",
    },
    snack: {
      emoji: "🍎",
      gradient: "from-green-500 to-emerald-500",
      bg: "from-green-500/20 to-emerald-500/20",
    },
  };

  const inputMethods = [
    {
      id: "search",
      label: "Search",
      icon: Search,
      gradient: "from-blue-500 to-cyan-500",
      description: "Find foods from database",
    },
    {
      id: "ai-plan",
      label: "AI Plan",
      icon: Sparkles,
      gradient: "from-purple-500 to-pink-500",
      description: "Use your personalized lan",
    },
    {
      id: "manual",
      label: "Manual",
      icon: Edit2,
      gradient: "from-green-500 to-emerald-500",
      description: "Enter macros manually",
    },
    {
      id: "voice",
      label: "Voice",
      icon: Mic,
      gradient: "from-orange-500 to-red-500",
      description: "Speak your meal",
    },
    {
      id: "barcode",
      label: "Barcode",
      icon: Barcode,
      gradient: "from-indigo-500 to-purple-500",
      description: "Scan product barcode",
    },
    {
      id: "photo",
      label: "Photo",
      icon: Camera,
      gradient: "from-pink-500 to-rose-500",
      description: "Take a picture",
    },
    {
      id: "template",
      label: "Templates",
      icon: Book,
      gradient: "from-amber-500 to-orange-500",
      description: "Use saved meals",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* PREMIUM HERO SECTION */}
        <div className="relative rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-10 text-white shadow-2xl mb-8">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>

          <div className="relative z-10">
            <Button
              onClick={() => navigate("/dashboard?tab=nutrition")}
              variant="ghost"
              className="mb-6 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                <Apple className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">Log Your Meal</h1>
                <p className="text-green-100 text-xl">
                  Track nutrition the easy way - multiple input methods, AI-powered, effortless
                </p>
              </div>
            </div>
            <DatePicker selectedDate={logDate} onDateChange={setLogDate} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Input Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Meal Type Selector */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <span>Select Meal Type</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(mealTypeConfig).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => setMealType(type as MealType)}
                      className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 ${mealType === type
                        ? `border-transparent shadow-xl scale-105`
                        : "border-border hover:border-green-500/50 hover:scale-102"
                        }`}
                      style={
                        mealType === type
                          ? {
                            background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                            backgroundImage: `linear-gradient(135deg, rgb(34 197 94) 0%, rgb(16 185 129) 100%)`,
                          }
                          : {}
                      }
                    >
                      {mealType === type && (
                        <div
                          className="absolute inset-0 bg-gradient-to-br opacity-20 animate-pulse"
                          style={{
                            backgroundImage: `linear-gradient(135deg, rgb(255 255 255) 0%, transparent 100%)`,
                          }}
                        />
                      )}
                      <div className="relative text-center">
                        <div className="text-4xl mb-2">{config.emoji}</div>
                        <p
                          className={`font-bold capitalize ${mealType === type ? "text-white" : ""}`}
                        >
                          {type}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Input Methods Grid */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span>Choose Input Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {inputMethods.map((method) => {
                    const Icon = method.icon;
                    const isActive = logMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => {
                          setLogMethod(method.id as LogMethod);
                          if (method.id === "barcode") setShowBarcodeScanner(true);
                        }}
                        className={`group relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 ${isActive
                          ? "border-transparent shadow-lg scale-105"
                          : "border-border hover:border-primary-500/50 hover:scale-102"
                          }`}
                        style={
                          isActive
                            ? {
                              background: `linear-gradient(135deg, ${method.gradient.split(" ")[0].replace("from-", "var(--color-")}, ${method.gradient.split(" ")[1].replace("to-", "var(--color-")}`,
                            }
                            : {}
                        }
                      >
                        <div className="relative text-center">
                          <Icon
                            className={`h-6 w-6 mx-auto mb-2 ${isActive ? "text-white" : "text-muted-foreground"}`}
                          />
                          <p className={`font-semibold text-sm ${isActive ? "text-white" : ""}`}>
                            {method.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Input Method Content */}
                <div className="min-h-[400px]">
                  {logMethod === "search" && (
                    <FoodSearch
                      onFoodSelect={handleItemSelect}
                      replacingFood={replacingItemIndex !== null}
                    />
                  )}

                  {logMethod === "ai-plan" && (
                    <AIMealPlanSelector
                      mealPlan={activeMealPlan}
                      onMealSelect={handleMealSelect}
                      onFoodSelect={handleItemSelect}
                      replacingFood={replacingItemIndex !== null}
                    />
                  )}

                  {logMethod === "manual" && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border-2 border-green-500/20 mb-4">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                          <Edit2 className="h-4 w-4 text-green-600" />
                          Manual Entry
                          {replacingItemIndex !== null && (
                            <Badge variant="tip" className="text-xs">
                              <Replace className='w-3 h-3 me-1' /> Replacing Food
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Enter nutrition information manually for custom foods
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold mb-2">Food Name *</label>
                          <input
                            type="text"
                            value={manualForm.food_name}
                            onChange={(e) => setManualForm({ ...manualForm, food_name: e.target.value })}
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
                            value={manualForm.brand_name}
                            onChange={(e) =>
                              setManualForm({ ...manualForm, brand_name: e.target.value })
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
                            value={manualForm.calories}
                            onChange={(e) =>
                              setManualForm({ ...manualForm, calories: e.target.value })
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
                            value={manualForm.protein}
                            onChange={(e) =>
                              setManualForm({ ...manualForm, protein: e.target.value })
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
                            value={manualForm.carbs}
                            onChange={(e) =>
                              setManualForm({ ...manualForm, carbs: e.target.value })
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
                            value={manualForm.fats}
                            onChange={(e) => setManualForm({ ...manualForm, fats: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 border-2 border-purple-200 dark:border-purple-900/30 rounded-xl bg-background hover:border-purple-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Fiber (g)</label>
                          <input
                            type="number"
                            value={manualForm.fiber}
                            onChange={(e) =>
                              setManualForm({ ...manualForm, fiber: e.target.value })
                            }
                            placeholder="0"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Serving Size</label>
                          <input
                            type="text"
                            value={manualForm.serving_unit}
                            onChange={(e) =>
                              setManualForm({ ...manualForm, serving_unit: e.target.value })
                            }
                            placeholder="e.g., 100g, 1 cup"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleManualItemAdd}
                        disabled={!manualForm.food_name || !manualForm.calories}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-6 text-base font-semibold"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Food to Meal
                      </Button>
                    </div>
                  )}

                  {logMethod === "voice" && (
                    <VoiceInput onFoodsRecognized={handleVoiceRecognized} />
                  )}

                  {logMethod === "barcode" && showBarcodeScanner && (
                    <FeatureGate feature="barcode_scanner" mode="block">
                      <BarcodeScanner
                        onFoodScanned={handleBarcodeScanned}
                        onClose={() => {
                          setShowBarcodeScanner(false);
                          setLogMethod("search");
                        }}
                      />
                    </FeatureGate>
                  )}

                  {logMethod === "photo" && (
                    <FeatureGate feature="ai_photo_analysis" mode="block">
                      <PhotoAnalysis
                        onFoodsRecognized={handlePhotoRecognized}
                        onClose={() => {
                          setLogMethod("search");
                        }}
                      />
                    </FeatureGate>
                  )}

                  {logMethod === "template" && (
                    <MealTemplates
                      onTemplateSelect={handleTemplateSelect}
                      onClose={() => {
                        setLogMethod("search");
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Meal Builder & Summary */}
          <div className="space-y-6">
            {/* Real-time Macro Calculator */}
            <Card
              className={`border-0 shadow-2xl bg-gradient-to-br ${mealTypeConfig[mealType].bg}`}
            >
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br ${mealTypeConfig[mealType].gradient} shadow-lg`}
                  >
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <span>Meal Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Macro Totals */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-950/10 border-2 border-orange-200/50 dark:border-orange-900/30">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">
                      Calories
                    </p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(totals.calories)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-950/10 border-2 border-blue-200/50 dark:border-blue-900/30">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                      Protein
                    </p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {Math.round(totals.protein)}g
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-950/10 border-2 border-amber-200/50 dark:border-amber-900/30">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
                      Carbs
                    </p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {Math.round(totals.carbs)}g
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-950/10 border-2 border-purple-200/50 dark:border-purple-900/30">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                      Fats
                    </p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.round(totals.fats)}g
                    </p>
                  </div>
                </div>

                {/* Foods List */}
                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2">
                  {selectedItems.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4 shadow-lg opacity-50">
                        <Apple className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        No foods added yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Choose an input method above
                      </p>
                    </div>
                  ) : (
                    selectedItems.map((item, index) => (
                      <div key={index}>
                        {editingItemIndex === index ? (
                          // Edit Mode
                          <Card className="p-3 border-2 border-primary-500 shadow-lg">
                            <CardContent className="p-0 space-y-3">
                              <input
                                type="text"
                                value={editForm.food_name}
                                onChange={(e) => setEditForm({ ...editForm, food_name: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-border rounded-lg bg-background font-semibold"
                                placeholder="Food name"
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-orange-600 dark:text-orange-400">
                                    Calories
                                  </label>
                                  <input
                                    type="number"
                                    value={editForm.calories}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, calories: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border-2 border-orange-200 dark:border-orange-900/30 rounded-lg bg-background text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-blue-600 dark:text-blue-400">
                                    Protein (g)
                                  </label>
                                  <input
                                    type="number"
                                    value={editForm.protein}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, protein: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border-2 border-blue-200 dark:border-blue-900/30 rounded-lg bg-background text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-amber-600 dark:text-amber-400">
                                    Carbs (g)
                                  </label>
                                  <input
                                    type="number"
                                    value={editForm.carbs}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, carbs: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border-2 border-amber-200 dark:border-amber-900/30 rounded-lg bg-background text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">
                                    Fats (g)
                                  </label>
                                  <input
                                    type="number"
                                    value={editForm.fats}
                                    onChange={(e) =>
                                      setEditForm({ ...editForm, fats: e.target.value })
                                    }
                                    className="w-full px-3 py-2 border-2 border-purple-200 dark:border-purple-900/30 rounded-lg bg-background text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold mb-1">Quantity</label>
                                <input
                                  type="number"
                                  value={editForm.serving_qty}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, serving_qty: e.target.value })
                                  }
                                  step="0.1"
                                  min="0.1"
                                  className="w-full px-3 py-2 border-2 border-border rounded-lg bg-background text-sm"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold mb-1">Unit</label>
                                <input
                                  type="text"
                                  value={editForm.serving_unit}
                                  onChange={(e) =>
                                    setEditForm({ ...editForm, serving_unit: e.target.value })
                                  }
                                  className="w-full px-3 py-2 border-2 border-border rounded-lg bg-background text-sm"
                                />
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  onClick={handleSaveEdit}
                                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                                  size="sm"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingItemIndex(null)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          // View Mode
                          <Card className="p-3 group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500/50">
                            <CardContent className="p-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-base mb-1">{item.food_name}</p>
                                  {item.brand_name && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                      {item.brand_name}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mb-2">
                                    <input
                                      type="number"
                                      value={item.serving_qty}
                                      onChange={(e) =>
                                        handleUpdateQty(index, Number(e.target.value))
                                      }
                                      step="0.1"
                                      min="0.1"
                                      className="w-20 px-2 py-1 border-2 border-border rounded-lg bg-background text-sm font-semibold"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      × {item.serving_unit}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                                    <div className="flex-1 text-center p-2 rounded-lg bg-orange-500/20">
                                      <p className="font-bold text-orange-500">
                                        {Math.round(item.calories * item.serving_qty)}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">cal</p>
                                    </div>
                                    <div className="flex-1 text-center p-2 rounded-lg bg-blue-500/20">
                                      <p className="font-bold text-blue-500">
                                        {Math.round(item.protein * item.serving_qty)}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">protein</p>
                                    </div>
                                    <div className="flex-1 text-center p-2 rounded-lg bg-amber-500/20">
                                      <p className="font-bold text-amber-500">
                                        {Math.round(item.carbs * item.serving_qty)}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">carbs</p>
                                    </div>
                                    <div className="flex-1 text-center p-2 rounded-lg bg-purple-500/20">
                                      <p className="font-bold text-purple-500">
                                        {Math.round(item.fats * item.serving_qty)}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">fats</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-3">
                                  <button
                                    onClick={() => handleEditItem(index)}
                                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReplaceItem(index)}
                                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                                    title="Replace"
                                  >
                                    <Replace className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleLogMeal}
                    disabled={selectedItems.length === 0 || creatingLog}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-6 text-base font-semibold"
                  >
                    {creatingLog ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Logging Meal...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Log {mealTypeConfig[mealType].emoji}{" "}
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </>
                    )}
                  </Button>

                  {selectedItems.length > 0 && (
                    <Button
                      onClick={() => setShowSaveTemplateDialog(true)}
                      variant="outline"
                      className="w-full border-2 hover:bg-primary-50 dark:hover:bg-primary-950/20"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            {selectedItems.length === 0 && (
              <Card className="border-2 border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Pro Tips</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Use AI Plan for quick meal selection</li>
                        <li>• Voice input for hands-free logging</li>
                        <li>• Scan barcodes for accurate data</li>
                        <li>• Save frequent meals as templates</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      {showSaveTemplateDialog && (
        <SaveTemplateDialog
          setShowSaveTemplateDialog={setShowSaveTemplateDialog}
          handleSaveAsTemplate={handleSaveAsTemplate}
          isCreatingTemplate={isCreatingTemplate}
          selectedItems={selectedItems}
          setTemplateDescription={setTemplateDescription}
          setTemplateName={setTemplateName}
          templateDescription={templateDescription}
          templateName={templateName}
          totals={totals}
        />
      )}
    </div>
  );
}
