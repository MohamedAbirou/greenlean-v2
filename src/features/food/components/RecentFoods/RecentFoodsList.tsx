/**
 * RecentFoodsList Component
 * Display frequently logged foods for quick-add
 */

import { motion } from 'framer-motion';
import { Clock, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useRecentFoods } from '../../hooks/useRecentFoods';
import type { RecentFood } from '../../types/food.types';

interface RecentFoodsListProps {
  limit?: number;
  showHeader?: boolean;
}

export function RecentFoodsList({ limit = 10, showHeader = true }: RecentFoodsListProps) {
  const { recentFoods, loading, quickAddFood } = useRecentFoods(limit);

  const handleQuickAdd = async (food: RecentFood) => {
    await quickAddFood(food);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Clock className="w-6 h-6 text-primary-600" />
        </motion.div>
      </div>
    );
  }

  if (recentFoods.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed">
        <Clock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm text-muted-foreground">
          No recent foods yet. Start logging to see your frequently eaten foods here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Recent Foods
            </h3>
            <p className="text-sm text-muted-foreground">
              Quick-add your frequently logged foods
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {recentFoods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
          >
            {/* Food Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium truncate">{food.food_name}</h4>
                {food.brand_name && (
                  <span className="text-xs text-muted-foreground truncate">
                    ({food.brand_name})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{food.serving_size}</span>
                <span>•</span>
                <span>{Math.round(food.calories)} cal</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Logged {food.frequency_count}x</span>
                </div>
              </div>
            </div>

            {/* Macros Quick View */}
            <div className="hidden sm:flex items-center gap-3 text-xs">
              <div className="text-center">
                <p className="text-primary-600 font-semibold">{Math.round(food.protein)}g</p>
                <p className="text-muted-foreground">P</p>
              </div>
              <div className="text-center">
                <p className="text-accent-600 font-semibold">{Math.round(food.carbs)}g</p>
                <p className="text-muted-foreground">C</p>
              </div>
              <div className="text-center">
                <p className="text-secondary-600 font-semibold">{Math.round(food.fat)}g</p>
                <p className="text-muted-foreground">F</p>
              </div>
            </div>

            {/* Quick Add Button */}
            <Button
              size="sm"
              onClick={() => handleQuickAdd(food)}
              className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Zap className="w-3 h-3" />
              Quick Add
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
