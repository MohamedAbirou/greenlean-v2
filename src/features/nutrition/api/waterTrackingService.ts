/**
 * Water Intake Tracking Service
 * Production-ready water logging and tracking
 */

import { supabase } from '@/lib/supabase/client';

export interface WaterLog {
  id?: string;
  user_id: string;
  log_date: string;
  amount_ml: number;
  logged_at?: string;
  created_at?: string;
}

export interface DailyWaterTotal {
  log_date: string;
  total_ml: number;
  log_count: number;
}

class WaterTrackingService {
  /**
   * Log water intake
   */
  async logWater(
    userId: string,
    amountMl: number,
    logDate?: string
  ): Promise<{ success: boolean; data?: WaterLog; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('water_intake_logs')
        .insert({
          user_id: userId,
          log_date: logDate || new Date().toISOString().split('T')[0],
          amount_ml: amountMl,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error) {
      console.error('Failed to log water:', error);
      return { success: false, error };
    }
  }

  /**
   * Get daily water total
   */
  async getDailyTotal(
    userId: string,
    date: string
  ): Promise<{ success: boolean; data?: number; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('amount_ml')
        .eq('user_id', userId)
        .eq('log_date', date);

      if (error) throw error;

      const total = data?.reduce((sum, log) => sum + log.amount_ml, 0) || 0;

      return { success: true, data: total };
    } catch (error) {
      console.error('Failed to get daily water total:', error);
      return { success: false, error };
    }
  }

  /**
   * Get water logs for date range
   */
  async getWaterLogs(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ success: boolean; data?: DailyWaterTotal[]; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('water_intake_logs')
        .select('log_date, amount_ml')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = data?.reduce((acc: Record<string, DailyWaterTotal>, log) => {
        if (!acc[log.log_date]) {
          acc[log.log_date] = {
            log_date: log.log_date,
            total_ml: 0,
            log_count: 0,
          };
        }
        acc[log.log_date].total_ml += log.amount_ml;
        acc[log.log_date].log_count += 1;
        return acc;
      }, {});

      return { success: true, data: Object.values(grouped || {}) };
    } catch (error) {
      console.error('Failed to get water logs:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete water log
   */
  async deleteWaterLog(logId: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('water_intake_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to delete water log:', error);
      return { success: false, error };
    }
  }
}

export const waterTrackingService = new WaterTrackingService();
