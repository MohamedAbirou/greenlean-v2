/**
 * WorkoutIntensityChart Component
 * Bar chart for workout volume & intensity tracking
 * Shows frequency, duration, calories burned
 */

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { Clock, Dumbbell, Flame, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

export interface WorkoutDataPoint {
  date: string;
  duration_minutes: number;
  calories_burned: number;
  workout_count: number;
}

interface WorkoutIntensityChartProps {
  data: WorkoutDataPoint[];
  onLogWorkout: () => void;
  loading?: boolean;
}

export function WorkoutIntensityChart({
  data = [],
  onLogWorkout,
  loading,
}: WorkoutIntensityChartProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [metric, setMetric] = useState<'duration' | 'calories'>('duration');
  const theme = useChartTheme();

  // Filter and aggregate data
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    const days = parseInt(timeRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Aggregate by week for better visualization
    const weeklyData = new Map<string, any>();

    data
      .filter((point) => new Date(point.date) >= cutoffDate)
      .forEach((point) => {
        const date = new Date(point.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week
        const weekKey = format(weekStart, 'MMM d');

        if (!weeklyData.has(weekKey)) {
          weeklyData.set(weekKey, {
            week: weekKey,
            duration_minutes: 0,
            calories_burned: 0,
            workout_count: 0,
          });
        }

        const existing = weeklyData.get(weekKey);
        existing.duration_minutes += point.duration_minutes || 0;
        existing.calories_burned += point.calories_burned || 0;
        existing.workout_count += point.workout_count || 1;
      });

    return Array.from(weeklyData.values());
  }, [data, timeRange]);

  // Calculate totals
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, point) => ({
        workouts: acc.workouts + point.workout_count,
        duration: acc.duration + point.duration_minutes,
        calories: acc.calories + point.calories_burned,
      }),
      { workouts: 0, duration: 0, calories: 0 }
    );
  }, [chartData]);

  // Format tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 rounded-lg border border-border shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">
            Week of {data.week}
          </p>
          <p className="text-xs text-muted-foreground">
            Workouts: <span className="font-semibold">{data.workout_count}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Duration: <span className="font-semibold">{data.duration_minutes} min</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Calories: <span className="font-semibold">{data.calories_burned}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12 text-muted-foreground">
          Loading workout data...
        </div>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        {onLogWorkout && (
          <Button variant="primary" size="sm" onClick={onLogWorkout}>
            <Plus className="w-4 h-4 mr-1" />
            Log Workout
          </Button>
        )}
        <div className="text-center py-12">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground">
            No workout data logged yet
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Start tracking workouts to see your intensity trends
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
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Workout Intensity
          </h3>
          <p className="text-sm text-muted-foreground">
            Track your training volume over time
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
        <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Dumbbell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totals.workouts}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Total Workouts
          </div>
        </div>

        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totals.duration}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Total Minutes
          </div>
        </div>

        <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {totals.calories}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Total Calories
          </div>
        </div>
      </div>

      {/* Metric toggle */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={metric === 'duration' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setMetric('duration')}
        >
          Duration
        </Button>
        <Button
          variant={metric === 'calories' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setMetric('calories')}
        >
          Calories
        </Button>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.grid}
            />
            <XAxis
              dataKey="week"
              tick={{ fill: theme.textSecondary, fontSize: 12 }}
              stroke={theme.axis}
            />
            <YAxis
              yAxisId="left"
              tick={{ fill: theme.textSecondary, fontSize: 12 }}
              stroke={theme.axis}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: theme.textSecondary, fontSize: 12 }}
              stroke={theme.axis}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="rect"
            />

            {/* Bars */}
            <Bar
              yAxisId="left"
              dataKey={metric === 'duration' ? 'duration_minutes' : 'calories_burned'}
              name={metric === 'duration' ? 'Duration (min)' : 'Calories Burned'}
              fill={metric === 'duration' ? '#3b82f6' : '#f97316'}
              radius={[8, 8, 0, 0]}
            />

            {/* Workout count line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="workout_count"
              name="Workout Count"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
