/**
 * Progress Data Hooks
 * React Query hooks for progress tracking and analytics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import * as progressApi from '../api/progress';
import type { WeightHistory, BodyMeasurement } from '../types';
import { getToday } from '../utils';

// ========== QUERY KEYS ==========

export const progressKeys = {
  all: ['progress'] as const,
  weightHistory: (userId: string, startDate?: string, endDate?: string) =>
    [...progressKeys.all, 'weight', userId, startDate, endDate] as const,
  bodyMeasurements: (userId: string, startDate?: string, endDate?: string) =>
    [...progressKeys.all, 'measurements', userId, startDate, endDate] as const,
  nutritionTrends: (userId: string, startDate?: string, endDate?: string) =>
    [...progressKeys.all, 'nutrition-trends', userId, startDate, endDate] as const,
  workoutAnalytics: (userId: string, startDate?: string, endDate?: string) =>
    [...progressKeys.all, 'workout-analytics', userId, startDate, endDate] as const,
  streaks: (userId: string) => [...progressKeys.all, 'streaks', userId] as const,
  dashboardStats: (userId: string, date: string) =>
    [...progressKeys.all, 'stats', userId, date] as const,
  progressSummary: (userId: string, startDate: string, endDate: string) =>
    [...progressKeys.all, 'summary', userId, startDate, endDate] as const,
};

// ========== WEIGHT TRACKING ==========

export function useWeightHistory(startDate?: string, endDate?: string, limit = 100) {
  const { user } = useAuth();

  return useQuery({
    queryKey: progressKeys.weightHistory(user?.id || '', startDate, endDate),
    queryFn: () => progressApi.getWeightHistory(user!.id, startDate, endDate, limit),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLatestWeight() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...progressKeys.weightHistory(user?.id || ''), 'latest'],
    queryFn: () => progressApi.getLatestWeight(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAddWeightEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (entry: Partial<WeightHistory>) =>
      progressApi.addWeightEntry({
        ...entry,
        user_id: user!.id,
        log_date: entry.log_date || getToday(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.weightHistory(user!.id),
      });
      queryClient.invalidateQueries({
        queryKey: [...progressKeys.all, 'stats'],
      });
    },
  });
}

export function useUpdateWeightEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WeightHistory> }) =>
      progressApi.updateWeightEntry(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.weightHistory(user!.id),
      });
    },
  });
}

export function useDeleteWeightEntry() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: progressApi.deleteWeightEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.weightHistory(user!.id),
      });
    },
  });
}

// ========== BODY MEASUREMENTS ==========

export function useBodyMeasurements(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: progressKeys.bodyMeasurements(user?.id || '', startDate, endDate),
    queryFn: () => progressApi.getBodyMeasurements(user!.id, startDate, endDate),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useLatestMeasurement() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...progressKeys.bodyMeasurements(user?.id || ''), 'latest'],
    queryFn: () => progressApi.getLatestMeasurement(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAddBodyMeasurement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (measurement: Partial<BodyMeasurement>) =>
      progressApi.addBodyMeasurement({
        ...measurement,
        user_id: user!.id,
        measurement_date: measurement.measurement_date || getToday(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.bodyMeasurements(user!.id),
      });
    },
  });
}

export function useUpdateBodyMeasurement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BodyMeasurement> }) =>
      progressApi.updateBodyMeasurement(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.bodyMeasurements(user!.id),
      });
    },
  });
}

export function useDeleteBodyMeasurement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: progressApi.deleteBodyMeasurement,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: progressKeys.bodyMeasurements(user!.id),
      });
    },
  });
}

// ========== NUTRITION TRENDS ==========

export function useNutritionTrends(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: progressKeys.nutritionTrends(user?.id || '', startDate, endDate),
    queryFn: () => progressApi.getNutritionTrends(user!.id, startDate, endDate),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useLatestNutritionTrend() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...progressKeys.nutritionTrends(user?.id || ''), 'latest'],
    queryFn: () => progressApi.getLatestNutritionTrend(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ========== WORKOUT ANALYTICS ==========

export function useWorkoutAnalytics(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: progressKeys.workoutAnalytics(user?.id || '', startDate, endDate),
    queryFn: () => progressApi.getWorkoutAnalytics(user!.id, startDate, endDate),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

export function useLatestWorkoutAnalytics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...progressKeys.workoutAnalytics(user?.id || ''), 'latest'],
    queryFn: () => progressApi.getLatestWorkoutAnalytics(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ========== USER STREAKS ==========

export function useUserStreaks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: progressKeys.streaks(user?.id || ''),
    queryFn: () => progressApi.getUserStreaks(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useStreakByType(streakType: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...progressKeys.streaks(user?.id || ''), streakType],
    queryFn: () => progressApi.getStreakByType(user!.id, streakType),
    enabled: !!user && !!streakType,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// ========== DASHBOARD STATS ==========

export function useDashboardStats(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery({
    queryKey: progressKeys.dashboardStats(user?.id || '', date),
    queryFn: () => progressApi.getDashboardStats(user!.id, date),
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes (fresher data for dashboard)
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}

// ========== PROGRESS SUMMARY ==========

export function useProgressSummary(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: progressKeys.progressSummary(user?.id || '', startDate, endDate),
    queryFn: () => progressApi.getProgressSummary(user!.id, startDate, endDate),
    enabled: !!user && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}
