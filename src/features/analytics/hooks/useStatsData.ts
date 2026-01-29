/**
 * Stats Data Hook
 * Fetches and manages stats data with React Query
 */

import { useQuery } from "@tanstack/react-query";
import { StatsService } from "../services/statsService";
import type { StatsData } from "../types/stats.types";

export function useStatsData(userId?: string, startDate?: string, endDate?: string) {
  return useQuery<StatsData>({
    queryKey: ["stats", userId, startDate, endDate],
    queryFn: () => StatsService.getStatsData(userId!, startDate!, endDate!),
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
  });
}
