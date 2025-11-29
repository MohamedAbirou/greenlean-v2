/**
 * DetailedWeightChart Component
 * Interactive weight tracking with Recharts - MacroFactor level
 * Shows trends, goals, projections
 */

import { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { TrendingDown, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/shared/design-system';
import { useChartTheme } from '../../hooks/useChartTheme';

export interface WeightDataPoint {
  date: string;
  weight_kg: number;
}

interface DetailedWeightChartProps {
  data: WeightDataPoint[];
  targetWeight?: number;
  currentWeight?: number;
  loading?: boolean;
}

export function DetailedWeightChart({
  data = [],
  targetWeight,
  currentWeight,
  loading,
}: DetailedWeightChartProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const theme = useChartTheme();

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data
      .filter((point) => new Date(point.date) >= cutoffDate)
      .map((point) => ({
        ...point,
        displayDate: format(new Date(point.date), 'MMM d'),
      }));
  }, [data, timeRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        startWeight: currentWeight || 0,
        change: 0,
        isLosing: false,
        avgWeeklyChange: 0,
        projectedWeeks: 0,
      };
    }

    const startWeight = filteredData[0].weight_kg;
    const endWeight = currentWeight || filteredData[filteredData.length - 1].weight_kg;
    const change = endWeight - startWeight;
    const isLosing = change < 0;

    // Calculate average weekly change
    const totalDays = filteredData.length;
    const weeks = totalDays / 7;
    const avgWeeklyChange = weeks > 0 ? change / weeks : 0;

    // Project weeks to goal
    let projectedWeeks = 0;
    if (targetWeight && avgWeeklyChange !== 0) {
      const remainingWeight = endWeight - targetWeight;
      projectedWeeks = Math.abs(remainingWeight / avgWeeklyChange);
    }

    return {
      startWeight,
      change,
      isLosing,
      avgWeeklyChange,
      projectedWeeks,
    };
  }, [filteredData, currentWeight, targetWeight]);

  // Format tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {data.displayDate}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.weight_kg.toFixed(1)} kg
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading weight data...
        </div>
      </Card>
    );
  }

  if (filteredData.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            No weight data logged yet
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Start tracking your weight to see progress charts
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Weight Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your weight journey over time
          </p>
        </div>

        {/* Time range toggle */}
        <div className="flex gap-2">
          {(['7', '30', '90'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range}d
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {currentWeight?.toFixed(1) || '--'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Current (kg)
          </div>
        </div>

        <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {targetWeight?.toFixed(1) || '--'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Target (kg)
          </div>
        </div>

        <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div
            className={cn(
              'text-2xl font-bold flex items-center justify-center gap-1',
              stats.isLosing ? 'text-success' : 'text-error'
            )}
          >
            {stats.isLosing ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            {Math.abs(stats.change).toFixed(1)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Change (kg)
          </div>
        </div>
      </div>

      {/* Insights */}
      {stats.avgWeeklyChange !== 0 && (
        <div className="mb-6 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
          <div className="flex items-start gap-3">
            <Badge
              variant={stats.isLosing ? 'success' : 'warning'}
              size="sm"
              className="mt-0.5"
            >
              Insight
            </Badge>
            <div className="flex-1 text-sm">
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {stats.isLosing ? 'Great progress!' : 'Weight increasing'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Average: {Math.abs(stats.avgWeeklyChange).toFixed(2)} kg/week
                {stats.projectedWeeks > 0 && targetWeight && (
                  <span>
                    {' • '}
                    Reach goal in ~{Math.ceil(stats.projectedWeeks)} weeks
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.grid}
            />
            <XAxis
              dataKey="displayDate"
              tick={{ fill: theme.textSecondary, fontSize: 12 }}
              stroke={theme.axis}
            />
            <YAxis
              tick={{ fill: theme.textSecondary, fontSize: 12 }}
              stroke={theme.axis}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />

            {/* Goal weight line */}
            {targetWeight && (
              <ReferenceLine
                y={targetWeight}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{
                  value: 'Goal',
                  fill: '#10b981',
                  fontSize: 12,
                  position: 'insideTopRight',
                }}
              />
            )}

            {/* Weight line */}
            <Line
              type="monotone"
              dataKey="weight_kg"
              name="Weight (kg)"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
