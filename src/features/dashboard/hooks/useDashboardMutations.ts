/**
 * Dashboard Mutations Hooks
 * Apollo hooks for creating, updating, and deleting dashboard data
 */

import { useMutation } from '@apollo/client';
import {
  CreateMealItemDocument,
  UpdateMealItemDocument,
  DeleteMealItemDocument,
  CreateWorkoutSessionDocument,
  UpdateWorkoutSessionDocument,
  DeleteWorkoutSessionDocument,
  CreateExerciseSetDocument,
  UpdateExerciseSetDocument,
  DeleteExerciseSetDocument,
  AddWeightEntryDocument,
  UpdateWeightEntryDocument,
  DeleteWeightEntryDocument,
  UpsertDailyWaterIntakeDocument,
  GetMealItemsByDateDocument,
  GetWorkoutSessionsByDateDocument,
  GetWeightHistoryDocument,
  GetDailyWaterIntakeDocument,
} from '@/generated/graphql';
import { useAuth } from '@/features/auth/context/AuthContext';

/**
 * Create meal item
 */
export function useCreateMealItem() {
  const { user } = useAuth();

  return useMutation(CreateMealItemDocument, {
    refetchQueries: [GetMealItemsByDateDocument],
  });
}

/**
 * Update meal item
 */
export function useUpdateMealItem() {
  return useMutation(UpdateMealItemDocument, {
    refetchQueries: [GetMealItemsByDateDocument],
  });
}

/**
 * Delete meal item
 */
export function useDeleteMealItem() {
  return useMutation(DeleteMealItemDocument, {
    refetchQueries: [GetMealItemsByDateDocument],
  });
}

/**
 * Create workout session
 */
export function useCreateWorkoutSession() {
  return useMutation(CreateWorkoutSessionDocument, {
    refetchQueries: [GetWorkoutSessionsByDateDocument],
  });
}

/**
 * Update workout session
 */
export function useUpdateWorkoutSession() {
  return useMutation(UpdateWorkoutSessionDocument, {
    refetchQueries: [GetWorkoutSessionsByDateDocument],
  });
}

/**
 * Delete workout session
 */
export function useDeleteWorkoutSession() {
  return useMutation(DeleteWorkoutSessionDocument, {
    refetchQueries: [GetWorkoutSessionsByDateDocument],
  });
}

/**
 * Create exercise set
 */
export function useCreateExerciseSet() {
  return useMutation(CreateExerciseSetDocument);
}

/**
 * Update exercise set
 */
export function useUpdateExerciseSet() {
  return useMutation(UpdateExerciseSetDocument);
}

/**
 * Delete exercise set
 */
export function useDeleteExerciseSet() {
  return useMutation(DeleteExerciseSetDocument);
}

/**
 * Add weight entry
 */
export function useAddWeightEntry() {
  return useMutation(AddWeightEntryDocument, {
    refetchQueries: [GetWeightHistoryDocument],
  });
}

/**
 * Update weight entry
 */
export function useUpdateWeightEntry() {
  return useMutation(UpdateWeightEntryDocument, {
    refetchQueries: [GetWeightHistoryDocument],
  });
}

/**
 * Delete weight entry
 */
export function useDeleteWeightEntry() {
  return useMutation(DeleteWeightEntryDocument, {
    refetchQueries: [GetWeightHistoryDocument],
  });
}

/**
 * Upsert daily water intake
 */
export function useUpsertWaterIntake() {
  return useMutation(UpsertDailyWaterIntakeDocument, {
    refetchQueries: [GetDailyWaterIntakeDocument],
  });
}
