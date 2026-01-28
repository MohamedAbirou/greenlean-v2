import type { MealItem } from "@/shared/types/food.types";

/**
 * Helper to recalculate macros when quantity changes
 */
export function recalculateMacros(item: MealItem, newQty: number): MealItem {
  const multiplier = newQty / item.base_serving_qty;

  return {
    ...item,
    serving_qty: newQty,
    calories: Math.round(item.base_calories * multiplier),
    protein: Math.round(item.base_protein * multiplier * 10) / 10,
    carbs: Math.round(item.base_carbs * multiplier * 10) / 10,
    fats: Math.round(item.base_fats * multiplier * 10) / 10,
    fiber: item.base_fiber ? Math.round(item.base_fiber * multiplier * 10) / 10 : undefined,
    sugar: item.base_sugar ? Math.round(item.base_sugar * multiplier * 10) / 10 : undefined,
    sodium: item.base_sodium ? Math.round(item.base_sodium * multiplier * 10) / 10 : undefined,
  };
}
// 0.032