/**
 * QuickMealLog - Ultra-smooth meal logging
 * MyFitnessPal/CalAI-level UX with photo/voice/search
 */

import { PhotoScanner, VoiceRecorder } from '@/features/nutrition';
import { mealTrackingService } from '@/features/nutrition';
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
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Check, Mic, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface QuickMealLogProps {
  userId: string;
  onSuccess?: () => void;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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

  const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 15) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  };

  const handleOpen = () => {
    setIsOpen(true);
    setMealType(getCurrentMealType());
  };

  const handleClose = () => {
    setIsOpen(false);
    setMode('quick');
    setQuickFood({ name: '', calories: '', protein: '', carbs: '', fats: '' });
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
                    <p className="text-sm text-muted-foreground">
                      Food search integration coming soon...
                    </p>
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
