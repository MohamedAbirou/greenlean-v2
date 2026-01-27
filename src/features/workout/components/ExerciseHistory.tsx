/**
 * Exercise History & PR Tracking Component
 * Now fully supports all tracking modes (weighted, duration, distance, AMRAP, etc.)
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { ExerciseHistoryRecord, PersonalRecord } from '@/shared/types/workout';
import { formatDate } from '@/shared/utils/dateFormatter';
import { Award, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { workoutLoggingService } from '../api/workoutLoggingService';
import { getConfigForMode } from '../utils/exerciseTypeConfig';

interface ExerciseHistoryProps {
  exerciseId: string;
  exerciseName: string;
  userId: string;
  trackingMode?: string;
  currentSet?: any;
  onClose?: () => void;
}

export function ExerciseHistory({
  exerciseId,
  exerciseName,
  userId,
  trackingMode = "reps-only",      // fallback
  currentSet,
  onClose,
}: ExerciseHistoryProps) {
  const [history, setHistory] = useState<ExerciseHistoryRecord[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const config = getConfigForMode(trackingMode as any);

  useEffect(() => {
    if (userId && exerciseId) fetchData();
  }, [userId, exerciseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [historyData, prs] = await Promise.all([
        workoutLoggingService.getExerciseHistory(userId, exerciseId, 10),
        workoutLoggingService.getPersonalRecords(userId, exerciseId),
      ]);
      setHistory(historyData);
      setPersonalRecords(prs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Potential new PR check (only if currentSet passed)
  const potentialPR = currentSet ? {
    weight: config.fields.weight && currentSet.weight_kg > (personalRecords?.max_weight_kg ?? 0),
    reps:   config.fields.reps   && currentSet.reps       > (personalRecords?.max_reps       ?? 0),
    volume: config.fields.weight && config.fields.reps &&
            (currentSet.reps * currentSet.weight_kg) > (personalRecords?.max_volume ?? 0),
    duration: config.fields.duration && currentSet.duration_seconds > (personalRecords?.best_time_seconds ?? 0),
    distance: config.fields.distance && currentSet.distance_meters  > (personalRecords?.max_distance_meters  ?? 0),
  } : null;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p>Loading {exerciseName} history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto border-2 shadow-xl p-2">
      <CardHeader className="flex justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl py-2">
          <div>
            <CardTitle className="text-2xl">{exerciseName}</CardTitle>
            <p className="text-purple-100 mt-1">
              {config.labels.primary} {config.labels.secondary && `+ ${config.labels.secondary}`}
            </p>
          </div>
          {onClose && <Button variant="ghost" onClick={onClose} className="text-white hover:bg-white/20">✕</Button>}
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Potential New PR Alert */}
        {potentialPR && Object.values(potentialPR).some(Boolean) && (
          <div className="p-5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/40 rounded-xl">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">🏆</span>
              <div>
                <h4 className="text-xl font-bold">Potential New PR!</h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Logging this could set a new personal best
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {potentialPR.weight   && <Badge className="bg-yellow-600">Weight: {currentSet.weight_kg}kg</Badge>}
              {potentialPR.reps     && <Badge className="bg-green-600">Reps: {currentSet.reps}</Badge>}
              {potentialPR.volume   && <Badge className="bg-purple-600">Volume: {currentSet.reps * currentSet.weight_kg}kg</Badge>}
              {potentialPR.duration && <Badge className="bg-orange-600">Duration: {currentSet.duration_seconds}s</Badge>}
              {potentialPR.distance && <Badge className="bg-cyan-600">Distance: {currentSet.distance_meters}m</Badge>}
            </div>
          </div>
        )}

        {/* Personal Records – mode-aware */}
        {personalRecords && (
          <div>
            <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" /> All-Time Bests
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.fields.weight && personalRecords.max_weight_kg && (
                <PRCard label="Max Weight" value={`${personalRecords.max_weight_kg} kg`} date={personalRecords.max_weight_date} />
              )}
              {config.fields.reps && personalRecords.max_reps && (
                <PRCard label="Max Reps" value={`${personalRecords.max_reps}`} date={personalRecords.max_reps_date} />
              )}
              {(config.fields.weight || config.fields.reps) && personalRecords.max_volume && (
                <PRCard label="Max Volume" value={`${Math.round(personalRecords.max_volume)} units`} date={personalRecords.max_volume_date} />
              )}
              {config.fields.duration && personalRecords.best_time_seconds && (
                <PRCard label="Best Time" value={`${personalRecords.best_time_seconds}s`} date={personalRecords.best_time_date} />
              )}
              {config.fields.distance && personalRecords.max_distance_meters && (
                <PRCard label="Max Distance" value={`${personalRecords.max_distance_meters} m`} date={personalRecords.max_distance_date} />
              )}
            </div>
          </div>
        )}

        {/* History List */}
        <div>
          <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" /> Recent Sessions ({history.length})
          </h4>

          {history.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
              <p className="text-muted-foreground">No sessions logged yet for this exercise.</p>
              <p className="text-sm mt-2">Your first log will appear here!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
              {history.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-xl border ${i === 0 ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium">{formatDate(entry.completed_at)}</p>
                    <Badge variant="outline">{entry.sets} sets</Badge>
                  </div>

                  {/* Mode-aware display */}
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Average performance:</span>
                      <span className="font-medium">
                        {entry.reps ? `${entry.reps} reps` : ''}
                        {entry.weight_kg ? ` @ ${entry.weight_kg}kg` : ''}
                        {entry.duration_seconds ? `${entry.duration_seconds}s` : ''}
                        {entry.distance_meters ? `${entry.distance_meters}m` : ''}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground italic mt-2">
                        Note: {entry.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

const PRCard = ({ label, value, date }: { label: string; value: string; date?: string }) => (
  <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/20 text-center">
    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
    <p className="text-2xl font-bold text-primary">{value}</p>
    {date && <p className="text-xs text-muted-foreground mt-2">{formatDate(date)}</p>}
  </div>
);