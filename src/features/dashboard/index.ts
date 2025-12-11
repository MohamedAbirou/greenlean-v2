/**
 * Dashboard Feature Exports
 */

// Main page
export { Dashboard } from './pages/Dashboard';

// Components
export { OverviewTab } from './components/overview/OverviewTab';
export { NutritionTab } from './components/nutrition/NutritionTab';
export { WorkoutTab } from './components/workout/WorkoutTab';
export { ProgressTab } from './components/progress/ProgressTab';
export { DateRangeSelector } from './components/shared/DateRangeSelector';
export { StatCard } from './components/shared/StatCard';
export { LoadingState, CardLoadingState } from './components/shared/LoadingState';

// Hooks
export * from './hooks/useNutrition';
export * from './hooks/useWorkout';
export * from './hooks/useProgress';

// API
export * as nutritionApi from './api/nutrition';
export * as workoutApi from './api/workout';
export * as progressApi from './api/progress';

// Utils
export * from './utils';

// Types
export type * from './types';
