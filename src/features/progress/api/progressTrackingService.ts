/**
 * Complete Progress Tracking Service
 * TIME-PROOF: Full historical data access with date range queries
 * SCALING-PROOF: Efficient pagination and batching
 */

import { supabase } from '@/lib/supabase';

export interface BodyMeasurement {
  user_id: string;
  measurement_date: string;
  weight_kg: number;
  body_fat_percentage?: number;
  waist_cm?: number;
  hips_cm?: number;
  notes?: string;
}

export interface ProgressMilestone {
  user_id: string;
  milestone_type: 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'fat_loss' | 'strength_pr' | 'endurance_milestone' | 'consistency_streak' | 'nutrition_goal' | 'custom';
  milestone_name: string;
  description?: string;
  target_value?: number;
  achieved_value?: number;
  unit?: string;
  status?: 'in_progress' | 'achieved' | 'missed' | 'canceled';
  target_date?: string;
  achieved_date?: string;
  points_awarded?: number;
}

export interface JourneyEvent {
  user_id: string;
  event_date: string;
  event_type: string;
  title: string;
  description?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  event_data?: any;
  visibility?: 'private';
  is_highlighted?: boolean;
  user_notes?: string;
}

export interface ComparisonSnapshot {
  user_id: string;
  snapshot_name: string;
  snapshot_type?: 'manual' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  starting_weight_kg?: number;
  ending_weight_kg?: number;
  starting_body_fat?: number;
  ending_body_fat?: number;
  starting_muscle_mass?: number;
  ending_muscle_mass?: number;
  measurements_comparison?: any;
  workouts_completed?: number;
  meals_logged?: number;
  prs_achieved?: number;
  notes?: string;
}

class ProgressTrackingService {
  /**
   * Log body measurement
   * TIME-PROOF: Date-stamped measurements for historical tracking
   */
  async logBodyMeasurement(
    measurement: BodyMeasurement
  ): Promise<{ success: boolean; measurementId?: string; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('body_measurements_simple')
        .insert({
          user_id: measurement.user_id,
          measurement_date: measurement.measurement_date,
          weight_kg: measurement.weight_kg,
          body_fat_percentage: measurement.body_fat_percentage,
          waist_cm: measurement.waist_cm,
          hips_cm: measurement.hips_cm,
          notes: measurement.notes,
        })
        .select('id')
        .single();

      if (error) throw error;

      // Update profile with latest weight
      await supabase
        .from('profiles')
        .update({ weight: measurement.weight_kg })
        .eq('id', measurement.user_id);

      return { success: true, measurementId: data.id };
    } catch (error) {
      console.error('Error logging body measurement:', error);
      return { success: false, error };
    }
  }

  /**
   * Get body measurements for date range
   * TIME-PROOF: Query any historical period
   * SCALING-PROOF: Pagination support
   */
  async getBodyMeasurements(
    userId: string,
    startDate: string,
    endDate: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('body_measurements_simple')
      .select('*')
      .eq('user_id', userId)
      .gte('measurement_date', startDate)
      .lte('measurement_date', endDate)
      .order('measurement_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching body measurements:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get latest body measurement
   */
  async getLatestMeasurement(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('body_measurements_simple')
      .select('*')
      .eq('user_id', userId)
      .order('measurement_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest measurement:', error);
      return null;
    }

    return data;
  }

  /**
   * Create progress milestone
   */
  async createMilestone(
    milestone: ProgressMilestone
  ): Promise<{ success: boolean; milestoneId?: string; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('progress_milestones')
        .insert({
          user_id: milestone.user_id,
          milestone_type: milestone.milestone_type,
          milestone_name: milestone.milestone_name,
          description: milestone.description,
          target_value: milestone.target_value,
          achieved_value: milestone.achieved_value,
          unit: milestone.unit,
          status: milestone.status || 'in_progress',
          target_date: milestone.target_date,
          achieved_date: milestone.achieved_date,
          points_awarded: milestone.points_awarded || 0,
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, milestoneId: data.id };
    } catch (error) {
      console.error('Error creating milestone:', error);
      return { success: false, error };
    }
  }

  /**
   * Get user milestones
   * TIME-PROOF: Filter by status and date range
   */
  async getMilestones(
    userId: string,
    status?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    let query = supabase
      .from('progress_milestones')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching milestones:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Update milestone
   */
  async updateMilestone(
    milestoneId: string,
    updates: Partial<ProgressMilestone>
  ): Promise<boolean> {
    const { error } = await supabase
      .from('progress_milestones')
      .update(updates)
      .eq('id', milestoneId);

    if (error) {
      console.error('Error updating milestone:', error);
      return false;
    }

    return true;
  }

  /**
   * Create journey timeline event
   */
  async createJourneyEvent(
    event: JourneyEvent
  ): Promise<{ success: boolean; eventId?: string; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('user_journey_timeline')
        .insert({
          user_id: event.user_id,
          event_date: event.event_date,
          event_type: event.event_type,
          title: event.title,
          description: event.description,
          related_entity_type: event.related_entity_type,
          related_entity_id: event.related_entity_id,
          event_data: event.event_data,
          visibility: 'private',
          is_highlighted: event.is_highlighted || false,
          user_notes: event.user_notes,
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, eventId: data.id };
    } catch (error) {
      console.error('Error creating journey event:', error);
      return { success: false, error };
    }
  }

  /**
   * Get journey timeline events
   * TIME-PROOF: Query any historical period with filters
   * SCALING-PROOF: Infinite scroll with pagination
   */
  async getJourneyEvents(
    userId: string,
    startDate?: string,
    endDate?: string,
    eventType?: string,
    highlightedOnly: boolean = false,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    let query = supabase
      .from('user_journey_timeline')
      .select('*')
      .eq('user_id', userId);

    if (startDate) {
      query = query.gte('event_date', startDate);
    }

    if (endDate) {
      query = query.lte('event_date', endDate);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (highlightedOnly) {
      query = query.eq('is_highlighted', true);
    }

    const { data, error } = await query
      .order('event_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching journey events:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Toggle event highlight
   */
  async toggleEventHighlight(
    eventId: string,
    isHighlighted: boolean
  ): Promise<boolean> {
    const { error } = await supabase
      .from('user_journey_timeline')
      .update({ is_highlighted: isHighlighted })
      .eq('id', eventId);

    return !error;
  }

  /**
   * Create comparison snapshot
   */
  async createComparisonSnapshot(
    snapshot: ComparisonSnapshot
  ): Promise<{ success: boolean; snapshotId?: string; error?: any }> {
    try {
      // Get summary data for the period
      const { data: summaryData } = await supabase
        .rpc('get_progress_summary', {
          p_user_id: snapshot.user_id,
          p_start_date: snapshot.start_date,
          p_end_date: snapshot.end_date,
        })
        .single();

      const { data, error } = await supabase
        .from('comparison_snapshots')
        .insert({
          user_id: snapshot.user_id,
          snapshot_name: snapshot.snapshot_name,
          snapshot_type: snapshot.snapshot_type || 'manual',
          start_date: snapshot.start_date,
          end_date: snapshot.end_date,
          starting_weight_kg: snapshot.starting_weight_kg,
          ending_weight_kg: snapshot.ending_weight_kg,
          weight_change_kg: snapshot.ending_weight_kg && snapshot.starting_weight_kg
            ? snapshot.ending_weight_kg - snapshot.starting_weight_kg
            : null,
          starting_body_fat: snapshot.starting_body_fat,
          ending_body_fat: snapshot.ending_body_fat,
          body_fat_change: snapshot.ending_body_fat && snapshot.starting_body_fat
            ? snapshot.ending_body_fat - snapshot.starting_body_fat
            : null,
          starting_muscle_mass: snapshot.starting_muscle_mass,
          ending_muscle_mass: snapshot.ending_muscle_mass,
          muscle_mass_change: snapshot.ending_muscle_mass && snapshot.starting_muscle_mass
            ? snapshot.ending_muscle_mass - snapshot.starting_muscle_mass
            : null,
          measurements_comparison: snapshot.measurements_comparison,
          workouts_completed: summaryData?.total_workouts || snapshot.workouts_completed || 0,
          meals_logged: summaryData?.total_meals_logged || snapshot.meals_logged || 0,
          prs_achieved: summaryData?.prs_achieved || snapshot.prs_achieved || 0,
          notes: snapshot.notes,
        })
        .select('id')
        .single();

      if (error) throw error;

      return { success: true, snapshotId: data.id };
    } catch (error) {
      console.error('Error creating comparison snapshot:', error);
      return { success: false, error };
    }
  }

  /**
   * Get comparison snapshots
   */
  async getComparisonSnapshots(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('comparison_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching comparison snapshots:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get monthly summary
   * TIME-PROOF: Query specific month
   */
  async getMonthlySummary(
    userId: string,
    month: string // Format: '2024-01-01'
  ): Promise<any> {
    const { data, error } = await supabase
      .from('monthly_progress_summaries')
      .select('*')
      .eq('user_id', userId)
      .eq('summary_month', month)
      .maybeSingle();

    if (error) {
      console.error('Error fetching monthly summary:', error);
      return null;
    }

    return data;
  }

  /**
   * Get weekly summary
   * TIME-PROOF: Query specific week
   */
  async getWeeklySummary(
    userId: string,
    weekStart: string // Format: '2024-01-01' (Monday)
  ): Promise<any> {
    const { data, error } = await supabase
      .from('weekly_progress_detailed')
      .select('*')
      .eq('user_id', userId)
      .eq('week_start_date', weekStart)
      .maybeSingle();

    if (error) {
      console.error('Error fetching weekly summary:', error);
      return null;
    }

    return data;
  }

  /**
   * Get weight history for chart
   * TIME-PROOF: Any date range
   */
  async getWeightHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    return this.getBodyMeasurements(userId, startDate, endDate, 365, 0);
  }

  /**
   * Calculate progress stats for period
   * TIME-PROOF: Dynamic period calculation
   */
  async getProgressStats(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<any> {
    const { data, error } = await supabase
      .rpc('get_progress_summary', {
        p_user_id: userId,
        p_start_date: startDate,
        p_end_date: endDate,
      })
      .single();

    if (error) {
      console.error('Error fetching progress stats:', error);
      return null;
    }

    return data;
  }
}

export const progressTrackingService = new ProgressTrackingService();
