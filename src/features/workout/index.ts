/**
 * Workout Feature Exports
 */

export { ExerciseDbService, STATIC_EXERCISES } from "./api/exerciseDbService";
export type { Exercise, ExerciseDbExercise } from "./api/exerciseDbService";
export { WorkoutService } from "./api/workoutService";
export { ExerciseAlternatives } from "./components/ExerciseAlternatives";
export { ExerciseLibrary } from "./components/ExerciseLibrary";
export { WorkoutBuilder } from "./components/WorkoutBuilder";
export { useWorkoutLogs } from "./hooks/useWorkoutLogs";
export type {
  ExerciseLog,
  WorkoutLog, WorkoutLogData, WorkoutStats
} from "./types";

