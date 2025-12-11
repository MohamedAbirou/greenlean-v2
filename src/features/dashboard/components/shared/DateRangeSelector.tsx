/**
 * Date Range Selector Component
 * Allows users to select date ranges for filtering dashboard data
 */

import React, { useState } from 'react';
import type { DateRange } from '../../types';
import { getDateRange, formatDate } from '../../utils';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets: Array<{ label: string; value: DateRange['preset'] }> = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: 'Year', value: 'year' },
  { label: 'Custom', value: 'custom' },
];

export function DateRangeSelector({ value, onChange, className = '' }: DateRangeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate);
  const [customEnd, setCustomEnd] = useState(value.endDate);

  const handlePresetClick = (preset: DateRange['preset']) => {
    if (preset === 'custom') {
      setShowCustomPicker(true);
      return;
    }

    const range = getDateRange(preset);
    onChange({
      startDate: range.startDate,
      endDate: range.endDate,
      preset,
    });
    setShowCustomPicker(false);
  };

  const handleCustomApply = () => {
    onChange({
      startDate: customStart,
      endDate: customEnd,
      preset: 'custom',
    });
    setShowCustomPicker(false);
  };

  return (
    <div className={`date-range-selector ${className}`}>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              value.preset === preset.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {showCustomPicker && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Custom Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={customEnd}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={customStart}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowCustomPicker(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCustomApply}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Showing data from <span className="font-medium">{formatDate(value.startDate)}</span> to{' '}
        <span className="font-medium">{formatDate(value.endDate)}</span>
      </div>
    </div>
  );
}
