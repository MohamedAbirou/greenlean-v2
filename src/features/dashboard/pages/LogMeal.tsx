/**
 * Log Meal Page - Redesigned with Full Edit/Swap Capabilities
 * Users can edit macros, swap foods, and manage meals efficiently
 */

import { useAuth } from '@/features/auth';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ArrowLeft, Calendar, Edit2, Plus, Replace, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AIMealPlanSelector } from '../components/AIMealPlanSelector';
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
  serving_size?: string;
  verified?: boolean;
}

interface SelectedFood extends FoodItem {
  quantity: number;
  mealType: string;
}

const getToday = () => new Date().toISOString().split('T')[0];

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
    quantity: '',
    serving_size: '',
  });

  const handleFoodSelect = (food: FoodItem) => {
    // If replacing an existing food
    if (replacingFoodIndex !== null) {
      const updated = [...selectedFoods];
      updated[replacingFoodIndex] = {
        ...food,
        quantity: updated[replacingFoodIndex].quantity, // Keep quantity
        mealType,
      };
      setSelectedFoods(updated);
      setReplacingFoodIndex(null);
      setLogMethod('search');
      return;
    }

    // Adding new food
    const newFood: SelectedFood = {
      ...food,
      quantity: 1,
      mealType,
    };
    setSelectedFoods([...selectedFoods, newFood]);
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
      serving_size: food.serving_size || 'serving',
      verified: false,
      quantity: food.quantity || 1,
      mealType,
    }));
    setSelectedFoods([...selectedFoods, ...photoFoods]);
    setLogMethod('search');
  };

  const handleAIMealPlanSelect = (foods: any[]) => {
    // Replace ALL foods with AI meal plan
    const planFoods: SelectedFood[] = foods.map((food) => ({
      id: food.id || `ai-plan-${Date.now()}-${Math.random()}`,
      name: food.name,
      brand: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      serving_size: food.serving_size || 'serving',
      verified: food.verified || true,
      quantity: food.quantity || 1,
      mealType,
    }));
    setSelectedFoods(planFoods);
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

  const handleReplaceMeal = () => {
    setLogMethod('aiPlan');
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

  const mealTypeConfig: Record<string, { emoji: string; color: string }> = {
    breakfast: { emoji: '🌅', color: 'orange' },
    lunch: { emoji: '🌞', color: 'yellow' },
    dinner: { emoji: '🌙', color: 'blue' },
    snack: { emoji: '🍎', color: 'green' },
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button onClick={() => navigate('/dashboard?tab=nutrition')} variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Log Meal</h1>
            <p className="text-muted-foreground">
              {isQuickLog ? 'Quick log your meal' : 'Log what you ate'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedFoods.length > 0 && (
              <>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {selectedFoods.length} item{selectedFoods.length !== 1 ? 's' : ''}
                </Badge>
                <Button
                  onClick={handleReplaceMeal}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Replace className="h-4 w-4" />
                  Replace Meal
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Date and Meal Type */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Meal Date
            </label>
            <DatePicker selectedDate={logDate} onDateChange={setLogDate} />
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Meal Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {Object.entries(mealTypeConfig).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    mealType === type
                      ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                      : 'bg-muted hover:bg-muted/80 hover:scale-102'
                  }`}
                >
                  <span className="mr-2">{config.emoji}</span>
                  <span className="capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Foods Summary */}
      {selectedFoods.length > 0 && (
        <Card className="mb-6 border-primary-500/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Foods ({selectedFoods.length})</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFoods([])} className="text-error">
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFoods.map((food, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{food.name}</h4>
                    {food.verified && (
                      <Badge variant="success" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  {food.brand && <p className="text-xs text-muted-foreground mb-1">{food.brand}</p>}
                  <div className="flex gap-3 text-xs">
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {Math.round(food.calories * food.quantity)} cal
                    </span>
                    <span>P: {Math.round(food.protein * food.quantity)}g</span>
                    <span>C: {Math.round(food.carbs * food.quantity)}g</span>
                    <span>F: {Math.round(food.fats * food.quantity)}g</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    value={food.quantity}
                    onChange={(e) => handleUpdateQuantity(index, parseFloat(e.target.value) || 1)}
                    className="w-16 px-2 py-1 border border-border rounded text-center text-sm"
                    title="Quantity"
                  />
                  <span className="text-xs text-muted-foreground">×</span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditFood(index)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-950/30"
                    title="Edit food details"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReplaceFood(index)}
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-950/30"
                    title="Replace with another food"
                  >
                    <Replace className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFood(index)}
                    className="text-error hover:bg-error/10"
                    title="Remove food"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="pt-3 border-t border-border">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950/20 dark:to-primary-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {Math.round(totals.calories)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Calories</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(totals.protein)}g
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Protein</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(totals.carbs)}g
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Carbs</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 rounded-xl">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {Math.round(totals.fats)}g
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Fats</p>
                </div>
              </div>
            </div>

            {/* Log Button */}
            <Button
              onClick={handleLogFoods}
              variant="primary"
              size="lg"
              fullWidth
              loading={creating}
              className="mt-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              Log {selectedFoods.length} Food{selectedFoods.length !== 1 ? 's' : ''} to {mealType}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Replacing Food Notice */}
      {replacingFoodIndex !== null && (
        <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20 mb-6">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                🔄 Replacing: <span className="font-bold">{selectedFoods[replacingFoodIndex]?.name}</span>
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplacingFoodIndex(null);
                  setLogMethod('search');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logging Methods */}
      <Tabs value={logMethod} onValueChange={(v) => setLogMethod(v as LogMethod)}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 mb-6">
          <TabsTrigger value="search">🔍 Search</TabsTrigger>
          <TabsTrigger value="manual">✏️ Manual</TabsTrigger>
          <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
          <TabsTrigger value="barcode">📷 Barcode</TabsTrigger>
          <TabsTrigger value="photo">📸 Photo</TabsTrigger>
          <TabsTrigger value="aiPlan">🤖 AI Plan</TabsTrigger>
          <TabsTrigger value="template">📋 Template</TabsTrigger>
        </TabsList>

        {/* USDA Food Search */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>
                {replacingFoodIndex !== null ? 'Choose Replacement Food' : 'Search Food Database'}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {replacingFoodIndex !== null
                  ? 'Select a food to replace the current one'
                  : 'Search thousands of foods from the USDA database'}
              </p>
            </CardHeader>
            <CardContent>
              <FoodSearch
                onSelect={handleFoodSelect}
                recentFoods={recentFoods.slice(0, 10).map((meal: any) => ({
                  id: meal.id,
                  name: meal.food_name,
                  brand: meal.brand_name,
                  calories: meal.calories,
                  protein: meal.protein,
                  carbs: meal.carbs,
                  fats: meal.fats,
                  serving_size: meal.serving_unit || 'serving',
                  verified: meal.source === 'usda',
                }))}
                selectedFoods={selectedFoods.map((f) => f.id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Logging */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <p className="text-sm text-muted-foreground">Enter nutrition information manually</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                You can manually enter food details or use the Edit button on selected foods to modify their macros.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Logging */}
        <TabsContent value="voice">
          <VoiceInput onFoodsRecognized={handleVoiceRecognized} onClose={() => setLogMethod('search')} />
        </TabsContent>

        {/* Barcode Scanner */}
        <TabsContent value="barcode">
          {showBarcodeScanner ? (
            <BarcodeScanner onFoodScanned={handleBarcodeScanned} onClose={() => setShowBarcodeScanner(false)} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Barcode Scanner</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="primary" onClick={() => setShowBarcodeScanner(true)}>
                  Open Camera Scanner
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Photo Scanning */}
        <TabsContent value="photo">
          <PhotoAnalysis onFoodsRecognized={handlePhotoRecognized} onClose={() => setLogMethod('search')} />
        </TabsContent>

        {/* AI Meal Plan */}
        <TabsContent value="aiPlan">
          <AIMealPlanSelector
            mealPlan={activeMealPlan}
            selectedMealType={mealType}
            onSelectMeal={handleAIMealPlanSelect}
            onClose={() => setLogMethod('search')}
          />
        </TabsContent>

        {/* Templates */}
        <TabsContent value="template">
          <MealTemplates
            onSelectTemplate={handleTemplateSelect}
            currentFoods={selectedFoods}
            onClose={() => setLogMethod('search')}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Food Modal */}
      {editingFoodIndex !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Food Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setEditingFoodIndex(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Food Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Brand (Optional)</label>
                <input
                  type="text"
                  value={editForm.brand}
                  onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Serving Size *</label>
                  <input
                    type="text"
                    value={editForm.serving_size}
                    onChange={(e) => setEditForm({ ...editForm, serving_size: e.target.value })}
                    placeholder="serving, oz, g, cup"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Calories *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.calories}
                    onChange={(e) => setEditForm({ ...editForm, calories: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.protein}
                    onChange={(e) => setEditForm({ ...editForm, protein: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.carbs}
                    onChange={(e) => setEditForm({ ...editForm, carbs: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fats (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.fats}
                    onChange={(e) => setEditForm({ ...editForm, fats: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveEdit} variant="primary" size="lg" fullWidth>
                  Save Changes
                </Button>
                <Button onClick={() => setEditingFoodIndex(null)} variant="outline" size="lg">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {selectedFoods.length === 0 && logMethod === 'search' && replacingFoodIndex === null && (
        <Card className="border-dashed border-2 mt-6">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">No Foods Added Yet</h3>
            <p className="text-muted-foreground mb-6">
              Use the tabs above to search, scan, or log foods using voice/photo/AI
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
