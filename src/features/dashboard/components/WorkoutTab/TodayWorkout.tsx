/**
 * TodayWorkout Component
 * Display today's workout plan
 * Uses design system variants
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/design-system';
import { motion } from 'framer-motion';
import { Clock, Dumbbell, Flame } from 'lucide-react';

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  duration?: number;
  calories?: number;
  completed?: boolean;
}

interface TodayWorkoutProps {
  workout?: {
    name: string;
    exercises: WorkoutExercise[];
  };
  onComplete?: (exerciseId: string) => void;
  loading?: boolean;
}

export function TodayWorkout({ workout, onComplete, loading }: TodayWorkoutProps) {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8 text-muted-foreground">
          Loading workout...
        </div>
      </Card>
    );
  }

  if (!workout) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8">
          <Dumbbell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-muted-foreground">
            No workout planned for today
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {workout.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          {workout.plan_data.weekly_plan.flatMap(day => day.exercises)?.length} exercises
        </p>
      </div>

      <div className="space-y-3">
        {workout.plan_data.weekly_plan.flatMap(day => day.exercises).map((exercise, index) => (
          <motion.div
            key={exercise.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              'p-4 rounded-lg border transition-all',
              exercise.completed
                ? 'bg-success-light/20 border-success dark:bg-success-dark/10 dark:border-success'
                : 'bg-background border-border'
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-medium text-foreground mb-2">
                  {exercise.name}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {exercise.sets && exercise.reps && (
                    <span>
                      {exercise.sets} × {exercise.reps} reps
                    </span>
                  )}
                  {exercise.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exercise.duration} min
                    </span>
                  )}
                  {exercise.calories && (
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {exercise.calories} cal
                    </span>
                  )}
                </div>
              </div>
              <div>
                {exercise.completed ? (
                  <Badge variant="success" size="sm">
                    ✓ Done
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onComplete?.(exercise.id)}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
