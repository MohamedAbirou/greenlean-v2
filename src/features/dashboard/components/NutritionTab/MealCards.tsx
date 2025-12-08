/**
 * MealCards Component
 * Display meal plan and logged meals
 * Enhanced with expandable food items and meal type indicators
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/design-system';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Clock,
  Coffee,
  Cookie,
  Flame,
  Moon,
  Plus,
  Sun
} from 'lucide-react';
import { useState } from 'react';

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Meal {
  id: string;
  meal_type: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  created_at?: string;
  food_items?: FoodItem[];
  notes?: string;
}

interface MealCardsProps {
  meals: Meal[];
  onLogMeal: () => void;
  loading?: boolean;
}

// Meal type configurations with unique styling
const mealTypeConfig = {
  breakfast: {
    icon: Coffee,
    label: 'Breakfast',
    color: 'text-accent',
    bgColor: 'bg-accent/20',
    borderColor: 'border-accent/50',
    iconBg: 'bg-accent/30',
  },
  lunch: {
    icon: Sun,
    label: 'Lunch',
    color: 'text-warning',
    bgColor: 'bg-warning/20',
    borderColor: 'border-warning/50',
    iconBg: 'bg-warning/30',
  },
  dinner: {
    icon: Moon,
    label: 'Dinner',
    color: 'text-tip',
    bgColor: 'bg-tip/20',
    borderColor: 'border-tip/50',
    iconBg: 'bg-tip/30',
  },
  snack: {
    icon: Cookie,
    label: 'Snack',
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary/50',
    iconBg: 'bg-primary/30',
  },
};

function MealCard({ meal }: { meal: Meal }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get meal type config or use default
  const mealConfig = mealTypeConfig[meal.meal_type.toLowerCase() as keyof typeof mealTypeConfig] || {
    icon: Activity,
    label: meal.meal_type,
    color: 'text-primary-600 dark:text-primary-400',
    bgColor: 'bg-primary-50 dark:bg-primary-950/30',
    borderColor: 'border-primary-200 dark:border-primary-800',
    iconBg: 'bg-primary-100 dark:bg-primary-900/40',
  };

  const MealIcon = mealConfig.icon;

  // Format timestamp
  let timeAgo = null;
  if (meal.created_at) {
    const createdAt = new Date(meal.created_at);
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      timeAgo = 'Just now';
    } else if (diffMins < 60) {
      timeAgo = `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      timeAgo = `${hours}h ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      timeAgo = `${days}d ago`;
    }
  }

  const hasFoodItems = meal.food_items && meal.food_items.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'p-4 rounded-xl',
        'border-2',
        mealConfig.bgColor,
        mealConfig.borderColor,
        'hover:shadow-md',
        'transition-all duration-200',
        'group'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            mealConfig.iconBg
          )}>
            <MealIcon className={cn('w-5 h-5', mealConfig.color)} />
          </div>
          <div>
            <div className="font-semibold text-foreground text-base">
              {mealConfig.label}
            </div>
            {timeAgo && (
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant="error"
            size="sm"
            className="flex items-center gap-1"
          >
            <Flame className="w-3 h-3" />
            {meal.total_calories}
          </Badge>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className={cn(
          'text-center p-2.5 rounded-lg',
          'bg-gradient-to-br from-secondary-100 to-secondary-500/50',
          'border border-secondary-400'
        )}>
          <div className="font-semibold text-secondary-700 text-sm">
            {meal.total_protein}g
          </div>
          <div className="text-xs text-secondary-600/80 font-medium">
            Protein
          </div>
        </div>
        <div className={cn(
          'text-center p-2.5 rounded-lg',
          'bg-gradient-to-br from-primary-100 to-primary-500/50',
          'border border-primary-400'
        )}>
          <div className="font-semibold text-primary-700 text-sm">
            {meal.total_carbs}g
          </div>
          <div className="text-xs text-primary-600/80 font-medium">
            Carbs
          </div>
        </div>
        <div className={cn(
          'text-center p-2.5 rounded-lg',
          'bg-gradient-to-br from-accent-100 to-accent-500/50',
          'border border-accent-400'
        )}>
          <div className="font-semibold text-accent-700 text-sm">
            {meal.total_fats}g
          </div>
          <div className="text-xs text-accent-600/80 font-medium">
            Fats
          </div>
        </div>
      </div>

      {/* Notes */}
      {meal.notes && meal.notes.trim() && (
        <div className={cn(
          'mb-3 p-2.5 rounded-lg text-sm',
          'bg-muted/50 border border-border',
          'text-muted-foreground italic'
        )}>
          "{meal.notes}"
        </div>
      )}

      {/* Food Items - Expandable */}
      {hasFoodItems && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'w-full flex items-center justify-between',
              'text-sm font-medium text-foreground',
              'hover:text-primary',
              'transition-colors cursor-pointer'
            )}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {meal.food_items!.length} food item{meal.food_items!.length !== 1 ? 's' : ''}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {meal.food_items!.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'p-3 rounded-lg',
                        'bg-background/30 border border-border',
                        'hover:bg-muted/50 transition-colors'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-foreground text-sm">
                            {item.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {item.portion}
                          </div>
                        </div>
                        <Badge variant="outline" size="sm" className="ml-2">
                          {item.calories} cal
                        </Badge>
                      </div>

                      <div className="flex gap-3 text-xs">
                        <div className="text-blue-600 dark:text-blue-400">
                          <span className="font-medium">{item.protein}g</span> P
                        </div>
                        <div className="text-emerald-600 dark:text-emerald-400">
                          <span className="font-medium">{item.carbs}g</span> C
                        </div>
                        <div className="text-amber-600 dark:text-amber-400">
                          <span className="font-medium">{item.fats}g</span> F
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export function MealCards({ meals, onLogMeal, loading }: MealCardsProps) {
  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Today's Meals
          </h3>
          <p className="text-sm text-muted-foreground">
            Track your nutrition throughout the day
          </p>
        </div>
        {onLogMeal && (
          <Button variant="primary" size="sm" onClick={onLogMeal}>
            <Plus className="w-4 h-4 mr-1" />
            Log Meal
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                Loading meals...
              </div>
            </motion.div>
          ) : meals.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={cn(
                'text-center py-12 px-4 rounded-xl',
                'bg-muted/30 border-2 border-dashed border-border'
              )}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Activity className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-foreground font-medium mb-1">
                No meals logged yet
              </p>
              <p className="text-sm text-muted-foreground">
                Start tracking your nutrition today!
              </p>
            </motion.div>
          ) : (
            meals.map((meal) => <MealCard key={meal.id} meal={meal} />)
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}