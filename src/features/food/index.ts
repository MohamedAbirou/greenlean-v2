/**
 * Food Feature Exports
 */

// Components
export { MealTemplatesManager } from "./components/MealTemplates/MealTemplateManager";
export { RecentFoodsQuickAdd } from "./components/RecentFoods/RecentFoodsQuickAdd";
export { VoiceInputButton } from "./components/VoiceInput/VoiceInputButton";

// Hooks
export { useMealTemplates } from "./hooks/useMealTemplates";
export { useRecentFoods } from "./hooks/useRecentFoods";
export { useVoiceInput } from "./hooks/useVoiceInput";

// Services
export { parseFoodVoiceInput, voiceRecognition } from "./services/voiceRecognition";

// Types
export type * from "./types/food.types";

