/**
 * NutritionTrendsChart Component
 * Multi-line chart for macro trends - MyFitnessPal level
 * Shows calories, protein, carbs, fat over time
 */

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { Flame, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChartTheme } from '../../hooks/useChartTheme';

export interface NutritionDataPoint {
  log_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
}

interface NutritionTrendsChartProps {
  data: NutritionDataPoint[];
  onLogMeal?: () => void;
  targetCalories?: number;
  loading?: boolean;
}

export function NutritionTrendsChart({
  data = [],
  targetCalories,
  onLogMeal,
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
      .filter((point) => new Date(point.log_date) >= cutoffDate)
      .map((point) => ({
        ...point,
        displayDate: format(new Date(point.log_date), 'MMM d'),
      }));
  }, [data, timeRange]);

  // Calculate averages
  const averages = useMemo(() => {
    if (filteredData.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const totals = filteredData.reduce(
      (acc, point) => ({
        calories: acc.calories + point.total_calories,
        protein: acc.protein + point.total_protein,
        carbs: acc.carbs + point.total_carbs,
        fat: acc.fat + point.total_fats,
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
        <div className="bg-background p-3 rounded-lg border border-border shadow-lg">
          <p className="text-sm font-semibold text-foreground mb-2">
            {data.displayDate}
          </p>
          {activeLines.calories && (
            <p className="text-xs text-muted-foreground">
              Calories: <span className="font-semibold">{data.total_calories}</span>
            </p>
          )}
          {activeLines.protein && (
            <p className="text-xs text-muted-foreground">
              Protein: <span className="font-semibold">{data.total_protein}g</span>
            </p>
          )}
          {activeLines.carbs && (
            <p className="text-xs text-muted-foreground">
              Carbs: <span className="font-semibold">{data.total_carbs}g</span>
            </p>
          )}
          {activeLines.fat && (
            <p className="text-xs text-muted-foreground">
              Fat: <span className="font-semibold">{data.total_fats}g</span>
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
        <div className="text-center py-12 text-muted-foreground">
          Loading nutrition trends...
        </div>
      </Card>
    );
  }

  if (filteredData.length === 0) {
    return (
      <Card variant="elevated" padding="lg">
        {onLogMeal && (
          <Button variant="primary" size="sm" onClick={onLogMeal}>
            <Plus className="w-4 h-4 mr-1" />
            Log Meal
          </Button>
        )}
        <div className="text-center py-12">
          <Flame className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground">
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
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Nutrition Trends
          </h3>
          <p className="text-sm text-muted-foreground">
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
              {range}
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
          <div className="text-xs text-muted-foreground mt-1">
            Avg Calories
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
          <div className="text-xl font-bold text-red-600 dark:text-red-400">
            {averages.protein}g
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg Protein
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {averages.carbs}g
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg Carbs
          </div>
        </div>
        <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
          <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
            {averages.fat}g
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Avg Fat
          </div>
        </div>
      </div>

      {/* Legend toggles */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <button
          onClick={() => toggleLine('calories')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeLines.calories
            ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
            : 'bg-muted text-gray-400'
            }`}
        >
          <div className="w-4 h-0.5 bg-orange-500 inline-block mr-1.5" />
          Calories
        </button>
        <button
          onClick={() => toggleLine('protein')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeLines.protein
            ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            : 'bg-muted text-gray-400'
            }`}
        >
          <div className="w-4 h-0.5 bg-red-500 inline-block mr-1.5" />
          Protein
        </button>
        <button
          onClick={() => toggleLine('carbs')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeLines.carbs
            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
            : 'bg-muted text-gray-400'
            }`}
        >
          <div className="w-4 h-0.5 bg-blue-500 inline-block mr-1.5" />
          Carbs
        </button>
        <button
          onClick={() => toggleLine('fat')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeLines.fat
            ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
            : 'bg-muted text-gray-400'
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
                dataKey="total_calories"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {activeLines.protein && (
              <Line
                type="monotone"
                dataKey="total_protein"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {activeLines.carbs && (
              <Line
                type="monotone"
                dataKey="total_carbs"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            )}
            {activeLines.fat && (
              <Line
                type="monotone"
                dataKey="total_fats"
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
