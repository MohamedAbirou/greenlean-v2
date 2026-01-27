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
  foodCategory?: string;
  score?: number;
}

export class USDAService {
  /**
   * Extract nutrient value from food
   */
  private static getNutrient(food: USDAFood, nutrientName: string): number {
    const nutrient = food.foodNutrients?.find((n) => n.nutrientName === nutrientName);
    return nutrient?.value || 0;
  }

  /**
   * Convert USDA food to FoodItem format
   */
  static toFoodItem(food: USDAFood): MealItem {
    const calories = this.getNutrient(food, "Energy");
    const protein = this.getNutrient(food, "Protein");
    const carbs = this.getNutrient(food, "Carbohydrate, by difference");
    const fats = this.getNutrient(food, "Total lipid (fat)");

    let servingSize = "100g";
    if (food.householdServingFullText) {
      servingSize = food.householdServingFullText;
    } else if (food.servingSize && food.servingSizeUnit) {
      servingSize = `${food.servingSize} ${food.servingSizeUnit}`;
    }

    const isPer100g = servingSize === "100g";

    return {
      food_id: food.fdcId.toString(),
      food_name: food.description,
      brand_name: food.brandOwner || food.brandName,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      serving_unit: servingSize,
      serving_qty: 1,
      base_calories: isPer100g ? calories / 100 : calories,
      base_protein: isPer100g ? protein / 100 : protein,
      base_carbs: isPer100g ? carbs / 100 : carbs,
      base_fats: isPer100g ? fats / 100 : fats,
      base_serving_unit: isPer100g ? "g" : servingSize,
      source: "search",
    };
  }

  /**
   * Check if API is configured
   */
  static isConfigured(): boolean {
    return USDA_API_KEY !== "DEMO_KEY";
  }

  /**
   * Get API configuration status
   */
  static getConfigStatus(): string {
    if (USDA_API_KEY === "DEMO_KEY") {
      return "Using USDA DEMO_KEY (limited to 1000 requests/hour). Add VITE_USDA_API_KEY to .env for production use.";
    }
    return "USDA FoodData Central API configured";
  }
}
