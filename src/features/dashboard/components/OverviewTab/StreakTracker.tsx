/**
 * StreakTracker Component
 * Big streak counter with GitHub-style heatmap
 * Gamification gold - highly engaging!
 */

import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Flame, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '@/shared/design-system';

export interface StreakData {
  current_streak: number;
  longest_streak: number;
  total_days_logged: number;
  last_logged_date?: string;
  streak_type: string;
}

interface StreakTrackerProps {
  streak?: StreakData;
  loading?: boolean;
}

export function StreakTracker({ streak, loading }: StreakTrackerProps) {
  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const totalDays = streak?.total_days_logged || 0;

  // Determine streak status
  const getStreakStatus = () => {
    if (currentStreak === 0) return { message: 'Start your journey!', color: 'gray', icon: Flame };
    if (currentStreak >= 100) return { message: '🔥 LEGENDARY STREAK!', color: 'gold', icon: Trophy };
    if (currentStreak >= 30) return { message: '🔥 Amazing commitment!', color: 'orange', icon: Flame };
    if (currentStreak >= 7) return { message: '🔥 Great momentum!', color: 'primary', icon: TrendingUp };
    return { message: '🔥 Keep it up!', color: 'success', icon: Flame };
  };

  const status = getStreakStatus();

  // Generate last 30 days for heatmap
  const generateHeatmap = () => {
    const days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simulate activity (would come from daily_activity_summary in production)
      const isActive = i <= currentStreak;
      const intensity = isActive ? Math.min(4, Math.floor(currentStreak / 7) + 1) : 0;

      days.push({
        date: date.toISOString().split('T')[0],
        intensity, // 0-4 scale
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    return days;
  };

  const heatmapDays = generateHeatmap();

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading streak...
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg" hover>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Daily Streak
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consistency is key to success
            </p>
          </div>
          <Badge variant={status.color as any} size="lg">
            {status.icon && <status.icon className="w-4 h-4 mr-1" />}
            Active
          </Badge>
        </div>

        {/* Big Streak Counter */}
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-3"
          >
            <motion.div
              animate={{
                scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            >
              <Flame
                className={cn(
                  'w-16 h-16',
                  currentStreak === 0 && 'text-gray-300 dark:text-gray-700',
                  currentStreak > 0 && currentStreak < 7 && 'text-orange-400',
                  currentStreak >= 7 && currentStreak < 30 && 'text-orange-500',
                  currentStreak >= 30 && currentStreak < 100 && 'text-orange-600',
                  currentStreak >= 100 && 'text-yellow-500'
                )}
              />
            </motion.div>
            <div className="text-left">
              <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
                {currentStreak}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentStreak === 1 ? 'day' : 'days'} in a row
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'mt-4 text-lg font-semibold',
              status.color === 'gold' && 'text-yellow-600 dark:text-yellow-400',
              status.color === 'orange' && 'text-orange-600 dark:text-orange-400',
              status.color === 'primary' && 'text-primary-600 dark:text-primary-400',
              status.color === 'success' && 'text-success-600 dark:text-success-400',
              status.color === 'gray' && 'text-gray-600 dark:text-gray-400'
            )}
          >
            {status.message}
          </motion.p>
        </div>

        {/* Heatmap Calendar (GitHub style) */}
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Last 30 days
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {heatmapDays.map((day, index) => (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={cn(
                  'aspect-square rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-primary-400',
                  day.intensity === 0 && 'bg-gray-100 dark:bg-gray-800',
                  day.intensity === 1 && 'bg-green-200 dark:bg-green-900/40',
                  day.intensity === 2 && 'bg-green-400 dark:bg-green-700/60',
                  day.intensity === 3 && 'bg-green-500 dark:bg-green-600/80',
                  day.intensity === 4 && 'bg-green-600 dark:bg-green-500'
                )}
                title={`${day.date} - ${day.intensity > 0 ? 'Logged' : 'No activity'}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {longestStreak}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Longest Streak
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {totalDays}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Total Days
            </div>
          </div>
        </div>

        {/* Milestone Progress */}
        {currentStreak > 0 && currentStreak < 100 && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
              <span>Next milestone</span>
              <span className="font-semibold">
                {currentStreak < 7 ? '7 days' : currentStreak < 30 ? '30 days' : '100 days'}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    currentStreak < 7
                      ? (currentStreak / 7) * 100
                      : currentStreak < 30
                      ? ((currentStreak - 7) / 23) * 100
                      : ((currentStreak - 30) / 70) * 100
                  }%`,
                }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  currentStreak < 7 && 'bg-green-500',
                  currentStreak >= 7 && currentStreak < 30 && 'bg-orange-500',
                  currentStreak >= 30 && 'bg-yellow-500'
                )}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
