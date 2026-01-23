/**
 * Progressive Overload Tracker – Mode-Aware Edition
 * Tracks improvements across all metrics depending on tracking mode
 */

import { formatSetDisplay, getConfigForMode } from '@/features/workout/utils/exerciseTypeConfig';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ModalDialog } from '@/shared/components/ui/modal-dialog';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Award,
  Calendar,
  Dumbbell,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { workoutLoggingService } from '../api/workoutLoggingService';

interface ProgressiveOverloadTrackerProps {
  open: boolean;
  onClose: () => void;
  exerciseId: string;
  exerciseName: string;
  userId: string;
  trackingMode?: string;
}

export function ProgressiveOverloadTracker({
  open,
  onClose,
  exerciseId,
  exerciseName,
  userId,
  trackingMode = "reps-only",
}: ProgressiveOverloadTrackerProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const config = getConfigForMode(trackingMode as any);

  useEffect(() => {
    if (open) loadHistory();
  }, [open, exerciseId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await workoutLoggingService.getExerciseHistory(userId, exerciseId, 10);
      setHistory(data || []);
    } catch (err) {
      console.log("Failed to load history: ", err);
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getLatestMetric = () => {
    if (history.length < 1) return null;
    const latest = history[0];

    if (config.fields.weight && latest.weight_kg) {
      return { label: "Weight", value: `${latest.weight_kg} kg`, prev: history[1]?.weight_kg };
    }
    if (config.fields.reps && latest.reps) {
      return { label: "Reps", value: `${latest.reps}`, prev: history[1]?.reps };
    }
    if (config.fields.duration && latest.duration_seconds) {
      return { label: "Duration", value: `${latest.duration_seconds}s`, prev: history[1]?.duration_seconds };
    }
    if (config.fields.distance && latest.distance_meters) {
      return { label: "Distance", value: `${latest.distance_meters}m`, prev: history[1]?.distance_meters };
    }
    return null;
  };

  const metric = getLatestMetric();

  return (
    <ModalDialog
      open={open}
      onOpenChange={onClose}
      title={`Progress: ${exerciseName}`}
      size="lg"
    >
      <div className="space-y-6 p-1">
        {/* Progress Summary */}
        {metric && history.length >= 2 && (
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-xl">
                  {metric.value > (history[1][metric.label.toLowerCase()] || 0) ? (
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  ) : (
                    <Award className="h-8 w-8 text-yellow-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold">
                    {metric.value > (history[1][metric.label.toLowerCase()] || 0)
                      ? 'New High!'
                      : 'Solid Work'}
                  </h4>
                  <p className="text-lg mt-1">
                    Latest {metric.label}: <strong>{metric.value}</strong>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* History */}
        <div>
          <h4 className="font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Recent Workouts ({history.length})
          </h4>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p>No logged sessions yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {history.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {format(new Date(entry.completed_at), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {entry.sets} sets
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {formatSetDisplay(trackingMode as any, entry)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <Button onClick={onClose} className="w-full">Close</Button>
      </div>
    </ModalDialog>
  );
}