/**
 * Log Meal Page - Production Grade
 * Comprehensive meal logging with multiple input methods and USDA food search
 */

import { useAuth } from '@/features/auth';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AIMealPlanSelector } from '../components/AIMealPlanSelector';
import { BarcodeScanner } from '../components/BarcodeScanner';
import { DateScroller } from '../components/DateScroller';
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

  const { data: mealPlanData } = useActiveMealPlan();
  const { data: todayMeals } = useMealItemsByDate(logDate);
  const [createMealItem, { loading: creating }] = useCreateMealItem();

  const activeMealPlan = (mealPlanData as any)?.ai_meal_plansCollection?.edges?.[0]?.node;
  const recentFoods = (todayMeals as any)?.daily_nutrition_logsCollection?.edges?.map((e: any) => e.node) || [];

  // Manual entry state
  const [manualFood, setManualFood] = useState({
    name: '',
    brand: '',
    servingQty: '1',
    servingUnit: 'serving',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  // Quick log mode
  const isQuickLog = searchParams.get('quick') === 'true';

  const handleFoodSelect = (food: FoodItem) => {
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
    setLogMethod('search'); // Switch back to show selected foods
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
    setLogMethod('search'); // Switch back to show selected foods
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
    setLogMethod('search'); // Switch back to show selected foods
  };

  const handleAIMealPlanSelect = (foods: any[]) => {
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
    setSelectedFoods([...selectedFoods, ...planFoods]);
    setLogMethod('search'); // Switch back to show selected foods
  };

  const handleRemoveFood = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
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

    // Aggregate foods into food_items JSON array - ensure all values are proper types
    const foodItems = selectedFoods.map(food => {
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

    // Calculate totals
    const totalCalories = Number(foodItems.reduce((sum, item) => sum + item.calories, 0).toFixed(2));
    const totalProtein = Number(foodItems.reduce((sum, item) => sum + item.protein, 0).toFixed(2));
    const totalCarbs = Number(foodItems.reduce((sum, item) => sum + item.carbs, 0).toFixed(2));
    const totalFats = Number(foodItems.reduce((sum, item) => sum + item.fats, 0).toFixed(2));

    try {
      // Insert single nutrition log with all foods as JSON
      await createMealItem({
        variables: {
          input: {
            user_id: user.id,
            log_date: logDate,
            meal_type: mealType,
            food_items: foodItems,
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

  const handleManualLog = async () => {
    if (!user?.id || !manualFood.name || !manualFood.calories) return;

    const qty = Number(manualFood.servingQty) || 1;
    const cals = Number(manualFood.calories) || 0;
    const prot = Number(manualFood.protein) || 0;
    const carb = Number(manualFood.carbs) || 0;
    const fat = Number(manualFood.fats) || 0;

    const foodItems = [{
      name: String(manualFood.name),
      brand: manualFood.brand ? String(manualFood.brand) : undefined,
      serving_qty: qty,
      serving_unit: String(manualFood.servingUnit || 'serving'),
      calories: cals,
      protein: prot,
      carbs: carb,
      fats: fat,
    }];

    try {
      await createMealItem({
        variables: {
          input: {
            user_id: user.id,
            log_date: logDate,
            meal_type: mealType,
            food_items: foodItems,
            total_calories: cals,
            total_protein: prot,
            total_carbs: carb,
            total_fats: fat,
          },
        },
      });

      navigate('/dashboard?tab=nutrition');
    } catch (error) {
      console.error('Error logging meal:', error);
      alert('Failed to log meal. Please try again.');
    }
  };

  const handleQuickAddRecent = async (meal: any) => {
    if (!user?.id) return;

    // Reuse the food_items from the recent meal (already in correct format)
    const foodItems = Array.isArray(meal.food_items) ? meal.food_items : [];

    try {
      await createMealItem({
        variables: {
          input: {
            user_id: user.id,
            log_date: logDate,
            meal_type: mealType,
            food_items: foodItems,
            total_calories: Number(meal.total_calories) || 0,
            total_protein: Number(meal.total_protein) || 0,
            total_carbs: Number(meal.total_carbs) || 0,
            total_fats: Number(meal.total_fats) || 0,
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

  console.log("Selected foods: ", selectedFoods);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button onClick={() => navigate('/dashboard?tab=nutrition')} variant="ghost" className="mb-4">
          ← Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Log Meal</h1>
            <p className="text-muted-foreground mt-2">
              {isQuickLog ? 'Quick log your meal' : 'Choose your preferred logging method'}
            </p>
          </div>
          {selectedFoods.length > 0 && (
            <Badge variant="primary" className="text-lg px-4 py-2">
              {selectedFoods.length} item{selectedFoods.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Date and Meal Type */}
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Date</label>
            <DateScroller selectedDate={logDate} onDateChange={setLogDate} />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Meal Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    mealType === type
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {type === 'breakfast' && '🌅'} {type === 'lunch' && '🌞'}
                  {type === 'dinner' && '🌙'} {type === 'snack' && '🍎'}
                  <span className="ml-2 capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Foods Summary */}
      {selectedFoods.length > 0 && (
        <Card className="mb-6 border-primary-500/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Foods ({selectedFoods.length})</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedFoods([])}>
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedFoods.map((food, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{food.name}</h4>
                    {food.verified && (
                      <Badge variant="success" className="text-xs">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  {food.brand && (
                    <p className="text-xs text-muted-foreground">{food.brand}</p>
                  )}
                  <div className="flex gap-3 text-xs mt-1">
                    <span className="text-primary-600 dark:text-primary-400">
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
                  />
                  <span className="text-xs text-muted-foreground">x</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFood(index)}
                    className="text-error"
                  >
                    🗑️
                  </Button>
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="pt-3 border-t border-border">
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {Math.round(totals.calories)}
                  </p>
                  <p className="text-xs text-muted-foreground">Calories</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(totals.protein)}g
                  </p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {Math.round(totals.carbs)}g
                  </p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {Math.round(totals.fats)}g
                  </p>
                  <p className="text-xs text-muted-foreground">Fats</p>
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
              className="mt-4"
            >
              Log {selectedFoods.length} Food{selectedFoods.length !== 1 ? 's' : ''} to {mealType}
            </Button>
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
              <CardTitle>Search Food Database</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search thousands of foods from the USDA database
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
                selectedFoods={selectedFoods.map(f => f.id)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manual Logging */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter nutrition information manually
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Food Name *</label>
                <input
                  type="text"
                  value={manualFood.name}
                  onChange={(e) => setManualFood({ ...manualFood, name: e.target.value })}
                  placeholder="e.g., Grilled Chicken Breast"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Brand (Optional)</label>
                <input
                  type="text"
                  value={manualFood.brand}
                  onChange={(e) => setManualFood({ ...manualFood, brand: e.target.value })}
                  placeholder="e.g., Perdue"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFood.servingQty}
                    onChange={(e) => setManualFood({ ...manualFood, servingQty: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Unit *</label>
                  <input
                    type="text"
                    value={manualFood.servingUnit}
                    onChange={(e) => setManualFood({ ...manualFood, servingUnit: e.target.value })}
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
                    value={manualFood.calories}
                    onChange={(e) => setManualFood({ ...manualFood, calories: e.target.value })}
                    placeholder="165"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFood.protein}
                    onChange={(e) => setManualFood({ ...manualFood, protein: e.target.value })}
                    placeholder="31"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFood.carbs}
                    onChange={(e) => setManualFood({ ...manualFood, carbs: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fats (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFood.fats}
                    onChange={(e) => setManualFood({ ...manualFood, fats: e.target.value })}
                    placeholder="3.6"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleManualLog}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={creating}
                  disabled={!manualFood.name || !manualFood.calories}
                >
                  Log Meal
                </Button>
                <Button
                  onClick={() => navigate('/dashboard?tab=nutrition')}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Foods Quick Add */}
          {recentFoods.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Recent Foods - Quick Add</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentFoods.slice(0, 5).map((meal: any) => (
                  <div
                    key={meal.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">{meal.food_name}</p>
                      {meal.brand_name && (
                        <p className="text-xs text-muted-foreground">{meal.brand_name}</p>
                      )}
                      <div className="flex gap-2 text-xs mt-1">
                        <span>{meal.calories} cal</span>
                        <span>P: {meal.protein}g</span>
                        <span>C: {meal.carbs}g</span>
                        <span>F: {meal.fats}g</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAddRecent(meal)}
                      disabled={creating}
                    >
                      + Add
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Voice Logging */}
        <TabsContent value="voice">
          <VoiceInput
            onFoodsRecognized={handleVoiceRecognized}
            onClose={() => setLogMethod('search')}
          />
        </TabsContent>

        {/* Barcode Scanner */}
        <TabsContent value="barcode">
          {showBarcodeScanner ? (
            <BarcodeScanner
              onFoodScanned={handleBarcodeScanned}
              onClose={() => setShowBarcodeScanner(false)}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Barcode Scanner</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Instantly log packaged foods by scanning their barcode
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📷</div>
                  <h3 className="text-xl font-semibold mb-2">Scan Product Barcodes</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Scan any packaged food's barcode for instant nutrition information.
                    Powered by Nutritionix, USDA, and OpenFoodFacts databases.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="primary" onClick={() => setShowBarcodeScanner(true)}>
                      📱 Open Camera Scanner
                    </Button>
                    <Button variant="outline" onClick={() => setLogMethod('search')}>
                      Use Search Instead
                    </Button>
                  </div>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      ⚡ Instant Results
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Get complete nutrition facts in seconds
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      🌍 Global Database
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Access millions of products worldwide
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      ✓ Verified Data
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Accurate nutrition from trusted sources
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      📱 Manual Entry
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Can't scan? Type the barcode manually
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Photo Scanning */}
        <TabsContent value="photo">
          <PhotoAnalysis
            onFoodsRecognized={handlePhotoRecognized}
            onClose={() => setLogMethod('search')}
          />
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
    </div>
  );
}
