/**
 * Log Workout Page
 * Comprehensive workout logging with exercise tracking
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth';
import { useCreateWorkoutSession } from '../hooks/useDashboardMutations';

const getToday = () => new Date().toISOString().split('T')[0];

export function LogWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessionDate, setSessionDate] = useState(getToday());
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState('strength');
  const [notes, setNotes] = useState('');

  const [createWorkoutSession, { loading: creating }] = useCreateWorkoutSession();

  const handleCreateWorkout = async () => {
    if (!user?.id || !workoutName) return;

    const result = await createWorkoutSession({
      variables: {
        input: {
          user_id: user.id,
          session_date: sessionDate,
          workout_name: workoutName,
          workout_type: workoutType,
          notes: notes || null,
          status: 'in_progress',
          total_exercises: 0,
          total_sets: 0,
          total_reps: 0,
          total_volume_kg: 0,
        },
      },
    });

    const sessionId = (result.data as any)?.insertIntoworkout_sessionsCollection?.records?.[0]?.id;

    if (sessionId) {
      // Navigate to workout session details page to add exercises
      navigate(`/dashboard/workout/${sessionId}`);
    } else {
      navigate('/dashboard?tab=workout');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mb-4">
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Log Workout</h1>
        <p className="text-muted-foreground mt-2">
          Start a new workout session
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date *</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>

          {/* Workout Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">Workout Name *</label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Upper Body Strength, Leg Day, Full Body"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>

          {/* Workout Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Workout Type *</label>
            <select
              value={workoutType}
              onChange={(e) => setWorkoutType(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
            >
              <option value="strength">Strength Training</option>
              <option value="cardio">Cardio</option>
              <option value="hiit">HIIT</option>
              <option value="yoga">Yoga</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your workout..."
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateWorkout}
              variant="primary"
              size="lg"
              fullWidth
              loading={creating}
              disabled={!workoutName}
            >
              Start Workout
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Features */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🤖 AI Workout Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Follow your personalized workout plan
            </p>
            <Button variant="outline" size="sm" fullWidth>
              View AI Plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">📋 Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Use a saved workout template
            </p>
            <Button variant="outline" size="sm" fullWidth>
              Browse Templates
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="mt-6" variant="outline">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> After creating the workout, you'll be able to add
            exercises, track sets, reps, weight, and monitor your personal records in real-time.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
