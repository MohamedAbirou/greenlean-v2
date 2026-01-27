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

function getSource(id: string) {
  const sources: Record<string, string> = {
    "ai-": "aiPlan",
    "manual-": "manual",
    "voice-": "voice",
  };

  for (const prefix in sources) {
    if (id.startsWith(prefix)) {
      return sources[prefix];
    }
  }

  return "search";
}

class WorkoutLoggingService {
  // Upsert exercise and get UUID
  async upsertExercise(userId: string, exercise: Exercise): Promise<string> {
    const source = getSource(exercise.id || ""); // Fallback if no id

    const { data, error } = await supabase
      .from("exercises")
      .upsert(
        {
          user_id: userId,
          name: exercise.name,
          category: exercise.category,
          muscle_group: exercise.muscle_group,
          tracking_mode: exercise.trackingMode,
          source,
        },
        { onConflict: "user_id, name, source" }
      )
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  }

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
        totalReps += set.reps ?? 0;
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
    mode: string
  ): Promise<PRDetectionResult> {
    const existingPRs = await this.getExistingPRs(userId, exerciseId);
    const typedMode = mode as ExerciseTrackingMode;

    const result: PRDetectionResult = {
      isWeightPR: false,
      isRepsPR: false,
      isVolumePR: false,
      isDurationPR: false,
      isDistancePR: false,
      previousWeightPR: existingPRs?.max_weight_kg,
      previousRepsPR: existingPRs?.max_reps,
      previousVolumePR: existingPRs?.max_volume,
      previousDurationPR: existingPRs?.best_time_seconds,
      previousDistancePR: existingPRs?.max_distance_meters,
    };

    if (sets.length === 0) return result;

    switch (typedMode) {
      case "weight-reps":
      case "reps-only":
      case "reps-per-side": {
        const maxWeight = Math.max(...sets.map((s) => s.weight_kg ?? 0));
        const maxReps = Math.max(...sets.map((s) => s.reps ?? 0));
        const maxVolume = Math.max(...sets.map((s) => calculateWork(typedMode, s)));

        result.isWeightPR = maxWeight > (existingPRs?.max_weight_kg ?? -Infinity);
        result.isRepsPR = maxReps > (existingPRs?.max_reps ?? -Infinity);
        result.isVolumePR = maxVolume > (existingPRs?.max_volume ?? -Infinity);

        if (result.isWeightPR) result.newWeightPR = maxWeight;
        if (result.isRepsPR) result.newRepsPR = maxReps;
        if (result.isVolumePR) result.newVolumePR = maxVolume;
        break;
      }

      case "duration": {
        // Higher duration is better (longer hold / more work in time)
        const maxDuration = Math.max(...sets.map((s) => s.duration_seconds ?? 0));
        result.isDurationPR = maxDuration > (existingPRs?.best_time_seconds ?? 0);
        if (result.isDurationPR) result.newDurationPR = maxDuration;
        break;
      }

      case "distance-time": {
        const maxDistance = Math.max(...sets.map((s) => s.distance_meters ?? 0));
        const minTime = Math.min(...sets.map((s) => s.duration_seconds ?? Infinity));

        result.isDistancePR = maxDistance > (existingPRs?.max_distance_meters ?? 0);
        // Lower time is better (faster for same/farther distance)
        result.isDurationPR = minTime < (existingPRs?.best_time_seconds ?? Infinity);

        if (result.isDistancePR) result.newDistancePR = maxDistance;
        if (result.isDurationPR) result.newDurationPR = minTime;
        break;
      }

      case "distance-only": {
        const maxDistance = Math.max(...sets.map((s) => s.distance_meters ?? 0));
        result.isDistancePR = maxDistance > (existingPRs?.max_distance_meters ?? 0);
        if (result.isDistancePR) result.newDistancePR = maxDistance;
        break;
      }

      case "reps-duration": {
        // Both can be PRs independently
        const maxReps = Math.max(...sets.map((s) => s.reps ?? 0));
        const maxDuration = Math.max(...sets.map((s) => s.duration_seconds ?? 0));

        result.isRepsPR = maxReps > (existingPRs?.max_reps ?? 0);
        result.isDurationPR = maxDuration > (existingPRs?.best_time_seconds ?? 0);

        if (result.isRepsPR) result.newRepsPR = maxReps;
        if (result.isDurationPR) result.newDurationPR = maxDuration;
        break;
      }

      case "amrap": {
        const maxReps = Math.max(...sets.map((s) => s.reps ?? 0));
        result.isRepsPR = maxReps > (existingPRs?.max_reps ?? 0);
        result.newRepsPR = result.isRepsPR ? maxReps : undefined;
        break;
      }

      default:
        // Unknown mode → no PR detection
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
    const typedMode = mode as ExerciseTrackingMode;

    return sets.map((set) => {
      const volume = calculateWork(typedMode, set);

      return {
        ...set,
        is_pr_weight: prDetection.isWeightPR && (set.weight_kg ?? 0) === prDetection.newWeightPR,
        is_pr_reps: prDetection.isRepsPR && (set.reps ?? 0) === prDetection.newRepsPR,
        is_pr_volume: prDetection.isVolumePR && volume === prDetection.newVolumePR,
        is_pr_duration:
          prDetection.isDurationPR && (set.duration_seconds ?? 0) === prDetection.newDurationPR,
        is_pr_distance:
          prDetection.isDistancePR && (set.distance_meters ?? 0) === prDetection.newDistancePR,
      };
    });
  }

  /**
   * Update personal records table – only update if improved
   * Uses the set that achieved the max/min value
   */
  private async updatePersonalRecords(
    userId: string,
    exerciseId: string,
    sets: ExerciseSet[],
    mode: string,
    sessionDate: string,
    setIds: string[]
  ): Promise<void> {
    if (sets.length === 0) return;

    const typedMode = mode as ExerciseTrackingMode;
    const existing = await this.getExistingPRs(userId, exerciseId);

    const prData: Partial<PersonalRecord> = {
      user_id: userId,
      exercise_id: exerciseId,
    };

    switch (typedMode) {
      case "weight-reps":
      case "reps-only":
      case "reps-per-side": {
        const maxWeightSet = sets.reduce(
          (max, s) => ((s.weight_kg ?? 0) > (max.weight_kg ?? 0) ? s : max),
          sets[0]
        );
        const maxRepsSet = sets.reduce(
          (max, s) => ((s.reps ?? 0) > (max.reps ?? 0) ? s : max),
          sets[0]
        );
        const maxVolSet = sets.reduce((max, s) => {
          const v = calculateWork(typedMode, s);
          return v > calculateWork(typedMode, max) ? s : max;
        }, sets[0]);

        const idxW = sets.indexOf(maxWeightSet);
        const idxR = sets.indexOf(maxRepsSet);
        const idxV = sets.indexOf(maxVolSet);

        // Weight
        if ((maxWeightSet.weight_kg ?? 0) > (existing?.max_weight_kg ?? -Infinity)) {
          prData.max_weight_kg = maxWeightSet.weight_kg;
          prData.max_weight_date = sessionDate;
          prData.max_weight_set_id = setIds[idxW];
        }

        // Reps
        if ((maxRepsSet.reps ?? 0) > (existing?.max_reps ?? -Infinity)) {
          prData.max_reps = maxRepsSet.reps;
          prData.max_reps_date = sessionDate;
          prData.max_reps_set_id = setIds[idxR];
        }

        // Volume
        const maxVol = calculateWork(typedMode, maxVolSet);
        if (maxVol > (existing?.max_volume ?? -Infinity)) {
          prData.max_volume = maxVol;
          prData.max_volume_date = sessionDate;
          prData.max_volume_set_id = setIds[idxV];
        }
        break;
      }

      case "duration":
      case "amrap": {
        const maxDurSet = sets.reduce(
          (max, s) => ((s.duration_seconds ?? 0) > (max.duration_seconds ?? 0) ? s : max),
          sets[0]
        );

        if ((maxDurSet.duration_seconds ?? 0) > (existing?.best_time_seconds ?? 0)) {
          prData.best_time_seconds = maxDurSet.duration_seconds!;
          prData.best_time_date = sessionDate;
        }
        break;
      }

      case "distance-time": {
        const maxDistSet = sets.reduce(
          (max, s) => ((s.distance_meters ?? 0) > (max.distance_meters ?? 0) ? s : max),
          sets[0]
        );
        const minTimeSet = sets.reduce(
          (min, s) =>
            (s.duration_seconds ?? Infinity) < (min.duration_seconds ?? Infinity) ? s : min,
          sets[0]
        );

        // Max distance
        if ((maxDistSet.distance_meters ?? 0) > (existing?.max_distance_meters ?? 0)) {
          prData.max_distance_meters = maxDistSet.distance_meters!;
          prData.max_distance_date = sessionDate;
        }

        // Best (lowest) time
        if ((minTimeSet.duration_seconds ?? Infinity) < (existing?.best_time_seconds ?? Infinity)) {
          prData.best_time_seconds = minTimeSet.duration_seconds!;
          prData.best_time_date = sessionDate;
        }
        break;
      }

      case "distance-only": {
        const maxDistSet = sets.reduce(
          (max, s) => ((s.distance_meters ?? 0) > (max.distance_meters ?? 0) ? s : max),
          sets[0]
        );

        if ((maxDistSet.distance_meters ?? 0) > (existing?.max_distance_meters ?? 0)) {
          prData.max_distance_meters = maxDistSet.distance_meters!;
          prData.max_distance_date = sessionDate;
        }
        break;
      }

      case "reps-duration": {
        const maxRepsSet = sets.reduce(
          (max, s) => ((s.reps ?? 0) > (max.reps ?? 0) ? s : max),
          sets[0]
        );
        const maxDurSet = sets.reduce(
          (max, s) => ((s.duration_seconds ?? 0) > (max.duration_seconds ?? 0) ? s : max),
          sets[0]
        );

        const idxR = sets.indexOf(maxRepsSet);

        // Max reps
        if ((maxRepsSet.reps ?? 0) > (existing?.max_reps ?? 0)) {
          prData.max_reps = maxRepsSet.reps;
          prData.max_reps_date = sessionDate;
          prData.max_reps_set_id = setIds[idxR];
        }

        // Max duration
        if ((maxDurSet.duration_seconds ?? 0) > (existing?.best_time_seconds ?? 0)) {
          prData.best_time_seconds = maxDurSet.duration_seconds!;
          prData.best_time_date = sessionDate;
        }
        break;
      }

      default:
        console.warn(`No PR logic implemented for mode: ${mode}`);
        break;
    }

    // Always upsert (insert if new, update if better or first time)
    const { error } = await supabase
      .from("exercise_personal_records")
      .upsert(prData, { onConflict: "user_id,exercise_id" });

    if (error) {
      console.error("Failed to upsert PR:", error);
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
        const mode = exercise.trackingMode || "reps-only";
        const exerciseUuid = await this.upsertExercise(input.user_id, exercise);

        const setsWithPRFlags = await this.markSetsWithPRFlags(
          input.user_id,
          exerciseUuid,
          exercise.sets,
          mode
        );

        // Prepare sets for insertion
        const setInserts = setsWithPRFlags.map((set) => ({
          workout_session_id: session.id,
          user_id: input.user_id,
          exercise_id: exerciseUuid,
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
          is_pr_duration: set.is_pr_duration,
          is_pr_distance: set.is_pr_distance,
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
          exerciseUuid,
          exercise.sets,
          mode,
          input.session_date,
          setIds
        );

        // 4. Add to exercise history
        const avgReps = exercise.sets.length
          ? Math.round(
              exercise.sets.reduce((sum, s) => sum + (s.reps ?? 0), 0) / exercise.sets.length
            )
          : 0;

        const avgWeight = exercise.sets.length
          ? exercise.sets.reduce((sum, s) => sum + (s.weight_kg ?? 0), 0) / exercise.sets.length
          : 0;

        const avgDuration = exercise.sets.length
          ? Math.round(
              exercise.sets.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) /
                exercise.sets.length
            )
          : 0;

        const avgDistance = exercise.sets.length
          ? exercise.sets.reduce((sum, s) => sum + (s.distance_meters ?? 0), 0) /
            exercise.sets.length
          : 0;

        const historyData: Partial<ExerciseHistoryRecord> = {
          user_id: input.user_id,
          exercise_id: exerciseUuid,
          workout_session_id: session.id,
          exercise_name: exercise.name,
          sets: exercise.sets.length,
          reps: avgReps,
          weight_kg: avgWeight,
          duration_seconds: avgDuration,
          distance_meters: avgDistance,
          notes: exercise.notes,
          completed_at: input.session_date,
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

  // Recalculate PR for an exercise/user (scan sets, find new maxes)
  private async recalculatePR(userId: string, exerciseId: string): Promise<void> {
    const { data: sets, error } = await supabase
      .from("exercise_sets")
      .select("*")
      .eq("user_id", userId)
      .eq("exercise_id", exerciseId)
      .order("created_at", { ascending: false });

    if (error || !sets?.length) {
      await supabase
        .from("exercise_personal_records")
        .delete()
        .eq("user_id", userId)
        .eq("exercise_id", exerciseId);
      return;
    }

    const mode = sets[0].tracking_mode;
    // const prDetection = await this.detectPRs(userId, exerciseId, sets, mode);
    const setIds = sets.map((s) => s.id);
    await this.updatePersonalRecords(
      userId,
      exerciseId,
      sets,
      mode,
      sets[0].created_at.split("T")[0],
      setIds
    );
  }

  //* Deletion Methods
  async deleteSet(setId: string): Promise<void> {
    const { data: set, error: fetchErr } = await supabase
      .from("exercise_sets")
      .select("user_id, exercise_id")
      .eq("id", setId)
      .single();
    if (fetchErr) throw fetchErr;

    await supabase.from("exercise_sets").delete().eq("id", setId);

    await this.recalculatePR(set.user_id, set.exercise_id);
  }

  async deleteExercise(sessionId: string, exerciseId: string): Promise<void> {
    const { data: sets, error: fetchErr } = await supabase
      .from("exercise_sets")
      .select("id, user_id")
      .eq("workout_session_id", sessionId)
      .eq("exercise_id", exerciseId);
    if (fetchErr) throw fetchErr;

    await supabase
      .from("exercise_sets")
      .delete()
      .eq("workout_session_id", sessionId)
      .eq("exercise_id", exerciseId);

    await supabase
      .from("workout_exercise_history")
      .delete()
      .eq("workout_session_id", sessionId)
      .eq("exercise_id", exerciseId);

    if (sets.length) await this.recalculatePR(sets[0].user_id, exerciseId);
  }

  async deleteWorkout(sessionId: string): Promise<void> {
    const { data: session, error: fetchErr } = await supabase
      .from("workout_sessions")
      .select("user_id")
      .eq("id", sessionId)
      .single();
    if (fetchErr) throw fetchErr;

    const { data: sessionSets } = await supabase
      .from("exercise_sets")
      .select("exercise_id")
      .eq("workout_session_id", sessionId);

    const uniqueExerciseIds = [...new Set(sessionSets?.map((s) => s.exercise_id) || [])];

    await supabase.from("workout_sessions").delete().eq("id", sessionId);

    for (const exId of uniqueExerciseIds) {
      await this.recalculatePR(session.user_id, exId);
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
