/**
 * ProgressiveOverloadTracker Component
 * Track exercise history and progressive overload gains
 * Shows improvements in weight, reps, sets over time
 */

import { supabase } from '@/lib/supabase/client';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { ModalDialog } from '@/shared/components/ui/modal-dialog';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  Dumbbell,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ExerciseHistory {
  id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight?: number;
  completed_at: string;
  notes?: string;
}

interface ProgressiveOverloadTrackerProps {
  open: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
  userId: string;
  currentSets?: number;
  currentReps?: number;
}

export function ProgressiveOverloadTracker({
  open,
  onClose,
  exerciseId,
  exerciseName,
  userId,
  currentSets = 3,
  currentReps = 10,
}: ProgressiveOverloadTrackerProps) {
  const [history, setHistory] = useState<ExerciseHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [weight, setWeight] = useState<number | ''>('');
  const [showLogDialog, setShowLogDialog] = useState(false);

  useEffect(() => {
    if (open) {
      loadHistory();
    }
  }, [open, exerciseId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Query workout_exercise_history table
      const { data, error } = await supabase
        .from('workout_exercise_history')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setHistory((data as ExerciseHistory[]) || []);
    } catch (error) {
      console.error('Error loading exercise history:', error);
      toast.error('Failed to load exercise history');
    } finally {
      setLoading(false);
    }
  };

  const handleLogWorkout = async () => {
    if (!weight || weight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    try {
      const { error } = await supabase.from('workout_exercise_history').insert({
        user_id: userId,
        exercise_id: exerciseId,
        exercise_name: exerciseName,
        sets: currentSets,
        reps: currentReps,
        weight: Number(weight),
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Workout logged! 💪');
      setWeight('');
      setShowLogDialog(false);
      loadHistory(); // Reload to show new entry
    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    }
  };

  const calculateProgress = () => {
    if (history.length < 2) return null;

    const latest = history[0];
    const previous = history[1];

    const weightChange = (latest.weight || 0) - (previous.weight || 0);
    const volumeChange =
      latest.sets * latest.reps * (latest.weight || 0) -
      previous.sets * previous.reps * (previous.weight || 0);

    return {
      weightChange,
      volumeChange,
      improved: weightChange > 0 || volumeChange > 0,
    };
  };

  const progress = calculateProgress();

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-error" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <>
      <ModalDialog
        open={open}
        onOpenChange={onClose}
        title={`Progressive Overload: ${exerciseName}`}
        size="lg"
      >
        <div className="space-y-4">
          {/* Progress Summary */}
          {progress && (
            <Card variant="outline" padding="md" className="bg-primary-50 dark:bg-primary-900/20">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary-600 rounded-lg">
                  {progress.improved ? (
                    <TrendingUp className="w-6 h-6 text-white" />
                  ) : (
                    <Award className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">
                    {progress.improved ? 'Great Progress!' : 'Keep Pushing!'}
                  </h4>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      Weight: {getTrendIcon(progress.weightChange)}
                      {Math.abs(progress.weightChange).toFixed(1)} kg
                    </span>
                    <span className="flex items-center gap-1">
                      Volume: {getTrendIcon(progress.volumeChange)}
                      {Math.abs(progress.volumeChange).toFixed(0)} kg
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Log New Workout Button */}
          <Button
            variant="primary"
            className="w-full"
            onClick={() => setShowLogDialog(true)}
          >
            <Dumbbell className="w-4 h-4" />
            Log Today's Workout
          </Button>

          {/* Exercise History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4text-muted-foreground" />
              <Label>History ({history.length} workouts)</Label>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {history.map((entry, index) => {
                  const prevEntry = history[index + 1];
                  const weightChange = prevEntry
                    ? (entry.weight || 0) - (prevEntry.weight || 0)
                    : 0;

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card variant="outline" padding="sm">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {format(new Date(entry.completed_at), 'MMM d, yyyy')}
                              </span>
                              {index === 0 && (
                                <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>
                                {entry.sets} sets × {entry.reps} reps
                              </span>
                              {entry.weight && (
                                <span className="flex items-center gap-1">
                                  <Dumbbell className="w-3 h-3" />
                                  {entry.weight} kg
                                </span>
                              )}
                              {weightChange !== 0 && index > 0 && (
                                <span className="flex items-center gap-1">
                                  {getTrendIcon(weightChange)}
                                  {Math.abs(weightChange).toFixed(1)} kg
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {(entry.sets * entry.reps * (entry.weight || 0)).toFixed(0)} kg
                            </div>
                            <div className="text-xs text-muted-foreground">Total Volume</div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Dumbbell className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                <p className="text-muted-foreground">No history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Log your first workout to start tracking progress!
                </p>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </ModalDialog>

      {/* Log Workout Dialog */}
      <ModalDialog
        open={showLogDialog}
        onOpenChange={() => setShowLogDialog(false)}
        title="Log Workout"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <Label>Exercise</Label>
            <Input value={exerciseName} disabled />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Sets</Label>
              <Input value={currentSets} disabled />
            </div>
            <div>
              <Label>Reps</Label>
              <Input value={currentReps} disabled />
            </div>
          </div>
          <div>
            <Label>Weight (kg)*</Label>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value ? Number(e.target.value) : '')}
              placeholder="Enter weight used"
              autoFocus
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowLogDialog(false)} className="flex-1">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleLogWorkout} className="flex-1">
              <Dumbbell className="w-4 h-4" />
              Log Workout
            </Button>
          </div>
        </div>
      </ModalDialog>
    </>
  );
}
