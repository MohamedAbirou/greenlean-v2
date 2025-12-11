/**
 * Workout Tab - Production Grade
 * View and manage workout sessions with enhanced UI
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Progress } from '@/shared/components/ui/progress';
import { DateScroller } from './DateScroller';
import { useWorkoutSessionsByDate } from '../hooks/useDashboardData';
import { useDeleteWorkoutSession } from '../hooks/useDashboardMutations';

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

  const workoutTypeIcons: Record<string, string> = {
    strength: '💪',
    cardio: '🏃',
    flexibility: '🧘',
    sports: '⚽',
    other: '🏋️',
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Scroller */}
      <DateScroller selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Workout Summary Card */}
      {workoutLogs.length > 0 && (
        <Card variant="elevated" className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Daily Workout Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDate === getToday() ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
                </p>
              </div>
              <Badge variant="success" className="text-lg px-4 py-2">
                {totals.completed} / {workoutLogs.length}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{workoutLogs.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Workouts</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{totals.duration}</p>
                <p className="text-xs text-muted-foreground mt-1">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-error">{totals.calories}</p>
                <p className="text-xs text-muted-foreground mt-1">Calories</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{totals.exercises}</p>
                <p className="text-xs text-muted-foreground mt-1">Exercises</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Completion Rate</span>
                <span className="font-semibold">{workoutLogs.length > 0 ? Math.round((totals.completed / workoutLogs.length) * 100) : 0}%</span>
              </div>
              <Progress value={workoutLogs.length > 0 ? (totals.completed / workoutLogs.length) * 100 : 0} className="h-3" />
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => navigate('/dashboard/log-workout')} variant="primary" size="lg" fullWidth className="h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">➕</span>
            <span className="font-semibold">Log Workout</span>
          </div>
        </Button>
        <Button onClick={() => navigate('/dashboard/log-workout?quick=true')} variant="secondary" size="lg" fullWidth className="h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-semibold">Quick Log</span>
          </div>
        </Button>
      </div>

      {/* Workout Logs - Enhanced */}
      {workoutLogs.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Today's Workouts</h3>
            <p className="text-sm text-muted-foreground">{workoutLogs.length} session{workoutLogs.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="space-y-4">
            {workoutLogs.map((log: any, idx: number) => {
              const typeIcon = workoutTypeIcons[log.workout_type] || workoutTypeIcons.other;

              return (
                <Card key={log.id} className="overflow-hidden">
                  <div className="bg-gradient-to-r from-muted/50 to-transparent p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{typeIcon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              #{idx + 1}
                            </Badge>
                            <h4 className="text-lg font-semibold capitalize">{log.workout_type}</h4>
                          </div>
                          <p className="text-xs text-muted-foreground">{log.exercises?.length || 0} exercise{log.exercises?.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <Badge variant={log.completed ? 'success' : 'gray'} className="px-3 py-1">
                        {log.completed ? '✓ Completed' : '○ In Progress'}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{log.duration_minutes || 0}</p>
                        <p className="text-xs text-muted-foreground">Minutes</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{log.calories_burned || 0}</p>
                        <p className="text-xs text-muted-foreground">Calories</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{log.exercises?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Exercises</p>
                      </div>
                    </div>

                    {/* Exercises List */}
                    {log.exercises && log.exercises.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold mb-2">Exercises</p>
                        <div className="space-y-1">
                          {log.exercises.slice(0, 3).map((ex: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm">
                              <span>{ex.name || `Exercise ${i + 1}`}</span>
                              <span className="text-muted-foreground">{ex.sets || 0} × {ex.reps || 0}</span>
                            </div>
                          ))}
                          {log.exercises.length > 3 && (
                            <p className="text-xs text-muted-foreground text-center py-1">
                              + {log.exercises.length - 3} more
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {log.notes && (
                      <div className="p-3 bg-muted/30 rounded-lg mb-3">
                        <p className="text-sm text-muted-foreground">📝 {log.notes}</p>
                      </div>
                    )}

                    {/* Timestamp */}
                    <p className="text-xs text-muted-foreground mb-3">
                      Logged at {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/dashboard/log-workout?edit=${log.id}`)}
                        variant="outline"
                        size="sm"
                        fullWidth
                      >
                        ✏️ Edit
                      </Button>
                      <Button
                        onClick={() => navigate(`/dashboard/log-workout?copy=${log.id}`)}
                        variant="outline"
                        size="sm"
                        fullWidth
                      >
                        📋 Copy
                      </Button>
                      <Button
                        onClick={() => handleDeleteWorkout(log.id)}
                        variant="ghost"
                        size="sm"
                      >
                        🗑️
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-16">
            <div className="text-6xl mb-4">💪</div>
            <h3 className="text-xl font-semibold mb-2">No Workouts Logged Yet</h3>
            <p className="text-muted-foreground mb-6">Start tracking your workouts to see your progress!</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard/log-workout')} variant="primary" size="lg">
                Log Your First Workout
              </Button>
              <Button onClick={() => navigate('/dashboard/log-workout?quick=true')} variant="outline" size="lg">
                Quick Log
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
