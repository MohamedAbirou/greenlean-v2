/**
 * Nutrition Data Hooks
 * React Query hooks for nutrition data management and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/context/AuthContext';
import * as nutritionApi from '../api/nutrition';
import type {
  NutritionLog,
  MealItem,
  MealTemplate,
  AIMealPlan,
  WaterIntakeLog,
} from '../types';
import { getToday } from '../utils';

// ========== QUERY KEYS ==========

export const nutritionKeys = {
  all: ['nutrition'] as const,
  dailyLogs: (userId: string, date: string) =>
    [...nutritionKeys.all, 'daily', userId, date] as const,
  logsByRange: (userId: string, startDate: string, endDate: string) =>
    [...nutritionKeys.all, 'range', userId, startDate, endDate] as const,
  mealItems: (logId: string) => [...nutritionKeys.all, 'items', logId] as const,
  mealItemsByDate: (userId: string, date: string) =>
    [...nutritionKeys.all, 'items-by-date', userId, date] as const,
  templates: (userId: string) => [...nutritionKeys.all, 'templates', userId] as const,
  templatesByType: (userId: string, mealType: string) =>
    [...nutritionKeys.all, 'templates', userId, mealType] as const,
  activeMealPlan: (userId: string) => [...nutritionKeys.all, 'meal-plan', userId] as const,
  waterIntake: (userId: string, date: string) =>
    [...nutritionKeys.all, 'water', userId, date] as const,
  macroTargets: (userId: string) => [...nutritionKeys.all, 'targets', userId] as const,
  recentFoods: (userId: string) => [...nutritionKeys.all, 'recent', userId] as const,
};

// ========== NUTRITION LOGS ==========

export function useDailyNutritionLog(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.dailyLogs(user?.id || '', date),
    queryFn: () => nutritionApi.getDailyNutritionLog(user!.id, date),
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useNutritionLogsByRange(startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.logsByRange(user?.id || '', startDate, endDate),
    queryFn: () => nutritionApi.getNutritionLogsByDateRange(user!.id, startDate, endDate),
    enabled: !!user && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateNutritionLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (log: Partial<NutritionLog>) =>
      nutritionApi.createNutritionLog({ ...log, user_id: user!.id }),
    onSuccess: (data) => {
      // Invalidate daily logs for the date
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.dailyLogs(user!.id, data.log_date),
      });
      // Invalidate range queries
      queryClient.invalidateQueries({
        queryKey: [...nutritionKeys.all, 'range'],
      });
    },
  });
}

export function useUpdateNutritionLog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<NutritionLog> }) =>
      nutritionApi.updateNutritionLog(id, updates),
    onSuccess: () => {
      // Invalidate all nutrition log queries
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.all,
      });
    },
  });
}

export function useDeleteNutritionLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nutritionApi.deleteNutritionLog,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.all,
      });
    },
  });
}

// ========== MEAL ITEMS ==========

export function useMealItems(nutritionLogId?: string) {
  return useQuery({
    queryKey: nutritionKeys.mealItems(nutritionLogId || ''),
    queryFn: () => nutritionApi.getMealItemsByLogId(nutritionLogId!),
    enabled: !!nutritionLogId,
  });
}

export function useMealItemsByDate(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.mealItemsByDate(user?.id || '', date),
    queryFn: () => nutritionApi.getMealItemsByDate(user!.id, date),
    enabled: !!user,
  });
}

export function useCreateMealItem() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (item: Partial<MealItem>) =>
      nutritionApi.createMealItem({ ...item, user_id: user!.id }),
    onSuccess: (data) => {
      // Invalidate meal items queries
      if (data.nutrition_log_id) {
        queryClient.invalidateQueries({
          queryKey: nutritionKeys.mealItems(data.nutrition_log_id),
        });
      }
      // Invalidate daily logs (totals will be recalculated)
      queryClient.invalidateQueries({
        queryKey: [...nutritionKeys.all, 'daily'],
      });
      // Invalidate meal items by date
      queryClient.invalidateQueries({
        queryKey: [...nutritionKeys.all, 'items-by-date'],
      });
    },
  });
}

export function useCreateMealItems() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (items: Partial<MealItem>[]) =>
      nutritionApi.createMealItems(items.map(item => ({ ...item, user_id: user!.id }))),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.all,
      });
    },
  });
}

export function useUpdateMealItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MealItem> }) =>
      nutritionApi.updateMealItem(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.all,
      });
    },
  });
}

export function useDeleteMealItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nutritionApi.deleteMealItem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.all,
      });
    },
  });
}

// ========== MEAL TEMPLATES ==========

export function useMealTemplates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.templates(user?.id || ''),
    queryFn: () => nutritionApi.getMealTemplates(user!.id),
    enabled: !!user,
  });
}

export function useMealTemplatesByType(mealType: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.templatesByType(user?.id || '', mealType),
    queryFn: () => nutritionApi.getMealTemplatesByType(user!.id, mealType),
    enabled: !!user && !!mealType,
  });
}

export function useCreateMealTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (template: Partial<MealTemplate>) =>
      nutritionApi.createMealTemplate({ ...template, user_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.templates(user!.id),
      });
    },
  });
}

export function useUpdateMealTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<MealTemplate> }) =>
      nutritionApi.updateMealTemplate(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.templates(user!.id),
      });
    },
  });
}

export function useDeleteMealTemplate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: nutritionApi.deleteMealTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.templates(user!.id),
      });
    },
  });
}

// ========== AI MEAL PLAN ==========

export function useActiveMealPlan() {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.activeMealPlan(user?.id || ''),
    queryFn: () => nutritionApi.getActiveMealPlan(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

// ========== WATER TRACKING ==========

export function useWaterIntake(date: string = getToday()) {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.waterIntake(user?.id || '', date),
    queryFn: async () => {
      const [dailyIntake, logs] = await Promise.all([
        nutritionApi.getDailyWaterIntake(user!.id, date),
        nutritionApi.getWaterIntakeLogs(user!.id, date),
      ]);

      return { dailyIntake, logs };
    },
    enabled: !!user,
  });
}

export function useAddWaterIntake() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (log: Partial<WaterIntakeLog>) =>
      nutritionApi.addWaterIntake({
        ...log,
        user_id: user!.id,
        log_date: log.log_date || getToday(),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: nutritionKeys.waterIntake(user!.id, data.log_date),
      });
    },
  });
}

export function useDeleteWaterIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: nutritionApi.deleteWaterIntake,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...nutritionKeys.all, 'water'],
      });
    },
  });
}

// ========== USDA FOOD SEARCH ==========

export function useUSDAFoodSearch(query: string, enabled = false) {
  return useQuery({
    queryKey: ['usda-search', query],
    queryFn: () => nutritionApi.searchUSDAFoods(query, 1, 25),
    enabled: enabled && query.length >= 3,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// ========== BARCODE LOOKUP ==========

export function useBarcodeLookup(barcode: string, enabled = false) {
  return useQuery({
    queryKey: ['barcode', barcode],
    queryFn: () => nutritionApi.searchFoodByBarcode(barcode),
    enabled: enabled && barcode.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1,
  });
}

// ========== RECENT & FREQUENT FOODS ==========

export function useRecentFoods(limit = 20) {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.recentFoods(user?.id || ''),
    queryFn: () => nutritionApi.getRecentFoods(user!.id, limit),
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// ========== MACRO TARGETS ==========

export function useMacroTargets() {
  const { user } = useAuth();

  return useQuery({
    queryKey: nutritionKeys.macroTargets(user?.id || ''),
    queryFn: () => nutritionApi.getCurrentMacroTargets(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
