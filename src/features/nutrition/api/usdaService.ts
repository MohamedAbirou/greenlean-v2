/**
 * USDA FoodData Central API Service
 * Free alternative food database with comprehensive nutrition data
 * API Docs: https://fdc.nal.usda.gov/api-guide.html
 */

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

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

export interface USDASearchResult {
  foods: USDAFood[];
  totalHits: number;
  currentPage: number;
  totalPages: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size: string;
  verified: boolean;
  dataType?: string;
}

export class USDAService {
  /**
   * Search for foods in the USDA database
   */
  static async searchFoods(
    query: string,
    page: number = 1,
    pageSize: number = 25
  ): Promise<USDASearchResult> {
    if (!query || query.length < 2) {
      return { foods: [], totalHits: 0, currentPage: 1, totalPages: 0 };
    }

    try {
      const params = new URLSearchParams({
        query: query,
        pageSize: pageSize.toString(),
        pageNumber: page.toString(),
        dataType: 'Survey (FNDDS),Branded,Foundation', // Multiple data types
        sortBy: 'dataType.keyword',
        sortOrder: 'asc',
      });

      const response = await fetch(
        `${USDA_BASE_URL}/foods/search?${params.toString()}`,
        {
          headers: {
            'X-Api-Key': USDA_API_KEY,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        }
        throw new Error(`USDA API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching USDA foods:', error);
      return { foods: [], totalHits: 0, currentPage: 1, totalPages: 0 };
    }
  }

  /**
   * Get detailed food information by FDC ID
   */
  static async getFoodById(fdcId: number): Promise<USDAFood | null> {
    try {
      const response = await fetch(
        `${USDA_BASE_URL}/food/${fdcId}?format=full`,
        {
          headers: {
            'X-Api-Key': USDA_API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`USDA API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching food details:', error);
      return null;
    }
  }

  /**
   * Search foods by barcode/UPC
   */
  static async searchByBarcode(upc: string): Promise<USDAFood | null> {
    if (!upc) return null;

    try {
      const params = new URLSearchParams({
        query: upc,
        dataType: 'Branded',
        pageSize: '1',
      });

      const response = await fetch(
        `${USDA_BASE_URL}/foods/search?${params.toString()}`,
        {
          headers: {
            'X-Api-Key': USDA_API_KEY,
          },
        }
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const food = data.foods?.find((f: USDAFood) => f.gtinUpc === upc);
      return food || null;
    } catch (error) {
      console.error('Error searching by barcode:', error);
      return null;
    }
  }

  /**
   * Extract nutrient value from food
   */
  private static getNutrient(
    food: USDAFood,
    nutrientName: string
  ): number {
    const nutrient = food.foodNutrients?.find(
      (n) => n.nutrientName === nutrientName
    );
    return nutrient?.value || 0;
  }

  /**
   * Convert USDA food to FoodItem format
   */
  static toFoodItem(food: USDAFood): FoodItem {
    const calories = this.getNutrient(food, 'Energy');
    const protein = this.getNutrient(food, 'Protein');
    const carbs = this.getNutrient(food, 'Carbohydrate, by difference');
    const fats = this.getNutrient(food, 'Total lipid (fat)');

    // Determine serving size
    let servingSize = '100g';
    if (food.householdServingFullText) {
      servingSize = food.householdServingFullText;
    } else if (food.servingSize && food.servingSizeUnit) {
      servingSize = `${food.servingSize} ${food.servingSizeUnit}`;
    }

    return {
      id: food.fdcId.toString(),
      name: food.description,
      brand: food.brandOwner || food.brandName,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fats: Math.round(fats),
      serving_size: servingSize,
      verified: food.dataType === 'Foundation' || food.dataType === 'Survey (FNDDS)',
      dataType: food.dataType,
    };
  }

  /**
   * Check if API is configured
   */
  static isConfigured(): boolean {
    return USDA_API_KEY !== 'DEMO_KEY';
  }

  /**
   * Get API configuration status
   */
  static getConfigStatus(): string {
    if (USDA_API_KEY === 'DEMO_KEY') {
      return 'Using USDA DEMO_KEY (limited to 1000 requests/hour). Add VITE_USDA_API_KEY to .env for production use.';
    }
    return 'USDA FoodData Central API configured';
  }

  /**
   * Get API documentation URL
   */
  static getApiDocsUrl(): string {
    return 'https://fdc.nal.usda.gov/api-guide.html';
  }
}
