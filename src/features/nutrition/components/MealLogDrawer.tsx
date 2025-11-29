/**
 * MealLogDrawer Component
 * Full-screen drawer for logging meals
 * Better UX than modal - proper space for food search and scanner
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Loader2, Plus, Save, X, Search, Camera, Edit3, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { FoodSearch } from './FoodSearch';
import { BarcodeScanner } from './BarcodeScanner';
import { NutritionixService, type FoodItem } from '../api/nutritionixService';
import { motion, AnimatePresence } from 'framer-motion';

interface FoodLog {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image?: string;
}

interface MealLog {
  meal_type: string;
  foods: FoodLog[];
  notes: string;
}

interface MealLogDrawerProps {
  userId: string;
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type EntryMode = 'search' | 'scan' | 'manual';

export function MealLogDrawer({ userId, show, onClose, onSuccess }: MealLogDrawerProps) {
  const [entryMode, setEntryMode] = useState<EntryMode>('search');
  const [showScanner, setShowScanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newFood, setNewFood] = useState<FoodLog>({
    name: '',
    portion: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });

  const [mealLog, setMealLog] = useState<MealLog>({
    meal_type: 'breakfast',
    foods: [],
    notes: '',
  });

  const isNutritionixConfigured = NutritionixService.isConfigured();

  // Block body scroll when drawer is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleFoodSelected = (food: FoodItem) => {
    setNewFood({
      name: food.brand ? `${food.brand} - ${food.name}` : food.name,
      portion: food.portion,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      image: food.image,
    });
    setEntryMode('manual');
  };

  const addFoodToLog = () => {
    if (!newFood.name || newFood.calories <= 0) {
      toast.error('Please fill in food name and calories');
      return;
    }

    setMealLog((prev) => ({ ...prev, foods: [...prev.foods, { ...newFood }] }));
    toast.success('Food added!');

    // Reset form
    setNewFood({
      name: '',
      portion: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    });
  };

  const removeFoodFromLog = (index: number) => {
    setMealLog((prev) => ({
      ...prev,
      foods: prev.foods.filter((_, i) => i !== index),
    }));
    toast.success('Food removed');
  };

  const saveMealLog = async () => {
    if (mealLog.foods.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }

    setIsSaving(true);
    try {
      const totalCalories = mealLog.foods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = mealLog.foods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = mealLog.foods.reduce((sum, f) => sum + f.carbs, 0);
      const totalFats = mealLog.foods.reduce((sum, f) => sum + f.fats, 0);

      const { error } = await supabase.from('daily_nutrition_logs').insert({
        user_id: userId,
        meal_type: mealLog.meal_type,
        food_items: mealLog.foods,
        total_calories: totalCalories,
        total_protein: totalProtein,
        total_carbs: totalCarbs,
        total_fats: totalFats,
        notes: mealLog.notes,
        log_date: new Date().toISOString().split('T')[0],
      });

      if (error) throw error;

      toast.success('Meal logged successfully! 🎉');
      setMealLog({ meal_type: 'breakfast', foods: [], notes: '' });
      setNewFood({
        name: '',
        portion: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving meal log:', error);
      toast.error('Failed to save meal log');
    } finally {
      setIsSaving(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-background shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-card">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Log Your Meal</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mealLog.foods.length === 0
                  ? 'Add food items to your meal'
                  : `${mealLog.foods.length} items • ${mealLog.foods.reduce(
                      (sum, f) => sum + f.calories,
                      0
                    )} cal`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-custom">
            {/* Meal Type */}
            <div>
              <Label>Meal Type*</Label>
              <Select
                value={mealLog.meal_type}
                onValueChange={(value) => setMealLog({ ...mealLog, meal_type: value })}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select Meal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Entry Mode Selection */}
            <div>
              <Label className="mb-2 block">Add Food Items</Label>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={entryMode === 'search' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setEntryMode('search')}
                  className="flex-1"
                  disabled={!isNutritionixConfigured}
                >
                  <Search className="w-4 h-4" />
                  Search
                  {isNutritionixConfigured && <Sparkles className="w-3 h-3 ml-1" />}
                </Button>
                <Button
                  variant={entryMode === 'scan' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEntryMode('scan');
                    setShowScanner(true);
                  }}
                  className="flex-1"
                  disabled={!isNutritionixConfigured}
                >
                  <Camera className="w-4 h-4" />
                  Scan
                  {isNutritionixConfigured && <Sparkles className="w-3 h-3 ml-1" />}
                </Button>
                <Button
                  variant={entryMode === 'manual' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setEntryMode('manual')}
                  className="flex-1"
                >
                  <Edit3 className="w-4 h-4" />
                  Manual
                </Button>
              </div>

              {!isNutritionixConfigured && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Configure Nutritionix API for food search and barcode
                    scanning
                  </p>
                </div>
              )}

              {/* Food Search Mode */}
              {entryMode === 'search' && isNutritionixConfigured && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <FoodSearch onSelectFood={handleFoodSelected} placeholder="Search for foods..." />
                </motion.div>
              )}

              {/* Manual Entry Mode */}
              {entryMode === 'manual' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card variant="outline" padding="md" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Label>Food Name*</Label>
                        <Input
                          value={newFood.name}
                          onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                          placeholder="e.g., Grilled Chicken"
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Portion*</Label>
                        <Input
                          value={newFood.portion}
                          onChange={(e) => setNewFood({ ...newFood, portion: e.target.value })}
                          placeholder="e.g., 150g or 1 cup"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Calories (kcal)*</Label>
                        <Input
                          type="number"
                          value={newFood.calories || ''}
                          onChange={(e) =>
                            setNewFood({
                              ...newFood,
                              calories: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Protein (g)*</Label>
                        <Input
                          type="number"
                          value={newFood.protein || ''}
                          onChange={(e) =>
                            setNewFood({
                              ...newFood,
                              protein: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Carbs (g)*</Label>
                        <Input
                          type="number"
                          value={newFood.carbs || ''}
                          onChange={(e) =>
                            setNewFood({
                              ...newFood,
                              carbs: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Fats (g)*</Label>
                        <Input
                          type="number"
                          value={newFood.fats || ''}
                          onChange={(e) =>
                            setNewFood({
                              ...newFood,
                              fats: Number(e.target.value),
                            })
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button onClick={addFoodToLog} variant="secondary" className="w-full">
                      <Plus className="h-4 w-4" />
                      Add Food
                    </Button>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Added Foods List */}
            <AnimatePresence>
              {mealLog.foods.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Label className="mb-2 block">Added Foods ({mealLog.foods.length})</Label>
                  <Card variant="outline" padding="sm">
                    <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-custom">
                      {mealLog.foods.map((food, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 bg-muted/20 p-3 rounded-lg"
                        >
                          {food.image && (
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-foreground truncate">{food.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {food.portion} • {food.calories} cal • {food.protein}g P •{' '}
                              {food.carbs}g C • {food.fats}g F
                            </div>
                          </div>
                          <button
                            onClick={() => removeFoodFromLog(index)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground">Calories</div>
                          <div className="font-semibold text-foreground">
                            {mealLog.foods.reduce((sum, f) => sum + f.calories, 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Protein</div>
                          <div className="font-semibold text-foreground">
                            {mealLog.foods.reduce((sum, f) => sum + f.protein, 0)}g
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Carbs</div>
                          <div className="font-semibold text-foreground">
                            {mealLog.foods.reduce((sum, f) => sum + f.carbs, 0)}g
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Fats</div>
                          <div className="font-semibold text-foreground">
                            {mealLog.foods.reduce((sum, f) => sum + f.fats, 0)}g
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notes */}
            <div>
              <Label>Notes (Optional)</Label>
              <Input
                value={mealLog.notes}
                onChange={(e) => setMealLog({ ...mealLog, notes: e.target.value })}
                placeholder="Any additional notes..."
                className="mt-2"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-card flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={saveMealLog}
              variant="primary"
              className="flex-1"
              disabled={isSaving || mealLog.foods.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Meal Log
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Barcode Scanner Modal */}
      {showScanner && (
        <BarcodeScanner
          onScanSuccess={(food) => {
            handleFoodSelected(food);
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}
    </AnimatePresence>
  );
}
