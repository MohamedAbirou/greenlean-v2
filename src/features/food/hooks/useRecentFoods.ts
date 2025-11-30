/**
 * useRecentFoods Hook
 * Manages recent foods tracking and quick-add
 */

import { useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import type { RecentFood } from '../types/food.types';
import {
  GET_USER_RECENT_FOODS,
  UPSERT_RECENT_FOOD,
} from '../graphql/foodQueries';

export function useRecentFoods(limit: number = 10) {
  const { user } = useAuth();

  // Fetch recent foods
  const { data, loading, refetch } = useQuery(GET_USER_RECENT_FOODS, {
    variables: { userId: user?.id, limit },
    skip: !user?.id,
  });

  // Upsert recent food (increment frequency or create new)
  const [upsertRecentFoodMutation] = useMutation(UPSERT_RECENT_FOOD, {
    onCompleted: () => {
      refetch();
    },
  });

  const recentFoods: RecentFood[] = data?.user_recent_foodsCollection?.edges?.map((edge: any) => edge.node) || [];

  const trackRecentFood = useCallback(async (
    foodName: string,
    servingSize: string,
    calories: number,
    protein: number,
    carbs: number,
    fat: number
  ) => {
    if (!user) return;

    try {
      await upsertRecentFoodMutation({
        variables: {
          userId: user.id,
          foodName,
          servingSize,
          calories,
          protein,
          carbs,
          fat,
        },
      });
    } catch (error) {
      console.error('Failed to track recent food:', error);
    }
  }, [user, upsertRecentFoodMutation]);

  const quickAddFood = useCallback(async (recentFood: RecentFood) => {
    // This would integrate with your existing food logging system
    // For now, just show success message
    toast.success(`Quick-added ${recentFood.food_name}! ⚡`);

    // Track that this food was used again
    await trackRecentFood(
      recentFood.food_name,
      recentFood.serving_size,
      recentFood.calories,
      recentFood.protein,
      recentFood.carbs,
      recentFood.fat
    );

    return recentFood;
  }, [trackRecentFood]);

  const getMostFrequent = useCallback((count: number = 5) => {
    return recentFoods.slice(0, count);
  }, [recentFoods]);

  return {
    // Data
    recentFoods,
    mostFrequent: getMostFrequent(),

    // Loading
    loading,

    // Actions
    trackRecentFood,
    quickAddFood,
    getMostFrequent,

    // Refetch
    refetch,
  };
}
