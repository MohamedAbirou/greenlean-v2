/**
 * Complete Workout Logging Service
 * Handles workout sessions, exercise sets, PR detection, and history tracking
 */

import { supabase } from "@/lib/supabase";
import type {
  Exercise,
  ExerciseHistoryRecord,
  ExerciseSet,
  LogWorkoutInput,
  PersonalRecord,
  PRDetectionResult,
  SetWithPRFlags,
  WorkoutSession,
  WorkoutStats,
} from "@/shared/types/workout";
import {
  calculateWork,
  getConfigForMode,
  type ExerciseTrackingMode,
} from "../utils/exerciseTypeConfig";

class WorkoutLoggingService {
  /**
   * Calculate workout statistics
   */
  calculateStats(exercises: Exercise[]): WorkoutStats {
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    exercises.forEach((exercise) => {
      const mode = exercise.trackingMode;
      if (!mode) return;
      const config = getConfigForMode(mode);

      exercise.sets.forEach((set) => {
        totalSets++;
        totalReps += set.reps;
        totalVolume += calculateWork(config.mode, set);
      });
    });

    const estimatedDuration = Math.max(totalSets * 3 + 10, 15);
    const estimatedCalories = Math.round(estimatedDuration * 6);

    return {
      totalExercises: exercises.length,
      totalSets,
      totalReps,
      totalVolume,
      estimatedDuration,
      estimatedCalories,
    };
  }

  /**
   * Get existing PRs for an exercise
   */
  private async getExistingPRs(userId: string, exerciseId: string): Promise<PersonalRecord | null> {
    const { data, error } = await supabase
      .from("exercise_personal_records")
      .select("*")
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching PRs:", error);
      return null;
    }

    return data;
  }

  /**
   * Detect if current sets contain any PRs
   * Generalized for different modes
   */
  private async detectPRs(
    userId: string,
    exerciseId: string,
    sets: ExerciseSet[],
    mode: string // ExerciseTrackingMode as string
  ): Promise<PRDetectionResult> {
    const existingPRs = await this.getExistingPRs(userId, exerciseId);
    const typedMode = mode as ExerciseTrackingMode;

    // Base results
    const result: PRDetectionResult = {
      isWeightPR: false,
      isRepsPR: false,
      isVolumePR: false,
      isDurationPR: false, // Added for duration-based
      isDistancePR: false, // Added for distance-based
      previousWeightPR: existingPRs?.max_weight_kg,
      previousRepsPR: existingPRs?.max_reps,
      previousVolumePR: existingPRs?.max_volume_kg,
      previousDurationPR: existingPRs?.best_time_seconds, // Repurposed for max duration in endurance
      previousDistancePR: existingPRs?.max_distance_meters,
    };

    switch (typedMode) {
      case "weight-reps":
      case "reps-only": {
        const maxWeight = Math.max(...sets.map((s) => s.weight_kg ?? 0));
        const maxReps = Math.max(...sets.map((s) => s.reps ?? 0));
        const maxVolume = Math.max(...sets.map((s) => (s.reps ?? 0) * (s.weight_kg ?? 0)));

        result.isWeightPR = maxWeight > (existingPRs?.max_weight_kg ?? 0);
        result.isRepsPR = maxReps > (existingPRs?.max_reps ?? 0);
        result.isVolumePR = maxVolume > (existingPRs?.max_volume_kg ?? 0);
        result.newWeightPR = result.isWeightPR ? maxWeight : undefined;
        result.newRepsPR = result.isRepsPR ? maxReps : undefined;
        result.newVolumePR = result.isVolumePR ? maxVolume : undefined;
        break;
      }

      case "duration": {
        const maxDuration = Math.max(...sets.map((s) => s.duration_seconds ?? 0));
        result.isDurationPR = maxDuration > (existingPRs?.best_time_seconds ?? 0);
        result.newDurationPR = result.isDurationPR ? maxDuration : undefined;
        break;
      }

      case "distance-time": {
        const maxDistance = Math.max(...sets.map((s) => s.distance_meters ?? 0));
        const minTime = Math.min(...sets.map((s) => s.duration_seconds ?? Infinity));
        result.isDistancePR = maxDistance > (existingPRs?.max_distance_meters ?? 0);
        result.isDurationPR = minTime < (existingPRs?.best_time_seconds ?? Infinity); // Min time better
        result.newDistancePR = result.isDistancePR ? maxDistance : undefined;
        result.newDurationPR = result.isDurationPR ? minTime : undefined;
        break;
      }

      case "distance-only": {
        const maxDistance = Math.max(...sets.map((s) => s.distance_meters ?? 0));
        result.isDistancePR = maxDistance > (existingPRs?.max_distance_meters ?? 0);
        result.newDistancePR = result.isDistancePR ? maxDistance : undefined;
        break;
      }

      case "reps-duration":
      case "amrap": {
        const maxReps = Math.max(...sets.map((s) => s.reps ?? 0));
        result.isRepsPR = maxReps > (existingPRs?.max_reps ?? 0);
        result.newRepsPR = result.isRepsPR ? maxReps : undefined;
        break;
      }

      // Add cases for other modes as needed
      default:
        break;
    }

    return result;
  }

  /**
   * Mark sets with PR flags
   * Generalized
   */
  private async markSetsWithPRFlags(
    userId: string,
    exerciseId: string,
    sets: ExerciseSet[],
    mode: string
  ): Promise<SetWithPRFlags[]> {
    const prDetection = await this.detectPRs(userId, exerciseId, sets, mode);

    return sets.map((set) => {
      const volume = (set.reps ?? 0) * (set.weight_kg ?? 0);

      return {
        ...set,
        is_pr_weight: prDetection.isWeightPR && (set.weight_kg ?? 0) === prDetection.newWeightPR,
        is_pr_reps: prDetection.isRepsPR && (set.reps ?? 0) === prDetection.newRepsPR,
        is_pr_volume: prDetection.isVolumePR && volume === prDetection.newVolumePR,
        is_pr_duration:
          prDetection.isDurationPR && (set.duration_seconds ?? 0) === prDetection.newDurationPR, // Added
        is_pr_distance:
          prDetection.isDistancePR && (set.distance_meters ?? 0) === prDetection.newDistancePR, // Added
      };
    });
  }

  /**
   * Update personal records
   * Generalized for modes
   */
  private async updatePersonalRecords(
    userId: string,
    exerciseId: string,
    sets: ExerciseSet[],
    mode: string,
    sessionDate: string,
    setIds: string[]
  ): Promise<void> {
    const typedMode = mode as ExerciseTrackingMode;
    const existingPR = await this.getExistingPRs(userId, exerciseId);

    const prData: Partial<PersonalRecord> = {
      user_id: userId,
      exercise_id: exerciseId,
    };

    switch (typedMode) {
      case "weight-reps":
      case "reps-only": {
        const maxWeightSet = sets.reduce(
          (max, set) => ((set.weight_kg ?? 0) > (max.weight_kg ?? 0) ? set : max),
          sets[0]
        );
        const maxRepsSet = sets.reduce(
          (max, set) => ((set.reps ?? 0) > (max.reps ?? 0) ? set : max),
          sets[0]
        );
        const maxVolumeSet = sets.reduce((max, set) => {
          const maxVol = (max.reps ?? 0) * (max.weight_kg ?? 0);
          const setVol = (set.reps ?? 0) * (set.weight_kg ?? 0);
          return setVol > maxVol ? set : max;
        }, sets[0]);

        const maxWeightIdx = sets.indexOf(maxWeightSet);
        const maxRepsIdx = sets.indexOf(maxRepsSet);
        const maxVolumeIdx = sets.indexOf(maxVolumeSet);

        // Weight PR
        if ((maxWeightSet.weight_kg ?? 0) > (existingPR?.max_weight_kg ?? 0)) {
          prData.max_weight_kg = maxWeightSet.weight_kg;
          prData.max_weight_date = sessionDate;
          prData.max_weight_set_id = setIds[maxWeightIdx];
        } else if (existingPR) {
          prData.max_weight_kg = existingPR.max_weight_kg;
          prData.max_weight_date = existingPR.max_weight_date;
          prData.max_weight_set_id = existingPR.max_weight_set_id;
        }

        // Reps PR
        if ((maxRepsSet.reps ?? 0) > (existingPR?.max_reps ?? 0)) {
          prData.max_reps = maxRepsSet.reps;
          prData.max_reps_date = sessionDate;
          prData.max_reps_set_id = setIds[maxRepsIdx];
        } else if (existingPR) {
          prData.max_reps = existingPR.max_reps;
          prData.max_reps_date = existingPR.max_reps_date;
          prData.max_reps_set_id = existingPR.max_reps_set_id;
        }

        // Volume PR
        const maxVolume = (maxVolumeSet.reps ?? 0) * (maxVolumeSet.weight_kg ?? 0);
        if (maxVolume > (existingPR?.max_volume_kg ?? 0)) {
          prData.max_volume_kg = maxVolume;
          prData.max_volume_date = sessionDate;
          prData.max_volume_set_id = setIds[maxVolumeIdx];
        } else if (existingPR) {
          prData.max_volume_kg = existingPR.max_volume_kg;
          prData.max_volume_date = existingPR.max_volume_date;
          prData.max_volume_set_id = existingPR.max_volume_set_id;
        }
        break;
      }

      case "duration": {
        const maxDurationSet = sets.reduce(
          (max, set) => ((set.duration_seconds ?? 0) > (max.duration_seconds ?? 0) ? set : max),
          sets[0]
        );
        if ((maxDurationSet.duration_seconds ?? 0) > (existingPR?.best_time_seconds ?? 0)) {
          prData.best_time_seconds = maxDurationSet.duration_seconds!;
          prData.best_time_date = sessionDate;
          prData.best_1rm_kg = undefined; // Reuse if needed, but clear
        } else if (existingPR) {
          prData.best_time_seconds = existingPR.best_time_seconds;
          prData.best_time_date = existingPR.best_time_date;
        }
        break;
      }

      case "distance-time": {
        const maxDistanceSet = sets.reduce(
          (max, set) => ((set.distance_meters ?? 0) > (max.distance_meters ?? 0) ? set : max),
          sets[0]
        );
        const minTimeSet = sets.reduce(
          (max, set) =>
            (set.duration_seconds ?? Infinity) < (max.duration_seconds ?? Infinity) ? set : max,
          sets[0]
        );

        if ((maxDistanceSet.distance_meters ?? 0) > (existingPR?.max_distance_meters ?? 0)) {
          prData.max_distance_meters = maxDistanceSet.distance_meters!;
          prData.max_distance_date = sessionDate;
        } else if (existingPR) {
          prData.max_distance_meters = existingPR.max_distance_meters;
          prData.max_distance_date = existingPR.max_distance_date;
        }

        if (
          (minTimeSet.duration_seconds ?? Infinity) < (existingPR?.best_time_seconds ?? Infinity)
        ) {
          prData.best_time_seconds = minTimeSet.duration_seconds!;
          prData.best_time_date = sessionDate;
        } else if (existingPR) {
          prData.best_time_seconds = existingPR.best_time_seconds;
          prData.best_time_date = existingPR.best_time_date;
        }
        break;
      }

      // Add similar logic for other modes

      default:
        break;
    }

    // Upsert PR record
    const { error } = await supabase.from("exercise_personal_records").upsert(prData, {
      onConflict: "user_id,exercise_id",
    });

    if (error) {
      console.error("Error updating PRs:", error);
    }
  }

  /**
   * Log complete workout session
   */
  async logWorkout(input: LogWorkoutInput): Promise<{
    success: boolean;
    sessionId?: string;
    stats?: WorkoutStats;
    error?: any;
  }> {
    try {
      const stats = this.calculateStats(input.exercises);

      // 1. Create workout session
      const sessionData: Partial<WorkoutSession> = {
        user_id: input.user_id,
        session_date: input.session_date,
        session_start_time: new Date(Date.now() - stats.estimatedDuration * 60_000).toISOString(),
        session_end_time: new Date().toISOString(),
        workout_name: input.workout_name || input.workout_type,
        workout_type: input.workout_type,
        workout_plan_id: input.workout_plan_id,
        from_ai_plan: input.from_ai_plan || false,
        plan_day_name: input.plan_day_name,
        total_exercises: stats.totalExercises,
        total_sets: stats.totalSets,
        total_reps: stats.totalReps,
        total_volume_kg: stats.totalVolume,
        calories_burned: input.calories_burned || stats.estimatedCalories,
        status: "completed",
        notes: input.notes,
      };

      const { data: session, error: sessionError } = await supabase
        .from("workout_sessions")
        .insert(sessionData)
        .select("id")
        .single();

      if (sessionError) throw sessionError;

      // 2. Insert exercise sets with PR detection
      for (const exercise of input.exercises) {
        const mode = exercise.trackingMode || "reps-only"; // Fallback

        // Mark sets with PR flags
        const setsWithPRFlags = await this.markSetsWithPRFlags(
          input.user_id,
          exercise.id,
          exercise.sets,
          mode
        );

        // Prepare sets for insertion
        const setInserts = setsWithPRFlags.map((set) => ({
          workout_session_id: session.id,
          user_id: input.user_id,
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          exercise_category: exercise.category,
          set_number: set.set_number,
          reps: set.reps,
          weight_kg: set.weight_kg,
          duration_seconds: set.duration_seconds,
          distance_meters: set.distance_meters,
          rpe: set.rpe,
          rest_seconds: set.rest_seconds,
          tempo: set.tempo,
          is_warmup: set.is_warmup || false,
          is_dropset: set.is_dropset || false,
          is_failure: set.is_failure || false,
          is_pr_weight: set.is_pr_weight,
          is_pr_reps: set.is_pr_reps,
          is_pr_volume: set.is_pr_volume,
          notes: set.notes,
          tracking_mode: mode,
        }));

        // Insert sets
        const { data: insertedSets, error: setsError } = await supabase
          .from("exercise_sets")
          .insert(setInserts)
          .select("id");

        if (setsError) throw setsError;

        // 3. Update personal records
        const setIds = insertedSets.map((s) => s.id);
        await this.updatePersonalRecords(
          input.user_id,
          exercise.id,
          exercise.sets,
          mode,
          input.session_date,
          setIds
        );

        // 4. Add to exercise history
        const avgWeight =
          exercise.sets.reduce((sum, s) => sum + s.weight_kg, 0) / exercise.sets.length;
        const avgReps = Math.round(
          exercise.sets.reduce((sum, s) => sum + s.reps, 0) / exercise.sets.length
        );
        const avgDuration =
          exercise.sets.reduce((sum, s) => sum + s.duration_seconds!, 0) / exercise.sets.length;
        const avgDistance =
          exercise.sets.reduce((sum, s) => sum + s.distance_meters!, 0) / exercise.sets.length;

        const historyData: Partial<ExerciseHistoryRecord> = {
          user_id: input.user_id,
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          sets: exercise.sets.length,
          reps: avgReps,
          weight_kg: avgWeight,
          duration_seconds: avgDuration,
          distance_meters: avgDistance,
          notes: exercise.notes,
          completed_at: new Date().toISOString(),
        };

        await supabase.from("workout_exercise_history").insert(historyData);
      }

      // 5. Update workout streak
      await supabase.rpc("update_user_streak", {
        p_user_id: input.user_id,
        p_streak_type: "workout_logging",
        p_log_date: input.session_date,
      });

      return {
        success: true,
        sessionId: session.id,
        stats,
      };
    } catch (error) {
      console.error("Error logging workout:", error);
      return { success: false, error };
    }
  }

  /**
   * Get exercise history for a user
   */
  async getExerciseHistory(
    userId: string,
    exerciseId: string,
    limit: number = 10
  ): Promise<ExerciseHistoryRecord[]> {
    const { data, error } = await supabase
      .from("workout_exercise_history")
      .select("*")
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId)
      .order("completed_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching exercise history:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get personal records for an exercise
   */
  async getPersonalRecords(userId: string, exerciseId: string): Promise<PersonalRecord | null> {
    return this.getExistingPRs(userId, exerciseId);
  }

  /**
   * Get all workout sessions
   */
  async getWorkoutSessions(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number = 50
  ): Promise<WorkoutSession[]> {
    const { data, error } = await supabase
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching workout sessions:", error);
      return [];
    }

    return data || [];
  }

  /**
   * Get exercise sets for a workout session
   */
  async getExerciseSets(sessionId: string): Promise<ExerciseSet[]> {
    const { data, error } = await supabase
      .from("exercise_sets")
      .select("*")
      .eq("workout_session_id", sessionId)
      .order("set_number", { ascending: true });

    if (error) {
      console.error("Error fetching exercise sets:", error);
      return [];
    }

    return data || [];
  }
}

export const workoutLoggingService = new WorkoutLoggingService();
