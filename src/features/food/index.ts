/**
 * Food Feature Exports
 */

// Components
export { MealTemplatesList } from './components/MealTemplates/MealTemplatesList';
export { CreateTemplateModal } from './components/MealTemplates/CreateTemplateModal';
export { RecentFoodsList } from './components/RecentFoods/RecentFoodsList';
export { VoiceInputButton } from './components/VoiceInput/VoiceInputButton';

// Hooks
export { useMealTemplates } from './hooks/useMealTemplates';
export { useRecentFoods } from './hooks/useRecentFoods';
export { useVoiceInput } from './hooks/useVoiceInput';

// Services
export { voiceRecognition, parseFoodVoiceInput } from './services/voiceRecognition';

// Types
export type * from './types/food.types';
