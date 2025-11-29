/**
 * MealCards Component
 * Display meal plan and logged meals
 * Uses design system variants
 */

import { motion } from 'framer-motion';
import { Apple, Plus, Clock } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/design-system';

export interface Meal {
  id: string;
  meal_name: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  logged_at?: string;
}

interface MealCardsProps {
  meals: Meal[];
  onLogMeal?: () => void;
  loading?: boolean;
}

function MealCard({ meal }: { meal: Meal }) {
  const timeAgo = meal.logged_at
    ? new Date(meal.logged_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-4 rounded-lg',
        'bg-white dark:bg-gray-800/50',
        'border border-gray-200 dark:border-gray-700',
        'hover:border-primary-300 dark:hover:border-primary-600',
        'transition-all'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <Apple className="w-4 h-4 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {meal.meal_name}
            </div>
            {timeAgo && (
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
            )}
          </div>
        </div>
        <Badge variant="primary" size="sm">
          {meal.calories} cal
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-800/50">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {meal.protein_g}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
        </div>
        <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-800/50">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {meal.carbs_g}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
        </div>
        <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-800/50">
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {meal.fat_g}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Fat</div>
        </div>
      </div>
    </motion.div>
  );
}

export function MealCards({ meals, onLogMeal, loading }: MealCardsProps) {
  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Today's Meals
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your nutrition
          </p>
        </div>
        {onLogMeal && (
          <Button variant="primary" size="sm" onClick={onLogMeal}>
            <Plus className="w-4 h-4 mr-1" />
            Log Meal
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading meals...
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No meals logged today. Start tracking!
          </div>
        ) : (
          meals.map((meal) => <MealCard key={meal.id} meal={meal} />)
        )}
      </div>
    </Card>
  );
}
