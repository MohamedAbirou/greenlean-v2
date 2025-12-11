/**
 * Progress Tab - Advanced Charts and Analytics
 */

import React, { useState } from 'react';
import { useWeightHistory, useProgressSummary } from '../../hooks/useProgress';
import { DateRangeSelector } from '../shared/DateRangeSelector';
import { LoadingState } from '../shared/LoadingState';
import { getDateRange, formatNumber, formatDate } from '../../utils';
import type { DateRange } from '../../types';

export function ProgressTab() {
  const [dateRange, setDateRange] = useState<DateRange>({
    ...getDateRange('month'),
    preset: 'month',
  });

  const { data: weightHistory, isLoading } = useWeightHistory(
    dateRange.startDate,
    dateRange.endDate
  );
  const { data: progressSummary } = useProgressSummary(
    dateRange.startDate,
    dateRange.endDate
  );

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h2>
      </div>

      <DateRangeSelector value={dateRange} onChange={setDateRange} />

      {/* Summary Stats */}
      {progressSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Weight Change</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {progressSummary.weight_change_kg > 0 ? '+' : ''}
              {formatNumber(progressSummary.weight_change_kg, 1)} kg
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Workouts</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{progressSummary.total_workouts}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Meals Logged</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{progressSummary.total_meals_logged}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">PRs Achieved</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">🏆 {progressSummary.prs_achieved}</p>
          </div>
        </div>
      )}

      {/* Weight History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Weight History</h3>
        {weightHistory && weightHistory.length > 0 ? (
          <div className="space-y-2">
            {weightHistory.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <span className="text-gray-600 dark:text-gray-400">{formatDate(entry.log_date)}</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{formatNumber(entry.weight_kg, 1)} kg</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">No weight data for this period</p>
        )}
      </div>
    </div>
  );
}
