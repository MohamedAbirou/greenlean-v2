/**
 * Onboarding Feature Exports
 * Streamlined 3-question onboarding experience + Progressive profiling
 */

export { QuickOnboarding } from './pages/QuickOnboarding';
export { QuickGoalStep } from './components/QuickGoalStep';
export { QuickActivityStep } from './components/QuickActivityStep';
export { QuickDietStep } from './components/QuickDietStep';

// Micro-Surveys System
export { MicroSurveyDialog, MicroSurveyProvider } from './components/MicroSurveyDialog';
export { useMicroSurveys, trackMicroSurveyEvent } from './hooks/useMicroSurveys';
export type { MicroSurveyState } from './hooks/useMicroSurveys';
export * from './services/microSurveys.config';
