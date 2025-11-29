/**
 * WorkoutList Component
 * Display recent workout history
 * Uses design system variants
 */

import { motion } from 'framer-motion';
import { Dumbbell, Clock, Flame, Calendar } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';

export interface WorkoutLog {
  id: string;
  workout_name: string;
  duration_minutes: number;
  calories_burned: number;
  completed_at: string;
}

interface WorkoutListProps {
  workouts: WorkoutLog[];
  loading?: boolean;
}

export function WorkoutList({ workouts, loading }: WorkoutListProps) {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading workouts...
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Recent Workouts
      </h3>

      {workouts.length === 0 ? (
        <div className="text-center py-8">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">
            No workouts logged yet
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout, index) => {
            const date = new Date(workout.completed_at);
            const timeAgo = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-accent-600 dark:text-accent-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        {workout.workout_name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {timeAgo}
                      </div>
                    </div>
                  </div>
                  <Badge variant="accent" size="sm">
                    Completed
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{workout.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Flame className="w-4 h-4" />
                    <span>{workout.calories_burned} cal</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
