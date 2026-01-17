/**
 * Exercise History & PR Tracking Component
 * Shows historical performance data and detects personal records
 */

import { workoutLoggingService } from '@/features/workout/api/workoutLoggingService';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { ExerciseHistoryRecord, PersonalRecord } from '@/shared/types/workout';
import { useEffect, useState } from 'react';

interface ExerciseHistoryProps {
  exerciseId: string;
  exerciseName: string;
  userId: string;
  currentWeight?: number;
  currentReps?: number;
  onClose?: () => void;
}

export function ExerciseHistory({
  exerciseId,
  exerciseName,
  userId,
  currentWeight = 0,
  currentReps = 0,
  onClose,
}: ExerciseHistoryProps) {
  const [history, setHistory] = useState<ExerciseHistoryRecord[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPR, setIsPR] = useState<{
    weight: boolean;
    volume: boolean;
    reps: boolean;
  }>({ weight: false, volume: false, reps: false });

  useEffect(() => {
    if (userId && exerciseId) {
      fetchData();
    }
  }, [userId, exerciseId]);

  useEffect(() => {
    if (currentWeight > 0 || currentReps > 0) {
      checkForPRs();
    }
  }, [currentWeight, currentReps, personalRecords]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch exercise history
      const historyData = await workoutLoggingService.getExerciseHistory(
        userId,
        exerciseId,
        10
      );
      setHistory(historyData);

      // Fetch personal records
      const prs = await workoutLoggingService.getPersonalRecords(userId, exerciseId);
      setPersonalRecords(prs);
    } catch (error) {
      console.error('Error fetching exercise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForPRs = () => {
    if (!personalRecords) {
      // If no PRs exist, any weight/reps is a PR
      setIsPR({
        weight: currentWeight > 0,
        reps: currentReps > 0,
        volume: (currentWeight * currentReps) > 0,
      });
      return;
    }

    const currentVolume = currentWeight * currentReps;

    setIsPR({
      weight: currentWeight > 0 && currentWeight > (personalRecords.max_weight_kg || 0),
      reps: currentReps > 0 && currentReps > (personalRecords.max_reps || 0),
      volume: currentVolume > 0 && currentVolume > (personalRecords.max_volume_kg || 0),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getProgressIndicator = (currentValue: number, previousValue: number) => {
    if (currentValue > previousValue) {
      const increase = Math.round(((currentValue - previousValue) / previousValue) * 100);
      return `📈 +${increase}%`;
    }
    if (currentValue < previousValue) {
      const decrease = Math.round(((previousValue - currentValue) / previousValue) * 100);
      return `📉 -${decrease}%`;
    }
    return '➡️ Same';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading exercise history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{exerciseName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Exercise History & Personal Records
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕ Close
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* PR Detection Alert */}
        {(isPR.weight || isPR.volume || isPR.reps) && (currentWeight > 0 || currentReps > 0) && (
          <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏆</span>
              <div>
                <h4 className="font-bold text-lg">NEW PERSONAL RECORD!</h4>
                <p className="text-sm text-muted-foreground">
                  {isPR.weight && 'Max Weight '}
                  {isPR.volume && 'Total Volume '}
                  {isPR.reps && 'Max Reps '}
                  PR detected!
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap mt-3">
              {isPR.weight && (
                <Badge variant="warning" className="bg-yellow-500 text-white">
                  ⚡ Weight PR: {currentWeight}kg
                </Badge>
              )}
              {isPR.volume && (
                <Badge variant="warning" className="bg-orange-500 text-white">
                  💪 Volume PR: {currentWeight * currentReps}kg
                </Badge>
              )}
              {isPR.reps && (
                <Badge variant="warning" className="bg-red-500 text-white">
                  🔥 Reps PR: {currentReps}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Personal Records Summary */}
        {personalRecords && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🏆</span> Personal Records
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {personalRecords.max_weight_kg && (
                <Card variant="elevated" className="bg-gradient-to-br from-primary-500/5 to-secondary-500/5">
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Max Weight
                    </p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {personalRecords.max_weight_kg}kg
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {personalRecords.max_weight_date && formatDate(personalRecords.max_weight_date)}
                    </p>
                  </CardContent>
                </Card>
              )}
              {personalRecords.max_volume_kg && (
                <Card variant="elevated" className="bg-gradient-to-br from-primary-500/5 to-secondary-500/5">
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Max Volume
                    </p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {Math.round(personalRecords.max_volume_kg)}kg
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {personalRecords.max_volume_date && formatDate(personalRecords.max_volume_date)}
                    </p>
                  </CardContent>
                </Card>
              )}
              {personalRecords.max_reps && (
                <Card variant="elevated" className="bg-gradient-to-br from-primary-500/5 to-secondary-500/5">
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      Max Reps
                    </p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {personalRecords.max_reps}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {personalRecords.max_reps_date && formatDate(personalRecords.max_reps_date)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Last Performance */}
        {history.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>⏮️</span> Last Performance
            </h4>
            <Card variant="elevated" className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">{formatDate(history[0].completed_at)}</p>
                  <Badge variant="outline">{history[0].sets} sets</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {history[0].weight_kg}kg
                    </p>
                    <p className="text-xs text-muted-foreground">Weight</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {history[0].reps}
                    </p>
                    <p className="text-xs text-muted-foreground">Reps</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.round((history[0].weight_kg || 0) * history[0].reps * history[0].sets)}kg
                    </p>
                    <p className="text-xs text-muted-foreground">Volume</p>
                  </div>
                </div>
                {history[0].notes && (
                  <div className="mt-3 p-2 bg-background rounded text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                    <p>{history[0].notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full History */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span>📊</span> Performance History ({history.length} sessions)
          </h4>

          {history.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">📈</div>
                <h4 className="text-lg font-semibold mb-2">No History Yet</h4>
                <p className="text-sm text-muted-foreground">
                  This is your first time logging {exerciseName}. Make it count!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((record, index) => {
                const previousRecord = history[index + 1];
                const showProgress = previousRecord && index === 0;
                const volume = (record.weight_kg || 0) * record.reps * record.sets;

                return (
                  <div
                    key={record.id}
                    className={`p-3 rounded-lg border transition-all ${index === 0
                        ? 'bg-primary-500/10 border-primary-500/50'
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {formatDate(record.completed_at)}
                          </p>
                          {index === 0 && (
                            <Badge variant="primary" className="text-xs">
                              Most Recent
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span className="text-muted-foreground">
                            {record.sets} sets × {record.reps} reps @ {record.weight_kg}kg
                          </span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {Math.round(volume)}kg volume
                          </span>
                        </div>
                        {showProgress && previousRecord && (
                          <div className="flex gap-3 mt-2 text-xs">
                            {record.weight_kg !== previousRecord.weight_kg && (
                              <span
                                className={
                                  (record.weight_kg || 0) > (previousRecord.weight_kg || 0)
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {getProgressIndicator(
                                  record.weight_kg || 0,
                                  previousRecord.weight_kg || 0
                                )}{' '}
                                weight
                              </span>
                            )}
                            {volume !== (previousRecord.weight_kg || 0) * previousRecord.reps * previousRecord.sets && (
                              <span
                                className={
                                  volume >
                                    (previousRecord.weight_kg || 0) * previousRecord.reps * previousRecord.sets
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }
                              >
                                {getProgressIndicator(
                                  volume,
                                  (previousRecord.weight_kg || 0) * previousRecord.reps * previousRecord.sets
                                )}{' '}
                                volume
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/20">
          <h4 className="text-sm font-semibold mb-2">💡 Progressive Overload Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Aim to increase weight by 2.5-5kg when you can complete all reps with good form</li>
            <li>• Track volume (sets × reps × weight) as your primary progress metric</li>
            <li>• If you can't increase weight, try adding 1-2 reps or an extra set</li>
            <li>• Consistency beats intensity - progressive overload happens over weeks and months</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}