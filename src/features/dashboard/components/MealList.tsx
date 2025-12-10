/**
 * MealList - Complete meal tracking with AI plan adherence
 * Infinite scroll, edit/delete, linked to AI plans
 */

import { mealTrackingService } from '@/features/nutrition';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Edit2, Sparkles, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

interface MealListProps {
  userId: string;
  selectedDate: Date;
  onRefresh?: () => void;
}

export function MealList({ userId, selectedDate, onRefresh }: MealListProps) {
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [aiPlanAdherence, setAiPlanAdherence] = useState<any>(null);

  const dateStr = selectedDate.toISOString().split('T')[0];
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayStr = nextDay.toISOString().split('T')[0];

  const {
    data: meals,
    isLoading,
    hasMore,
    observerTarget,
    refresh,
  } = useInfiniteScroll({
    fetchFunction: async (limit, offset) => {
      return await mealTrackingService.getDailyLogs(
        userId,
        dateStr,
        nextDayStr,
        limit,
        offset
      );
    },
    pageSize: 20,
  });

  // Load AI plan adherence
  useEffect(() => {
    const loadAdherence = async () => {
      // Get user's active meal plan
      const { data: activePlan } = await (window as any).supabase
        .from('ai_meal_plans')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (activePlan) {
        const adherence = await mealTrackingService.getMealPlanAdherence(
          userId,
          activePlan.id,
          dateStr,
          dateStr
        );
        setAiPlanAdherence(adherence[0]);
      }
    };

    loadAdherence();
  }, [userId, dateStr]);

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Delete this meal log?')) return;

    try {
      // Delete meal items first, then the log
      const { error } = await (window as any).supabase
        .from('daily_nutrition_logs')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      toast.success('Meal deleted');
      refresh();
      onRefresh?.();
    } catch (error) {
      toast.error('Failed to delete meal');
      console.error(error);
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🥗';
      case 'dinner':
        return '🍝';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-700';
      case 'lunch':
        return 'bg-green-500/10 border-green-500/20 text-green-700';
      case 'dinner':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700';
      case 'snack':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-700';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-700';
    }
  };

  if (isLoading && meals.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} padding="md" className="animate-pulse">
            <div className="h-20 bg-muted rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (meals.length === 0 && !isLoading) {
    return (
      <Card variant="elevated" padding="lg" className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-lg font-semibold mb-2">No meals logged yet</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use the + button to log your first meal
        </p>
        {aiPlanAdherence && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>
                You have an AI meal plan active. Follow it for best results!
              </span>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Plan Adherence Summary */}
      {aiPlanAdherence && (
        <Card
          variant="elevated"
          padding="md"
          className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">AI Plan Adherence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-primary">
                {Math.round(aiPlanAdherence.adherence_percentage || 0)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {aiPlanAdherence.meals_followed || 0} of {aiPlanAdherence.meals_total || 0} meals
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Meal List */}
      <AnimatePresence>
        {meals.map((meal: any) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card
              variant="elevated"
              padding="md"
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl">{getMealIcon(meal.meal_type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold capitalize">{meal.meal_type}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getMealColor(meal.meal_type)}`}>
                        {meal.meal_type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {meal.total_calories || 0} cal
                      </span>
                      <span>P: {Math.round(meal.total_protein || 0)}g</span>
                      <span>C: {Math.round(meal.total_carbs || 0)}g</span>
                      <span>F: {Math.round(meal.total_fats || 0)}g</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {meal.meal_items?.some((item: any) => item.from_ai_plan) && (
                    <div className="p-1.5 rounded-full bg-primary/10">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMeal(meal.id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedMeal === meal.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t space-y-2"
                >
                  <h5 className="font-medium text-sm mb-2">Food Items:</h5>
                  {meal.meal_items?.length > 0 ? (
                    meal.meal_items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2"
                      >
                        <div className="flex items-center gap-2">
                          {item.from_ai_plan && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                          <span className="font-medium">{item.food_name}</span>
                          <span className="text-muted-foreground">
                            {item.serving_qty} {item.serving_unit}
                          </span>
                        </div>
                        <div className="text-muted-foreground">
                          {item.calories} cal
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items</p>
                  )}

                  {meal.notes && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <strong>Notes:</strong> {meal.notes}
                    </div>
                  )}
                </motion.div>
              )}
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Infinite Scroll Trigger */}
      {hasMore && (
        <div ref={observerTarget} className="py-4 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Loading more meals...
          </div>
        </div>
      )}

      {!hasMore && meals.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          All meals loaded ✓
        </div>
      )}
    </div>
  );
}
