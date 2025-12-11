/**
 * AI Workout Plan Selector Component
 * Select and log workouts from your AI-generated personalized workout plan
 * Integrates with LogWorkout workflow for seamless workout logging
 */

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface WorkoutExercise {
  exercise_name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  tempo?: string;
  notes?: string;
}

interface Workout {
  day: string;
  focus: string;
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  warm_up?: string[];
  exercises: WorkoutExercise[];
  cool_down?: string[];
}

interface AIWorkoutPlanSelectorProps {
  workoutPlan: any; // GraphQL node with plan_data as JSON
  onSelectWorkout: (exercises: any[]) => void;
  onClose?: () => void;
}

export function AIWorkoutPlanSelector({
  workoutPlan,
  onSelectWorkout,
  onClose,
}: AIWorkoutPlanSelectorProps) {
  const navigate = useNavigate();
  const [expandedWorkout, setExpandedWorkout] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Parse plan_data from GraphQL response
  const planData = workoutPlan?.plan_data ?
    (typeof workoutPlan.plan_data === 'string' ? JSON.parse(workoutPlan.plan_data) : workoutPlan.plan_data)
    : null;

  if (!planData || !planData.workouts || planData.workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Workout Plan</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-xl font-semibold mb-2">Generate Your Personalized Workout Plan</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get AI-powered workout recommendations based on your fitness goals and experience level.
          </p>
          <Button variant="primary" onClick={() => navigate('/plans')}>
            Generate Workout Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const workouts = planData.workouts || [];

  // Filter workouts by selected day
  const filteredWorkouts = selectedDay === 'all'
    ? workouts
    : workouts.filter((w: Workout) => w.day.toLowerCase() === selectedDay.toLowerCase());

  const displayWorkouts = filteredWorkouts.length > 0 ? filteredWorkouts : workouts;

  // Get unique days for filter
  const uniqueDays = ['all', ...Array.from(new Set(workouts.map((w: Workout) => w.day)))];

  const handleSelectWorkout = (workout: Workout) => {
    // Convert workout exercises to the format expected by LogWorkout
    const exercises = workout.exercises.map((exercise, index) => ({
      id: `ai-workout-${Date.now()}-${index}`,
      name: exercise.exercise_name,
      category: workout.focus,
      muscle_group: workout.focus,
      equipment: 'Mixed',
      difficulty: workout.difficulty,
      sets: Array.from({ length: exercise.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: parseInt(exercise.reps.split('-')[0]) || 10,
        weight: 0,
        completed: false,
      })),
      notes: exercise.notes || '',
    }));

    onSelectWorkout(exercises);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Workout Plan</h3>
          <p className="text-sm text-muted-foreground">
            Select workouts from your personalized plan
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Close
          </Button>
        )}
      </div>

      {/* Day Filter */}
      <Card className="border-primary-500/50 bg-gradient-to-r from-primary-500/5 to-secondary-500/5">
        <CardHeader>
          <CardTitle className="text-base">Select Training Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {uniqueDays.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  selectedDay === day
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workouts List */}
      {displayWorkouts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🏋️</div>
            <h4 className="text-lg font-semibold mb-2">No Workouts in Plan</h4>
            <p className="text-sm text-muted-foreground">
              Your workout plan doesn't have any workouts yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayWorkouts.map((workout: Workout, index: number) => {
            const isExpanded = expandedWorkout === index;

            return (
              <Card
                key={index}
                className="transition-all hover:shadow-lg cursor-pointer border-2 border-transparent hover:border-primary-500/30"
              >
                <CardContent className="pt-6 space-y-4">
                  {/* Workout Header */}
                  <div onClick={() => setExpandedWorkout(isExpanded ? null : index)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="primary" className="uppercase">
                            💪 {workout.day}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            🕐 {workout.duration_minutes} min
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(workout.difficulty)}`}>
                            {workout.difficulty}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-bold mb-1">{workout.focus}</h4>
                        <p className="text-xs text-muted-foreground">
                          {workout.exercises.length} exercises
                        </p>
                      </div>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-transform"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        ⌄
                      </button>
                    </div>

                    {/* Exercise Count Pills */}
                    <div className="flex gap-2 flex-wrap">
                      {workout.exercises.slice(0, 3).map((exercise, i) => (
                        <div key={i} className="px-3 py-1.5 bg-muted/50 rounded-full">
                          <span className="text-xs font-medium">{exercise.exercise_name}</span>
                        </div>
                      ))}
                      {workout.exercises.length > 3 && (
                        <div className="px-3 py-1.5 bg-muted/50 rounded-full">
                          <span className="text-xs font-medium">
                            +{workout.exercises.length - 3} more
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-border space-y-4">
                      {/* Warm Up */}
                      {workout.warm_up && workout.warm_up.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <span>🔥</span> Warm Up
                          </h5>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {workout.warm_up.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Exercises List */}
                      <div>
                        <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <span>💪</span> Exercises
                        </h5>
                        <div className="space-y-2">
                          {workout.exercises.map((exercise, i) => (
                            <div
                              key={i}
                              className="p-3 bg-muted/30 rounded-lg"
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-sm">{exercise.exercise_name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {exercise.sets} sets
                                </span>
                              </div>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>Reps: {exercise.reps}</span>
                                <span>Rest: {exercise.rest_seconds}s</span>
                                {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                              </div>
                              {exercise.notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  {exercise.notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cool Down */}
                      {workout.cool_down && workout.cool_down.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <span>🧘</span> Cool Down
                          </h5>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {workout.cool_down.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleSelectWorkout(workout)}
                  >
                    Start {workout.focus} Workout
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Full Plan */}
      <div className="flex items-center justify-center pt-4">
        <Button variant="outline" onClick={() => navigate('/plans')}>
          View Full Workout Plan →
        </Button>
      </div>

      {/* Info */}
      <div className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/20">
        <h4 className="text-sm font-semibold mb-1">🤖 AI-Powered Training</h4>
        <p className="text-xs text-muted-foreground">
          These workouts are tailored to your fitness level, goals, and available equipment.
          All sets, reps, and rest periods are optimized for your progression.
        </p>
      </div>
    </div>
  );
}
