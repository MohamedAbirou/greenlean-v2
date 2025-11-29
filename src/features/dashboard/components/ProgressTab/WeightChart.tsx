/**
 * WeightChart Component
 * Visual weight progress over time
 * Uses design system colors
 */

import { Card } from '@/shared/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/design-system';

export interface WeightDataPoint {
  date: string;
  weight_kg: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  targetWeight?: number;
  currentWeight?: number;
  loading?: boolean;
}

export function WeightChart({
  data = [],
  targetWeight,
  currentWeight,
  loading,
}: WeightChartProps) {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading weight data...
        </div>
      </Card>
    );
  }

  // Calculate progress
  const startWeight = data[0]?.weight_kg;
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0;
  const isLosing = weightChange < 0;

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Weight Progress
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Track your weight journey
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentWeight || '--'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Current
          </div>
        </div>
        <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {targetWeight || '--'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Target
          </div>
        </div>
        <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div
            className={cn(
              'text-2xl font-bold flex items-center justify-center gap-1',
              isLosing ? 'text-success' : 'text-error'
            )}
          >
            {isLosing ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            {Math.abs(weightChange).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Change (kg)
          </div>
        </div>
      </div>

      {/* Simple Chart Placeholder */}
      {data.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No weight data logged yet</p>
          <p className="text-xs mt-2">Start tracking to see your progress</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Recent entries:
          </div>
          {data.slice(-5).reverse().map((point, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(point.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {point.weight_kg} kg
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
