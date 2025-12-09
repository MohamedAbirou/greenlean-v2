import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface ActivityCalendarProps {
  userId: string;
}

interface DayActivity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const [activities, setActivities] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  useEffect(() => {
    loadActivityData();
  }, [userId]);

  const loadActivityData = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 90); // Last 90 days

      // Get meal logs
      const { data: meals } = await supabase
        .from('meal_items')
        .select('meal_date')
        .eq('user_id', userId)
        .gte('meal_date', startDate.toISOString().split('T')[0])
        .lte('meal_date', endDate.toISOString().split('T')[0]);

      // Get workout logs
      const { data: workouts } = await supabase
        .from('workout_sessions')
        .select('workout_date')
        .eq('user_id', userId)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .lte('workout_date', endDate.toISOString().split('T')[0]);

      // Combine and count activities per day
      const activityMap: Record<string, number> = {};

      meals?.forEach((meal) => {
        activityMap[meal.meal_date] = (activityMap[meal.meal_date] || 0) + 1;
      });

      workouts?.forEach((workout) => {
        const date = workout.workout_date.split('T')[0];
        activityMap[date] = (activityMap[date] || 0) + 2; // Workouts count more
      });

      // Generate array for last 90 days
      const dayActivities: DayActivity[] = [];
      for (let i = 0; i < 90; i++) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = activityMap[dateStr] || 0;

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (count >= 8) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 3) level = 2;
        else if (count >= 1) level = 1;

        dayActivities.push({ date: dateStr, count, level });
      }

      setActivities(dayActivities.reverse());
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: number) => {
    const colors = [
      'bg-gray-100 dark:bg-gray-800',
      'bg-green-200 dark:bg-green-900',
      'bg-green-300 dark:bg-green-700',
      'bg-green-400 dark:bg-green-600',
      'bg-green-500 dark:bg-green-500',
    ];
    return colors[level];
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-4" />
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </Card>
    );
  }

  const totalDays = activities.filter((a) => a.count > 0).length;
  const currentStreak = calculateCurrentStreak(activities);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="h-6 w-6 text-primary" />
          <h3 className="text-lg font-semibold">Activity Overview</h3>
        </div>
        <div className="text-right text-sm">
          <div className="font-semibold">{totalDays} active days</div>
          <div className="text-muted-foreground">in last 90 days</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="relative mb-4">
        <div className="grid grid-cols-13 gap-1 mb-2">
          {activities.map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.002 }}
              className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} cursor-pointer transition-transform hover:scale-150 hover:z-10`}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
            />
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-background border rounded-lg shadow-lg p-3 z-20">
            <div className="text-sm font-semibold">{formatDate(hoveredDay.date)}</div>
            <div className="text-xs text-muted-foreground">
              {hoveredDay.count === 0 ? 'No activity' : `${hoveredDay.count} activities`}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Less</span>
        <div className="flex space-x-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
        </div>
        <span className="text-muted-foreground">More</span>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">Day Current Streak</div>
        </div>
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold">{Math.round((totalDays / 90) * 100)}%</div>
          <div className="text-xs text-muted-foreground">Active Days</div>
        </div>
      </div>
    </Card>
  );
}

function calculateCurrentStreak(activities: DayActivity[]): number {
  let streak = 0;
  const reversedActivities = [...activities].reverse();

  for (const activity of reversedActivities) {
    if (activity.count > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
