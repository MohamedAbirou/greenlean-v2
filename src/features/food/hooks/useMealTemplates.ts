/**
 * useMealTemplates Hook
 * Manages meal template CRUD operations
 */

import { useAuth } from "@/features/auth";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
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
  foods: any; // adjust if you have a type for foods
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  meal_type: string;
  is_favorite: boolean;
  use_count: number;
  created_at: string;
  updated_at: string;
};

type MealTemplatesCollection = {
  edges: { node: MealTemplateNode }[];
};

type GetUserMealTemplatesData = {
  meal_templatesCollection: MealTemplatesCollection;
};

type GetUserMealTemplatesVars = {
  userId?: string;
};

export function useMealTemplates() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch user's meal templates
  const { data, loading, refetch } = useQuery<GetUserMealTemplatesData, GetUserMealTemplatesVars>(
    GET_USER_MEAL_TEMPLATES,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
    }
  );

  // Create template mutation
  const [createTemplateMutation, { loading: isCreating }] = useMutation(CREATE_MEAL_TEMPLATE, {
    onCompleted: () => {
      toast.success("Meal template created! 🎉");
      refetch();
      setIsCreateModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create template: ${error.message}`);
    },
  });

  // Delete template mutation
  const [deleteTemplateMutation, { loading: isDeleting }] = useMutation(DELETE_MEAL_TEMPLATE, {
    onCompleted: () => {
      toast.success("Template deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  // Toggle favorite mutation
  const [toggleFavoriteMutation] = useMutation(TOGGLE_TEMPLATE_FAVORITE, {
    onCompleted: () => {
      refetch();
    },
  });

  // Increment use count
  const [incrementUseMutation] = useMutation(INCREMENT_TEMPLATE_USE);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const templates: MealTemplate[] =
    data?.meal_templatesCollection?.edges?.map((edge: any) => edge.node) || [];

  const createTemplate = useCallback(
    async (name: string, description: string, foods: TemplateFoodItem[], mealType?: string) => {
      if (!user) return;

      const totals = foods.reduce(
        (acc, food) => ({
          calories: acc.calories + food.calories * food.quantity,
          protein: acc.protein + food.protein * food.quantity,
          carbs: acc.carbs + food.carbs * food.quantity,
          fat: acc.fat + food.fat * food.quantity,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      await createTemplateMutation({
        variables: {
          userId: user.id,
          name,
          description,
          foods: JSON.stringify(foods),
          totalCalories: totals.calories,
          totalProtein: totals.protein,
          totalCarbs: totals.carbs,
          totalFat: totals.fat,
          mealType,
        },
      });
    },
    [user, createTemplateMutation]
  );

  const deleteTemplate = useCallback(
    async (templateId: string) => {
      await deleteTemplateMutation({
        variables: { id: templateId },
      });
    },
    [deleteTemplateMutation]
  );

  const toggleFavorite = useCallback(
    async (templateId: string, currentFavorite: boolean) => {
      await toggleFavoriteMutation({
        variables: {
          id: templateId,
          isFavorite: !currentFavorite,
        },
      });
      toast.success(currentFavorite ? "Removed from favorites" : "Added to favorites ⭐");
    },
    [toggleFavoriteMutation]
  );

  const logTemplate = useCallback(
    async (template: MealTemplate) => {
      // Increment use count
      await incrementUseMutation({
        variables: {
          id: template.id,
          currentCount: template.use_count + 1,
        },
      });

      // Here you would also create nutrition_log entries for each food
      // This integrates with your existing food logging system
      toast.success(`Logged "${template.name}" successfully! 📝`);

      return template;
    },
    [incrementUseMutation]
  );

  const getFavoriteTemplates = useCallback(() => {
    return templates.filter((t) => t.is_favorite);
  }, [templates]);

  const getTemplatesByMealType = useCallback(
    (mealType: string) => {
      return templates.filter((t) => t.meal_type === mealType);
    },
    [templates]
  );

  return {
    // Data
    templates,
    selectedTemplate,
    favoriteTemplates: getFavoriteTemplates(),

    // Loading states
    loading,
    isCreating,
    isDeleting,

    // Modal state
    isCreateModalOpen,
    setIsCreateModalOpen,
    setSelectedTemplate,

    // Actions
    createTemplate,
    deleteTemplate,
    toggleFavorite,
    logTemplate,
    getTemplatesByMealType,

    // Refetch
    refetch,
  };
}
