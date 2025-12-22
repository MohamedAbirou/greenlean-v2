/**
 * Log Meal Page - REVOLUTIONARY 2026 UX/UI
 * The most intuitive, feature-rich meal logging experience ever created
 * Features: AI Plan, Search, Manual, Voice, Barcode, Photo, Real-time Macros, Templates
 */

import { useAuth } from '@/features/auth';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

import {
  Apple,
  ArrowLeft,
  Barcode, Book,
  Calendar,
  Camera,
  Check,
  Edit2,
  Flame,
  Mic,
  Plus, Replace,
  Save,
  Search,
  Sparkles,
  Trash2, X,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { DatePicker } from '../components/DatePicker';
import { FoodSearch } from '../components/FoodSearch';
import { MealTemplates } from '../components/MealTemplates';
import { PhotoAnalysis } from '../components/PhotoAnalysis';
import { VoiceInput } from '../components/VoiceInput';
import { useActiveMealPlan, useMealItemsByDate } from '../hooks/useDashboardData';
import { useCreateMealItem } from '../hooks/useDashboardMutations';

type LogMethod = 'search' | 'manual' | 'voice' | 'barcode' | 'photo' | 'aiPlan' | 'template';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  serving_size?: string;
  verified?: boolean;
}

interface SelectedFood extends FoodItem {
  quantity: number;
  mealType: string;
}

const getToday = () => new Date().toISOString().split('T')[0];

// REVOLUTIONARY AI MEAL PLAN COMPONENT
function AIMealPlanSelector({ mealPlan, onMealSelect, onFoodSelect, replacingFood }: {
  mealPlan: any;
  onMealSelect: (foods: FoodItem[]) => void;
  onFoodSelect: (food: FoodItem) => void;
  replacingFood: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'meals' | 'foods'>('meals');

  // Parse plan_data from GraphQL response
  const planData = mealPlan?.plan_data
    ? (typeof mealPlan.plan_data === 'string' ? JSON.parse(mealPlan.plan_data) : mealPlan.plan_data)
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
    ? meals.filter((meal: any) =>
      meal.meal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meal.meal_type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : meals;

  const filteredFoods = searchQuery.trim()
    ? allFoods.filter(food =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.mealName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allFoods;

  const handleAddFood = (aiFood: any) => {
    const food: FoodItem = {
      id: `ai-${Date.now()}-${Math.random()}`,
      name: aiFood.name,
      brand: 'AI Meal Plan',
      calories: aiFood.calories || 0,
      protein: aiFood.protein || 0,
      carbs: aiFood.carbs || 0,
      fats: aiFood.fats || 0,
      fiber: aiFood.fiber || 0,
      serving_size: aiFood.portion || aiFood.serving_size || '1 serving',
      verified: true,
    };
    onFoodSelect(food);
  };

  const handleSelectWholeMeal = (meal: any) => {
    const foods: FoodItem[] = meal.foods.map((food: any) => ({
      id: `ai-${Date.now()}-${Math.random()}`,
      name: food.name,
      brand: 'AI Meal Plan',
      calories: food.calories || 0,
      protein: food.protein || 0,
      carbs: food.carbs || 0,
      fats: food.fats || 0,
      fiber: food.fiber || 0,
      serving_size: food.portion || food.serving_size || '1 serving',
      verified: true,
      quantity: 1,
      mealType: meal.meal_type,
    }));
    onMealSelect(foods);
  };

  const mealTypeEmoji: Record<string, string> = {
    breakfast: '🌅',
    lunch: '🌞',
    dinner: '🌙',
    snack: '🍎',
  };

  if (meals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6 shadow-xl">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <p className="font-semibold text-lg mb-2">No AI Meal Plan Found</p>
        <p className="text-muted-foreground text-sm">Create an AI meal plan first to use this feature</p>
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
            onClick={() => setViewMode('meals')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${viewMode === 'meals'
              ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md'
              : 'hover:bg-background'
             }`}
          >
            Full Meals
          </button>
          <button
            onClick={() => setViewMode('foods')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${viewMode === 'foods'
              ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md'
              : 'hover:bg-background'
              }`}
          >
            Individual Foods
          </button>
        </div>
      </div>

      {/* Meals View */}
      {viewMode === 'meals' && (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredMeals.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No meals match your search</p>
          ) : (
            filteredMeals.map((meal: any, idx: number) => (
              <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-500/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{mealTypeEmoji[meal.meal_type] || '🍽️'}</span>
                        <div>
                          <h3 className="font-bold text-lg">{meal.meal_name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{meal.meal_type}</p>
                        </div>
                      </div>

                      {/* Macros Summary */}
                      <div className="flex gap-4 mb-3">
                        <div className="text-sm">
                          <span className="text-orange-600 dark:text-orange-400 font-bold">{meal.total_calories}</span>
                          <span className="text-muted-foreground ml-1">cal</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-blue-600 dark:text-blue-400 font-bold">{meal.total_protein}g</span>
                          <span className="text-muted-foreground ml-1">protein</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-amber-600 dark:text-amber-400 font-bold">{meal.total_carbs}g</span>
                          <span className="text-muted-foreground ml-1">carbs</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-purple-600 dark:text-purple-400 font-bold">{meal.total_fats}g</span>
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
                        {meal.foods?.length || 0} ingredients • {meal.prep_time_minutes || 0} min prep
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
                          <div key={foodIdx} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex-1">
                              <p className="font-medium">{food.name}</p>
                              <p className="text-xs text-muted-foreground">{food.portion || food.serving_size}</p>
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
      {viewMode === 'foods' && (
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
                      <span className="text-muted-foreground">{food.portion || food.serving_size}</span>
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

      {!replacingFood && (viewMode === 'meals' ? filteredMeals : filteredFoods).length > 0 && (
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border-2 border-green-500/20">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-green-600" />
            AI-Powered Meal Planning
          </p>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'meals'
              ? 'Select entire meals or individual ingredients from your personalized A meal plan'
              : 'Browse all ingredients across your meal plan and add them individually'
            }
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

  const [logMethod, setLogMethod] = useState<LogMethod>('search');
  const [logDate, setLogDate] = useState(getToday());
  const [mealType, setMealType] = useState<string>(searchParams.get('meal') || 'breakfast');
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [editingFoodIndex, setEditingFoodIndex] = useState<number | null>(null);
  const [replacingFoodIndex, setReplacingFoodIndex] = useState<number | null>(null);

  const { data: mealPlanData } = useActiveMealPlan();
  const { data: todayMeals } = useMealItemsByDate(logDate);
  const [createMealItem, { loading: creating }] = useCreateMealItem();

  const activeMealPlan = (mealPlanData as any)?.ai_meal_plansCollection?.edges?.[0]?.node;
  const recentFoods = (todayMeals as any)?.daily_nutrition_logsCollection?.edges?.map((e: any) => e.node) || [];

  const isQuickLog = searchParams.get('quick') === 'true';

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    quantity: '',
    serving_size: '',
  });

  // Manual entry form state
  const [manualForm, setManualForm] = useState({
    name: '',
    brand: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    serving_size: '',
  });


  const handleFoodSelect = (food: FoodItem) => {
    // If replacing an existing food
    if (replacingFoodIndex !== null) {
      const updated = [...selectedFoods];
      updated[replacingFoodIndex] = {
        ...food,
        quantity: updated[replacingFoodIndex].quantity,
        mealType,
      };
      setSelectedFoods(updated);
      setReplacingFoodIndex(null);
      setLogMethod('search');
      return;
    }


    // Adding new food
    const neood: SelectedFood = {

      ...food,
      quantity: 1,
      mealType,
    };
    setSelectedFoods([...selectedFoods, newFood]);
  };

  const handleMealSelect = (foods: SelectedFood[]) => {
    // Replace all foods with AI meal
    setSelectedFoods(foods);
    setLogMethod('search');
  };

  const handleBarcodeScanned = (scannedFood: any) => {
    const newFood: SelectedFood = {
      id: scannedFood.id,
      name: scannedFood.name,
      brand: scannedFood.brand,
      calories: scannedFood.calories,
      protein: scannedFood.protein,
      carbs: scannedFood.carbs,
      fats: scannedFood.fats,
      fiber: scannedFood.fiber,
      serving_size: scannedFood.serving_size,
      verified: scannedFood.verified,
      quantity: 1,
      mealType,
    };
    setSelectedFoods([...selectedFoods, newFood]);
    setShowBarcodeScanner(false);
  };

  const handleTemplateSelect = (foods: any[]) => {
    const templateFoods: SelectedFood[] = foods.map((food) => ({
      id: food.id,
      name: food.name,
      brand: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      fiber: food.fiber,
      serving_size: food.serving_size,
      verified: food.verified,
      quantity: food.quantity || 1,
      mealType,
    }));
    setSelectedFoods([...selectedFoods, ...templateFoods]);
    setLogMethod('search');
  };

  const handleVoiceRecognized = (foods: any[]) => {
    const voiceFoods: SelectedFood[] = foods.map((food) => ({
      id: food.id || `voice-${Date.now()}-${Math.random()}`,
      name: food.name,
      brand: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      fiber: food.fiber,
      serving_size: food.serving_size || food.unit || 'serving',
      verified: false,
      quantity: food.quantity || 1,
      mealType,
    }));
    setSelectedFoods([...selectedFoods, ...voiceFoods]);
    setLogMethod('search');
  };

  const handlePhotoRecognized = (foods: any[]) => {
    const photoFoods: SelectedFood[] = foods.map((food) => ({
      id: food.id || `photo-${Date.now()}-${Math.random()}`,
      name: food.name,
      brand: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      fiber: food.fiber,
      serving_size: food.serving_size || 'serving',
      verified: false,
      quantity: food.quantity || 1,
      mealType,
    }));
    setSelectedFoods([...selectedFoods, ...photoFoods]);
    setLogMethod('search');
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const handleEditFood = (index: number) => {
    const food = selectedFoods[index];
    setEditForm({
      name: food.name,
      brand: food.brand || '',
      calories: String(food.calories),
      protein: String(food.protein),
      carbs: String(food.carbs),
      fats: String(food.fats),
      fiber: String(food.fiber || 0),
      quantity: String(food.quantity),
      serving_size: food.serving_size || 'serving',
    });
    setEditingFoodIndex(index);
  };

  const handleSaveEdit = () => {
    if (editingFoodIndex === null) return;

    const updated = [...selectedFoods];
    updated[editingFoodIndex] = {
      ...updated[editingFoodIndex],
      name: editForm.name,
      brand: editForm.brand || undefined,
      calories: Number(editForm.calories) || 0,
      protein: Number(editForm.protein) || 0,
      carbs: Number(editForm.carbs) || 0,
      fats: Number(editForm.fats) || 0,
      fiber: Number(editForm.fiber) || 0,
      quantity: Number(editForm.quantity) || 1,
      serving_size: editForm.serving_size,
    };
    setSelectedFoods(updated);
    setEditingFoodIndex(null);
  };

  const handleReplaceFood = (index: number) => {
    setReplacingFoodIndex(index);
    setLogMethod('search');
  };

  const handleManualFoodAdd = () => {
    if (!manualForm.name.trim()) return;

    const newFood: SelectedFood = {
      id: `manual-${Date.now()}`,
      name: manualForm.name.trim(),
      brand: manualForm.brand || undefined,
      calories: Number(manualForm.calories) || 0,
      protein: Number(manualForm.protein) || 0,
      carbs: Number(manualForm.carbs) || 0,
      fats: Number(manualForm.fats) || 0,
      fiber: Number(manualForm.fiber) || 0,
      serving_size: manualForm.serving_size || 'serving',
      verified: false,
      quantity: 1,
      mealType,
    };

    setSelectedFoods([...selectedFoods, newFood]);

    // Reset form
    setManualForm({
      name: '',
      brand: '',
      calories: '',
      protein: '',
      carbs: '',
      fats: '',
      fiber: '',
      serving_size: '',
    });
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updated = [...selectedFoods];
    updated[index].quantity = quantity;
    setSelectedFoods(updated);
  };

  const calculateTotals = () => {
    return selectedFoods.reduce(
      (totals, food) => ({
        calories: totals.calories + food.calories * food.quantity,
        protein: totals.protein + food.protein * food.quantity,
        carbs: totals.carbs + food.carbs * food.quantity,
        fats: totals.fats + food.fats * food.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const handleLogFoods = async () => {
    if (!user?.id || selectedFoods.length === 0) return;

    const foodItems = selectedFoods.map((food) => {
      const qty = Number(food.quantity) || 1;
      const cals = Number(food.calories) || 0;
      const prot = Number(food.protein) || 0;
      const carb = Number(food.carbs) || 0;
      const fat = Number(food.fats) || 0;

      return {
        name: String(food.name || 'Unknown'),
        brand: food.brand ? String(food.brand) : undefined,
        serving_qty: qty,
        serving_unit: String(food.serving_size || 'serving'),
        calories: cals * qty,
        protein: prot * qty,
        carbs: carb * qty,
        fats: fat * qty,
      };
    });

    const totalCalories = Number(foodItems.reduce((sum, item) => sum + item.calories, 0).toFixed(2));
    const totalProtein = Number(foodItems.reduce((sum, item) => sum + item.protein, 0).toFixed(2));
    const totalCarbs = Number(foodItems.reduce((sum, item) => sum + item.carbs, 0).toFixed(2));
    const totalFats = Number(foodItems.reduce((sum, item) => sum + item.fats, 0).toFixed(2));

    try {
      await createMealItem({
        variables: {
          input: {
            user_id: user.id,
            log_date: logDate,
            meal_type: mealType,
            food_items: JSON.stringify(foodItems),
            total_calories: totalCalories,
            total_protein: totalProtein,
            total_carbs: totalCarbs,
            total_fats: totalFats,
          },
        },
      });

      navigate('/dashboard?tab=nutrition');
    } catch (error) {
      console.error('Error logging meal:', error);
      alert('Failed to log meal. Please try again.');
    }
  };

  const totals = calculateTotals();

  const mealTypeConfig: Record<string, { emoji: string; gradient: string; bg: string }> = {
    breakfast: { emoji: '🌅', gradient: 'from-orange-500 to-amber-500', bg: 'from-orange-50 to-amber-50 dark:from-orange-950/50 dark:to-amber-950/50' },
    lunch: { emoji: '🌞', gradient: 'from-yellow-500 to-amber-500', bg: 'from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50' },
    dinner: { emoji: '🌙', gradient: 'from-blue-500 to-indigo-500', bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50' },
    snack: { emoji: '🍎', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50' },
  };

  const inputMethods = [
    { id: 'search', label: 'Search', icon: Search, gradient: 'from-blue-500 to-cyan-500', description: 'Find foods from database' },
    { id: 'aiPlan', label: 'AI Plan', icon: Sparkles, gradient: 'from-purple-500 to-pink-500', description: 'Use your personalized lan' },
    { id: 'manual', label: 'Manual', icon: Edit2, gradient: 'from-green-500 to-emerald-500', description: 'Enter macros manually' },
    { id: 'voice', label: 'Voice', icon: Mic, gradient: 'from-orange-500 to-red-500', description: 'Speak your meal' },
    { id: 'barcode', label: 'Barcode', icon: Barcode, gradient: 'from-indigo-500 to-purple-500', description: 'Scan product barcode' },
    { id: 'photo', label: 'Photo', icon: Camera, gradient: 'from-pink-500 to-rose-500', description: 'Take a picture' },
    { id: 'template', label: 'Templates', icon: Book, gradient: 'from-amber-500 to-orange-500', description: 'Use saved meals' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* PREMIUM HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 p-10 text-white shadow-2xl mb-8">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <Button
              onClick={() => navigate('/dashboard?tab=nutrition')}
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
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
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
                      onClick={() => setMealType(type)}
                      className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 ${mealType === type
                        ? `border-transparent shadow-xl scale-105`
                        : 'border-border hover:border-green-500/50 hover:scale-102'
                        }`}
                      style={mealType === type ? {
                        background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                        backgroundImage: `linear-gradient(135deg, rgb(34 197 94) 0%, rgb(16 185 129) 100%)`,
                      } : {}}
                    >
                      {mealType === type && (
                        <div className="absolute inset-0 bg-gradient-to-br opacity-20 animate-pulse" style={{
                          backgroundImage: `linear-gradient(135deg, rgb(255 255 255) 0%, transparent 100%)`,
                        }} />
                      )}
                      <div className="relative text-center">
                        <div className="text-4xl mb-2">{config.emoji}</div>
                        <p className={`font-bold capitalize ${mealType === type ? 'text-white' : ''}`}>
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
                          if (method.id === 'barcode') setShowBarcodeScanner(true);
                        }}
                        className={`group relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 ${isActive
                          ? 'border-transparent shadow-lg scale-105'
                          : 'border-border hover:border-primary-500/50 hover:scale-102'
                          }`}
                        style={isActive ? {
                          background: `linear-gradient(135deg, ${method.gradient.split(' ')[0].replace('from-', 'var(--color-')}, ${method.gradient.split(' ')[1].replace('to-', 'var(--color-')}`,
                        } : {}}
                      >
                        <div className="relative text-center">
                          <Icon className={`h-6 w-6 mx-auto mb-2 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                          <p className={`font-semibold text-sm ${isActive ? 'text-white' : ''}`}>
                            {method.label}
                          </p>
                        </div>
                      </button>);
                  })}
                </div>

                {/* Input Method Content */}
                <div className="min-h-[400px]">
                  {logMethod === 'search' && (
                    <FoodSearch
                      onFoodSelect={handleFoodSelect}
                      replacingFood={replacingFoodIndex !== null}
                    />
                  )}

                  {logMethod === 'aiPlan' && (
                    <AIMealPlanSelector
                      mealPlan={activeMealPlan}
                      onMealSelect={handleMealSelect}
                      onFoodSelect={handleFoodSelect}
                      replacingFood={replacingFoodIndex !== null}
                    />
                  )}

                  {logMethod === 'manual' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border-2 border-green-500/20 mb-4">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                          <Edit2 className="h-4 w-4 text-green-600" />
                          Manual Entry
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
                            value={manualForm.name}
                            onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                            placeholder="e.g., Chicken Breast"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-semibold mb-2">Brand (Optional)</label>
                          <input
                            type="text"
                            value={manualForm.brand}
                            onChange={(e) => setManualForm({ ...manualForm, brand: e.target.value })}
                            placeholder="e.g., Tyson"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-orange-600 dark:text-orange-400">Calories *</label>
                          <input
                            type="number"
                            value={manualForm.calories}
                            onChange={(e) => setManualForm({ ...manualForm, calories: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 border-2 border-orange-200 dark:border-orange-900/30 rounded-xl bg-background hover:border-orange-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-blue-600 dark:text-blue-400">Protein (g) *</label>
                          <input
                            type="number"
                            value={manualForm.protein}
                            onChange={(e) => setManualForm({ ...manualForm, protein: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 border-2 border-blue-200 dark:border-blue-900/30 rounded-xl bg-background hover:border-blue-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-amber-600 dark:text-amber-400">Carbs (g) *</label>
                          <input
                            type="number"
                            value={manualForm.carbs}
                            onChange={(e) => setManualForm({ ...manualForm, carbs: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 border-2 border-amber-200 dark:border-amber-900/30 rounded-xl bg-background hover:border-amber-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2 text-purple-600 dark:text-purple-400">Fats (g) *</label>
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
                            onChange={(e) => setManualForm({ ...manualForm, fiber: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Serving Size</label>
                          <input
                            type="text"
                            value={manualForm.serving_size}
                            onChange={(e) => setManualForm({ ...manualForm, serving_size: e.target.value })}
                            placeholder="e.g., 100g, 1 cup"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleManualFoodAdd}
                        disabled={!manualForm.name || !manualForm.calories}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-6 text-base font-semibold"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Food to Meal
                      </Button>
                    </div>
                  )}

                  {logMethod === 'voice' && (
                    <VoiceInput onFoodsRecognized={handleVoiceRecognized} />
                  )}

                  {logMethod === 'barcode' && showBarcodeScanner && (
                    <BarcodeScanner
                      onFoodScanned={handleBarcodeScanned}
                      onClose={() => {
                        setShowBarcodeScanner(false);
                        setLogMethod('search');
                      }}
                    />
                  )}

                  {logMethod === 'photo' && (
                    <PhotoAnalysis onFoodsRecognized={handlePhotoRecognized} />
                  )}

                  {logMethod === 'template' && (
                    <MealTemplates onTemplateSelect={handleTemplateSelect} />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - Meal Builder & Summary */}
          <div className="space-y-6">
            {/* Real-time Macro Calculator */}
            <Card className={`sticky top-4 border-0 shadow-2xl bg-gradient-to-br ${mealTypeConfig[mealType].bg}`}>
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${mealTypeConfig[mealType].gradient} shadow-lg`}>
                    <Flame className="h-5 w-5 text-white" />
                  </div>
                  <span>Meal Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Macro Totals */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-950/10 border-2 border-orange-200/50 dark:border-orange-900/30">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Calories</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{Math.round(totals.calories)}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-950/10 border-2 border-blue-200/50 dark:border-blue-900/30">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Protein</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{Math.round(totals.protein)}g</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/20 dark:to-amber-950/10 border-2 border-amber-200/50 dark:border-amber-900/30">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Carbs</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">{Math.round(totals.carbs)}g</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-950/10 border-2 border-purple-200/50 dark:border-purple-900/30">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Fats</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{Math.round(totals.fats)}g</p>
                  </div>
                </div>

                {/* Foods List */}
                <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2">
                  {selectedFoods.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-4 shadow-lg opacity-50">
                        <Apple className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">No foods added yet</p>
                      <p className="text-xs text-muted-foreground mt-1">Choose an input method above</p>
                    </div>
                  ) : (
                    selectedFoods.map((food, index) => (
                      <div key={index}>
                        {editingFoodIndex === index ? (
                          // Edit Mode
                          <Card className="border-2 border-primary-500 shadow-lg">
                            <CardContent className="p-4 space-y-3">
                              <input
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-border rounded-lg bg-background font-semibold"
                                placeholder="Food name"
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-orange-600 dark:text-orange-400">Calories</label>
                                  <input
                                    type="number"
                                    value={editForm.calories}
                                    onChange={(e) => setEditForm({ ...editForm, calories: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-orange-200 dark:border-orange-900/30 rounded-lg bg-background text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-blue-600 dark:text-blue-400">Protein (g)</label>
                                  <input
                                    type="number"
                                    value={editForm.protein}
                                    onChange={(e) => setEditForm({ ...editForm, protein: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-blue-200 dark:border-blue-900/30 rounded-lg bg-background text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-amber-600 dark:text-amber-400">Carbs (g)</label>
                                  <input
                                    type="number"
                                    value={editForm.carbs}
                                    onChange={(e) => setEditForm({ ...editForm, carbs: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-amber-200 dark:border-amber-900/30 rounded-lg bg-background text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-purple-600 dark:text-purple-400">Fats (g)</label>
                                  <input
                                    type="number"
                                    value={editForm.fats}
                                    onChange={(e) => setEditForm({ ...editForm, fats: e.target.value })}
                                    className="w-full px-3 py-2 border-2 border-purple-200 dark:border-purple-900/30 rounded-lg bg-background text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold mb-1">Quantity</label>
                                <input
                                  type="number"
                                  value={editForm.quantity}
                                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                                  step="0.1"
                                  min="0.1"
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
                                  onClick={() => setEditingFoodIndex(null)}
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
                          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-500/50">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <p className="font-semibold text-base mb-1">{food.name}</p>
                                  {food.brand && (
                                    <p className="text-xs text-muted-foreground mb-2">{food.brand}</p>
                                  )}
                                  <div className="flex items-center gap-2 mb-2">
                                    <input
                                      type="number"
                                      value={food.quantity}
                                      onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                                      step="0.1"
                                      min="0.1"
                                      className="w-20 px-2 py-1 border-2 border-border rounded-lg bg-background text-sm font-semibold"
                                    />
                                    <span className="text-xs text-muted-foreground">× {food.serving_size}</span>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div className="text-center p-2 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                                      <p className="font-bold text-orange-600 dark:text-orange-400">{Math.round(food.calories * food.quantity)}</p>
                                      <p className="text-[10px] text-muted-foreground">cal</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                      <p className="font-bold text-blue-600 dark:text-blue-400">{Math.round(food.protein * food.quantity)}</p>
                                      <p className="text-[10px] text-muted-foreground">protein</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                                      <p className="font-bold text-amber-600 dark:text-amber-400">{Math.round(food.carbs * food.quantity)}</p>
                                      <p className="text-[10px] text-muted-foreground">carbs</p>
                                    </div>
                                    <div className="text-center p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                                      <p className="font-bold text-purple-600 dark:text-purple-400">{Math.round(food.fats * food.quantity)}</p>
                                      <p className="text-[10px] text-muted-foreground">fats</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-3">
                                  <button
                                    onClick={() => handleEditFood(index)}
                                    className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleReplaceFood(index)}
                                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                                    title="Replace"
                                  >
                                    <Replace className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRemoveFood(index)}
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
                    onClick={handleLogFoods}
                    disabled={selectedFoods.length === 0 || creating}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-6 text-base font-semibold"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Logging Meal...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Log {mealTypeConfig[mealType].emoji} {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </>
                    )}
                  </Button>

                  {selectedFoods.length > 0 && (
                    <Button
                      onClick={() => {/* TODO: Save as template */ }}
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
            {selectedFoods.length === 0 && (
              <Card className="border-2 border-primary-500/20 bg-gradient-to-br from-primary-50/50 to-purple-50/50 dark:from-primary-950/20 dark:to-purple-950/20">
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
    </div>
  );
}