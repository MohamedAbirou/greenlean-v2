/**
 * TodayWorkout Component - FIXED
 * Display today's workout plan with proper data structure handling
 * Uses design system variants
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/design-system';
import { motion } from 'framer-motion';
import { Clock, Dumbbell, Flame, Target } from 'lucide-react';

export interface WorkoutExercise {
  id?: string;
  name: string;
  sets?: number;
  reps?: number | string;
  duration?: number;
  calories?: number;
  completed?: boolean;
  rest_seconds?: number;
  tempo?: string;
  notes?: string;
}

interface TodayWorkoutProps {
  workout?: {
    id?: string;
    plan_data?: {
      weekly_plan?: Array<{
        day_name: string;
        exercises: WorkoutExercise[];
      }>;
      exercises?: WorkoutExercise[];
    };
    workout_type?: string;
    duration_per_session?: string;
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

  if (!workout || !workout.plan_data) {
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

  // Extract exercises from plan_data
  // Handle both weekly_plan array and direct exercises array
  const exercises: WorkoutExercise[] = workout.plan_data.weekly_plan
    ? workout.plan_data.weekly_plan.flatMap(day => day.exercises || [])
    : workout.plan_data.exercises || [];

  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayPlan = workout.plan_data.weekly_plan?.find(
    day => day.day_name.toLowerCase() === today.toLowerCase()
  );

  // Use today's exercises if available, otherwise show all
  const displayExercises = todayPlan?.exercises || exercises.slice(0, 5);

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">
            {todayPlan ? `${today}'s Workout` : 'Your Workout Plan'}
          </h3>
          {workout.workout_type && (
            <Badge variant="secondary" className="capitalize">
              {workout.workout_type}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4" />
          {displayExercises.length} exercises
          {workout.duration_per_session && ` • ${workout.duration_per_session}`}
        </p>
      </div>

      <div className="space-y-3">
        {displayExercises.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Rest day - no exercises planned
          </div>
        ) : (
          displayExercises.map((exercise, index) => (
            <motion.div
              key={exercise.id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'p-4 rounded-lg border transition-all',
                exercise.completed
                  ? 'bg-success-light/20 border-success dark:bg-success-dark/10 dark:border-success'
                  : 'bg-background border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-foreground mb-2">
                    {exercise.name}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
                    {exercise.sets && exercise.reps && (
                      <span className="flex items-center gap-1">
                        <Dumbbell className="w-3 h-3" />
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
                    {exercise.rest_seconds && (
                      <span className="text-xs">
                        Rest: {exercise.rest_seconds}s
                      </span>
                    )}
                  </div>
                  {exercise.notes && (
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      {exercise.notes}
                    </p>
                  )}
                </div>

                {onComplete && !exercise.completed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onComplete(exercise.id || String(index))}
                    className="ml-2"
                  >
                    Complete
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {!todayPlan && workout.plan_data.weekly_plan && (
        <div className="mt-4 p-3 bg-accent/10 rounded-lg text-sm text-muted-foreground text-center">
          Showing workout preview. View full weekly plan in the Plans section.
        </div>
      )}
    </Card>
  );
}
