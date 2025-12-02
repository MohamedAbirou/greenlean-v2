/**
 * WorkoutList Component
 * Display recent workout history
 * Uses design system variants
 */

import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Clock, Dumbbell, Flame } from 'lucide-react';

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
        <div className="text-center py-8 text-muted-foreground">
          Loading workouts...
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-lg font-semibold mb-6 text-foreground">
        Recent Workouts
      </h3>

      {workouts.length === 0 ? (
        <div className="text-center py-8">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground">
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
                className="p-4 rounded-lg bg-background border border-border hover:border-primary-300 dark:hover:border-primary-600 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">
                        {workout.workout_name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
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
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{workout.duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
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
