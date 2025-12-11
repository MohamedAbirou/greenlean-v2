/**
 * useAnalytics Hook
 * Provides easy access to analytics data and insights
 */

import { useState, useEffect } from 'react';
// Temporary type definitions until dashboard components are rebuilt
type Insight = any;
type StreakData = any;
import {
  getUserInsights,
  getStreakData,
  getCurrentWeekSummary,
  getWeightHistory,
  logWeight as logWeightService,
  type WeeklySummary,
  type WeightEntry,
} from '../services/analyticsService';

export function useAnalytics(userId: string | undefined) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all analytics data in parallel
      const [insightsData, streakData, summaryData, weightData] = await Promise.all([
        getUserInsights(userId),
        getStreakData(userId, 'nutrition_logging'),
        getCurrentWeekSummary(userId),
        getWeightHistory(userId, 90),
      ]);

      setInsights(insightsData || []);
      setStreak(streakData as StreakData);
      setWeeklySummary(summaryData);
      setWeightHistory(weightData || []);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const logWeight = async (weightKg: number, date?: Date, notes?: string): Promise<boolean> => {
    if (!userId) return false;

    const success = await logWeightService(userId, weightKg, date, notes);

    if (success) {
      // Refresh weight history and weekly summary
      const [weightData, summaryData] = await Promise.all([
        getWeightHistory(userId, 90),
        getCurrentWeekSummary(userId),
      ]);

      setWeightHistory(weightData || []);
      setWeeklySummary(summaryData);
    }

    return success;
  };

  const refreshAnalytics = () => {
    fetchAnalytics();
  };

  return {
    insights,
    streak,
    weeklySummary,
    weightHistory,
    loading,
    error,
    logWeight,
    refreshAnalytics,
  };
}
