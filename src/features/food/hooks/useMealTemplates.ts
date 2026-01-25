/**
 * useMealTemplates Hook - PRODUCTION READY
 * Complete meal template management with proper error handling
 */

import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import type { MealItem, MealTemplate } from "@/shared/types/food.types";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  GET_USER_MEAL_TEMPLATES,
  INCREMENT_TEMPLATE_USE,
  TOGGLE_TEMPLATE_FAVORITE,
} from "../graphql/foodQueries";

type MealTemplateNode = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  meal_type?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  is_favorite: boolean;
  use_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
  template_itemsCollection: {
    edges: {
      node: MealItem;
    }[];
  };
};

type GetUserMealTemplatesData = {
  meal_templatesCollection: {
    edges: { node: MealTemplateNode }[];
  };
};

export function useMealTemplates() {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

    return data.meal_templatesCollection.edges.map(({ node }) => {
      const items = node.template_itemsCollection?.edges.map((e) => e.node) ?? [];

      return {
        ...node,
        items,
        total_fats: node.total_fats, // consistency
      };
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
    async (name: string, description: string, foods: MealItem[], mealType?: string) => {
      if (!user || foods.length === 0) return null;

      const totals = foods.reduce(
        (acc, f) => ({
          calories: acc.calories + f.calories * f.serving_qty,
          protein: acc.protein + f.protein * f.serving_qty,
          carbs: acc.carbs + f.carbs * f.serving_qty,
          fats: acc.fats + f.fats * f.serving_qty,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

      const template = {
        user_id: user.id,
        name: name.trim(),
        description: description?.trim() || null,
        meal_type: mealType || null,
        total_calories: totals.calories,
        total_protein: totals.protein,
        total_carbs: totals.carbs,
        total_fats: totals.fats,
        is_favorite: false,
        use_count: 0,
      };

      try {
        setIsCreating(true);

        // Insert the log first
        const { data: templateData, error: logError } = await supabase
          .from("meal_templates")
          .insert(template)
          .select()
          .single();

        if (logError) throw logError;

        const templateId = templateData.id;

        const items = foods.map((f) => ({
          user_id: user.id,
          food_id: f.food_id,
          food_name: f.food_name,
          brand_name: f.brand_name,
          serving_qty: f.serving_qty,
          serving_unit: f.serving_unit,
          calories: f.calories,
          protein: f.protein,
          carbs: f.carbs,
          fats: f.fats,
          fiber: f.fiber,
          sugar: f.sugar,
          sodium: f.sodium,
          notes: f.notes,
        }));

        // Insert items with log_id
        const itemsToInsert = items.map((item) => ({
          ...item,
          template_id: templateId,
        }));

        const { data: itemsData, error: itemsError } = await supabase
          .from("template_items")
          .insert(itemsToInsert)
          .select();

        if (itemsError) throw itemsError;

        toast.success("Template saved! 🎉", {
          description: "You can now quickly add this meal anytime",
        });

        refetch();
        return { data: { log: templateData, items: itemsData } };
      } catch (error: any) {
        toast.error("Failed to delete template", {
          description: error.message || "Please try again",
        });
      } finally {
        setIsCreating(false);
      }
    },
    [user, refetch]
  );

  /**
   * Delete a template
   */
  const deleteTemplate = useCallback(
    async (templateId: string) => {
      if (!user || !templateId) return false;

      try {
        setIsDeleting(true);
        const { error } = await supabase
          .from("meal_templates")
          .delete()
          .eq("id", templateId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast.success("Template deleted");

        refetch();
        return { data: { success: true } };
      } catch (error: any) {
        console.error("Error deleting meal item:", error);
        toast.error("Failed to delete template", {
          description: error.message || "Please try again",
        });
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [user, refetch]
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
