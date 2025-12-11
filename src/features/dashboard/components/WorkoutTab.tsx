/**
 * Workout Tab
 * View and manage workout sessions
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
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

  const getStatusColor = (completed: boolean) => {
    return completed ? 'success' : 'gray';
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Workouts</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        />
      </div>

      {/* Quick Log Button */}
      <Button
        onClick={() => navigate('/dashboard/log-workout')}
        variant="primary"
        size="lg"
        fullWidth
      >
        ➕ Log Workout
      </Button>

      {/* Workout Logs */}
      {workoutLogs.length > 0 ? (
        <div className="space-y-4">
          {workoutLogs.map((log: any) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="capitalize">{log.workout_type}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.exercises?.length || 0} exercises
                    </p>
                  </div>
                  <Badge variant={getStatusColor(log.completed)}>
                    {log.completed ? 'Completed' : 'Incomplete'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold">
                      {log.duration_minutes || 0} min
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-lg font-semibold">
                      {log.calories_burned || 0} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Exercises</p>
                    <p className="text-lg font-semibold">{log.exercises?.length || 0}</p>
                  </div>
                </div>

                {log.notes && (
                  <p className="text-sm text-muted-foreground mb-3">
                    📝 {log.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleDeleteWorkout(log.id)}
                    variant="ghost"
                    size="sm"
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No workouts logged yet</p>
            <Button onClick={() => navigate('/dashboard/log-workout')} variant="primary">
              Log Your First Workout
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
