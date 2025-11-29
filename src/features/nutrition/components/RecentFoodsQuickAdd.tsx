/**
 * RecentFoodsQuickAdd Component
 * Shows recently logged foods for quick selection
 * Analyzes daily_nutrition_logs to find frequently logged foods
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ModalDialog } from '@/shared/components/ui/modal-dialog';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Button } from '@/shared/components/ui/button';
import { Clock, Search, Plus, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface RecentFood {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  frequency: number;
  lastLogged: string;
  image?: string;
}

interface RecentFoodsQuickAddProps {
  open: boolean;
  onClose: () => void;
  onSelectFood: (food: Omit<RecentFood, 'frequency' | 'lastLogged'>) => void;
  userId: string;
}

export function RecentFoodsQuickAdd({
  open,
  onClose,
  onSelectFood,
  userId,
}: RecentFoodsQuickAddProps) {
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<RecentFood[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadRecentFoods();
    }
  }, [open, userId]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = recentFoods.filter((food) =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFoods(filtered);
    } else {
      setFilteredFoods(recentFoods);
    }
  }, [searchQuery, recentFoods]);

  const loadRecentFoods = async () => {
    setLoading(true);
    try {
      // Get last 30 days of meal logs
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs, error } = await supabase
        .from('daily_nutrition_logs')
        .select('food_items, log_date')
        .eq('user_id', userId)
        .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (error) throw error;

      // Process and aggregate foods
      const foodMap = new Map<string, RecentFood>();

      logs?.forEach((log) => {
        const foods = log.food_items as any[];
        foods.forEach((food) => {
          const key = `${food.name}-${food.portion}`;
          if (foodMap.has(key)) {
            const existing = foodMap.get(key)!;
            existing.frequency += 1;
            // Update last logged if this log is more recent
            if (log.log_date > existing.lastLogged) {
              existing.lastLogged = log.log_date;
            }
          } else {
            foodMap.set(key, {
              name: food.name,
              portion: food.portion,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fats: food.fats,
              image: food.image,
              frequency: 1,
              lastLogged: log.log_date,
            });
          }
        });
      });

      // Convert to array and sort by frequency and recency
      const foodsArray = Array.from(foodMap.values()).sort((a, b) => {
        // First sort by frequency
        if (b.frequency !== a.frequency) {
          return b.frequency - a.frequency;
        }
        // Then by recency
        return new Date(b.lastLogged).getTime() - new Date(a.lastLogged).getTime();
      });

      // Limit to top 50
      setRecentFoods(foodsArray.slice(0, 50));
      setFilteredFoods(foodsArray.slice(0, 50));
    } catch (error) {
      console.error('Error loading recent foods:', error);
      toast.error('Failed to load recent foods');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFood = (food: RecentFood) => {
    onSelectFood({
      name: food.name,
      portion: food.portion,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      image: food.image,
    });
    toast.success(`Added ${food.name} to your log!`);
  };

  const formatLastLogged = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <ModalDialog open={open} onOpenChange={onClose} title="Recent Foods" size="lg">
      <div className="space-y-4">
        {/* Search */}
        <div>
          <Label>Search Recent Foods</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by food name..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Showing foods from the last 30 days</span>
        </div>

        {/* Recent Foods List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredFoods.length > 0 ? (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
            {filteredFoods.map((food, index) => (
              <motion.div
                key={`${food.name}-${food.portion}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card
                  variant="outline"
                  padding="sm"
                  className="hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {/* Image */}
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    {/* Food Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {food.name}
                        </h4>
                        {food.frequency > 1 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                            <TrendingUp className="w-3 h-3" />
                            {food.frequency}x
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{food.portion}</span>
                        <span>•</span>
                        <span>{food.calories} cal</span>
                        <span>•</span>
                        <span>{food.protein}g P</span>
                        <span>•</span>
                        <span>{food.carbs}g C</span>
                        <span>•</span>
                        <span>{food.fats}g F</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Last logged: {formatLastLogged(food.lastLogged)}
                      </div>
                    </div>

                    {/* Add Button */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSelectFood(food)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery ? 'No matching foods found' : 'No recent foods yet'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Start logging meals to see your favorites here'}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
}
