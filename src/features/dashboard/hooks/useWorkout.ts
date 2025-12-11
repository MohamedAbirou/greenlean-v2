/**
 * Workout Data Hooks
 * React Query hooks for workout data management and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import * as workoutApi from '../api/workout';
import type {
  WorkoutSession,
  ExerciseSet,
  WorkoutTemplate,
  AIWorkoutPlan,
} from '../types';
import { getToday } from '../utils';

// ========== QUERY KEYS ==========

export const workoutKeys = {
  all: ['workout'] as const,
  sessions: (userId: string, startDate?: string, endDate?: string) =>
    [...workoutKeys.all, 'sessions', userId, startDate, endDate] as const,
  session: (sessionId: string) => [...workoutKeys.all, 'session', sessionId] as const,
  sessionsByDate: (userId: string, date: string) =>
    [...workoutKeys.all, 'sessions-by-date', userId, date] as const,
  exerciseSets: (sessionId: string) => [...workoutKeys.all, 'sets', sessionId] as const,
  exerciseHistory: (userId: string, exerciseId: string) =>
    [...workoutKeys.all, 'history', userId, exerciseId] as const,
  personalRecords: (userId: string) => [...workoutKeys.all, 'prs', userId] as const,
  personalRecord: (userId: string, exerciseId: string) =>
    [...workoutKeys.all, 'pr', userId, exerciseId] as const,
  templates: (userId: string) => [...workoutKeys.all, 'templates', userId] as const,
  template: (templateId: string) => [...workoutKeys.all, 'template', templateId] as const,
  activeWorkoutPlan: (userId: string) =>
    [...workoutKeys.all, 'workout-plan', userId] as const,
  exerciseLibrary: (searchTerm: string, filters?: any) =>
    [...workoutKeys.all, 'library', searchTerm, filters] as const,
  exerciseDB: (searchTerm?: string, bodyPart?: string, equipment?: string) =>
    [...workoutKeys.all, 'exercisedb', searchTerm, bodyPart, equipment] as const,
};

// ========== WORKOUT SESSIONS ==========

export function useWorkoutSessions(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.sessions(user?.id || '', startDate, endDate),
    queryFn: () => workoutApi.getWorkoutSessions(user!.id, startDate, endDate),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useWorkoutSession(sessionId?: string) {
  return useQuery({
    queryKey: workoutKeys.session(sessionId || ''),
    queryFn: () => workoutApi.getWorkoutSessionById(sessionId!),
    enabled: !!sessionId,
  });
}

export function useWorkoutSessionsByDate(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.sessionsByDate(user?.id || '', date),
    queryFn: () => workoutApi.getWorkoutSessionsByDate(user!.id, date),
    enabled: !!user,
  });
}

export function useCreateWorkoutSession() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (session: Partial<WorkoutSession>) =>
      workoutApi.createWorkoutSession({
        ...session,
        user_id: user!.id,
        workout_date: session.workout_date || getToday(),
      }),
    onSuccess: (data) => {
      // Invalidate sessions queries
      queryClient.invalidateQueries({
        queryKey: workoutKeys.sessions(user!.id),
      });
      queryClient.invalidateQueries({
        queryKey: workoutKeys.sessionsByDate(user!.id, data.workout_date),
      });
    },
  });
}

export function useUpdateWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WorkoutSession> }) =>
      workoutApi.updateWorkoutSession(id, updates),
    onSuccess: (data) => {
      // Invalidate specific session
      queryClient.invalidateQueries({
        queryKey: workoutKeys.session(data.id),
      });
      // Invalidate all sessions
      queryClient.invalidateQueries({
        queryKey: [...workoutKeys.all, 'sessions'],
      });
    },
  });
}

export function useDeleteWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workoutApi.deleteWorkoutSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...workoutKeys.all, 'sessions'],
      });
    },
  });
}

export function useCompleteWorkoutSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      ...updates
    }: {
      id: string;
      duration_minutes?: number;
      calories_burned?: number;
      rating?: number;
      energy_level?: number;
      notes?: string;
    }) =>
      workoutApi.completeWorkoutSession(id, {
        status: 'completed',
        ...updates,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.session(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: [...workoutKeys.all, 'sessions'],
      });
    },
  });
}

// ========== EXERCISE SETS ==========

export function useExerciseSets(sessionId?: string) {
  return useQuery({
    queryKey: workoutKeys.exerciseSets(sessionId || ''),
    queryFn: () => workoutApi.getExerciseSetsBySession(sessionId!),
    enabled: !!sessionId,
  });
}

export function useExerciseHistory(exerciseId?: string, limit = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.exerciseHistory(user?.id || '', exerciseId || ''),
    queryFn: () => workoutApi.getExerciseHistory(user!.id, exerciseId!, limit),
    enabled: !!user && !!exerciseId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useCreateExerciseSet() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (set: Partial<ExerciseSet>) =>
      workoutApi.createExerciseSet({ ...set, user_id: user!.id }),
    onSuccess: (data) => {
      // Invalidate sets for this session
      if (data.workout_session_id) {
        queryClient.invalidateQueries({
          queryKey: workoutKeys.exerciseSets(data.workout_session_id),
        });
        // Invalidate session (totals will be recalculated)
        queryClient.invalidateQueries({
          queryKey: workoutKeys.session(data.workout_session_id),
        });
      }
      // Invalidate exercise history
      if (data.exercise_id) {
        queryClient.invalidateQueries({
          queryKey: workoutKeys.exerciseHistory(user!.id, data.exercise_id),
        });
      }
      // Invalidate PRs (might have set a new one)
      queryClient.invalidateQueries({
        queryKey: workoutKeys.personalRecords(user!.id),
      });
    },
  });
}

export function useCreateExerciseSets() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (sets: Partial<ExerciseSet>[]) =>
      workoutApi.createExerciseSets(sets.map(set => ({ ...set, user_id: user!.id }))),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.all,
      });
    },
  });
}

export function useUpdateExerciseSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ExerciseSet> }) =>
      workoutApi.updateExerciseSet(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.all,
      });
    },
  });
}

export function useDeleteExerciseSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workoutApi.deleteExerciseSet,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.all,
      });
    },
  });
}

// ========== EXERCISE LIBRARY ==========

export function useExerciseLibrary(
  searchTerm: string,
  filters?: {
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
  },
  enabled = false
) {
  return useQuery({
    queryKey: workoutKeys.exerciseLibrary(searchTerm, filters),
    queryFn: () => workoutApi.searchExerciseLibrary(searchTerm, filters),
    enabled: enabled && searchTerm.length >= 2,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useAllExercises(limit = 100, offset = 0) {
  return useQuery({
    queryKey: ['exercises', 'all', limit, offset],
    queryFn: () => workoutApi.getAllExercises(limit, offset),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// ========== EXERCISE DB API ==========

export function useExerciseDB(
  searchTerm?: string,
  bodyPart?: string,
  equipment?: string,
  limit = 20,
  offset = 0,
  enabled = true
) {
  return useQuery({
    queryKey: workoutKeys.exerciseDB(searchTerm, bodyPart, equipment),
    queryFn: () =>
      workoutApi.searchExerciseDB(searchTerm, bodyPart, equipment, limit, offset),
    enabled: enabled,
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });
}

// ========== PERSONAL RECORDS ==========

export function usePersonalRecords() {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.personalRecords(user?.id || ''),
    queryFn: () => workoutApi.getPersonalRecords(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function usePersonalRecord(exerciseId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.personalRecord(user?.id || '', exerciseId || ''),
    queryFn: () => workoutApi.getPersonalRecordByExercise(user!.id, exerciseId!),
    enabled: !!user && !!exerciseId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useRecentPRs(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...workoutKeys.personalRecords(user?.id || ''), 'recent', limit],
    queryFn: () => workoutApi.getRecentPRs(user!.id, limit),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ========== WORKOUT TEMPLATES ==========

export function useWorkoutTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.templates(user?.id || ''),
    queryFn: () => workoutApi.getWorkoutTemplates(user!.id),
    enabled: !!user,
  });
}

export function useWorkoutTemplate(templateId?: string) {
  return useQuery({
    queryKey: workoutKeys.template(templateId || ''),
    queryFn: () => workoutApi.getWorkoutTemplateById(templateId!),
    enabled: !!templateId,
  });
}

export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (template: Partial<WorkoutTemplate>) =>
      workoutApi.createWorkoutTemplate({ ...template, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.templates(user!.id),
      });
    },
  });
}

export function useUpdateWorkoutTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WorkoutTemplate> }) =>
      workoutApi.updateWorkoutTemplate(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.template(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: workoutKeys.templates(user!.id),
      });
    },
  });
}

export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: workoutApi.deleteWorkoutTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: workoutKeys.templates(user!.id),
      });
    },
  });
}

// ========== AI WORKOUT PLAN ==========

export function useActiveWorkoutPlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: workoutKeys.activeWorkoutPlan(user?.id || ''),
    queryFn: () => workoutApi.getActiveWorkoutPlan(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ========== ANALYTICS ==========

export function useWorkoutStats(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workout-stats', user?.id, startDate, endDate],
    queryFn: () => workoutApi.getWorkoutStats(user!.id, startDate, endDate),
    enabled: !!user && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useExerciseFrequency(days = 30) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exercise-frequency', user?.id, days],
    queryFn: () => workoutApi.getExerciseFrequency(user!.id, days),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
