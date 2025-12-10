import { supabase } from '@/lib/supabase/client';
import { Card } from '@/shared/components/ui/card';
import { motion } from 'framer-motion';
import { Apple, Dumbbell, Flame, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface StreakTrackerProps {
  userId: string;
}

interface Streak {
  type: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  label: string;
}

export function StreakTracker({ userId }: StreakTrackerProps) {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreaks();
  }, [userId]);

  const loadStreaks = async () => {
    setLoading(true);
    try {
      // Calculate meal logging streak
      const mealStreak = await calculateMealStreak();
      // Calculate workout streak
      const workoutStreak = await calculateWorkoutStreak();
      // Calculate overall activity streak
      const activityStreak = Math.max(mealStreak, workoutStreak);

      setStreaks([
        {
          type: 'activity',
          count: activityStreak,
          icon: <Flame className="h-5 w-5" />,
          color: 'from-orange-500 to-red-500',
          label: 'Day Activity Streak',
        },
        {
          type: 'meals',
          count: mealStreak,
          icon: <Apple className="h-5 w-5" />,
          color: 'from-green-500 to-emerald-500',
          label: 'Day Meal Logging',
        },
        {
          type: 'workouts',
          count: workoutStreak,
          icon: <Dumbbell className="h-5 w-5" />,
          color: 'from-blue-500 to-cyan-500',
          label: 'Day Workout Streak',
        },
      ]);
    } catch (error) {
      console.error('Failed to load streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMealStreak = async (): Promise<number> => {
    try {
      // Get all meal logs ordered by date desc
      const { data, error } = await supabase
        .from('meal_items')
        .select('meal_date')
        .eq('user_id', userId)
        .order('meal_date', { ascending: false })
        .limit(365);

      if (error) throw error;

      if (!data || data.length === 0) return 0;

      // Get unique dates
      const uniqueDates = [...new Set(data.map((item) => item.meal_date))].sort().reverse();

      // Calculate consecutive days from today
      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      let currentDate = today;

      for (const date of uniqueDates) {
        if (date === currentDate) {
          streak++;
          // Move to previous day
          const d = new Date(currentDate);
          d.setDate(d.getDate() - 1);
          currentDate = d.toISOString().split('T')[0];
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Failed to calculate meal streak:', error);
      return 0;
    }
  };

  const calculateWorkoutStreak = async (): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('workout_date')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false })
        .limit(365);

      if (error) throw error;

      if (!data || data.length === 0) return 0;

      const uniqueDates = [...new Set(data.map((item) => item.workout_date.split('T')[0]))]
        .sort()
        .reverse();

      let streak = 0;
      const today = new Date().toISOString().split('T')[0];
      let currentDate = today;

      for (const date of uniqueDates) {
        if (date === currentDate) {
          streak++;
          const d = new Date(currentDate);
          d.setDate(d.getDate() - 1);
          currentDate = d.toISOString().split('T')[0];
        } else {
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Failed to calculate workout streak:', error);
      return 0;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const maxStreak = Math.max(...streaks.map((s) => s.count));

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Flame className="h-6 w-6 text-orange-500" />
        <h3 className="text-lg font-semibold">Your Streaks</h3>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {streaks.map((streak, index) => (
          <motion.div
            key={streak.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg bg-gradient-to-br ${streak.color} text-white relative overflow-hidden`}
          >
            {/* Background Icon */}
            <div className="absolute top-2 right-2 opacity-20">
              {React.cloneElement(streak.icon as React.ReactElement, {
                className: 'h-12 w-12',
              })}
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-2">
                {streak.icon}
                {streak.count === maxStreak && streak.count > 0 && (
                  <Trophy className="h-4 w-4" />
                )}
              </div>

              <div className="text-3xl font-bold mb-1">{streak.count}</div>

              <div className="text-xs opacity-90">{streak.label}</div>
            </div>

            {/* Fire Effect */}
            {streak.count > 0 && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/30"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Motivation Message */}
      <div className="mt-4 p-3 bg-muted rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          {maxStreak === 0 ? (
            "Start your streak today! Log a meal or workout to begin. 🚀"
          ) : maxStreak < 7 ? (
            `Great start! Keep going to reach a 7-day streak! 🔥`
          ) : maxStreak < 30 ? (
            `Amazing! You're on fire! Aim for a 30-day streak! 💪`
          ) : (
            `Incredible ${maxStreak}-day streak! You're a champion! 🏆`
          )}
        </p>
      </div>
    </Card>
  );
}
