/**
 * NutritionTrendsChart Component
 * Multi-line chart for macro trends - MyFitnessPal level
 * Shows calories, protein, carbs, fat over time
 */

import { useState, useMemo } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { Flame } from 'lucide-react';
import { useChartTheme } from '../../hooks/useChartTheme';

export interface NutritionDataPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface NutritionTrendsChartProps {
  data: NutritionDataPoint[];
  targetCalories?: number;
  loading?: boolean;
}

export function NutritionTrendsChart({
  data = [],
  targetCalories,
  loading,
}: NutritionTrendsChartProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('7');
  const [activeLines, setActiveLines] = useState({
    calories: true,
    protein: true,
    carbs: true,
    fat: true,
  });
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

  // Calculate averages
  const averages = useMemo(() => {
    if (filteredData.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const totals = filteredData.reduce(
      (acc, point) => ({
        calories: acc.calories + point.calories,
        protein: acc.protein + point.protein,
        carbs: acc.carbs + point.carbs,
        fat: acc.fat + point.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
      calories: Math.round(totals.calories / filteredData.length),
      protein: Math.round(totals.protein / filteredData.length),
      carbs: Math.round(totals.carbs / filteredData.length),
      fat: Math.round(totals.fat / filteredData.length),
    };
  }, [filteredData]);

  // Format tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {data.displayDate}
          </p>
          {activeLines.calories && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Calories: <span className="font-semibold">{data.calories}</span>
            </p>
          )}
          {activeLines.protein && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Protein: <span className="font-semibold">{data.protein}g</span>
            </p>
          )}
          {activeLines.carbs && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Carbs: <span className="font-semibold">{data.carbs}g</span>
            </p>
          )}
          {activeLines.fat && (
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Fat: <span className="font-semibold">{data.fat}g</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Toggle line visibility
  const toggleLine = (line: keyof typeof activeLines) => {
    setActiveLines((prev) => ({ ...prev, [line]: !prev[line] }));
  };

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Loading nutrition trends...
        </div>
      </Card>
    );
  }

  if (filteredData.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <Flame className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            No nutrition data logged yet
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Start logging meals to see your macro trends
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
            Nutrition Trends
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track your macros over time
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

      {/* Averages Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="text-center p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
            {averages.calories}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Avg Calories
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            {averages.protein}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Avg Protein
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {averages.carbs}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Avg Carbs
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
            {averages.fat}g
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Avg Fat
          </div>
        </div>
      </div>

      {/* Legend toggles */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <button
          onClick={() => toggleLine('calories')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeLines.calories
              ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}
        >
          <div className="w-4 h-0.5 bg-orange-500 inline-block mr-1.5" />
          Calories
        </button>
        <button
          onClick={() => toggleLine('protein')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeLines.protein
              ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}
        >
          <div className="w-4 h-0.5 bg-red-500 inline-block mr-1.5" />
          Protein
        </button>
        <button
          onClick={() => toggleLine('carbs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeLines.carbs
              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}
        >
          <div className="w-4 h-0.5 bg-blue-500 inline-block mr-1.5" />
          Carbs
        </button>
        <button
          onClick={() => toggleLine('fat')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeLines.fat
              ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
          }`}
        >
          <div className="w-4 h-0.5 bg-yellow-500 inline-block mr-1.5" />
          Fat
        </button>
      </div>

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
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Calorie goal line */}
            {targetCalories && activeLines.calories && (
              <ReferenceLine
                y={targetCalories}
                stroke="#f97316"
                strokeDasharray="5 5"
                label={{
                  value: 'Goal',
                  fill: '#f97316',
                  fontSize: 12,
                  position: 'insideTopRight',
                }}
              />
            )}

            {/* Lines */}
            {activeLines.calories && (
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {activeLines.protein && (
              <Line
                type="monotone"
                dataKey="protein"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {activeLines.carbs && (
              <Line
                type="monotone"
                dataKey="carbs"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {activeLines.fat && (
              <Line
                type="monotone"
                dataKey="fat"
                stroke="#eab308"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
