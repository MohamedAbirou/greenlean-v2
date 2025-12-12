/**
 * Modern Workout Tab - Premium Exercise Tracking
 * Gorgeous UI with workout cards and performance metrics
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Dumbbell, Plus, Trash2, Clock, Flame, TrendingUp, Award, Zap, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSessionsByDate } from '../hooks/useDashboardData';
import { useDeleteWorkoutSession } from '../hooks/useDashboardMutations';
import { DatePicker } from './DatePicker';

const getToday = () => new Date().toISOString().split('T')[0];

export function WorkoutTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data, loading, refetch } = useWorkoutSessionsByDate(selectedDate);
  const [deleteWorkoutSession] = useDeleteWorkoutSession();

  const workoutLogs = (data as any)?.workout_logsCollection?.edges?.map((e: any) => e.node) || [];

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('Delete this workout log?')) {
      await deleteWorkoutSession({ variables: { id } });
      refetch();
    }
  };

  // Calculate totals
  const totals = workoutLogs.reduce(
    (acc: any, log: any) => ({
      duration: acc.duration + (log.duration_minutes || 0),
      calories: acc.calories + (log.calories_burned || 0),
      exercises: acc.exercises + (log.exercises?.length || 0),
      completed: acc.completed + (log.completed ? 1 : 0),
    }),
    { duration: 0, calories: 0, exercises: 0, completed: 0 }
  );

  const workoutTypeConfig: Record<string, { emoji: string, color: string, gradient: string }> = {
    strength: { emoji: '💪', color: 'purple', gradient: 'from-purple-500 to-pink-600' },
    cardio: { emoji: '🏃', color: 'blue', gradient: 'from-blue-500 to-cyan-600' },
    hiit: { emoji: '⚡', color: 'orange', gradient: 'from-orange-500 to-red-600' },
    flexibility: { emoji: '🧘', color: 'green', gradient: 'from-green-500 to-emerald-600' },
    sports: { emoji: '⚽', color: 'yellow', gradient: 'from-yellow-500 to-orange-600' },
    other: { emoji: '🏋️', color: 'gray', gradient: 'from-gray-500 to-slate-600' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-purple-600" />
            Workout Tracker
          </h2>
          <p className="text-muted-foreground mt-1">Track your training sessions</p>
        </div>
        <Button onClick={() => navigate('/dashboard/log-workout')} className="bg-gradient-to-r from-purple-500 to-pink-600">
          <Plus className="h-4 w-4 mr-2" />
          Log Workout
        </Button>
      </div>

      {/* Date Picker */}
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Stats Grid */}
      {workoutLogs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Workouts */}
          <Card className="relative overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="h-5 w-5 text-purple-500" />
                <Badge variant={totals.completed === workoutLogs.length ? 'success' : 'secondary'}>
                  {totals.completed}/{workoutLogs.length}
                </Badge>
              </div>
              <p className="text-3xl font-bold">{workoutLogs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Workouts</p>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card className="relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold">{totals.duration}</p>
              <p className="text-xs text-muted-foreground mt-1">Minutes</p>
            </CardContent>
          </Card>

          {/* Calories */}
          <Card className="relative overflow-hidden border-2 border-orange-500/20 hover:border-orange-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold">{totals.calories}</p>
              <p className="text-xs text-muted-foreground mt-1">Calories</p>
            </CardContent>
          </Card>

          {/* Exercises */}
          <Card className="relative overflow-hidden border-2 border-green-500/20 hover:border-green-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold">{totals.exercises}</p>
              <p className="text-xs text-muted-foreground mt-1">Exercises</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workouts List */}
      <div>
        <h3 className="text-xl font-bold mb-4">Training Sessions</h3>

        {workoutLogs.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
                <Dumbbell className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Workouts Logged Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your training to see your progress!
              </p>
              <Button onClick={() => navigate('/dashboard/log-workout')} className="bg-gradient-to-r from-purple-500 to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workoutLogs.map((workout: any) => {
              const config = workoutTypeConfig[workout.workout_type] || workoutTypeConfig.other;
              const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];

              return (
                <Card key={workout.id} className="group hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: `hsl(var(--${config.color}))` }}>
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Workout Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl`}>
                            {config.emoji}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-bold capitalize">{workout.workout_type} Workout</h4>
                              {workout.completed && (
                                <Badge variant="success" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {workout.duration_minutes} min • {exercises.length} exercises • {workout.calories_burned || 0} cal burned
                            </p>
                          </div>
                        </div>

                        {/* Exercises List */}
                        {exercises.length > 0 && (
                          <div className="ml-[68px] space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">Exercises:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {exercises.map((exercise: any, idx: number) => {
                                const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
                                const completedSets = sets.filter((s: any) => s.completed).length;
                                const totalSets = sets.length;

                                return (
                                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                    <div>
                                      <p className="text-sm font-medium">{exercise.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {completedSets}/{totalSets} sets
                                        {sets.length > 0 && (
                                          <span> • {sets[0].weight_kg}kg × {sets[0].reps} reps</span>
                                        )}
                                      </p>
                                    </div>
                                    {completedSets === totalSets && (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {workout.notes && (
                          <div className="ml-[68px] mt-3 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">Note</p>
                            <p className="text-sm mt-1">{workout.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          onClick={() => handleDeleteWorkout(workout.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {workoutLogs.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold">Performance Summary</h4>
                <p className="text-xs text-muted-foreground">Your training metrics for today</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round((totals.completed / workoutLogs.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totals.duration / workoutLogs.length)}min</p>
                  <p className="text-xs text-muted-foreground">Avg Duration</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totals.calories / workoutLogs.length)}</p>
                  <p className="text-xs text-muted-foreground">Avg Calories</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
