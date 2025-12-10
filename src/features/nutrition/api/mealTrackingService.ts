/**
 * Enhanced Meal Tracking Service
 * Comprehensive meal logging with AI plan adherence tracking
 */

import { supabase } from '@/lib/supabase';

export interface MealItem {
  food_id?: string;
  food_name: string;
  brand_name?: string;
  serving_qty: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  source?: 'manual' | 'barcode' | 'recipe' | 'template' | 'ai_plan' | 'voice';
  from_ai_plan?: boolean;
  ai_meal_plan_id?: string;
  plan_meal_name?: string;
  notes?: string;
}

export interface DailyNutritionLog {
  id?: string;
  user_id: string;
  log_date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items?: any[];
  total_calories?: number;
  total_protein?: number;
  total_carbs?: number;
  total_fats?: number;
  notes?: string;
}

export interface MealPlanAdherence {
  user_id: string;
  meal_plan_id: string;
  tracking_date: string;
  planned_meals?: any[];
  logged_meals?: any[];
  meals_followed?: number;
  meals_total?: number;
  adherence_percentage?: number;
  planned_calories?: number;
  actual_calories?: number;
  calories_variance?: number;
  planned_protein?: number;
  actual_protein?: number;
  protein_variance?: number;
  skip_reason?: string;
  notes?: string;
}

export interface Recipe {
  name: string;
  description?: string;
  cuisine_type?: string;
  meal_type?: string[];
  ingredients: Array<{
    food_id?: string;
    name: string;
    qty: number;
    unit: string;
  }>;
  instructions: string[];
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings: number;
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fats_per_serving?: number;
  dietary_tags?: string[];
  allergen_tags?: string[];
  image_url?: string;
  visibility?: 'private' | 'public' | 'friends';
}

class MealTrackingService {
  /**
   * Log a complete meal with multiple food items
   */
  async logMeal(
    userId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    items: MealItem[],
    logDate: string = new Date().toISOString().split('T')[0],
    notes?: string
  ): Promise<{ success: boolean; nutritionLogId?: string; error?: any }> {
    try {
      // 1. Create or get the daily nutrition log
      const { data: existingLog, error: fetchError } = await supabase
        .from('daily_nutrition_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('log_date', logDate)
        .eq('meal_type', mealType)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let nutritionLogId: string;

      if (existingLog) {
        // Update existing log
        nutritionLogId = existingLog.id;
      } else {
        // Create new log
        const { data: newLog, error: insertError } = await supabase
          .from('daily_nutrition_logs')
          .insert({
            user_id: userId,
            log_date: logDate,
            meal_type: mealType,
            notes: notes,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        nutritionLogId = newLog.id;
      }

      // 2. Insert all meal items
      const mealItemsToInsert = items.map(item => ({
        user_id: userId,
        nutrition_log_id: nutritionLogId,
        food_id: item.food_id,
        food_name: item.food_name,
        brand_name: item.brand_name,
        serving_qty: item.serving_qty,
        serving_unit: item.serving_unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        fiber: item.fiber,
        sugar: item.sugar,
        sodium: item.sodium,
        source: item.source || 'manual',
        from_ai_plan: item.from_ai_plan || false,
        ai_meal_plan_id: item.ai_meal_plan_id,
        plan_meal_name: item.plan_meal_name,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('meal_items')
        .insert(mealItemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Update nutrition streak
      await supabase.rpc('update_user_streak', {
        p_user_id: userId,
        p_streak_type: 'nutrition_logging',
        p_log_date: logDate,
      });

      // 4. Check and update meal plan adherence if from AI plan
      if (items.some(item => item.from_ai_plan && item.ai_meal_plan_id)) {
        await this.updateMealPlanAdherence(
          userId,
          items[0].ai_meal_plan_id!,
          logDate
        );
      }

      return { success: true, nutritionLogId };
    } catch (error) {
      console.error('Error logging meal:', error);
      return { success: false, error };
    }
  }

  /**
   * Get daily nutrition logs for a user
   */
  async getDailyLogs(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<DailyNutritionLog[]> {
    const { data, error } = await supabase
      .from('daily_nutrition_logs')
      .select(`
        *,
        meal_items (*)
      `)
      .eq('user_id', userId)
      .gte('log_date', startDate)
      .lte('log_date', endDate)
      .order('log_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching daily logs:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get meal items for a specific log
   */
  async getMealItems(nutritionLogId: string): Promise<MealItem[]> {
    const { data, error } = await supabase
      .from('meal_items')
      .select('*')
      .eq('nutrition_log_id', nutritionLogId)
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Error fetching meal items:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Delete a meal item
   */
  async deleteMealItem(itemId: string): Promise<boolean> {
    const { error } = await supabase
      .from('meal_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error deleting meal item:', error);
      return false;
    }

    return true;
  }

  /**
   * Update meal plan adherence
   */
  async updateMealPlanAdherence(
    userId: string,
    mealPlanId: string,
    trackingDate: string
  ): Promise<void> {
    try {
      await supabase.rpc('calculate_meal_plan_adherence', {
        p_user_id: userId,
        p_meal_plan_id: mealPlanId,
        p_date: trackingDate,
      });
    } catch (error) {
      console.error('Error updating meal plan adherence:', error);
    }
  }

  /**
   * Get meal plan adherence for a period
   */
  async getMealPlanAdherence(
    userId: string,
    mealPlanId: string,
    startDate: string,
    endDate: string
  ): Promise<MealPlanAdherence[]> {
    const { data, error } = await supabase
      .from('meal_plan_adherence')
      .select('*')
      .eq('user_id', userId)
      .eq('meal_plan_id', mealPlanId)
      .gte('tracking_date', startDate)
      .lte('tracking_date', endDate)
      .order('tracking_date', { ascending: false });

    if (error) {
      console.error('Error fetching meal plan adherence:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Save a recipe
   */
  async saveRecipe(userId: string, recipe: Recipe): Promise<{ success: boolean; recipeId?: string; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('recipe_database')
        .insert({
          created_by: userId,
          name: recipe.name,
          description: recipe.description,
          cuisine_type: recipe.cuisine_type,
          meal_type: recipe.meal_type,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prep_time_minutes: recipe.prep_time_minutes,
          cook_time_minutes: recipe.cook_time_minutes,
          servings: recipe.servings,
          calories_per_serving: recipe.calories_per_serving,
          protein_per_serving: recipe.protein_per_serving,
          carbs_per_serving: recipe.carbs_per_serving,
          fats_per_serving: recipe.fats_per_serving,
          dietary_tags: recipe.dietary_tags,
          allergen_tags: recipe.allergen_tags,
          image_url: recipe.image_url,
          visibility: recipe.visibility || 'private',
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, recipeId: data.id };
    } catch (error) {
      console.error('Error saving recipe:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's recipes
   */
  async getUserRecipes(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('recipe_database')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching recipes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get public recipes
   */
  async getPublicRecipes(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      cuisine_type?: string;
      meal_type?: string;
      dietary_tags?: string[];
    }
  ): Promise<any[]> {
    let query = supabase
      .from('recipe_database')
      .select('*, created_by:profiles(full_name, avatar_url)')
      .eq('visibility', 'public')
      .eq('verified', true);

    if (filters?.cuisine_type) {
      query = query.eq('cuisine_type', filters.cuisine_type);
    }

    if (filters?.meal_type) {
      query = query.contains('meal_type', [filters.meal_type]);
    }

    if (filters?.dietary_tags && filters.dietary_tags.length > 0) {
      query = query.overlaps('dietary_tags', filters.dietary_tags);
    }

    const { data, error } = await query
      .order('uses_count', { ascending: false })
      .order('likes_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching public recipes:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Like/unlike a recipe
   */
  async toggleRecipeLike(userId: string, recipeId: string): Promise<boolean> {
    // Check if already liked
    const { data: existing } = await supabase
      .from('recipe_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('recipe_likes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      return !error;
    } else {
      // Like
      const { error } = await supabase
        .from('recipe_likes')
        .insert({ user_id: userId, recipe_id: recipeId });

      return !error;
    }
  }

  /**
   * Log recipe usage
   */
  async logRecipeUsage(
    userId: string,
    recipeId: string,
    servings: number = 1
  ): Promise<void> {
    await supabase.from('recipe_usage').insert({
      user_id: userId,
      recipe_id: recipeId,
      servings_logged: servings,
      logged_date: new Date().toISOString().split('T')[0],
    });
  }

  /**
   * Add/remove favorite food
   */
  async toggleFavoriteFood(
    userId: string,
    foodId: string,
    preferredServingQty?: number,
    preferredServingUnit?: string
  ): Promise<boolean> {
    // Check if already favorite
    const { data: existing } = await supabase
      .from('user_favorite_foods')
      .select('*')
      .eq('user_id', userId)
      .eq('food_id', foodId)
      .maybeSingle();

    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorite_foods')
        .delete()
        .eq('user_id', userId)
        .eq('food_id', foodId);

      return !error;
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorite_foods')
        .insert({
          user_id: userId,
          food_id: foodId,
          preferred_serving_qty: preferredServingQty,
          preferred_serving_unit: preferredServingUnit,
        });

      return !error;
    }
  }

  /**
   * Get user's favorite foods
   */
  async getFavoriteFoods(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_favorite_foods')
      .select('*, food_database(*)')
      .eq('user_id', userId)
      .order('times_logged', { ascending: false });

    if (error) {
      console.error('Error fetching favorite foods:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get nutrition trends for a user
   */
  async getNutritionTrends(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('nutrition_trends')
      .select('*')
      .eq('user_id', userId)
      .gte('trend_date', startDate)
      .lte('trend_date', endDate)
      .order('trend_date', { ascending: false });

    if (error) {
      console.error('Error fetching nutrition trends:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get current nutrition goals
   */
  async getCurrentNutritionGoals(userId: string): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_current_nutrition_goals', { p_user_id: userId })
      .single();

    if (error) {
      console.error('Error fetching nutrition goals:', error);
      return null;
    }

    return data;
  }
}

export const mealTrackingService = new MealTrackingService();
