/**
 * Nutritionix API Service
 * Provides food search and barcode scanning functionality
 * API Docs: https://www.nutritionix.com/business/api
 */

const NUTRITIONIX_APP_ID = import.meta.env.VITE_NUTRITIONIX_APP_ID || '';
const NUTRITIONIX_API_KEY = import.meta.env.VITE_NUTRITIONIX_API_KEY || '';
const NUTRITIONIX_BASE_URL = 'https://trackapi.nutritionix.com/v2';

export interface NutritionixFood {
  food_name: string;
  brand_name?: string;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams?: number;
  nf_calories: number;
  nf_total_fat: number;
  nf_saturated_fat?: number;
  nf_cholesterol?: number;
  nf_sodium?: number;
  nf_total_carbohydrate: number;
  nf_dietary_fiber?: number;
  nf_sugars?: number;
  nf_protein: number;
  nf_potassium?: number;
  photo?: {
    thumb?: string;
    highres?: string;
  };
  tags?: {
    item?: string;
    measure?: string;
    quantity?: string;
    food_group?: number;
    tag_id?: number;
  };
}

export interface NutritionixSearchResult {
  common?: Array<{
    food_name: string;
    serving_unit: string;
    tag_name: string;
    serving_qty: number;
    common_type: number | null;
    tag_id: string;
    photo: {
      thumb: string;
    };
    locale: string;
  }>;
  branded?: Array<{
    food_name: string;
    serving_unit: string;
    nix_brand_id: string;
    brand_name_item_name: string;
    serving_qty: number;
    nf_calories: number;
    photo: {
      thumb: string;
    };
    brand_name: string;
    region: number;
    brand_type: number;
    nix_item_id: string;
    locale: string;
  }>;
}

export interface FoodItem {
  name: string;
  brand?: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image?: string;
  servingSize?: string;
}

export class NutritionixService {
  /**
   * Search for foods using instant endpoint (autocomplete)
   */
  static async searchFoods(query: string): Promise<NutritionixSearchResult> {
    if (!query || query.length < 2) {
      return { common: [], branded: [] };
    }

    try {
      const response = await fetch(
        `${NUTRITIONIX_BASE_URL}/search/instant?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching foods:', error);
      return { common: [], branded: [] };
    }
  }

  /**
   * Get detailed nutrition info for a food item (natural language)
   */
  static async getNutritionDetails(query: string): Promise<NutritionixFood | null> {
    if (!query) return null;

    try {
      const response = await fetch(`${NUTRITIONIX_BASE_URL}/natural/nutrients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-id': NUTRITIONIX_APP_ID,
          'x-app-key': NUTRITIONIX_API_KEY,
        },
        body: JSON.stringify({
          query,
        }),
      });

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.foods?.[0] || null;
    } catch (error) {
      console.error('Error getting nutrition details:', error);
      return null;
    }
  }

  /**
   * Get nutrition info by barcode (UPC)
   */
  static async searchByBarcode(upc: string): Promise<NutritionixFood | null> {
    if (!upc) return null;

    try {
      const response = await fetch(
        `${NUTRITIONIX_BASE_URL}/search/item?upc=${encodeURIComponent(upc)}`,
        {
          headers: {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_API_KEY,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Food not found
        }
        throw new Error(`Nutritionix API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.foods?.[0] || null;
    } catch (error) {
      console.error('Error searching by barcode:', error);
      return null;
    }
  }

  /**
   * Get branded food item by nix_item_id
   */
  static async getBrandedFood(nixItemId: string): Promise<NutritionixFood | null> {
    if (!nixItemId) return null;

    try {
      const response = await fetch(
        `${NUTRITIONIX_BASE_URL}/search/item?nix_item_id=${encodeURIComponent(nixItemId)}`,
        {
          headers: {
            'x-app-id': NUTRITIONIX_APP_ID,
            'x-app-key': NUTRITIONIX_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Nutritionix API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.foods?.[0] || null;
    } catch (error) {
      console.error('Error getting branded food:', error);
      return null;
    }
  }

  /**
   * Convert Nutritionix food to FoodItem format
   */
  static toFoodItem(food: NutritionixFood): FoodItem {
    return {
      name: food.food_name,
      brand: food.brand_name,
      portion: `${food.serving_qty} ${food.serving_unit}${food.serving_weight_grams ? ` (${Math.round(food.serving_weight_grams)}g)` : ''}`,
      calories: Math.round(food.nf_calories),
      protein: Math.round(food.nf_protein),
      carbs: Math.round(food.nf_total_carbohydrate),
      fats: Math.round(food.nf_total_fat),
      image: food.photo?.thumb,
      servingSize: `${food.serving_qty} ${food.serving_unit}`,
    };
  }

  /**
   * Check if API credentials are configured
   */
  static isConfigured(): boolean {
    return Boolean(NUTRITIONIX_APP_ID && NUTRITIONIX_API_KEY);
  }

  /**
   * Get API configuration status message
   */
  static getConfigStatus(): string {
    if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_API_KEY) {
      return 'Nutritionix API credentials not configured. Please add VITE_NUTRITIONIX_APP_ID and VITE_NUTRITIONIX_API_KEY to your .env file.';
    }
    return 'Nutritionix API configured';
  }
}
