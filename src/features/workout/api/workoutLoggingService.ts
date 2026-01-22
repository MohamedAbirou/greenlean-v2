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

class WorkoutLoggingService {
  /**
   * Calculate workout statistics
   */
  calculateStats(exercises: Exercise[]): WorkoutStats {
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;

    exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        totalSets++;
        totalReps += set.reps;
        totalVolume += set.reps * set.weight_kg;
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
   */
  private async detectPRs(
    userId: string,
    exerciseId: string,
    sets: ExerciseSet[]
  ): Promise<PRDetectionResult> {
    const existingPRs = await this.getExistingPRs(userId, exerciseId);

    // Calculate current session bests
    const maxWeight = Math.max(...sets.map((s) => s.weight_kg));
    const maxReps = Math.max(...sets.map((s) => s.reps));
    const maxVolume = Math.max(...sets.map((s) => s.reps * s.weight_kg));

    // Check for PRs
    const isWeightPR = !existingPRs || maxWeight > (existingPRs.max_weight_kg || 0);
    const isRepsPR = !existingPRs || maxReps > (existingPRs.max_reps || 0);
    const isVolumePR = !existingPRs || maxVolume > (existingPRs.max_volume_kg || 0);

    return {
      isWeightPR,
      isRepsPR,
      isVolumePR,
      previousWeightPR: existingPRs?.max_weight_kg,
      previousRepsPR: existingPRs?.max_reps,
      previousVolumePR: existingPRs?.max_volume_kg,
      newWeightPR: isWeightPR ? maxWeight : undefined,
      newRepsPR: isRepsPR ? maxReps : undefined,
      newVolumePR: isVolumePR ? maxVolume : undefined,
    };
  }

  /**
   * Mark sets with PR flags
   */
  private async markSetsWithPRFlags(
    userId: string,
    exerciseId: string,
    sets: ExerciseSet[]
  ): Promise<SetWithPRFlags[]> {
    const prDetection = await this.detectPRs(userId, exerciseId, sets);

    return sets.map((set) => {
      const volume = set.reps * set.weight_kg;

      return {
        ...set,
        is_pr_weight: prDetection.isWeightPR && set.weight_kg === prDetection.newWeightPR!,
        is_pr_reps: prDetection.isRepsPR && set.reps === prDetection.newRepsPR!,
        is_pr_volume: prDetection.isVolumePR && volume === prDetection.newVolumePR!,
      };
    });
  }

  /**
   * Update personal records
   */
  private async updatePersonalRecords(
    userId: string,
    exerciseId: string,
    sets: ExerciseSet[],
    sessionDate: string,
    setIds: string[]
  ): Promise<void> {
    const maxWeightSet = sets.reduce((max, set) => (set.weight_kg > max.weight_kg ? set : max));
    const maxRepsSet = sets.reduce((max, set) => (set.reps > max.reps ? set : max));
    const maxVolumeSet = sets.reduce((max, set) => {
      const maxVol = max.reps * max.weight_kg;
      const setVol = set.reps * set.weight_kg;
      return setVol > maxVol ? set : max;
    });

    const maxWeightIdx = sets.indexOf(maxWeightSet);
    const maxRepsIdx = sets.indexOf(maxRepsSet);
    const maxVolumeIdx = sets.indexOf(maxVolumeSet);

    const existingPR = await this.getExistingPRs(userId, exerciseId);

    const prData: Partial<PersonalRecord> = {
      user_id: userId,
      exercise_id: exerciseId,
    };

    // Update weight PR if better
    if (!existingPR || maxWeightSet.weight_kg > (existingPR.max_weight_kg || 0)) {
      prData.max_weight_kg = maxWeightSet.weight_kg;
      prData.max_weight_date = sessionDate;
      prData.max_weight_set_id = setIds[maxWeightIdx];
    } else if (existingPR) {
      prData.max_weight_kg = existingPR.max_weight_kg;
      prData.max_weight_date = existingPR.max_weight_date;
      prData.max_weight_set_id = existingPR.max_weight_set_id;
    }

    // Update reps PR if better
    if (!existingPR || maxRepsSet.reps > (existingPR.max_reps || 0)) {
      prData.max_reps = maxRepsSet.reps;
      prData.max_reps_date = sessionDate;
      prData.max_reps_set_id = setIds[maxRepsIdx];
    } else if (existingPR) {
      prData.max_reps = existingPR.max_reps;
      prData.max_reps_date = existingPR.max_reps_date;
      prData.max_reps_set_id = existingPR.max_reps_set_id;
    }

    // Update volume PR if better
    const maxVolume = maxVolumeSet.reps * maxVolumeSet.weight_kg;
    if (!existingPR || maxVolume > (existingPR.max_volume_kg || 0)) {
      prData.max_volume_kg = maxVolume;
      prData.max_volume_date = sessionDate;
      prData.max_volume_set_id = setIds[maxVolumeIdx];
    } else if (existingPR) {
      prData.max_volume_kg = existingPR.max_volume_kg;
      prData.max_volume_date = existingPR.max_volume_date;
      prData.max_volume_set_id = existingPR.max_volume_set_id;
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
        // Mark sets with PR flags
        const setsWithPRFlags = await this.markSetsWithPRFlags(
          input.user_id,
          exercise.id,
          exercise.sets
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
          input.session_date,
          setIds
        );

        // 4. Add to exercise history
        const avgWeight =
          exercise.sets.reduce((sum, s) => sum + s.weight_kg, 0) / exercise.sets.length;
        const avgReps = Math.round(
          exercise.sets.reduce((sum, s) => sum + s.reps, 0) / exercise.sets.length
        );

        const historyData: Partial<ExerciseHistoryRecord> = {
          user_id: input.user_id,
          exercise_id: exercise.id,
          exercise_name: exercise.name,
          sets: exercise.sets.length,
          reps: avgReps,
          weight_kg: avgWeight,
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
