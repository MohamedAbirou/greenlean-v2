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
}

export const mealTrackingService = new MealTrackingService();
