/**
 * Complete Workout Tracking Service
 * Production-ready with time-proof data access and scaling
 */

import { supabase } from '@/lib/supabase';

export interface ExerciseSet {
  exercise_id?: string;
  exercise_name: string;
  exercise_category?: string;
  set_number: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  distance_meters?: number;
  rpe?: number;
  rest_seconds?: number;
  tempo?: string;
  is_warmup?: boolean;
  is_dropset?: boolean;
  is_failure?: boolean;
  notes?: string;
}

export interface WorkoutSession {
  id?: string;
  user_id: string;
  session_date: string;
  session_start_time?: string;
  session_end_time?: string;
  workout_name: string;
  workout_type: 'strength' | 'cardio' | 'flexibility' | 'sports' | 'hybrid' | 'other';
  workout_plan_id?: string;
  from_ai_plan?: boolean;
  plan_day_name?: string;
  location?: 'gym' | 'home' | 'outdoor' | 'other';
  weather?: string;
  difficulty_rating?: number;
  energy_level?: number;
  mood_after?: 'great' | 'good' | 'neutral' | 'tired' | 'frustrated';
  status?: 'planned' | 'in_progress' | 'completed' | 'skipped' | 'failed';
  skip_reason?: string;
  notes?: string;
}

export interface CardioSession {
  workout_session_id?: string;
  user_id: string;
  session_date: string;
  activity_type: 'running' | 'cycling' | 'swimming' | 'rowing' | 'walking' | 'hiking' | 'elliptical' | 'stair_climber' | 'jump_rope' | 'other';
  duration_minutes?: number;
  distance_meters?: number;
  calories_burned?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  avg_pace_per_km?: string;
  avg_speed_kmh?: number;
  zone1_minutes?: number;
  zone2_minutes?: number;
  zone3_minutes?: number;
  zone4_minutes?: number;
  zone5_minutes?: number;
  route_name?: string;
  elevation_gain_meters?: number;
  weather_conditions?: string;
  notes?: string;
}

export interface WorkoutTemplate {
  name: string;
  description?: string;
  workout_type: string;
  exercises: any[];
  estimated_duration_minutes?: number;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
  is_favorite?: boolean;
}

class WorkoutTrackingService {
  /**
   * Log a complete workout session with exercises
   * TIME-PROOF: All sessions are date-stamped
   * SCALING-PROOF: Batch insert with proper indexing
   */
  async logWorkoutSession(
    session: WorkoutSession,
    exercises: ExerciseSet[]
  ): Promise<{ success: boolean; sessionId?: string; error?: any }> {
    try {
      // 1. Create workout session
      const { data: workoutSession, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: session.user_id,
          session_date: session.session_date,
          session_start_time: session.session_start_time,
          session_end_time: session.session_end_time,
          workout_name: session.workout_name,
          workout_type: session.workout_type,
          workout_plan_id: session.workout_plan_id,
          from_ai_plan: session.from_ai_plan || false,
          plan_day_name: session.plan_day_name,
          location: session.location,
          weather: session.weather,
          difficulty_rating: session.difficulty_rating,
          energy_level: session.energy_level,
          mood_after: session.mood_after,
          status: session.status || 'completed',
          skip_reason: session.skip_reason,
          notes: session.notes,
        })
        .select('id')
        .single();

      if (sessionError) throw sessionError;

      // 2. Insert all exercise sets (batch insert for performance)
      if (exercises.length > 0) {
        const exerciseSets = exercises.map(set => ({
          workout_session_id: workoutSession.id,
          user_id: session.user_id,
          exercise_id: set.exercise_id,
          exercise_name: set.exercise_name,
          exercise_category: set.exercise_category,
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
          notes: set.notes,
        }));

        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(exerciseSets);

        if (setsError) throw setsError;
      }

      // 3. Update workout streak
      await supabase.rpc('update_user_streak', {
        p_user_id: session.user_id,
        p_streak_type: 'workout_logging',
        p_log_date: session.session_date,
      });

      return { success: true, sessionId: workoutSession.id };
    } catch (error) {
      console.error('Error logging workout session:', error);
      return { success: false, error };
    }
  }

  /**
   * Log cardio session
   */
  async logCardioSession(
    cardio: CardioSession,
    linkedSessionId?: string
  ): Promise<{ success: boolean; sessionId?: string; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('cardio_sessions')
        .insert({
          workout_session_id: linkedSessionId,
          user_id: cardio.user_id,
          session_date: cardio.session_date,
          activity_type: cardio.activity_type,
          duration_minutes: cardio.duration_minutes,
          distance_meters: cardio.distance_meters,
          calories_burned: cardio.calories_burned,
          avg_heart_rate: cardio.avg_heart_rate,
          max_heart_rate: cardio.max_heart_rate,
          avg_pace_per_km: cardio.avg_pace_per_km,
          avg_speed_kmh: cardio.avg_speed_kmh,
          zone1_minutes: cardio.zone1_minutes,
          zone2_minutes: cardio.zone2_minutes,
          zone3_minutes: cardio.zone3_minutes,
          zone4_minutes: cardio.zone4_minutes,
          zone5_minutes: cardio.zone5_minutes,
          route_name: cardio.route_name,
          elevation_gain_meters: cardio.elevation_gain_meters,
          weather_conditions: cardio.weather_conditions,
          notes: cardio.notes,
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, sessionId: data.id };
    } catch (error) {
      console.error('Error logging cardio session:', error);
      return { success: false, error };
    }
  }

  /**
   * Get workout sessions for date range
   * TIME-PROOF: Query by date range
   * SCALING-PROOF: Pagination with offset/limit
   */
  async getWorkoutSessions(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        exercise_sets (*)
      `)
      .eq('user_id', userId)
      .gte('session_date', startDate)
      .lte('session_date', endDate)
      .order('session_date', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching workout sessions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get workout history (alias for getWorkoutSessions with success/data format)
   * Returns data in {success, data} format for consistency
   */
  async getWorkoutHistory(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ success: boolean; data?: any[]; error?: any }> {
    try {
      const data = await this.getWorkoutSessions(userId, startDate, endDate, limit, offset);
      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Get workout session by ID with full details
   */
  async getWorkoutSession(sessionId: string): Promise<any> {
    const { data, error } = await supabase
      .from('workout_sessions')
      .select(`
        *,
        exercise_sets (*)
      `)
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error fetching workout session:', error);
      return null;
    }

    return data;
  }

  /**
   * Get exercise sets for a session
   */
  async getExerciseSets(sessionId: string): Promise<ExerciseSet[]> {
    const { data, error } = await supabase
      .from('exercise_sets')
      .select('*')
      .eq('workout_session_id', sessionId)
      .order('set_number', { ascending: true });

    if (error) {
      console.error('Error fetching exercise sets:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get personal records for a user
   */
  async getPersonalRecords(
    userId: string,
    exerciseId?: string
  ): Promise<any[]> {
    let query = supabase
      .from('exercise_personal_records')
      .select('*, exercise_library(*)')
      .eq('user_id', userId);

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching personal records:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get workout plan adherence
   * TIME-PROOF: Weekly tracking over any time range
   */
  async getWorkoutPlanAdherence(
    userId: string,
    planId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('workout_plan_adherence')
      .select('*')
      .eq('user_id', userId)
      .eq('workout_plan_id', planId)
      .gte('tracking_week_start', startDate)
      .lte('tracking_week_start', endDate)
      .order('tracking_week_start', { ascending: false });

    if (error) {
      console.error('Error fetching workout plan adherence:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Save workout template
   */
  async saveWorkoutTemplate(
    userId: string,
    template: WorkoutTemplate
  ): Promise<{ success: boolean; templateId?: string; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .insert({
          user_id: userId,
          name: template.name,
          description: template.description,
          workout_type: template.workout_type,
          exercises: template.exercises,
          estimated_duration_minutes: template.estimated_duration_minutes,
          difficulty_level: template.difficulty_level,
          is_favorite: template.is_favorite || false,
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, templateId: data.id };
    } catch (error) {
      console.error('Error saving workout template:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user's workout templates
   */
  async getWorkoutTemplates(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .eq('user_id', userId)
      .order('is_favorite', { ascending: false })
      .order('times_used', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching workout templates:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get cardio sessions for date range
   */
  async getCardioSessions(
    userId: string,
    startDate: string,
    endDate: string,
    activityType?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    let query = supabase
      .from('cardio_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('session_date', startDate)
      .lte('session_date', endDate);

    if (activityType) {
      query = query.eq('activity_type', activityType);
    }

    const { data, error } = await query
      .order('session_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching cardio sessions:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get performance metrics for an exercise over time
   * TIME-PROOF: Track progression across any date range
   */
  async getPerformanceMetrics(
    userId: string,
    exerciseId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (error) {
      console.error('Error fetching performance metrics:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Delete workout session
   */
  async deleteWorkoutSession(sessionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('workout_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting workout session:', error);
      return false;
    }

    return true;
  }

  /**
   * Update workout session
   */
  async updateWorkoutSession(
    sessionId: string,
    updates: Partial<WorkoutSession>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('workout_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating workout session:', error);
      return false;
    }

    return true;
  }

  /**
   * Toggle workout template favorite
   */
  async toggleTemplateFavorite(
    templateId: string,
    isFavorite: boolean
  ): Promise<boolean> {
    const { error } = await supabase
      .from('workout_templates')
      .update({ is_favorite: isFavorite })
      .eq('id', templateId);

    return !error;
  }
}

export const workoutTrackingService = new WorkoutTrackingService();
