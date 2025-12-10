/**
 * QuickMealLog - Ultra-smooth meal logging
 * MyFitnessPal/CalAI-level UX with photo/voice/search
 */

import { mealTrackingService, PhotoScanner, VoiceRecorder } from '@/features/nutrition';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Check, Loader2, Mic, Plus, Search, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface QuickMealLogProps {
  userId: string;
  onSuccess?: () => void;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface FoodDatabaseItem {
  id: string;
  food_name: string;
  brand_name?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_qty: number;
  serving_unit: string;
}

interface AIMealPlan {
  id: string;
  plan_data: {
    meals: Array<{
      meal_type: string;
      meal_name: string;
      foods: Array<{
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        serving_qty?: number;
        serving_unit?: string;
      }>;
    }>;
  };
}

export function QuickMealLog({ userId, onSuccess, defaultMealType }: QuickMealLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'quick' | 'photo' | 'voice' | 'search'>('quick');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(
    defaultMealType || 'breakfast'
  );
  const [isLogging, setIsLogging] = useState(false);

  // Quick entry state
  const [quickFood, setQuickFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
  });

  // Food search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodDatabaseItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(null);
  const [servingSize, setServingSize] = useState('1');

  // AI Meal Plan state
  const [activeMealPlan, setActiveMealPlan] = useState<AIMealPlan | null>(null);
  const [loadingMealPlan, setLoadingMealPlan] = useState(false);
  const [searchMode, setSearchMode] = useState<'database' | 'ai_plan'>('database');

  const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  // Load active AI meal plan when modal opens
  useEffect(() => {
    if (isOpen) {
      loadActiveMealPlan();
    }
  }, [isOpen]);

  const loadActiveMealPlan = async () => {
    setLoadingMealPlan(true);
    try {
      const { data, error } = await supabase
        .from('ai_meal_plans')
        .select('id, plan_data')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('status', 'active')
        .maybeSingle();

      if (!error && data) {
        setActiveMealPlan(data as AIMealPlan);
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    } finally {
      setLoadingMealPlan(false);
    }
  };

  // Search food database
  const handleFoodSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('food_database')
        .select('id, food_name, brand_name, calories, protein, carbs, fats, serving_qty, serving_unit')
        .ilike('food_name', `%${query}%`)
        .limit(20);

      if (!error && data) {
        setSearchResults(data as FoodDatabaseItem[]);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
      toast.error('Failed to search foods');
    } finally {
      setIsSearching(false);
    }
  };

  // Log selected food from database
  const handleLogSelectedFood = async () => {
    if (!selectedFood) {
      toast.error('Please select a food');
      return;
    }

    const servingMultiplier = parseFloat(servingSize) || 1;

    setIsLogging(true);
    try {
      const result = await mealTrackingService.logMeal(
        userId,
        mealType,
        [
          {
            food_id: selectedFood.id,
            food_name: selectedFood.food_name,
            brand_name: selectedFood.brand_name,
            serving_qty: selectedFood.serving_qty * servingMultiplier,
            serving_unit: selectedFood.serving_unit,
            calories: selectedFood.calories * servingMultiplier,
            protein: selectedFood.protein * servingMultiplier,
            carbs: selectedFood.carbs * servingMultiplier,
            fats: selectedFood.fats * servingMultiplier,
            source: 'manual',
          },
        ],
        new Date().toISOString().split('T')[0]
      );

      if (result.success) {
        toast.success('Food logged successfully!');
        handleClose();
        onSuccess?.();
      } else {
        toast.error('Failed to log food');
      }
    } catch (error) {
      toast.error('Error logging food');
      console.error(error);
    } finally {
      setIsLogging(false);
    }
  };

  // Log meal from AI plan
  const handleLogAIPlanMeal = async (meal: AIMealPlan['plan_data']['meals'][0]) => {
    setIsLogging(true);
    try {
      const result = await mealTrackingService.logMeal(
        userId,
        mealType,
        meal.foods.map(food => ({
          food_name: food.name,
          serving_qty: food.serving_qty || 1,
          serving_unit: food.serving_unit || 'serving',
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          source: 'ai_plan',
          from_ai_plan: true,
          ai_meal_plan_id: activeMealPlan?.id,
          plan_meal_name: meal.meal_name,
        })),
        new Date().toISOString().split('T')[0]
      );

      if (result.success) {
        toast.success('Meal from AI plan logged!');
        handleClose();
        onSuccess?.();
      } else {
        toast.error('Failed to log meal');
      }
    } catch (error) {
      toast.error('Error logging meal');
      console.error(error);
    } finally {
      setIsLogging(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setMealType(getCurrentMealType());
  };

  const handleClose = () => {
    setIsOpen(false);
    setMode('quick');
    setQuickFood({ name: '', calories: '', protein: '', carbs: '', fats: '' });
    setSearchQuery('');
    setSearchResults([]);
    setSelectedFood(null);
    setServingSize('1');
    setSearchMode('database');
  };

  const handleQuickLog = async () => {
    if (!quickFood.name || !quickFood.calories) {
      toast.error('Please enter food name and calories');
      return;
    }

    setIsLogging(true);

    try {
      const result = await mealTrackingService.logMeal(
        userId,
        mealType,
        [
          {
            food_name: quickFood.name,
            serving_qty: 1,
            serving_unit: 'serving',
            calories: parseFloat(quickFood.calories),
            protein: parseFloat(quickFood.protein) || 0,
            carbs: parseFloat(quickFood.carbs) || 0,
            fats: parseFloat(quickFood.fats) || 0,
            source: 'manual',
          },
        ],
        new Date().toISOString().split('T')[0]
      );

      if (result.success) {
        toast.success('Meal logged successfully! 🎉');
        handleClose();
        onSuccess?.();
      } else {
        toast.error('Failed to log meal');
      }
    } catch (error) {
      toast.error('Error logging meal');
      console.error(error);
    } finally {
      setIsLogging(false);
    }
  };

  const handlePhotoFoodsDetected = async (foods: any[]) => {
    setIsLogging(true);

    try {
      const result = await mealTrackingService.logMeal(
        userId,
        mealType,
        foods.map(food => ({
          food_name: food.name,
          serving_qty: food.portion ? parseFloat(food.portion.split(' ')[0]) : 1,
          serving_unit: food.portion ? food.portion.split(' ').slice(1).join(' ') : 'serving',
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          source: 'photo',
        })),
        new Date().toISOString().split('T')[0]
      );

      if (result.success) {
        toast.success('Meal from photo logged! 📸');
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Error logging meal');
    } finally {
      setIsLogging(false);
    }
  };

  const handleVoiceFoodsDetected = async (foods: any[]) => {
    setIsLogging(true);

    try {
      const result = await mealTrackingService.logMeal(
        userId,
        mealType,
        foods.map(food => ({
          food_name: food.name,
          serving_qty: food.portion ? parseFloat(food.portion.split(' ')[0]) : 1,
          serving_unit: food.portion ? food.portion.split(' ').slice(1).join(' ') : 'serving',
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fats: food.fats,
          source: 'voice',
        })),
        new Date().toISOString().split('T')[0]
      );

      if (result.success) {
        toast.success('Meal from voice logged! 🎤');
        handleClose();
        onSuccess?.();
      }
    } catch (error) {
      toast.error('Error logging meal');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={handleOpen}
        size="lg"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto"
            >
              <Card variant="elevated" padding="lg" className="max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Quick Log Meal</h2>
                  <Button variant="ghost" size="sm" onClick={handleClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Meal Type Selector */}
                <div className="mb-4">
                  <Label>Meal Type</Label>
                  <Select value={mealType} onValueChange={(v: any) => setMealType(v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakfast">🍳 Breakfast</SelectItem>
                      <SelectItem value="lunch">🥗 Lunch</SelectItem>
                      <SelectItem value="dinner">🍝 Dinner</SelectItem>
                      <SelectItem value="snack">🍎 Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Mode Selector */}
                {mode === 'quick' && (
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setMode('photo')}
                      className="flex-col h-20 gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span className="text-xs">Photo</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setMode('voice')}
                      className="flex-col h-20 gap-2"
                    >
                      <Mic className="w-5 h-5" />
                      <span className="text-xs">Voice</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setMode('search')}
                      className="flex-col h-20 gap-2"
                    >
                      <Search className="w-5 h-5" />
                      <span className="text-xs">Search</span>
                    </Button>
                  </div>
                )}

                {/* Quick Entry Form */}
                {mode === 'quick' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="food-name">Food Name *</Label>
                      <Input
                        id="food-name"
                        placeholder="e.g., Chicken breast"
                        value={quickFood.name}
                        onChange={(e) => setQuickFood({ ...quickFood, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="calories">Calories *</Label>
                        <Input
                          id="calories"
                          type="number"
                          placeholder="200"
                          value={quickFood.calories}
                          onChange={(e) => setQuickFood({ ...quickFood, calories: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="protein">Protein (g)</Label>
                        <Input
                          id="protein"
                          type="number"
                          placeholder="30"
                          value={quickFood.protein}
                          onChange={(e) => setQuickFood({ ...quickFood, protein: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="carbs">Carbs (g)</Label>
                        <Input
                          id="carbs"
                          type="number"
                          placeholder="10"
                          value={quickFood.carbs}
                          onChange={(e) => setQuickFood({ ...quickFood, carbs: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="fats">Fats (g)</Label>
                        <Input
                          id="fats"
                          type="number"
                          placeholder="5"
                          value={quickFood.fats}
                          onChange={(e) => setQuickFood({ ...quickFood, fats: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      onClick={handleQuickLog}
                      disabled={isLogging}
                      className="w-full"
                    >
                      {isLogging ? (
                        'Logging...'
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Log Meal
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Photo Mode */}
                {mode === 'photo' && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMode('quick')}
                      className="mb-4"
                    >
                      ← Back
                    </Button>
                    <PhotoScanner
                      userId={userId}
                      onFoodsDetected={handlePhotoFoodsDetected}
                      onClose={() => setMode('quick')}
                    />
                  </div>
                )}

                {/* Voice Mode */}
                {mode === 'voice' && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMode('quick')}
                      className="mb-4"
                    >
                      ← Back
                    </Button>
                    <VoiceRecorder
                      userId={userId}
                      onFoodsDetected={handleVoiceFoodsDetected}
                      onClose={() => setMode('quick')}
                    />
                  </div>
                )}

                {/* Search Mode */}
                {mode === 'search' && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMode('quick')}
                      className="mb-4"
                    >
                      ← Back
                    </Button>

                    <Tabs value={searchMode} onValueChange={(v: any) => setSearchMode(v)} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="database">
                          <Search className="w-4 h-4 mr-2" />
                          Food Database
                        </TabsTrigger>
                        {activeMealPlan && (
                          <TabsTrigger value="ai_plan">
                            <Sparkles className="w-4 h-4 mr-2" />
                            My Meal Plan
                          </TabsTrigger>
                        )}
                      </TabsList>

                      {/* Food Database Search */}
                      <TabsContent value="database" className="space-y-4">
                        <div>
                          <Label htmlFor="food-search">Search Food Database</Label>
                          <Input
                            id="food-search"
                            placeholder="Search for foods..."
                            value={searchQuery}
                            onChange={(e) => handleFoodSearch(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        {isSearching && (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        )}

                        {searchResults.length > 0 && !selectedFood && (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {searchResults.map((food) => (
                              <Card
                                key={food.id}
                                className="p-3 cursor-pointer hover:bg-accent transition-colors"
                                onClick={() => setSelectedFood(food)}
                              >
                                <div className="font-medium">{food.food_name}</div>
                                {food.brand_name && (
                                  <div className="text-xs text-muted-foreground">{food.brand_name}</div>
                                )}
                                <div className="text-sm text-muted-foreground mt-1">
                                  {food.calories} cal | P: {food.protein}g | C: {food.carbs}g | F: {food.fats}g
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Serving: {food.serving_qty} {food.serving_unit}
                                </div>
                              </Card>
                            ))}
                          </div>
                        )}

                        {selectedFood && (
                          <Card className="p-4 bg-primary/5 border-primary">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="font-medium">{selectedFood.food_name}</div>
                                {selectedFood.brand_name && (
                                  <div className="text-xs text-muted-foreground">{selectedFood.brand_name}</div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFood(null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="serving-size">Serving Size</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <Input
                                    id="serving-size"
                                    type="number"
                                    step="0.5"
                                    min="0.1"
                                    value={servingSize}
                                    onChange={(e) => setServingSize(e.target.value)}
                                    className="w-20"
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    x {selectedFood.serving_qty} {selectedFood.serving_unit}
                                  </span>
                                </div>
                              </div>

                              <div className="bg-background rounded-lg p-3 space-y-1">
                                <div className="text-sm font-medium">Nutrition (Total)</div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>Calories: {Math.round(selectedFood.calories * parseFloat(servingSize || '1'))}</div>
                                  <div>Protein: {Math.round(selectedFood.protein * parseFloat(servingSize || '1'))}g</div>
                                  <div>Carbs: {Math.round(selectedFood.carbs * parseFloat(servingSize || '1'))}g</div>
                                  <div>Fats: {Math.round(selectedFood.fats * parseFloat(servingSize || '1'))}g</div>
                                </div>
                              </div>

                              <Button
                                variant="primary"
                                onClick={handleLogSelectedFood}
                                disabled={isLogging}
                                className="w-full"
                              >
                                {isLogging ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Logging...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Log Food
                                  </>
                                )}
                              </Button>
                            </div>
                          </Card>
                        )}
                      </TabsContent>

                      {/* AI Meal Plan */}
                      {activeMealPlan && (
                        <TabsContent value="ai_plan" className="space-y-4">
                          <div className="space-y-2">
                            <Label>Select Meal from Your Plan</Label>
                            {loadingMealPlan ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                              </div>
                            ) : (
                              <div className="space-y-2 max-h-96 overflow-y-auto">
                                {activeMealPlan.plan_data.meals
                                  .filter((meal) => meal.meal_type.toLowerCase() === mealType.toLowerCase())
                                  .map((meal, index) => (
                                    <Card
                                      key={index}
                                      className="p-4 cursor-pointer hover:bg-accent transition-colors"
                                      onClick={() => handleLogAIPlanMeal(meal)}
                                    >
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="font-medium flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-primary" />
                                            {meal.meal_name}
                                          </div>
                                          <div className="text-sm text-muted-foreground mt-2">
                                            {meal.foods.length} food item{meal.foods.length !== 1 ? 's' : ''}
                                          </div>
                                          <div className="mt-2 space-y-1">
                                            {meal.foods.map((food, foodIndex) => (
                                              <div key={foodIndex} className="text-sm">
                                                - {food.name}
                                              </div>
                                            ))}
                                          </div>
                                          <div className="text-sm text-muted-foreground mt-2">
                                            Total: {meal.foods.reduce((sum, f) => sum + f.calories, 0)} cal |
                                            P: {meal.foods.reduce((sum, f) => sum + f.protein, 0)}g |
                                            C: {meal.foods.reduce((sum, f) => sum + f.carbs, 0)}g |
                                            F: {meal.foods.reduce((sum, f) => sum + f.fats, 0)}g
                                          </div>
                                        </div>
                                      </div>
                                    </Card>
                                  ))}
                                {activeMealPlan.plan_data.meals.filter(
                                  (meal) => meal.meal_type.toLowerCase() === mealType.toLowerCase()
                                ).length === 0 && (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No {mealType} meals in your plan
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
