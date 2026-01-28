export type LogMethod =
  | "search"
  | "manual"
  | "voice"
  | "barcode"
  | "photo"
  | "ai-plan"
  | "template";

/**
 * MealItem - Core food item type
 *
 * Key Concept:
 * - base_* fields store nutrition per base_serving_qty of base_serving_unit
 * - calories, protein, etc. are CALCULATED from base_* × serving_qty
 * - This allows flexible quantity changes without losing precision
 */
export interface MealItem {
  // IDs
  id?: string; // Generated UUID for meal_items table
  food_id?: string; // USDA FDC ID, barcode, or other external ID

  // Basic Info
  food_name: string;
  brand_name?: string;

  // Serving Info (what user selected)
  serving_qty: number; // e.g., 2 (two servings)
  serving_unit: string; // e.g., "cup", "100g", "serving"

  // Calculated Macros (based on serving_qty × base values)
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;

  // Base Nutrition (per base_serving_qty) - REQUIRED for calculations
  base_calories: number;
  base_protein: number;
  base_carbs: number;
  base_fats: number;
  base_fiber?: number;
  base_sugar?: number;
  base_sodium?: number;
  base_serving_qty: number; // Usually 1 or 100
  base_serving_unit: string; // e.g., "g", "serving", "cup"

  // Metadata
  source?: LogMethod;
  from_ai_plan?: boolean;
  ai_meal_plan_id?: string;
  plan_meal_name?: string;
  notes?: string;

  // AI/Photo specific
  confidence?: number; // 0-1 for AI recognition confidence
  portion_estimate?: string; // Human-readable portion description
}

export interface DailyNutritionLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  notes?: string;
  created_at: string;
  meal_items?: MealItem[]; // Joined in queries
}

export interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  meal_type?: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  is_favorite: boolean;
  use_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
  template_items?: MealItem[];
}
