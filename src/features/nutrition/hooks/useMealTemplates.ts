/**
 * useMealTemplates Hook - PRODUCTION READY
 * Complete meal template management with proper error handling
 */

import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import type { MealItem, MealTemplate } from "@/shared/types/food.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export function useMealTemplates() {
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [mealTemplates, setMealTemplates] = useState<MealTemplate[]>();
  const [loading, setLoading] = useState(true);

  // Fetch user's meal templates
  const fetchMealTemplates = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("meal_templates")
        .select(
          `
        *,
        template_items:template_items!template_items_template_id_fkey (
          id,
          food_id,
          food_name,
          brand_name,
          serving_qty,
          serving_unit,
          calories,
          protein,
          carbs,
          fats,
          fiber,
          sugar,
          sodium,
          notes,
          created_at
        )
      `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setMealTemplates(data ?? []);
    } catch (err) {
      console.error("Error fetching meal templates:", err);
      setMealTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchMealTemplates();
  }, [fetchMealTemplates]);

  const refetch = fetchMealTemplates;

  // Parse and memoize templates
  const templates: MealTemplate[] = useMemo(() => {
    if (!mealTemplates) return [];

    return mealTemplates;
  }, [mealTemplates]);

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
        toast.error("Failed to create template", {
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
      try {
        const { error } = await supabase
          .from("meal_templates")
          .update({ is_favorite: !currentFavorite })
          .eq("id", templateId)
          .eq("user_id", user!.id);

        if (error) throw error;

        toast.success(currentFavorite ? "Removed from favorites" : "Added to favorites ⭐");

        refetch();
        return true;
      } catch (err) {
        console.error("Toggle favorite failed:", err);
        toast.error("Failed to update favorite");
        return false;
      }
    },
    [refetch, user]
  );

  /**
   * Use a template (logs it and increments use count)
   */
  const applyTemplate = useCallback(
    async (template: MealTemplate) => {
      try {
        const { error } = await supabase
          .from("meal_templates")
          .update({
            use_count: (template.use_count ?? 0) + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", template.id)
          .eq("user_id", user!.id);

        if (error) throw error;

        await refetch();
        return template;
      } catch (err) {
        console.error("Error applying template:", err);
        return null;
      }
    },
    [refetch, user]
  );

  return {
    templates,
    favoriteTemplates,
    mostUsedTemplates,
    recentlyUsedTemplates,

    loading,
    isCreating,
    isDeleting,

    createTemplate,
    deleteTemplate,
    toggleFavorite,
    applyTemplate,
    getTemplatesByMealType,

    refetch,
  };
}
