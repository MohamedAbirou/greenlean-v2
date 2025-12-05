/**
 * Workout Performance Component - Competitor-Level Quality
 * Inspired by 90 Days Challenge and Strava
 * Shows workout calendar, stats, and effort trends
 */

import { Card } from '@/shared/components/ui/card';
import { Dumbbell, Flame } from 'lucide-react';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface WorkoutPerformanceProps {
  workoutLogs: any[];
}

export function WorkoutPerformance({ workoutLogs }: WorkoutPerformanceProps) {
  // Generate calendar data (last 28 days = 4 weeks)
  const calendarData = useMemo(() => {
    const days = 28;
    const result = [];
    const logsMap = new Map();

    // Map logs by date
    workoutLogs.forEach((log) => {
      const date = log.workout_date || new Date().toISOString().split('T')[0];
      if (!logsMap.has(date)) {
        logsMap.set(date, []);
      }
      logsMap.get(date).push(log);
    });

    // Generate last 28 days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLogs = logsMap.get(dateStr) || [];

      result.push({
        date: dateStr,
        workoutType: dayLogs.length > 0 ? dayLogs[0].workout_type : null,
        duration: dayLogs.reduce((sum: number, log: any) => sum + (log.duration_minutes || 0), 0),
        caloriesBurned: dayLogs.reduce((sum: number, log: any) => sum + (log.calories_burned || 0), 0),
      });
    }

    return result;
  }, [workoutLogs]);

  // Calculate stats
  const stats = useMemo(() => {
    const thisMonth = workoutLogs.filter((log) => {
      const logDate = new Date(log.workout_date || log.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return logDate >= thirtyDaysAgo;
    });

    const totalWorkouts = thisMonth.length;
    const totalMinutes = thisMonth.reduce((sum: number, log: any) => sum + (log.duration_minutes || 0), 0);
    const totalCalories = thisMonth.reduce((sum: number, log: any) => sum + (log.calories_burned || 0), 0);
    const avgCaloriesPerSession = totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

    // Most common workout type
    const typeCounts = new Map();
    thisMonth.forEach((log) => {
      const type = log.workout_type || 'general';
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    });
    const mostCommonType = Array.from(typeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    // Longest workout
    const longestWorkout = Math.max(...thisMonth.map((log) => log.duration_minutes || 0), 0);

    return {
      totalWorkouts,
      totalMinutes,
      totalCalories,
      avgCaloriesPerSession,
      mostCommonType,
      longestWorkout,
    };
  }, [workoutLogs]);

  // Weekly effort data (last 8 weeks)
  const weeklyEffort = useMemo(() => {
    const weeks = 8;
    const result = [];

    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));

      const weekLogs = workoutLogs.filter((log) => {
        const logDate = new Date(log.workout_date || log.created_at);
        return logDate >= weekStart && logDate <= weekEnd;
      });

      const totalMinutes = weekLogs.reduce((sum: number, log: any) => sum + (log.duration_minutes || 0), 0);
      const totalCalories = weekLogs.reduce((sum: number, log: any) => sum + (log.calories_burned || 0), 0);

      result.push({
        week: `W${weeks - i}`,
        totalMinutes,
        totalCalories,
      });
    }

    return result;
  }, [workoutLogs]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getWorkoutIcon = (type: string | null) => {
    if (!type) return null;
    const iconMap: Record<string, string> = {
      strength: '💪',
      cardio: '🏃',
      yoga: '🧘',
      flexibility: '🤸',
      hiit: '⚡',
      sports: '⚽',
      custom: '🏋️',
    };
    return iconMap[type.toLowerCase()] || '🏋️';
  };

  const getIntensityColor = (calories: number) => {
    if (calories >= 400) return 'bg-red-500 border-red-600';
    if (calories >= 300) return 'bg-orange-500 border-orange-600';
    if (calories >= 200) return 'bg-yellow-500 border-yellow-600';
    if (calories > 0) return 'bg-green-500 border-green-600';
    return 'bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600';
  };

  // Group calendar into weeks
  const weeks: typeof calendarData[] = [];
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Workout Performance</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workout Calendar */}
        <Card variant="elevated" padding="lg" className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Calendar</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-2 text-xs font-medium text-muted-foreground mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center">
                  {day}
                </div>
              ))}
            </div>
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-7 gap-2">
                {week.map((day, dayIdx) => (
                  <div
                    key={dayIdx}
                    className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1 cursor-pointer transition-all hover:scale-105 ${
                      day.workoutType
                        ? `${getIntensityColor(day.caloriesBurned)} text-white font-semibold`
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                    title={
                      day.workoutType
                        ? `${formatDate(day.date)}: ${day.workoutType}\n${day.duration}min, ${day.caloriesBurned}cal`
                        : formatDate(day.date)
                    }
                  >
                    <span className="text-xs">
                      {new Date(day.date).getDate()}
                    </span>
                    {day.workoutType && (
                      <span className="text-xs sm:text-lg">{getWorkoutIcon(day.workoutType)}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Intensity:</span>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center">
                <div className="w-4 h-4 rounded border-2 bg-green-500 border-green-600"></div>
                <span>Low</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="w-4 h-4 rounded border-2 bg-yellow-500 border-yellow-600"></div>
                <span>Med</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="w-4 h-4 rounded border-2 bg-orange-500 border-orange-600"></div>
                <span>High</span>
              </div>
              <div className="flex gap-1 items-center">
                <div className="w-4 h-4 rounded border-2 bg-red-500 border-red-600"></div>
                <span>Max</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Panel */}
        <div className="space-y-4">
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Dumbbell className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium text-foreground/80">This Month</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-foreground">{stats.totalWorkouts}</p>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-2xl font-bold text-foreground">{stats.totalMinutes}</p>
                <p className="text-sm text-muted-foreground">Total Minutes</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/80 dark:bg-gray-900/80 rounded-lg">
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Calories Burned</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-3xl font-bold text-foreground">
                  {stats.totalCalories.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total This Month</p>
              </div>
              <div className="pt-3 border-t border-orange-200 dark:border-orange-800">
                <p className="text-2xl font-bold text-foreground">
                  {stats.avgCaloriesPerSession}
                </p>
                <p className="text-sm text-muted-foreground">Avg per Session</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Most Common</span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {stats.mostCommonType}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Longest Workout</span>
                <span className="text-sm font-semibold text-foreground">
                  {stats.longestWorkout} min
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Weekly Effort Trend */}
      <Card variant="elevated" padding="lg">
        <h3 className="text-lg font-semibold text-foreground mb-4">Effort Over Time (8 Weeks)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyEffort}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis yAxisId="left" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalMinutes"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              name="Minutes"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalCalories"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ fill: '#f97316', r: 4 }}
              name="Calories"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
