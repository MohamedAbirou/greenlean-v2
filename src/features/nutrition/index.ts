/**
 * Nutrition Feature Exports
 */

// API Services
export { NutritionixService } from "./api/nutritionixService";
export type { FoodItem, NutritionixFood, NutritionixSearchResult } from "./api/nutritionixService";
export { NutritionService } from "./api/nutritionService";
export { mealTrackingService } from "./api/mealTrackingService";
export { photoScanningService } from "./api/photoScanningService";
export { voiceLoggingService } from "./api/voiceLoggingService";
export { waterTrackingService } from "./api/waterTrackingService";

// Components
export { BarcodeScanner } from "./components/BarcodeScanner";
export { EnhancedMealLogModal } from "./components/EnhancedMealLogModal";
export { FoodSearch } from "./components/FoodSearch";
export { PhotoScanner } from "./components/PhotoScanner";
export { VoiceRecorder } from "./components/VoiceRecorder";

// Hooks
export { useNutritionLogs } from "./hooks/useNutritionLogs";
export { usePhotoScanning } from "./hooks/usePhotoScanning";
export { useVoiceLogging } from "./hooks/useVoiceLogging";

// Types
export type {
    NutritionLog as DefaultNutritionLog, TodayLog as DefaultTodayLog, MacroTargets, NutritionStats
} from "./types";

