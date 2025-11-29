/**
 * Dashboard Data Hooks
 * Real Supabase queries replacing placeholder implementation
 * Uses React hooks with Supabase client for data fetching
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// ============================================
// TYPES
// ============================================

interface DashboardOverviewData {
  profile: any;
  quizResult: any;
  bmiStatus: { status: string; color: string };
}

interface DashboardNutritionData {
  mealPlan: any;
  waterIntake: { glasses: number; total_ml: number };
  mealLogs: any[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
}

interface DashboardWorkoutData {
  workoutPlan: any;
  workoutLogs: any[];
}

interface DashboardProgressData {
  profile: any;
  weightHistory: any[];
}

// ============================================
// OVERVIEW HOOK
// ============================================
export function useDashboardOverview(userId?: string) {
  const [data, setData] = useState<DashboardOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch latest quiz result
      const { data: quizData, error: quizError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (quizError && quizError.code !== 'PGRST116') throw quizError;

      // Calculate BMI status
      let bmiStatus = { status: 'Unknown', color: 'gray' };
      if (profileData?.weight_kg && profileData?.height_cm) {
        const bmi = profileData.weight_kg / Math.pow(profileData.height_cm / 100, 2);
        if (bmi < 18.5) {
          bmiStatus = { status: 'Underweight', color: 'info' };
        } else if (bmi < 25) {
          bmiStatus = { status: 'Normal', color: 'success' };
        } else if (bmi < 30) {
          bmiStatus = { status: 'Overweight', color: 'warning' };
        } else {
          bmiStatus = { status: 'Obese', color: 'error' };
        }
      }

      setData({
        profile: profileData,
        quizResult: quizData,
        bmiStatus,
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching overview data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const profile = useMemo(() => data?.profile, [data]);
  const quizResult = useMemo(() => data?.quizResult, [data]);
  const bmiStatus = useMemo(() => data?.bmiStatus || { status: 'Unknown', color: 'gray' }, [data]);

  return {
    profile,
    quizResult,
    bmiStatus,
    loading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// NUTRITION HOOK
// ============================================
export function useDashboardNutrition(userId?: string, date?: string) {
  const [data, setData] = useState<DashboardNutritionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const logDate = date || new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch active meal plan
      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from('ai_meal_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mealPlanError && mealPlanError.code !== 'PGRST116') throw mealPlanError;

      // Fetch water intake for today
      const { data: waterData, error: waterError } = await supabase
        .from('daily_water_intake')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', logDate)
        .maybeSingle();

      if (waterError && waterError.code !== 'PGRST116') throw waterError;

      // Fetch meal logs for today
      const { data: mealLogsData, error: mealLogsError } = await supabase
        .from('daily_nutrition_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('log_date', logDate)
        .order('created_at', { ascending: true });

      if (mealLogsError) throw mealLogsError;

      // Calculate totals
      const totals = (mealLogsData || []).reduce(
        (acc, log) => ({
          calories: acc.calories + (log.total_calories || 0),
          protein: acc.protein + (log.total_protein || 0),
          carbs: acc.carbs + (log.total_carbs || 0),
          fat: acc.fat + (log.total_fats || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      setData({
        mealPlan: mealPlanData,
        waterIntake: {
          glasses: waterData?.glasses || 0,
          total_ml: waterData?.total_ml || 0,
        },
        mealLogs: mealLogsData || [],
        totals,
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching nutrition data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, logDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mealPlan = useMemo(() => data?.mealPlan, [data]);
  const waterIntake = useMemo(() => data?.waterIntake || { glasses: 0, total_ml: 0 }, [data]);
  const mealLogs = useMemo(() => data?.mealLogs || [], [data]);
  const totals = useMemo(() => data?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 }, [data]);

  return {
    mealPlan,
    waterIntake,
    mealLogs,
    totals,
    loading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// WORKOUT HOOK
// ============================================
export function useDashboardWorkout(userId?: string) {
  const [data, setData] = useState<DashboardWorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch active workout plan
      const { data: workoutPlanData, error: workoutPlanError } = await supabase
        .from('ai_workout_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (workoutPlanError && workoutPlanError.code !== 'PGRST116') throw workoutPlanError;

      // Fetch recent workout logs (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: workoutLogsData, error: workoutLogsError } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('workout_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('workout_date', { ascending: false });

      if (workoutLogsError) throw workoutLogsError;

      setData({
        workoutPlan: workoutPlanData,
        workoutLogs: workoutLogsData || [],
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching workout data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const workoutPlan = useMemo(() => data?.workoutPlan, [data]);
  const workoutLogs = useMemo(() => data?.workoutLogs || [], [data]);

  return {
    workoutPlan,
    workoutLogs,
    loading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// PROGRESS HOOK
// ============================================
export function useDashboardProgress(userId?: string) {
  const [data, setData] = useState<DashboardProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(false);
      setError(null);

      // Fetch profile (for current weight)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch weight history (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Try new weight_history table first (might not exist yet)
      let weightHistoryData = [];
      try {
        const { data, error: weightError } = await supabase
          .from('weight_history')
          .select('*')
          .eq('user_id', userId)
          .gte('log_date', ninetyDaysAgo.toISOString().split('T')[0])
          .order('log_date', { ascending: true });

        if (!weightError) {
          weightHistoryData = data || [];
        }
      } catch (err) {
        // Table might not exist yet - that's okay
        console.log('weight_history table not available yet');
      }

      setData({
        profile: profileData,
        weightHistory: weightHistoryData,
      });
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching progress data:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const profile = useMemo(() => data?.profile, [data]);
  const weightHistory = useMemo(() => data?.weightHistory || [], [data]);

  return {
    profile,
    weightHistory,
    loading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// MUTATION HOOKS
// ============================================

export function useWaterIntakeMutations() {
  const [loading, setLoading] = useState(false);

  const logWater = async (userId: string, glasses: number, totalMl: number) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase
        .from('daily_water_intake')
        .upsert(
          {
            user_id: userId,
            log_date: today,
            glasses,
            total_ml: totalMl,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,log_date',
          }
        );

      if (error) throw error;
    } catch (err) {
      console.error('Error logging water:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateWater = logWater; // Same implementation

  return {
    logWater,
    updateWater,
    loading,
  };
}

export function useMealMutations() {
  const [loading, setLoading] = useState(false);

  const logMealEntry = async (
    userId: string,
    mealData: {
      mealName: string;
      mealType: string;
      calories: number;
      proteinG: number;
      carbsG: number;
      fatG: number;
      foodItems?: any[];
    }
  ) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('daily_nutrition_logs').insert({
        user_id: userId,
        log_date: today,
        meal_type: mealData.mealType,
        food_items: mealData.foodItems || [],
        total_calories: mealData.calories,
        total_protein: mealData.proteinG,
        total_carbs: mealData.carbsG,
        total_fats: mealData.fatG,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error logging meal:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    logMealEntry,
    loading,
  };
}

export function useWorkoutMutations() {
  const [loading, setLoading] = useState(false);

  const logWorkoutEntry = async (
    userId: string,
    workoutData: {
      workoutName: string;
      workoutType: string;
      durationMinutes: number;
      caloriesBurned: number;
      exercises?: any[];
      notes?: string;
    }
  ) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('workout_logs').insert({
        user_id: userId,
        workout_date: today,
        workout_type: workoutData.workoutType,
        exercises: workoutData.exercises || [],
        duration_minutes: workoutData.durationMinutes,
        calories_burned: workoutData.caloriesBurned,
        notes: workoutData.notes,
        completed: true,
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error logging workout:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    logWorkoutEntry,
    loading,
  };
}

export function useWeightMutations() {
  const [loading, setLoading] = useState(false);

  const logWeight = async (userId: string, weightKg: number, notes?: string) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      const { error } = await supabase.from('weight_history').upsert(
        {
          user_id: userId,
          log_date: today,
          weight_kg: weightKg,
          notes,
        },
        {
          onConflict: 'user_id,log_date',
        }
      );

      if (error) throw error;

      // Also update the profiles table with latest weight
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ weight_kg: weightKg, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (profileError) throw profileError;
    } catch (err) {
      console.error('Error logging weight:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    logWeight,
    loading,
  };
}

// ============================================
// STREAK & GAMIFICATION HOOKS
// ============================================
export function useStreakData(userId?: string) {
  const [streakData, setStreakData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStreakData = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch nutrition logging streak
      const { data, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('streak_type', 'nutrition_logging')
        .maybeSingle();

      if (streakError) throw streakError;

      setStreakData(data || {
        current_streak: 0,
        longest_streak: 0,
        total_days_logged: 0,
        streak_type: 'nutrition_logging',
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  return { streakData, loading, error, refetch: fetchStreakData };
}

export function useAchievementData(userId?: string) {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAchievements = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Fetch user's badge progress
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);

      if (badgesError) throw badgesError;

      // Fetch additional data to calculate achievements
      const [weightHistoryRes, workoutLogsRes, mealLogsRes, streaksRes] = await Promise.all([
        supabase.from('weight_history').select('weight_kg').eq('user_id', userId).order('log_date', { ascending: true }),
        supabase.from('workout_logs').select('id').eq('user_id', userId),
        supabase.from('meal_logs').select('id').eq('user_id', userId),
        supabase.from('user_streaks').select('*').eq('user_id', userId),
      ]);

      const weightHistory = weightHistoryRes.data || [];
      const totalWorkouts = workoutLogsRes.data?.length || 0;
      const totalMeals = mealLogsRes.data?.length || 0;
      const streaks = streaksRes.data || [];

      // Calculate weight loss
      let weightLoss = 0;
      if (weightHistory.length > 1) {
        const startWeight = weightHistory[0].weight_kg;
        const currentWeight = weightHistory[weightHistory.length - 1].weight_kg;
        weightLoss = startWeight - currentWeight;
      }

      // Get max streak
      const maxStreak = Math.max(...streaks.map(s => s.longest_streak || 0), 0);

      // Default achievements with calculated progress
      const defaultAchievements = [
        {
          id: '1',
          name: 'First Step',
          icon: '🌱',
          unlocked: totalMeals > 0,
          requirement: 'Log first meal',
          progress: totalMeals > 0 ? 100 : 0,
          badge_id: 'first_step',
        },
        {
          id: '2',
          name: 'Week Warrior',
          icon: '🔥',
          unlocked: maxStreak >= 7,
          requirement: '7-day streak',
          progress: Math.min((maxStreak / 7) * 100, 100),
          badge_id: 'week_warrior',
        },
        {
          id: '3',
          name: 'Workout Newbie',
          icon: '🏃',
          unlocked: totalWorkouts >= 10,
          requirement: '10 workouts',
          progress: Math.min((totalWorkouts / 10) * 100, 100),
          badge_id: 'workout_newbie',
        },
        {
          id: '4',
          name: 'Month Master',
          icon: '💪',
          unlocked: maxStreak >= 30,
          requirement: '30-day streak',
          progress: Math.min((maxStreak / 30) * 100, 100),
          badge_id: 'month_master',
        },
        {
          id: '5',
          name: '5kg Down',
          icon: '⬇️',
          unlocked: weightLoss >= 5,
          requirement: '5kg weight loss',
          progress: Math.min((weightLoss / 5) * 100, 100),
          badge_id: '5kg_down',
        },
        {
          id: '6',
          name: 'Gym Regular',
          icon: '💪',
          unlocked: totalWorkouts >= 50,
          requirement: '50 workouts',
          progress: Math.min((totalWorkouts / 50) * 100, 100),
          badge_id: 'gym_regular',
        },
      ];

      // Merge with database badges if they exist
      const mergedAchievements = defaultAchievements.map(achievement => {
        const dbBadge = badgesData?.find(b => b.badge_id === achievement.badge_id);
        return {
          ...achievement,
          unlocked_at: dbBadge?.unlocked_at,
        };
      });

      setAchievements(mergedAchievements);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return { achievements, loading, error, refetch: fetchAchievements };
}

// ============================================
// COMBINED DASHBOARD HOOK
// ============================================
export function useDashboardData(userId?: string) {
  const overview = useDashboardOverview(userId);
  const nutrition = useDashboardNutrition(userId);
  const workout = useDashboardWorkout(userId);
  const progress = useDashboardProgress(userId);
  const streak = useStreakData(userId);
  const gamification = useAchievementData(userId);

  return {
    overview,
    nutrition,
    workout,
    progress,
    streak,
    gamification,
    loading:
      overview.loading ||
      nutrition.loading ||
      workout.loading ||
      progress.loading ||
      streak.loading ||
      gamification.loading,
    error:
      overview.error ||
      nutrition.error ||
      workout.error ||
      progress.error ||
      streak.error ||
      gamification.error,
  };
}
