/**
 * USDA FoodData Central API Service
 * Free alternative food database with comprehensive nutrition data
 * API Docs: https://fdc.nal.usda.gov/api-guide.html
 */

import type { MealItem } from "@/shared/types/food.types";

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || "DEMO_KEY";

export interface USDAFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandOwner?: string;
  brandName?: string;
  gtinUpc?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodNutrients?: Array<{
    nutrientId: number;
    nutrientName: string;
    nutrientNumber: string;
    unitName: string;
    value: number;
  }>;
  labelNutrients?: {
    calories?: { value: number };
    protein?: { value: number };
    carbohydrates?: { value: number };
    fat?: { value: number };
    fiber?: { value: number };
    sugars?: { value: number };
    sodium?: { value: number };
  };
  foodCategory?: string;
  score?: number;
}

export class USDAService {
  /**
   * Extract nutrient value from foodNutrients array
   */
  private static getNutrient(food: USDAFood, nutrientName: string): number {
    const nutrient = food.foodNutrients?.find((n) =>
      n.nutrientName.toLowerCase().includes(nutrientName.toLowerCase())
    );
    return nutrient?.value || 0;
  }

  /**
   * Convert USDA food to MealItem with proper base value calculation
   *
   * CRITICAL: USDA data comes in different formats:
   * 1. Branded foods: labelNutrients (per serving)
   * 2. Survey/Foundation: foodNutrients (per 100g)
   */
  static toMealItem(food: USDAFood): MealItem {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fats = 0;
    let fiber = 0;
    let sugar = 0;
    let sodium = 0;

    let baseServingQty = 1;
    let baseServingUnit = "serving";
    let servingUnit = "serving";

    // Try labelNutrients first (Branded foods - per serving)
    if (food.labelNutrients && food.labelNutrients.calories) {
      calories = food.labelNutrients.calories?.value || 0;
      protein = food.labelNutrients.protein?.value || 0;
      carbs = food.labelNutrients.carbohydrates?.value || 0;
      fats = food.labelNutrients.fat?.value || 0;
      fiber = food.labelNutrients.fiber?.value || 0;
      sugar = food.labelNutrients.sugars?.value || 0;
      sodium = food.labelNutrients.sodium?.value || 0;

      // Use serving size from food
      if (food.householdServingFullText) {
        servingUnit = food.householdServingFullText;
        baseServingUnit = food.householdServingFullText;
      } else if (food.servingSize && food.servingSizeUnit) {
        servingUnit = `${food.servingSize}${food.servingSizeUnit}`;
        baseServingUnit = food.servingSizeUnit;
        baseServingQty = food.servingSize;
      }
    }
    // Fallback to foodNutrients (Survey/Foundation - typically per 100g)
    else if (food.foodNutrients && food.foodNutrients.length > 0) {
      calories = this.getNutrient(food, "Energy");
      protein = this.getNutrient(food, "Protein");
      carbs = this.getNutrient(food, "Carbohydrate");
      fats = this.getNutrient(food, "Total lipid");
      fiber = this.getNutrient(food, "Fiber");
      sugar = this.getNutrient(food, "Sugars, total");
      sodium = this.getNutrient(food, "Sodium");

      // Usually per 100g
      baseServingQty = 100;
      baseServingUnit = "g";
      servingUnit = "100g";
    }

    // Round values
    const roundedCalories = Math.round(calories);
    const roundedProtein = Math.round(protein * 10) / 10;
    const roundedCarbs = Math.round(carbs * 10) / 10;
    const roundedFats = Math.round(fats * 10) / 10;
    const roundedFiber = Math.round(fiber * 10) / 10;
    const roundedSugar = Math.round(sugar * 10) / 10;
    const roundedSodium = Math.round(sodium * 10) / 10;

    return {
      food_id: food.fdcId.toString(),
      food_name: food.description,
      brand_name: food.brandOwner || food.brandName,

      // Default serving is 1x the base
      serving_qty: 1,
      serving_unit: servingUnit,

      // Macros for 1 serving
      calories: roundedCalories,
      protein: roundedProtein,
      carbs: roundedCarbs,
      fats: roundedFats,
      fiber: roundedFiber || undefined,
      sugar: roundedSugar || undefined,
      sodium: roundedSodium || undefined,

      // Base values (per baseServingQty of baseServingUnit)
      base_calories: roundedCalories,
      base_protein: roundedProtein,
      base_carbs: roundedCarbs,
      base_fats: roundedFats,
      base_fiber: roundedFiber || undefined,
      base_sugar: roundedSugar || undefined,
      base_sodium: roundedSodium || undefined,
      base_serving_qty: baseServingQty,
      base_serving_unit: baseServingUnit,

      source: "search",
    };
  }

  /**
   * Check if API is configured
   */
  static isConfigured(): boolean {
    const apiKey = USDA_API_KEY;
    return apiKey && apiKey !== "DEMO_KEY";
  }

  /**
   * Get API configuration status
   */
  static getConfigStatus(): string {
    const apiKey = USDA_API_KEY;
    if (!apiKey || apiKey === "DEMO_KEY") {
      return "Using USDA DEMO_KEY (limited to 1000 requests/hour). Add VITE_USDA_API_KEY to .env for production use.";
    }
    return "USDA FoodData Central API configured";
  }
}
