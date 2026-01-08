/**
 * useMealTemplates Hook - PRODUCTION READY
 * Complete meal template management with proper error handling
 */

import { useAuth } from "@/features/auth";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  CREATE_MEAL_TEMPLATE,
  DELETE_MEAL_TEMPLATE,
  GET_USER_MEAL_TEMPLATES,
  INCREMENT_TEMPLATE_USE,
  TOGGLE_TEMPLATE_FAVORITE,
} from "../graphql/foodQueries";
import type { MealTemplate, TemplateFoodItem } from "../types/food.types";

type MealTemplateNode = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  foods: any;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_type: string;
  is_favorite: boolean;
  use_count: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
};

type GetUserMealTemplatesData = {
  meal_templatesCollection: {
    edges: { node: MealTemplateNode }[];
  };
};

export function useMealTemplates() {
  const { user } = useAuth();

  // Fetch user's meal templates with optimized query
  const { data, loading, refetch, error } = useQuery<GetUserMealTemplatesData>(
    GET_USER_MEAL_TEMPLATES,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
      fetchPolicy: "cache-and-network", // Always try to get fresh data
      notifyOnNetworkStatusChange: true,
    }
  );

  // Create template mutation
  const [createTemplateMutation, { loading: isCreating }] = useMutation(CREATE_MEAL_TEMPLATE, {
    onCompleted: () => {
      toast.success("Template saved! 🎉", {
        description: "You can now quickly add this meal anytime",
      });
      refetch();
    },
    onError: (error) => {
      console.error("Failed to create template:", error);
      toast.error("Failed to save template", {
        description: error.message || "Please try again",
      });
    },
  });

  // Delete template mutation
  const [deleteTemplateMutation, { loading: isDeleting }] = useMutation(DELETE_MEAL_TEMPLATE, {
    onCompleted: () => {
      toast.success("Template deleted");
      refetch();
    },
    onError: (error) => {
      console.error("Failed to delete template:", error);
      toast.error("Failed to delete template", {
        description: error.message || "Please try again",
      });
    },
  });

  // Toggle favorite mutation
  const [toggleFavoriteMutation] = useMutation(TOGGLE_TEMPLATE_FAVORITE, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Failed to toggle favorite:", error);
      toast.error("Failed to update favorite status");
    },
  });

  // Increment use count mutation
  const [incrementUseMutation] = useMutation(INCREMENT_TEMPLATE_USE, {
    onError: (error) => {
      console.error("Failed to increment use count:", error);
      // Silent fail - not critical
    },
  });

  // Parse and memoize templates
  const templates: MealTemplate[] = useMemo(() => {
    if (!data?.meal_templatesCollection?.edges) return [];

    return data.meal_templatesCollection.edges.map((edge) => {
      const node = edge.node;

      // Parse foods if it's a JSON string
      let parsedFoods = node.foods;
      if (typeof node.foods === "string") {
        try {
          parsedFoods = JSON.parse(node.foods);
        } catch (e) {
          console.error("Failed to parse foods JSON:", e);
          parsedFoods = [];
        }
      }

      return {
        ...node,
        foods: parsedFoods,
        total_fats: node.total_fat, // Map total_fat to total_fats for consistency
      } as MealTemplate;
    });
  }, [data]);

  // Get favorite templates
  const favoriteTemplates = useMemo(() => {
    return templates.filter((t) => t.is_favorite);
  }, [templates]);

  // Get templates by meal type
  const getTemplatesByMealType = useCallback(
    (mealType: string) => {
      return templates.filter((t) => t.meal_type === mealType);
    },
    [templates]
  );

  // Get most used templates
  const mostUsedTemplates = useMemo(() => {
    return [...templates].sort((a, b) => b.use_count - a.use_count).slice(0, 5);
  }, [templates]);

  // Get recently used templates
  const recentlyUsedTemplates = useMemo(() => {
    return [...templates]
      .filter((t) => t.last_used_at)
      .sort((a, b) => new Date(b.last_used_at!).getTime() - new Date(a.last_used_at!).getTime())
      .slice(0, 5);
  }, [templates]);

  /**
   * Create a new meal template
   */
  const createTemplate = useCallback(
    async (name: string, description: string, foods: TemplateFoodItem[], mealType?: string) => {
      if (!user) {
        toast.error("You must be logged in to create templates");
        return null;
      }

      if (!name.trim()) {
        toast.error("Please provide a name for the template");
        return null;
      }

      if (foods.length === 0) {
        toast.error("Template must contain at least one food item");
        return null;
      }

      // Calculate totals
      const totals = foods.reduce(
        (acc, food) => ({
          calories: acc.calories + food.calories * food.quantity,
          protein: acc.protein + food.protein * food.quantity,
          carbs: acc.carbs + food.carbs * food.quantity,
          fat: acc.fat + food.fat * food.quantity,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      try {
        const result = await createTemplateMutation({
          variables: {
            userId: user.id,
            name: name.trim(),
            description: description?.trim() || null,
            foods: JSON.stringify(foods),
            totalCalories: Math.round(totals.calories * 100) / 100,
            totalProtein: Math.round(totals.protein * 100) / 100,
            totalCarbs: Math.round(totals.carbs * 100) / 100,
            totalFat: Math.round(totals.fat * 100) / 100,
            mealType: mealType || null,
          },
        });

        return result.data;
      } catch (error) {
        console.error("Error creating template:", error);
        return null;
      }
    },
    [user, createTemplateMutation]
  );

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      if (!templateId) return false;

      try {
        await deleteTemplateMutation({
          variables: { id: templateId },
        });
        return true;
      } catch (error) {
        console.error("Error deleting template:", error);
        return false;
      }
    },
    [deleteTemplateMutation]
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    async (templateId: string, currentFavorite: boolean) => {
      if (!templateId) return false;

      try {
        await toggleFavoriteMutation({
          variables: {
            id: templateId,
            isFavorite: !currentFavorite,
          },
        });

        toast.success(currentFavorite ? "Removed from favorites" : "Added to favorites ⭐");
        return true;
      } catch (error) {
        console.error("Error toggling favorite:", error);
        return false;
      }
    },
    [toggleFavoriteMutation]
  );

  /**
   * Use a template (logs it and increments use count)
   */
  const applyTemplate = useCallback(
    async (template: MealTemplate) => {
      if (!template) return null;

      try {
        // Increment use count
        await incrementUseMutation({
          variables: {
            id: template.id,
            currentCount: (template.use_count || 0) + 1,
          },
        });

        // Refetch to update UI
        await refetch();

        return template;
      } catch (error) {
        console.error("Error using template:", error);
        return null;
      }
    },
    [incrementUseMutation, refetch]
  );

  return {
    // Data
    templates,
    favoriteTemplates,
    mostUsedTemplates,
    recentlyUsedTemplates,

    // Loading states
    loading,
    isCreating,
    isDeleting,
    error,

    // Actions
    createTemplate,
    deleteTemplate,
    toggleFavorite,
    applyTemplate,
    getTemplatesByMealType,

    // Refetch
    refetch,
  };
}
