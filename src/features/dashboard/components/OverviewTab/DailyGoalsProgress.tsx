/**
 * DailyGoalsProgress Component
 * Circular progress rings for daily goals - Apple Watch style
 * Highly visual and motivating!
 */

import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/design-system';
import { motion } from 'framer-motion';
import { Check, Droplet, Dumbbell, Flame, Target } from 'lucide-react';

export interface DailyGoal {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  icon: any;
  color: string;
  completed: boolean;
}

interface DailyGoalsProgressProps {
  goals?: DailyGoal[];
  loading?: boolean;
}

// Circular progress component
function CircularProgress({
  progress,
  color,
  size = 80,
  strokeWidth = 8,
}: {
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="none"
        className="text-muted-foreground"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

export function DailyGoalsProgress({ goals, loading }: DailyGoalsProgressProps) {
  // Default goals if not provided
  const defaultGoals: DailyGoal[] = [
    {
      id: 'calories',
      name: 'Calories',
      current: 0,
      target: 2000,
      unit: 'kcal',
      icon: Flame,
      color: '#f97316',
      completed: false,
    },
    {
      id: 'protein',
      name: 'Protein',
      current: 0,
      target: 150,
      unit: 'g',
      icon: Target,
      color: '#ef4444',
      completed: false,
    },
    {
      id: 'water',
      name: 'Water',
      current: 0,
      target: 8,
      unit: 'glasses',
      icon: Droplet,
      color: '#3b82f6',
      completed: false,
    },
    {
      id: 'workout',
      name: 'Workout',
      current: 0,
      target: 1,
      unit: 'session',
      icon: Dumbbell,
      color: '#8b5cf6',
      completed: false,
    },
  ];

  const displayGoals = goals || defaultGoals;
  const completedGoals = displayGoals.filter((g) => g.completed).length;
  const totalGoals = displayGoals.length;
  const overallProgress = (completedGoals / totalGoals) * 100;

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8 text-muted-foreground">
          Loading goals...
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
            <h3 className="text-lg font-semibold text-foreground">
              Daily Goals
            </h3>
            <p className="text-sm text-muted-foreground">
              {completedGoals} of {totalGoals} completed
            </p>
          </div>
          {completedGoals === totalGoals && totalGoals > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <Badge variant="success" size="lg">
                <Check className="w-4 h-4 mr-1" />
                Perfect Day!
              </Badge>
            </motion.div>
          )}
        </div>

        {/* Overall Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold text-foreground">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                overallProgress === 100
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-primary-500 to-primary-600'
              )}
            />
          </div>
        </div>

        {/* Goal Rings Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {displayGoals.map((goal, index) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const Icon = goal.icon;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex flex-col items-center p-4 rounded-lg bg-muted transition-all hover:bg-gray-100 dark:hover:bg-gray-800">
                  {/* Circular Progress */}
                  <div className="relative mb-3">
                    <CircularProgress progress={progress} color={goal.color} size={80} strokeWidth={8} />

                    {/* Icon in center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="p-2 rounded-full"
                        style={{
                          backgroundColor: `${goal.color}20`,
                        }}
                      >
                        <Icon
                          className="w-6 h-6"
                          style={{ color: goal.color }}
                        />
                      </div>
                    </div>

                    {/* Checkmark if completed */}
                    {goal.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Goal Info */}
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      {goal.current}
                      <span className="text-sm text-muted-foreground">
                        /{goal.target}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {goal.name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {goal.unit}
                    </div>
                  </div>

                  {/* Progress percentage */}
                  <div className="mt-2">
                    <Badge
                      variant={goal.completed ? 'success' : 'gray'}
                      size="sm"
                    >
                      {Math.round(progress)}%
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Motivational Message */}
        {completedGoals > 0 && completedGoals < totalGoals && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
          >
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {completedGoals === totalGoals - 1
                ? '🎯 Almost there! One more goal to go!'
                : `💪 Great progress! ${totalGoals - completedGoals} goals remaining`}
            </p>
          </motion.div>
        )}

        {/* Perfect Day Celebration */}
        {completedGoals === totalGoals && totalGoals > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-center p-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800"
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              className="text-4xl mb-2"
            >
              🎉
            </motion.div>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              Perfect Day Achieved!
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              You hit all your goals today. Keep up the amazing work!
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
