/**
 * Comprehensive Progress Tab
 * Track weight, nutrition, workouts, and overall progress with charts and statistics
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useAuth } from '@/features/auth';
import {
  useMealItemsByDate,
  useWorkoutSessionsByDate,
  useWorkoutSessionsRange,
} from '../hooks/useDashboardData';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Helper functions
const getToday = () => new Date().toISOString().split('T')[0];
const getDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export function ProgressTabNew() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState(30); // 7, 30, 90 days
  const [startDate, setStartDate] = useState(getDaysAgo(30));
  const [endDate, setEndDate] = useState(getToday());

  // Fetch data for the selected range
  const { data: workoutsData } = useWorkoutSessionsRange(startDate, endDate);

  // Process workout data for charts
  const workoutStats = useMemo(() => {
    const workouts = (workoutsData as any)?.workout_logsCollection?.edges?.map((e: any) => e.node) || [];

    // Group by date
    const byDate: Record<string, any> = {};
    workouts.forEach((workout: any) => {
      const date = workout.workout_date;
      if (!byDate[date]) {
        byDate[date] = {
          date,
          workouts: 0,
          totalDuration: 0,
          totalCalories: 0,
          exerciseCount: 0,
        };
      }
      byDate[date].workouts += 1;
      byDate[date].totalDuration += workout.duration_minutes || 0;
      byDate[date].totalCalories += workout.calories_burned || 0;
      byDate[date].exerciseCount += (workout.exercises?.length || 0);
    });

    const chartData = Object.values(byDate).map((d: any) => ({
      date: formatDate(d.date),
      workouts: d.workouts,
      duration: d.totalDuration,
      calories: d.totalCalories,
    }));

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum: number, w: any) => sum + (w.duration_minutes || 0), 0);
    const totalCalories = workouts.reduce((sum: number, w: any) => sum + (w.calories_burned || 0), 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    return {
      chartData,
      totalWorkouts,
      totalDuration,
      totalCalories,
      avgDuration,
    };
  }, [workoutsData]);

  // Calculate date range options
  const handleDateRangeChange = (days: number) => {
    setDateRange(days);
    setStartDate(getDaysAgo(days));
    setEndDate(getToday());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Progress Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Track your journey with comprehensive metrics and charts
          </p>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="border-primary-500/30">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2">
              <Button
                variant={dateRange === 7 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange(7)}
              >
                7 Days
              </Button>
              <Button
                variant={dateRange === 30 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange(30)}
              >
                30 Days
              </Button>
              <Button
                variant={dateRange === 90 ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleDateRangeChange(90)}
              >
                90 Days
              </Button>
            </div>

            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Workouts */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Workouts</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {workoutStats.totalWorkouts}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last {dateRange} days
                </p>
              </div>
              <div className="text-5xl">💪</div>
            </div>
          </CardContent>
        </Card>

        {/* Total Duration */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Training Time</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {Math.floor(workoutStats.totalDuration / 60)}h {workoutStats.totalDuration % 60}m
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {workoutStats.avgDuration} min/workout
                </p>
              </div>
              <div className="text-5xl">⏱️</div>
            </div>
          </CardContent>
        </Card>

        {/* Calories Burned */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Calories Burned</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {workoutStats.totalCalories.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  From workouts
                </p>
              </div>
              <div className="text-5xl">🔥</div>
            </div>
          </CardContent>
        </Card>

        {/* Workout Frequency */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Frequency</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {(workoutStats.totalWorkouts / (dateRange / 7)).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Workouts per week
                </p>
              </div>
              <div className="text-5xl">📈</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workout Frequency Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🏋️</span> Workout Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workoutStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={workoutStats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p>No workout data for this period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Duration Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>⏱️</span> Training Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workoutStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={workoutStats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="duration"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p>No duration data for this period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calories Burned Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔥</span> Calories Burned
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workoutStats.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={workoutStats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="calories"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-3))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p>No calorie data for this period</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon - More Charts */}
        <Card className="bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-950/50 dark:to-blue-950/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🍽️</span> Nutrition Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <div className="text-6xl mb-4">🚀</div>
                <p className="font-semibold mb-2">Coming in Next Update</p>
                <p className="text-sm">
                  Calorie intake, macro tracking, and nutrition adherence charts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/20">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <span>💡</span> Track Your Progress
        </h4>
        <p className="text-xs text-muted-foreground">
          Your progress data is automatically tracked as you log workouts and meals. Charts update in
          real-time to show your fitness journey. Keep logging consistently to see meaningful trends!
        </p>
      </div>
    </div>
  );
}
