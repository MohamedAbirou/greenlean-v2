/**
 * Stat Card Component
 * Displays a metric with progress visualization
 */

import React from 'react';
import { calculateMacroProgress, formatNumber } from '../../utils';

interface StatCardProps {
  title: string;
  current: number;
  goal?: number;
  unit?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  showProgress?: boolean;
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
  green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
  red: 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300',
};

const progressColorClasses = {
  under: 'bg-gray-300 dark:bg-gray-600',
  perfect: 'bg-green-500',
  over: 'bg-orange-500',
};

export function StatCard({
  title,
  current,
  goal,
  unit = '',
  icon,
  color = 'blue',
  showProgress = true,
  className = '',
}: StatCardProps) {
  const progress = goal ? calculateMacroProgress(current, goal) : null;

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(current, current % 1 !== 0 ? 1 : 0)}
              {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
            </p>
            {goal && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                / {formatNumber(goal)} {unit}
              </p>
            )}
          </div>
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>

      {showProgress && goal && progress && (
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              {progress.percentage}% of goal
            </span>
            {progress.status === 'perfect' && (
              <span className="text-green-600 dark:text-green-400 font-medium">Perfect!</span>
            )}
            {progress.status === 'over' && (
              <span className="text-orange-600 dark:text-orange-400 font-medium">
                +{formatNumber(current - goal)} {unit} over
              </span>
            )}
            {progress.status === 'under' && (
              <span className="text-gray-600 dark:text-gray-400">
                {formatNumber(progress.remaining)} {unit} left
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressColorClasses[progress.status]
              }`}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
