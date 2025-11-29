/**
 * EnhancedMealLogModal Component
 * Meal logging with Nutritionix API integration
 * Features: Food search, barcode scanning, manual entry
 * Production-ready with full error handling
 */

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ModalDialog } from '@/shared/components/ui/modal-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card } from '@/shared/components/ui/card';
import { Loader2, Plus, Save, X, Search, Camera, Edit3, Sparkles, BookmarkPlus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { FoodSearch } from './FoodSearch';
import { BarcodeScanner } from './BarcodeScanner';
import { MealTemplatesManager } from './MealTemplatesManager';
import { RecentFoodsQuickAdd } from './RecentFoodsQuickAdd';
import { NutritionixService, type FoodItem } from '../api/nutritionixService';
import { motion, AnimatePresence } from 'framer-motion';
import { FeatureGate } from '@/shared/components/billing/FeatureGate';

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

interface EnhancedMealLogModalProps {
  userId: string;
  show: boolean;
  setShowLogModal: (show: boolean) => void;
  onClose: () => void;
  loadTodayLogs: () => void;
  isLogging: boolean;
}

type EntryMode = 'search' | 'scan' | 'manual';

export function EnhancedMealLogModal({
  userId,
  show,
  setShowLogModal,
  onClose,
  loadTodayLogs,
  isLogging,
}: EnhancedMealLogModalProps) {
  const [entryMode, setEntryMode] = useState<EntryMode>('search');
  const [showScanner, setShowScanner] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showRecentFoods, setShowRecentFoods] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodLog | null>(null);

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
    setEntryMode('manual'); // Switch to manual mode to allow editing
  };

  const handleTemplateSelected = (template: any) => {
    // Add all foods from template to current meal
    const templateFoods = template.foods.map((f: any) => ({
      name: f.food_name,
      portion: `${f.qty} ${f.unit}`,
      calories: f.calories,
      protein: f.protein,
      carbs: f.carbs,
      fats: f.fats,
    }));

    setMealLog((prev) => ({
      ...prev,
      meal_type: template.meal_type,
      foods: [...prev.foods, ...templateFoods],
    }));

    setShowTemplates(false);
  };

  const handleRecentFoodSelected = (food: FoodLog) => {
    setNewFood(food);
    setEntryMode('manual');
    setShowRecentFoods(false);
  };

  const addFoodToLog = () => {
    if (!newFood.name || newFood.calories <= 0) {
      toast.error('Please fill in food name and calories');
      return;
    }

    if (editingFood) {
      // Update existing food
      setMealLog((prev) => ({
        ...prev,
        foods: prev.foods.map((f) => (f === editingFood ? { ...newFood } : f)),
      }));
      setEditingFood(null);
      toast.success('Food updated!');
    } else {
      // Add new food
      setMealLog((prev) => ({ ...prev, foods: [...prev.foods, { ...newFood }] }));
      toast.success('Food added!');
    }

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

  const editFood = (food: FoodLog) => {
    setEditingFood(food);
    setNewFood(food);
    setEntryMode('manual');
  };

  const saveMealLog = async () => {
    if (mealLog.foods.length === 0) {
      toast.error('Please add at least one food item');
      return;
    }

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
      setShowLogModal(false);
      setMealLog({ meal_type: 'breakfast', foods: [], notes: '' });
      setNewFood({
        name: '',
        portion: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
      });
      loadTodayLogs();
    } catch (error) {
      console.error('Error saving meal log:', error);
      toast.error('Failed to save meal log');
    }
  };

  return (
    <>
      <ModalDialog open={show} onOpenChange={onClose} title="Log Your Meal" size="lg">
        <div className="space-y-6">
          {/* Meal Type */}
          <div>
            <Label>Meal Type*</Label>
            <Select
              value={mealLog.meal_type}
              onValueChange={(value) => setMealLog({ ...mealLog, meal_type: value })}
            >
              <SelectTrigger className="w-full">
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
            <div className="grid grid-cols-3 gap-2 mb-2">
              <Button
                variant={entryMode === 'search' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setEntryMode('search')}
                disabled={!isNutritionixConfigured}
              >
                <Search className="w-4 h-4" />
                Search
                {isNutritionixConfigured && <Sparkles className="w-3 h-3 ml-1 text-warning" />}
              </Button>
              <FeatureGate
                feature="barcode_scanner"
                mode="inline"
                upgradeTitle="Unlock Barcode Scanner"
                upgradeDescription="Scan food barcodes to instantly log nutrition information with Pro or Premium."
              >
                <Button
                  variant={entryMode === 'scan' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setEntryMode('scan');
                    setShowScanner(true);
                  }}
                  disabled={!isNutritionixConfigured}
                >
                  <Camera className="w-4 h-4" />
                  Scan
                  {isNutritionixConfigured && <Sparkles className="w-3 h-3 ml-1 text-warning" />}
                </Button>
              </FeatureGate>
              <Button
                variant={entryMode === 'manual' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setEntryMode('manual')}
              >
                <Edit3 className="w-4 h-4" />
                Manual
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                <BookmarkPlus className="w-4 h-4" />
                Templates
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRecentFoods(true)}
              >
                <Clock className="w-4 h-4" />
                Recent Foods
              </Button>
            </div>

            {!isNutritionixConfigured && (
              <div className="bg-warning-light dark:bg-warning/20 border border-warning rounded-lg p-3 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  💡 <strong>Tip:</strong> Configure Nutritionix API to enable food search and
                  barcode scanning. Add VITE_NUTRITIONIX_APP_ID and VITE_NUTRITIONIX_API_KEY to
                  your .env file.
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
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Portion*</Label>
                      <Input
                        value={newFood.portion}
                        onChange={(e) => setNewFood({ ...newFood, portion: e.target.value })}
                        placeholder="e.g., 150g or 1 cup"
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
                      />
                    </div>
                  </div>
                  <Button onClick={addFoodToLog} variant="secondary" className="w-full">
                    <Plus className="h-4 w-4" />
                    {editingFood ? 'Update Food' : 'Add Food'}
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
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {mealLog.foods.map((food, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                      >
                        {food.image && (
                          <img
                            src={food.image}
                            alt={food.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {food.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {food.portion} • {food.calories} cal • {food.protein}g P •{' '}
                            {food.carbs}g C • {food.fats}g F
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => editFood(food)}
                            className="p-2 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFoodFromLog(index)}
                            className="p-2 text-error hover:bg-error-light dark:hover:bg-error/20 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Calories</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {mealLog.foods.reduce((sum, f) => sum + f.calories, 0)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Protein</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {mealLog.foods.reduce((sum, f) => sum + f.protein, 0)}g
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Carbs</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {mealLog.foods.reduce((sum, f) => sum + f.carbs, 0)}g
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Fats</div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
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
            <Textarea
              value={mealLog.notes}
              onChange={(e) => setMealLog({ ...mealLog, notes: e.target.value })}
              placeholder="Any additional notes about this meal..."
              rows={3}
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={saveMealLog}
            variant="primary"
            className="w-full"
            disabled={isLogging || mealLog.foods.length === 0}
          >
            {isLogging ? (
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
      </ModalDialog>

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

      {/* Meal Templates Manager */}
      <MealTemplatesManager
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelected}
        currentMeal={mealLog}
      />

      {/* Recent Foods Quick Add */}
      <RecentFoodsQuickAdd
        open={showRecentFoods}
        onClose={() => setShowRecentFoods(false)}
        onSelectFood={handleRecentFoodSelected}
        userId={userId}
      />
    </>
  );
}
