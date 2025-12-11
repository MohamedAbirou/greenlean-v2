/**
 * Nutrition API Layer
 * Complete CRUD operations for all nutrition-related features
 */

import { supabase } from '@/lib/supabase/client';
import type {
  NutritionLog,
  MealItem,
  MealTemplate,
  VoiceMealLog,
  MealPhotoLog,
  AIMealPlan,
  USDAFoodSearchResult,
  DailyWaterIntake,
  WaterIntakeLog,
} from '../types';

// ========== NUTRITION LOGS ==========

export async function getDailyNutritionLog(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as NutritionLog[];
}

export async function getNutritionLogsByDateRange(
  userId: string,
  startDate: string,
  endDate: string
) {
  const { data, error } = await supabase
    .from('daily_nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: false });

  if (error) throw error;
  return data as NutritionLog[];
}

export async function createNutritionLog(log: Partial<NutritionLog>) {
  const { data, error } = await supabase
    .from('daily_nutrition_logs')
    .insert([log])
    .select()
    .single();

  if (error) throw error;
  return data as NutritionLog;
}

export async function updateNutritionLog(id: string, updates: Partial<NutritionLog>) {
  const { data, error } = await supabase
    .from('daily_nutrition_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as NutritionLog;
}

export async function deleteNutritionLog(id: string) {
  const { error } = await supabase
    .from('daily_nutrition_logs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========== MEAL ITEMS ==========

export async function getMealItemsByLogId(nutritionLogId: string) {
  const { data, error } = await supabase
    .from('meal_items')
    .select('*')
    .eq('nutrition_log_id', nutritionLogId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as MealItem[];
}

export async function getMealItemsByDate(userId: string, date: string) {
  // First get all nutrition logs for the date
  const logs = await getDailyNutritionLog(userId, date);

  if (logs.length === 0) return [];

  const logIds = logs.map(log => log.id);

  const { data, error } = await supabase
    .from('meal_items')
    .select('*')
    .in('nutrition_log_id', logIds)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as MealItem[];
}

export async function createMealItem(item: Partial<MealItem>) {
  const { data, error } = await supabase
    .from('meal_items')
    .insert([item])
    .select()
    .single();

  if (error) throw error;
  return data as MealItem;
}

export async function createMealItems(items: Partial<MealItem>[]) {
  const { data, error } = await supabase
    .from('meal_items')
    .insert(items)
    .select();

  if (error) throw error;
  return data as MealItem[];
}

export async function updateMealItem(id: string, updates: Partial<MealItem>) {
  const { data, error } = await supabase
    .from('meal_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MealItem;
}

export async function deleteMealItem(id: string) {
  const { error } = await supabase
    .from('meal_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========== MEAL TEMPLATES ==========

export async function getMealTemplates(userId: string) {
  const { data, error } = await supabase
    .from('meal_templates')
    .select('*')
    .eq('user_id', userId)
    .order('use_count', { ascending: false });

  if (error) throw error;
  return data as MealTemplate[];
}

export async function getMealTemplatesByType(userId: string, mealType: string) {
  const { data, error } = await supabase
    .from('meal_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('meal_type', mealType)
    .order('use_count', { ascending: false });

  if (error) throw error;
  return data as MealTemplate[];
}

export async function createMealTemplate(template: Partial<MealTemplate>) {
  const { data, error } = await supabase
    .from('meal_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data as MealTemplate;
}

export async function updateMealTemplate(id: string, updates: Partial<MealTemplate>) {
  const { data, error } = await supabase
    .from('meal_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MealTemplate;
}

export async function deleteMealTemplate(id: string) {
  const { error } = await supabase
    .from('meal_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function incrementTemplateUseCount(id: string) {
  const { data, error } = await supabase.rpc('increment_template_use_count', {
    template_id: id,
  });

  if (error) {
    // Fallback if function doesn't exist
    const template = await supabase
      .from('meal_templates')
      .select('use_count')
      .eq('id', id)
      .single();

    if (template.data) {
      await supabase
        .from('meal_templates')
        .update({ use_count: template.data.use_count + 1 })
        .eq('id', id);
    }
  }
}

// ========== VOICE LOGGING ==========

export async function createVoiceMealLog(voiceLog: Partial<VoiceMealLog>) {
  const { data, error } = await supabase
    .from('voice_meal_logs')
    .insert([voiceLog])
    .select()
    .single();

  if (error) throw error;
  return data as VoiceMealLog;
}

export async function updateVoiceMealLog(id: string, updates: Partial<VoiceMealLog>) {
  const { data, error } = await supabase
    .from('voice_meal_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as VoiceMealLog;
}

export async function getVoiceMealLogs(userId: string) {
  const { data, error } = await supabase
    .from('voice_meal_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as VoiceMealLog[];
}

// ========== PHOTO LOGGING ==========

export async function createMealPhotoLog(photoLog: Partial<MealPhotoLog>) {
  const { data, error } = await supabase
    .from('meal_photo_logs')
    .insert([photoLog])
    .select()
    .single();

  if (error) throw error;
  return data as MealPhotoLog;
}

export async function updateMealPhotoLog(id: string, updates: Partial<MealPhotoLog>) {
  const { data, error } = await supabase
    .from('meal_photo_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MealPhotoLog;
}

export async function getMealPhotoLogs(userId: string) {
  const { data, error } = await supabase
    .from('meal_photo_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as MealPhotoLog[];
}

// ========== AI MEAL PLAN ==========

export async function getActiveMealPlan(userId: string) {
  const { data, error } = await supabase
    .from('ai_meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as AIMealPlan | null;
}

export async function getMealPlanHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ai_meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AIMealPlan[];
}

// ========== WATER TRACKING ==========

export async function getDailyWaterIntake(userId: string, date: string) {
  const { data, error } = await supabase
    .from('daily_water_intake')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as DailyWaterIntake | null;
}

export async function getWaterIntakeLogs(userId: string, date: string) {
  const { data, error } = await supabase
    .from('water_intake_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', date)
    .order('logged_at', { ascending: true });

  if (error) throw error;
  return data as WaterIntakeLog[];
}

export async function addWaterIntake(log: Partial<WaterIntakeLog>) {
  const { data, error } = await supabase
    .from('water_intake_logs')
    .insert([log])
    .select()
    .single();

  if (error) throw error;
  return data as WaterIntakeLog;
}

export async function deleteWaterIntake(id: string) {
  const { error } = await supabase
    .from('water_intake_logs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ========== USDA FOOD API ==========

const USDA_API_KEY = process.env.NEXT_PUBLIC_USDA_API_KEY || 'DEMO_KEY';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export async function searchUSDAFoods(
  query: string,
  pageNumber = 1,
  pageSize = 25
): Promise<{ foods: USDAFoodSearchResult[]; totalHits: number }> {
  const url = `${USDA_BASE_URL}/foods/search?query=${encodeURIComponent(
    query
  )}&pageSize=${pageSize}&pageNumber=${pageNumber}&api_key=${USDA_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to search USDA foods');
  }

  const data = await response.json();

  return {
    foods: data.foods || [],
    totalHits: data.totalHits || 0,
  };
}

export async function getFoodByFdcId(fdcId: number): Promise<USDAFoodSearchResult> {
  const url = `${USDA_BASE_URL}/food/${fdcId}?api_key=${USDA_API_KEY}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to get food details');
  }

  return await response.json();
}

// ========== BARCODE LOOKUP ==========

export async function searchFoodByBarcode(barcode: string) {
  try {
    // Try USDA first with UPC search
    const foods = await searchUSDAFoods(barcode, 1, 5);

    if (foods.foods.length > 0) {
      return foods.foods[0];
    }

    // Fallback to Open Food Facts API
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status === 1 && data.product) {
      // Convert Open Food Facts format to our format
      return convertOpenFoodFactsToUSDA(data.product);
    }

    return null;
  } catch (error) {
    console.error('Barcode lookup error:', error);
    return null;
  }
}

function convertOpenFoodFactsToUSDA(product: any): USDAFoodSearchResult {
  const nutrients = product.nutriments || {};

  return {
    fdcId: 0,
    description: product.product_name || 'Unknown',
    brandName: product.brands || undefined,
    dataType: 'Branded',
    foodNutrients: [
      {
        nutrientId: 1008,
        nutrientName: 'Energy',
        nutrientNumber: '208',
        unitName: 'kcal',
        value: nutrients['energy-kcal_100g'] || nutrients.energy_100g || 0,
      },
      {
        nutrientId: 1003,
        nutrientName: 'Protein',
        nutrientNumber: '203',
        unitName: 'g',
        value: nutrients.proteins_100g || 0,
      },
      {
        nutrientId: 1005,
        nutrientName: 'Carbohydrate, by difference',
        nutrientNumber: '205',
        unitName: 'g',
        value: nutrients.carbohydrates_100g || 0,
      },
      {
        nutrientId: 1004,
        nutrientName: 'Total lipid (fat)',
        nutrientNumber: '204',
        unitName: 'g',
        value: nutrients.fat_100g || 0,
      },
      {
        nutrientId: 1079,
        nutrientName: 'Fiber, total dietary',
        nutrientNumber: '291',
        unitName: 'g',
        value: nutrients.fiber_100g || 0,
      },
    ],
    servingSize: product.serving_quantity || 100,
    servingSizeUnit: product.serving_unit || 'g',
  };
}

// ========== RECENT FOODS ==========

export async function getRecentFoods(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('meal_items')
    .select('food_name, brand_name, serving_size, servings, calories, protein, carbs, fats, fiber')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getFrequentFoods(userId: string, limit = 20) {
  const { data, error } = await supabase
    .from('meal_items')
    .select('food_name, brand_name, serving_size, servings, calories, protein, carbs, fats, fiber, COUNT(*) as frequency')
    .eq('user_id', userId)
    .order('frequency', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ========== USER MACRO TARGETS ==========

export async function getCurrentMacroTargets(userId: string) {
  const { data, error } = await supabase
    .from('user_macro_targets')
    .select('*')
    .eq('user_id', userId)
    .lte('effective_date', new Date().toISOString().split('T')[0])
    .or(`end_date.is.null,end_date.gte.${new Date().toISOString().split('T')[0]}`)
    .order('effective_date', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function createMacroTargets(targets: {
  user_id: string;
  daily_calories: number;
  daily_protein_g: number;
  daily_carbs_g: number;
  daily_fats_g: number;
  daily_fiber_g?: number;
  daily_water_ml?: number;
  effective_date: string;
}) {
  const { data, error } = await supabase
    .from('user_macro_targets')
    .insert([targets])
    .select()
    .single();

  if (error) throw error;
  return data;
}
