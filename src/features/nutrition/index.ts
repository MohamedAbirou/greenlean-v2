/**
 * Nutrition Feature Exports
 */

export { NutritionService } from "./api/nutritionService";
export { NutritionixService } from "./api/nutritionixService";
export { useNutritionLogs } from "./hooks/useNutritionLogs";
export { FoodSearch } from "./components/FoodSearch";
export { BarcodeScanner } from "./components/BarcodeScanner";
export { EnhancedMealLogModal } from "./components/EnhancedMealLogModal";
export { MealLogDrawer } from "./components/MealLogDrawer";
export type {
    NutritionLog as DefaultNutritionLog, TodayLog as DefaultTodayLog, MacroTargets, NutritionStats
} from "./types";
export type { FoodItem, NutritionixFood, NutritionixSearchResult } from "./api/nutritionixService";

