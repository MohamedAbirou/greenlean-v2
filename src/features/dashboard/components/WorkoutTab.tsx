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

  const workoutSessions = data?.workout_sessionsCollection?.edges?.map((e) => e.node) || [];

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('Delete this workout session?')) {
      await deleteWorkoutSession({ variables: { id } });
      refetch();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'skipped':
        return 'warning';
      default:
        return 'gray';
    }
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

      {/* Workout Sessions */}
      {workoutSessions.length > 0 ? (
        <div className="space-y-4">
          {workoutSessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{session.workout_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {session.workout_type}
                    </p>
                  </div>
                  <Badge variant={getStatusColor(session.status)}>{session.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Exercises</p>
                    <p className="text-lg font-semibold">{session.total_exercises}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sets</p>
                    <p className="text-lg font-semibold">{session.total_sets}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Volume</p>
                    <p className="text-lg font-semibold">
                      {Math.round(session.total_volume_kg)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-lg font-semibold">
                      {session.duration_minutes || '-'} min
                    </p>
                  </div>
                </div>

                {session.notes && (
                  <p className="text-sm text-muted-foreground mb-3">
                    📝 {session.notes}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => navigate(`/dashboard/workout/${session.id}`)}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleDeleteWorkout(session.id)}
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
