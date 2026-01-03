/**
 * AI Workout Plan Selector Component
 * Select and log workouts from your AI-generated personalized workout plan
 * Integrates with LogWorkout workflow for seamless workout logging
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Calendar } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface WorkoutExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  equipment_needed?: string[];
  tempo?: string;
  safety_notes?: string;
}

interface Workout {
  day: string;
  focus: string;
  training_location?: string;
  duration_minutes: number;
  intensity: 'low' | 'intermediate' | 'high';
  warmup?: any;
  exercises: WorkoutExercise[];
  cooldown?: any;
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


  if (!planData || !planData.weekly_plan || planData.weekly_plan.length === 0) {
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

  const workouts = planData.weekly_plan || [];
  const weeklySummary = planData.weekly_summary || {};

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
      name: exercise.name,
      category: workout.focus,
      muscle_group: workout.focus,
      equipments: exercise.equipment_needed,
      difficulty: workout.intensity,
      sets: Array.from({ length: exercise.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: parseInt(exercise.reps.split('-')[0]) || 10,
        weight: 0,
        completed: false,
      })),
      notes: exercise.safety_notes || '',
    }));

    onSelectWorkout(exercises);
  };

  const getDifficultyColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high':
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

      {/* Daily Summary */}
      <Card variant="elevated">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-foreground">Weekly Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
            <p className="text-sm text-muted-foreground">Workout Days</p>
            <p className="text-xl font-bold text-purple-600">{weeklySummary.total_workout_days || 0}</p>
          </div>
          <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-xl font-bold text-blue-600">{weeklySummary.total_time_minutes || 0} min</p>
          </div>
          <div className="p-2 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
            <p className="text-sm text-muted-foreground">Calories Burned</p>
            <p className="text-xl font-bold text-orange-600">{weeklySummary.estimated_weekly_calories_burned || 0}</p>
          </div>
          <div className="p-2 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <p className="text-xl font-bold text-green-600 capitalize">{weeklySummary.difficulty_level || 'Medium'}</p>
          </div>
        </div>
        {weeklySummary.training_split && (
          <div className="mt-4 p-2 bg-accent/10 rounded-lg">
            <p className="text-sm">
              <strong>Training Split:</strong> {weeklySummary.training_split}
            </p>
          </div>
        )}
        {weeklySummary.progression_strategy && (
          <div className="mt-2 p-2 bg-primary/10 rounded-lg">
            <p className="text-sm">
              <strong>Progression Strategy:</strong> {weeklySummary.progression_strategy}
            </p>
          </div>
        )}
      </Card>

      {/* Day Filter */}
      <Card className="p-2 border-primary-500/50 bg-gradient-to-r from-primary-500/5 to-secondary-500/5">
        <CardHeader>
          <CardTitle className="text-base">Select Training Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {uniqueDays.map((day: any, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(day as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${selectedDay === day
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
                <CardContent className="p-2 space-y-4">
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
                          <Badge className={`text-xs ${getDifficultyColor(workout.intensity)}`}>
                            {workout.intensity}
                          </Badge>
                          <Badge variant="accent" className="text-xs ">
                            {workout.training_location}
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
                        {isExpanded ? '▲' : '▼'}
                      </button>
                    </div>

                    {/* Exercise Count Pills */}
                    <div className="flex gap-2 flex-wrap">
                      {workout.exercises.slice(0, 3).map((exercise, i) => (
                        <div key={i} className="px-3 py-1.5 bg-muted/50 rounded-full">
                          <span className="text-xs font-medium">{exercise.name}</span>
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
                      {workout.warmup && workout.warmup.activities.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <span>🔥</span> Warm Up
                          </h5>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {workout.warmup.activities.map((item: string, i: number) => (
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
                                <span className="font-medium text-sm">{exercise.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {exercise.sets} sets
                                </span>
                              </div>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>Reps: {exercise.reps}</span>
                                <span>Rest: {exercise.rest_seconds}s</span>
                                {exercise.tempo && <span>Tempo: {exercise.tempo}</span>}
                              </div>
                              {exercise.safety_notes && (
                                <p className="text-xs text-muted-foreground mt-1 italic">
                                  {exercise.safety_notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cool Down */}
                      {workout.cooldown && workout.cooldown.activities.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <span>🧘</span> Cool Down
                          </h5>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {workout.cooldown.activities.map((item: string, i: number) => (
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
