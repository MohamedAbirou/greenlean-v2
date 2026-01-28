/**
 * Edge Function Response Converters
 * Standardizes all logging method responses into MealItem format
 */

import type { MealItem } from "@/shared/types/food.types";

/**
 * Convert Voice Edge Function response to MealItem
 * Voice function returns: { foods: Array<{name, calories, protein, carbs, fats, quantity, unit, ...}> }
 */
export function convertVoiceFoodToMealItem(voiceFood: any): MealItem {
  const qty = voiceFood.quantity || 1;
  const unit = voiceFood.unit || voiceFood.serving_size || "serving";

  // Voice returns TOTAL macros for the quantity
  // We need to calculate base values (per 1 unit)
  const baseCal = voiceFood.calories / qty;
  const basePro = voiceFood.protein / qty;
  const baseCarb = voiceFood.carbs / qty;
  const baseFat = voiceFood.fats / qty;

  return {
    food_name: voiceFood.name,
    brand_name: voiceFood.brand,
    serving_qty: qty,
    serving_unit: unit,
    calories: Math.round(voiceFood.calories),
    protein: Math.round(voiceFood.protein * 10) / 10,
    carbs: Math.round(voiceFood.carbs * 10) / 10,
    fats: Math.round(voiceFood.fats * 10) / 10,
    fiber: voiceFood.fiber ? Math.round(voiceFood.fiber * 10) / 10 : undefined,
    base_calories: Math.round(baseCal),
    base_protein: Math.round(basePro * 10) / 10,
    base_carbs: Math.round(baseCarb * 10) / 10,
    base_fats: Math.round(baseFat * 10) / 10,
    base_fiber: voiceFood.fiber ? Math.round((voiceFood.fiber / qty) * 10) / 10 : undefined,
    base_serving_qty: 1,
    base_serving_unit: unit,
    source: "voice",
    confidence: voiceFood.confidence || 0.85,
  };
}

/**
 * Convert Barcode Edge Function response to MealItem
 * Barcode function returns: { food: {id, name, brand, barcode, calories, protein, carbs, fats, serving_size, ...} }
 * Nutrition is per serving or per 100g
 */
export function convertBarcodeFoodToMealItem(barcodeFood: any): MealItem {
  // Barcode nutrition is already per serving
  const servingSize = barcodeFood.serving_size || "100g";

  // Parse serving size to get qty and unit
  let baseQty = 1;
  let baseUnit = servingSize;
  const match = servingSize.match(/^(\d+(?:\.\d+)?)\s*(\w+)$/);
  if (match) {
    baseQty = parseFloat(match[1]);
    baseUnit = match[2];
  }

  return {
    food_id: barcodeFood.id || barcodeFood.barcode,
    food_name: barcodeFood.name,
    brand_name: barcodeFood.brand,
    serving_qty: 1,
    serving_unit: servingSize,
    calories: Math.round(barcodeFood.calories),
    protein: Math.round(barcodeFood.protein * 10) / 10,
    carbs: Math.round(barcodeFood.carbs * 10) / 10,
    fats: Math.round(barcodeFood.fats * 10) / 10,
    fiber: barcodeFood.fiber ? Math.round(barcodeFood.fiber * 10) / 10 : undefined,
    base_calories: Math.round(barcodeFood.calories),
    base_protein: Math.round(barcodeFood.protein * 10) / 10,
    base_carbs: Math.round(barcodeFood.carbs * 10) / 10,
    base_fats: Math.round(barcodeFood.fats * 10) / 10,
    base_fiber: barcodeFood.fiber ? Math.round(barcodeFood.fiber * 10) / 10 : undefined,
    base_serving_qty: baseQty,
    base_serving_unit: baseUnit,
    source: "barcode",
  };
}

/**
 * Convert Photo Analysis Edge Function response to MealItem
 * Photo function returns: { items: Array<{food_name, calories, protein, carbs, fats, serving_qty, serving_unit, confidence, ...}> }
 */
export function convertPhotoFoodToMealItem(photoFood: any): MealItem {
  const qty = photoFood.serving_qty || photoFood.quantity || 1;
  const unit = photoFood.serving_unit || photoFood.serving_size || "serving";

  // Photo returns macros for the detected quantity
  // Calculate base per 1 unit
  const baseCal = photoFood.calories / qty;
  const basePro = photoFood.protein / qty;
  const baseCarb = photoFood.carbs / qty;
  const baseFat = photoFood.fats / qty;

  return {
    food_name: photoFood.food_name || photoFood.name,
    brand_name: photoFood.brand_name || photoFood.brand,
    serving_qty: qty,
    serving_unit: unit,
    calories: Math.round(photoFood.calories),
    protein: Math.round(photoFood.protein * 10) / 10,
    carbs: Math.round(photoFood.carbs * 10) / 10,
    fats: Math.round(photoFood.fats * 10) / 10,
    fiber: photoFood.fiber ? Math.round(photoFood.fiber * 10) / 10 : undefined,
    base_calories: Math.round(baseCal),
    base_protein: Math.round(basePro * 10) / 10,
    base_carbs: Math.round(baseCarb * 10) / 10,
    base_fats: Math.round(baseFat * 10) / 10,
    base_fiber: photoFood.fiber ? Math.round((photoFood.fiber / qty) * 10) / 10 : undefined,
    base_serving_qty: 1,
    base_serving_unit: unit,
    source: "photo",
    confidence: photoFood.confidence || 0.75,
    portion_estimate: photoFood.portion_estimate,
  };
}

/**
 * Convert AI Meal Plan food to MealItem
 * AI Plan foods: {name, calories, protein, carbs, fats, portion, grams}
 * Macros are for the specified portion
 */
export function convertAIPlanFoodToMealItem(
  aiFood: any,
  mealPlanId?: string,
  mealName?: string
): MealItem {
  // AI plan provides portion (e.g., "4 large") and grams
  const portion = aiFood.portion || "1 serving";
  const grams = aiFood.grams || 100;

  // Parse portion to get quantity
  let qty = 1;
  const qtyMatch = portion.match(/^(\d+(?:\.\d+)?)/);
  if (qtyMatch) {
    qty = parseFloat(qtyMatch[1]);
  }

  // Calculate base values per 1 portion unit
  const baseCal = aiFood.calories / qty;
  const basePro = aiFood.protein / qty;
  const baseCarb = aiFood.carbs / qty;
  const baseFat = aiFood.fats / qty;
  const baseFiber = aiFood.fiber / qty;

  return {
    food_name: aiFood.name,
    brand_name: "AI Meal Plan",
    serving_qty: qty,
    serving_unit: portion,
    calories: Math.round(aiFood.calories),
    protein: Math.round(aiFood.protein * 10) / 10,
    carbs: Math.round(aiFood.carbs * 10) / 10,
    fats: Math.round(aiFood.fats * 10) / 10,
    fiber: aiFood.fiber ? Math.round(aiFood.fiber * 10) / 10 : undefined,
    base_calories: Math.round(baseCal),
    base_protein: Math.round(basePro * 10) / 10,
    base_carbs: Math.round(baseCarb * 10) / 10,
    base_fats: Math.round(baseFat * 10) / 10,
    base_fiber: aiFood.fiber ? Math.round(baseFiber * 10) / 10 : undefined,
    base_serving_qty: 1,
    base_serving_unit: portion,
    source: "ai-plan",
    from_ai_plan: true,
    ai_meal_plan_id: mealPlanId,
    plan_meal_name: mealName,
    portion_estimate: `${grams}g (${portion})`,
  };
}

/**
 * Convert Manual Input to MealItem
 * User provides: food_name, calories, protein, carbs, fats, serving_qty, serving_unit
 */
export function convertManualInputToMealItem(manualData: {
  food_name: string;
  brand_name?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  serving_qty: number;
  serving_unit: string;
}): MealItem {
  const qty = manualData.serving_qty || 1;

  return {
    food_name: manualData.food_name,
    brand_name: manualData.brand_name,

    serving_qty: qty,
    serving_unit: manualData.serving_unit || "serving",

    // Display values (rounded)
    calories: Math.round(manualData.calories),
    protein: Math.round(manualData.protein * 10) / 10,
    carbs: Math.round(manualData.carbs * 10) / 10,
    fats: Math.round(manualData.fats * 10) / 10,

    fiber: manualData.fiber,
    sugar: manualData.sugar,
    sodium: manualData.sodium,

    // 🔥 BASE VALUES — NO ROUNDING
    base_calories: manualData.calories / qty,
    base_protein: manualData.protein / qty,
    base_carbs: manualData.carbs / qty,
    base_fats: manualData.fats / qty,
    base_fiber: manualData.fiber ? manualData.fiber / qty : undefined,
    base_sugar: manualData.sugar ? manualData.sugar / qty : undefined,
    base_sodium: manualData.sodium ? manualData.sodium / qty : undefined,

    base_serving_qty: 1,
    base_serving_unit: manualData.serving_unit || "serving",

    source: "manual",
  };
}
