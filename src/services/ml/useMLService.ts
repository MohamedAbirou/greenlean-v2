/**
 * React hooks for ML Service
 * Easy-to-use hooks for AI plan generation
 */

import { useState, useCallback } from 'react';
import { mlService, type MealPlan, type WorkoutPlan } from './mlService';
import { toast } from 'sonner';
import { useFeatureAccess } from '../stripe';

interface UseGenerateMealPlanResult {
  generateMealPlan: () => Promise<void>;
  mealPlan: MealPlan | null;
  isGenerating: boolean;
  error: string | null;
}

interface UseGenerateWorkoutPlanResult {
  generateWorkoutPlan: () => Promise<void>;
  workoutPlan: WorkoutPlan | null;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Hook for generating AI meal plans
 */
export function useGenerateMealPlan(userId: string | undefined): UseGenerateMealPlanResult {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canAccess, useFeature } = useFeatureAccess('ai_meal_plan');

  const generateMealPlan = useCallback(async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    // Check feature access and track usage
    if (!canAccess) {
      toast.error('You have reached your meal plan generation limit');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Track feature usage
      await useFeature();

      // Check ML service health
      const isHealthy = await mlService.healthCheck();
      if (!isHealthy) {
        throw new Error('AI service is currently unavailable. Please try again later.');
      }

      // Generate meal plan
      const plan = await mlService.generateMealPlan(userId);

      if (plan) {
        setMealPlan(plan);
        toast.success('🍽️ Meal plan generated successfully!');
      } else {
        throw new Error('Failed to generate meal plan');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate meal plan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [userId, canAccess, useFeature]);

  return {
    generateMealPlan,
    mealPlan,
    isGenerating,
    error,
  };
}

/**
 * Hook for generating AI workout plans
 */
export function useGenerateWorkoutPlan(userId: string | undefined): UseGenerateWorkoutPlanResult {
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canAccess, useFeature } = useFeatureAccess('ai_workout_plan');

  const generateWorkoutPlan = useCallback(async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    // Check feature access and track usage
    if (!canAccess) {
      toast.error('You have reached your workout plan generation limit');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Track feature usage
      await useFeature();

      // Check ML service health
      const isHealthy = await mlService.healthCheck();
      if (!isHealthy) {
        throw new Error('AI service is currently unavailable. Please try again later.');
      }

      // Generate workout plan
      const plan = await mlService.generateWorkoutPlan(userId);

      if (plan) {
        setWorkoutPlan(plan);
        toast.success('💪 Workout plan generated successfully!');
      } else {
        throw new Error('Failed to generate workout plan');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate workout plan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [userId, canAccess, useFeature]);

  return {
    generateWorkoutPlan,
    workoutPlan,
    isGenerating,
    error,
  };
}

/**
 * Hook for generating both meal and workout plans
 */
export function useGenerateBothPlans(userId: string | undefined) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { canAccess: canAccessMeal, useFeature: useMealFeature } = useFeatureAccess('ai_meal_plan');
  const { canAccess: canAccessWorkout, useFeature: useWorkoutFeature } = useFeatureAccess('ai_workout_plan');

  const generateBothPlans = useCallback(async () => {
    if (!userId) {
      toast.error('User not authenticated');
      return;
    }

    if (!canAccessMeal || !canAccessWorkout) {
      toast.error('You have reached your plan generation limit');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Track feature usage
      await Promise.all([useMealFeature(), useWorkoutFeature()]);

      // Check ML service health
      const isHealthy = await mlService.healthCheck();
      if (!isHealthy) {
        throw new Error('AI service is currently unavailable. Please try again later.');
      }

      // Get user profile
      const userProfile = await mlService.getUserProfileData(userId);
      if (!userProfile) {
        throw new Error('Failed to fetch user profile');
      }

      // Generate both plans
      const response = await mlService.generatePlans({
        userId,
        userProfile,
      });

      if (response.success) {
        setMealPlan(response.mealPlan || null);
        setWorkoutPlan(response.workoutPlan || null);
        toast.success('🎉 Your personalized plans are ready!');
      } else {
        throw new Error(response.error || 'Failed to generate plans');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate plans';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [userId, canAccessMeal, canAccessWorkout, useMealFeature, useWorkoutFeature]);

  return {
    generateBothPlans,
    mealPlan,
    workoutPlan,
    isGenerating,
    error,
  };
}
