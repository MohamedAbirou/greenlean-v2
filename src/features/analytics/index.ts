/**
 * Analytics Feature Module
 * Exports all analytics-related functionality
 */

// Components
export { HeroSummaryCards } from "./components/HeroSummaryCards";
export { HydrationTracking } from "./components/HydrationTracking";
export { NutritionAnalytics } from "./components/NutritionAnalytics";
export { PlanAdherence } from "./components/PlanAdherence";
export { InsightsPanel, ProgressComparison } from "./components/ProgressComparison";
export { WorkoutPerformance } from "./components/WorkoutPerformance";

// Hooks
export * from "./hooks/useStatsData";

// Utils
export * from "./utils/statsCalculations";

// Types
export * from "./types/stats.types";

