/**
 * Nutrition Feature Exports
 */

// API Services
export { mealTrackingService } from "./api/mealTrackingService";
export { NutritionService } from "./api/nutritionService";
export { photoScanningService } from "./api/photoScanningService";
export { voiceLoggingService } from "./api/voiceLoggingService";
export { waterTrackingService } from "./api/waterTrackingService";

// Hooks
export { useNutritionLogs } from "./hooks/useNutritionLogs";
export { usePhotoScanning } from "./hooks/usePhotoScanning";
export { useVoiceLogging } from "./hooks/useVoiceLogging";

// Types
export type {
    NutritionLog as DefaultNutritionLog, TodayLog as DefaultTodayLog, MacroTargets, NutritionStats
} from "./types";

