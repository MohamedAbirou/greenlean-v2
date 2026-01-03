/**
 * useRecentFoods Hook
 * Manages recent foods tracking and quick-add
 */

import { useAuth } from "@/features/auth";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback } from "react";
import { toast } from "sonner";
import { GET_USER_RECENT_FOODS, UPSERT_RECENT_FOOD } from "../graphql/foodQueries";
import type { RecentFood } from "../types/food.types";

type RecentFoodNode = {
  id: string;
  user_id: string;
  food_name: string;
  brand_name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  frequency_count: number;
  last_logged_at: string;
  nutritionix_id: string;
};

type UserRecentFoodsCollection = {
  edges: { node: RecentFoodNode }[];
};

type GetUserRecentFoodsData = {
  user_recent_foodsCollection: UserRecentFoodsCollection;
};

type GetUserRecentFoodsVars = {
  userId?: string;
  limit?: number;
};

export function useRecentFoods(limit: number = 10) {
  const { user } = useAuth();

  // Fetch recent foods
  const { data, loading, refetch } = useQuery<GetUserRecentFoodsData, GetUserRecentFoodsVars>(
    GET_USER_RECENT_FOODS,
    {
      variables: { userId: user?.id, limit },
      skip: !user?.id,
    }
  );

  // Upsert recent food (increment frequency or create new)
  const [upsertRecentFoodMutation] = useMutation(UPSERT_RECENT_FOOD, {
    onCompleted: () => {
      refetch();
    },
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recentFoods: RecentFood[] =
    data?.user_recent_foodsCollection?.edges?.map((edge: any) => edge.node) || [];

  const trackRecentFood = useCallback(
    async (
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
        console.error("Failed to track recent food:", error);
      }
    },
    [user, upsertRecentFoodMutation]
  );

  const quickAddFood = useCallback(
    async (recentFood: RecentFood) => {
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
    },
    [trackRecentFood]
  );

  const getMostFrequent = useCallback(
    (count: number = 5) => {
      return recentFoods.slice(0, count);
    },
    [recentFoods]
  );

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
