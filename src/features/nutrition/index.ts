/**
 * Nutrition Feature Exports
 */

export { NutritionixService } from "./api/nutritionixService";
export type { FoodItem, NutritionixFood, NutritionixSearchResult } from "./api/nutritionixService";
export { NutritionService } from "./api/nutritionService";
export { BarcodeScanner } from "./components/BarcodeScanner";
export { EnhancedMealLogModal } from "./components/EnhancedMealLogModal";
export { FoodSearch } from "./components/FoodSearch";
export { useNutritionLogs } from "./hooks/useNutritionLogs";
export type {
    NutritionLog as DefaultNutritionLog, TodayLog as DefaultTodayLog, MacroTargets, NutritionStats
} from "./types";

