/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Optimized Workout Display Service
 * Efficiently fetches workout sessions with exercises, sets, PRs, and history
 * Designed for high performance with large datasets
 */

import { supabase } from "@/lib/supabase";
import { calculateWork, type ExerciseTrackingMode } from "../utils/exerciseTypeConfig";

export interface WorkoutDisplayData {
  id: string;
  session_date: string;
  workout_name: string;
  workout_type: string;
  duration_minutes: number;
  total_exercises: number;
  total_sets: number;
  total_volume: number;
  calories_burned: number | undefined;
  status: string;
  exercises: ExerciseDisplayData[];
}

export interface ExerciseDisplayData {
  id: string; // set id of first set (for grouping)
  exercise_id: string;
  exercise_name: string;
  exercise_category: string;
  muscle_group?: string;
  trackingMode: ExerciseTrackingMode;
  sets: SetDisplayData[];
  personalRecord?: PersonalRecordData;
  recentHistory?: HistoryEntry[];
  notes?: string;
}

export interface SetDisplayData {
  id?: string;
  set_number: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  is_pr_weight?: boolean;
  is_pr_reps?: boolean;
  is_pr_volume?: boolean;
  is_pr_duration?: boolean;
  is_pr_distance?: boolean;
  notes?: string;
}

export interface PersonalRecordData {
  max_weight_kg?: number;
  max_weight_date?: string;
  max_reps?: number;
  max_reps_date?: string;
  max_volume?: number;
  max_volume_date?: string;
  max_distance_meters?: number;
  max_distance_date?: string;
  best_time_seconds?: number; // e.g. fastest time for distance
  best_time_date?: string;
}

export interface HistoryEntry {
  date: string;
  reps: number;
  weight_kg?: number;
  distance_meters?: number;
  duration_seconds?: number;
  summary: string; // e.g. "Avg 12 reps @ 80kg" or "Avg 2:45 hold"
  total_work: number; // mode-aware total
  completed_at?: string;
}

class WorkoutDisplayService {
  /**
   * MAIN ENTRY POINT
   * Fetch workouts with all related data efficiently
   * Uses pagination and optimized queries
   */
  async getWorkoutsForDisplay(
    userId: string,
    options: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
      workoutType?: string;
      includePRsOnly?: boolean;
    } = {}
  ): Promise<{
    workouts: WorkoutDisplayData[];
    hasMore: boolean;
    total: number;
  }> {
    const {
      startDate,
      endDate,
      limit = 10,
      offset = 0,
      workoutType,
      includePRsOnly = false,
    } = options;

    try {
      // Step 1: Fetch workout sessions with basic info
      let sessionQuery = supabase
        .from("workout_sessions")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("status", "completed")
        .order("session_date", { ascending: false })
        .range(offset, offset + limit - 1);

      if (startDate) {
        sessionQuery = sessionQuery.gte("session_date", startDate);
      }
      if (endDate) {
        sessionQuery = sessionQuery.lte("session_date", endDate);
      }
      if (workoutType && workoutType !== "all") {
        sessionQuery = sessionQuery.eq("workout_type", workoutType);
      }

      const { data: sessions, error: sessionError, count } = await sessionQuery;

      if (sessionError) throw sessionError;
      if (!sessions || sessions.length === 0) {
        return { workouts: [], hasMore: false, total: 0 };
      }

      const sessionIds = sessions.map((s) => s.id);

      // Step 2: Fetch ALL exercise sets for these sessions (single query)
      // This is more efficient than N queries for N sessions
      const { data: allSets, error: setsError } = await supabase
        .from("exercise_sets")
        .select("*")
        .in("workout_session_id", sessionIds) // Works after adding column
        .order("set_number", { ascending: true })
        .order("created_at", { ascending: true });

      if (setsError) throw setsError;

      // Step 3: Get unique exercise IDs to fetch PRs and history
      const exerciseIds = [...new Set(allSets?.map((s) => s.exercise_id).filter(Boolean) || [])];

      // Step 4: Fetch personal records for all exercises (single batch query)
      const { data: personalRecords, error: prError } = await supabase
        .from("exercise_personal_records")
        .select("*")
        .eq("user_id", userId)
        .in("exercise_id", exerciseIds);

      if (prError) throw prError;

      // Step 5: Fetch recent history for all exercises (single batch query)
      // Limit to last 5 entries per exercise for performance
      const { data: historyData, error: historyError } = await supabase
        .from("workout_exercise_history")
        .select("*")
        .eq("user_id", userId)
        .in("exercise_id", exerciseIds)
        .order("completed_at", { ascending: false })
        .limit(exerciseIds.length * 5); // 5 per exercise

      if (historyError) throw historyError;

      // Step 6: Build lookup maps for O(1) access
      const setsBySession = new Map<string, any[]>();
      allSets?.forEach((set) => {
        const key = set.workout_session_id;
        if (!setsBySession.has(key)) setsBySession.set(key, []);
        setsBySession.get(key)!.push(set);
      });

      const prByExercise = new Map<string, any>();
      personalRecords?.forEach((pr) => prByExercise.set(pr.exercise_id, pr));

      const historyByExercise = new Map<string, any[]>();
      historyData?.forEach((h) => {
        if (!historyByExercise.has(h.exercise_id)) historyByExercise.set(h.exercise_id, []);
        const arr = historyByExercise.get(h.exercise_id)!;
        if (arr.length < 5) arr.push(h);
      });

      // Step 7: Transform data into display format
      const workouts: WorkoutDisplayData[] = sessions
        .map((session) => {
          const sessionSets = setsBySession.get(session.id) || [];

          // Group sets by exercise
          const byExercise = new Map<string, any[]>();
          sessionSets.forEach((set) => {
            const key = set.exercise_id;
            if (!byExercise.has(key)) byExercise.set(key, []);
            byExercise.get(key)!.push(set);
          });

          // Build exercises array
          const exercises: ExerciseDisplayData[] = Array.from(byExercise.entries()).map(
            ([exKey, sets]) => {
              const first = sets[0];
              const mode = (first.tracking_mode || "reps-only") as ExerciseTrackingMode;

              const transformedSets: SetDisplayData[] = sets.map((s) => ({
                id: s.id,
                set_number: s.set_number,
                reps: s.reps,
                weight_kg: s.weight_kg,
                duration_seconds: s.duration_seconds,
                distance_meters: s.distance_meters,
                is_pr_weight: s.is_pr_weight,
                is_pr_reps: s.is_pr_reps,
                is_pr_volume: s.is_pr_volume,
                is_pr_duration: s.is_pr_duration,
                is_pr_distance: s.is_pr_distance,
                notes: s.notes,
              }));

              // Get PR data
              const pr = prByExercise.get(first.exercise_id || exKey);

              // Get history
              const history = historyByExercise.get(first.exercise_id || exKey) || [];

              const recentHistory: HistoryEntry[] = history.map((h) => ({
                date: h.completed_at.split("T")[0],
                reps: h.reps,
                weight_kg: h.weight_kg,
                distance_meters: h.distance_meters,
                duration_seconds: h.duration_seconds,
                summary: "Avg performance", // you can improve this later
                total_work: h.weight_kg ? h.sets * h.reps * h.weight_kg : 0, // fallback; ideally recompute
                completed_at: h.completed_at,
              }));

              return {
                id: first.id,
                exercise_id: first.exercise_id || exKey,
                exercise_name: first.exercise_name,
                exercise_category: first.exercise_category || "strength",
                trackingMode: mode,
                sets: transformedSets,
                personalRecord: pr
                  ? {
                      max_weight_kg: pr.max_weight_kg,
                      max_weight_date: pr.max_weight_date,
                      max_reps: pr.max_reps,
                      max_reps_date: pr.max_reps_date,
                      max_volume: pr.max_volume_kg,
                      max_volume_date: pr.max_volume_date,
                      max_distance_date: pr.max_distance_date,
                      best_time_seconds: pr.best_time_seconds,
                      best_time_date: pr.best_time_date,
                    }
                  : undefined,
                recentHistory,
              };
            }
          );

          // Filter for PRs if needed
          if (includePRsOnly) {
            const hasPRs = exercises.some((ex) =>
              ex.sets.some((s) => s.is_pr_weight || s.is_pr_reps || s.is_pr_volume)
            );
            if (!hasPRs) return null;
          }

          // Compute total work using calculateWork
          const totalWork = exercises.reduce(
            (sum, ex) =>
              sum +
              ex.sets.reduce((setSum, set) => setSum + calculateWork(ex.trackingMode, set), 0),
            0
          );

          return {
            id: session.id,
            session_date: session.session_date,
            workout_name: session.workout_name,
            workout_type: session.workout_type,
            duration_minutes: session.duration_minutes,
            total_exercises: exercises.length,
            total_sets: sessionSets.length,
            total_volume: totalWork, // now generic
            calories_burned: session.calories_burned,
            status: session.status,
            exercises,
          };
        })
        .filter((w): w is WorkoutDisplayData => w !== null);

      return {
        workouts,
        hasMore: (count || 0) > offset + limit,
        total: count || 0,
      };
    } catch (error) {
      console.error("Error fetching workouts for display:", error);
      throw error;
    }
  }

  /**
   * OPTIMIZED: Fetch single workout with full details
   * Use this for detailed view/editing
   */
  async getWorkoutDetails(
    userId: string,
    workoutSessionId: string
  ): Promise<WorkoutDisplayData | null> {
    try {
      const { workouts } = await this.getWorkoutsForDisplay(userId, {
        limit: 1,
        offset: 0,
      });

      // Filter in-memory (more efficient than complex DB query)
      const workout = workouts.find((w) => w.id === workoutSessionId);
      return workout || null;
    } catch (error) {
      console.error("Error fetching workout details:", error);
      return null;
    }
  }

  /**
   * OPTIMIZED: Get workout statistics for date range
   * Efficient aggregation without fetching all data
   */
  async getWorkoutStats(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{
    totalWorkouts: number;
    totalExercises: number;
    totalSets: number;
    totalWork: number;
    totalCalories: number;
    prCount: number;
  }> {
    try {
      // Aggregate query - much faster than fetching all data
      const { data: stats, error } = await supabase
        .rpc("get_workout_stats_summary", {
          p_user_id: userId,
          p_start_date: startDate,
          p_end_date: endDate,
        })
        .single();

      if (error) {
        // Fallback if RPC doesn't exist
        console.warn("RPC not found, using fallback calculation");
        const { workouts } = await this.getWorkoutsForDisplay(userId, {
          startDate,
          endDate,
          limit: 1000, // Max for fallback
        });

        return {
          totalWorkouts: workouts.length,
          totalExercises: workouts.reduce((sum, w) => sum + w.total_exercises, 0),
          totalSets: workouts.reduce((sum, w) => sum + w.total_sets, 0),
          totalWork: workouts.reduce((sum, w) => sum + w.total_volume, 0),
          totalCalories: workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0),
          prCount: workouts.reduce(
            (sum, w) =>
              sum +
              w.exercises.reduce(
                (exSum, ex) =>
                  exSum +
                  ex.sets.filter((s) => s.is_pr_weight || s.is_pr_reps || s.is_pr_volume).length,
                0
              ),
            0
          ),
        };
      }

      return stats as {
        totalWorkouts: number;
        totalExercises: number;
        totalSets: number;
        totalWork: number;
        totalCalories: number;
        prCount: number;
      };
    } catch (error) {
      console.error("Error fetching workout stats:", error);
      throw error;
    }
  }

  /**
   * INFINITE SCROLL HELPER
   * Fetch next page of workouts
   */
  async getNextWorkoutsPage(
    userId: string,
    currentOffset: number,
    pageSize: number = 10,
    filters?: {
      startDate?: string;
      endDate?: string;
      workoutType?: string;
    }
  ) {
    return this.getWorkoutsForDisplay(userId, {
      ...filters,
      limit: pageSize,
      offset: currentOffset,
    });
  }
}

// Export singleton instance
export const workoutDisplayService = new WorkoutDisplayService();
