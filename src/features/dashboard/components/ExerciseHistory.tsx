/**
 * Exercise History & PR Tracking Component
 * Shows historical performance data and detects personal records
 * Helps users track progress and know their previous performance
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';

interface ExerciseHistoryRecord {
  id: string;
  session_date: string;
  sets: number;
  reps: number;
  weight: number;
  volume: number;
  notes?: string;
}

interface PersonalRecord {
  type: 'max_weight' | 'max_volume' | 'max_reps';
  value: number;
  date: string;
  reps?: number;
}

interface ExerciseHistoryProps {
  exerciseName: string;
  currentWeight?: number;
  currentReps?: number;
  onClose?: () => void;
}

export function ExerciseHistory({
  exerciseName,
  currentWeight = 0,
  currentReps = 0,
  onClose,
}: ExerciseHistoryProps) {
  const { user } = useAuth();
  const [history, setHistory] = useState<ExerciseHistoryRecord[]>([]);
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPR, setIsPR] = useState<{
    weight: boolean;
    volume: boolean;
    reps: boolean;
  }>({ weight: false, volume: false, reps: false });

  useEffect(() => {
    if (user && exerciseName) {
      fetchExerciseHistory();
    }
  }, [user, exerciseName]);

  useEffect(() => {
    if (currentWeight > 0 || currentReps > 0) {
      checkForPRs();
    }
  }, [currentWeight, currentReps, personalRecords]);

  const fetchExerciseHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch workout sessions that contain this exercise
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Parse exercise data from each session
      const exerciseRecords: ExerciseHistoryRecord[] = [];

      sessions?.forEach((session: any) => {
        try {
          const exercises = JSON.parse(session.exercises || '[]');
          const targetExercise = exercises.find(
            (ex: any) => ex.name.toLowerCase() === exerciseName.toLowerCase()
          );

          if (targetExercise) {
            exerciseRecords.push({
              id: session.id,
              session_date: session.session_date,
              sets: targetExercise.sets || 0,
              reps: Math.round(targetExercise.reps || 0),
              weight: targetExercise.weight || 0,
              volume: (targetExercise.sets || 0) * (targetExercise.reps || 0) * (targetExercise.weight || 0),
              notes: targetExercise.notes,
            });
          }
        } catch (e) {
          console.error('Error parsing exercise data:', e);
        }
      });

      setHistory(exerciseRecords);

      // Calculate personal records
      if (exerciseRecords.length > 0) {
        const prs: PersonalRecord[] = [];

        // Max weight PR
        const maxWeightRecord = exerciseRecords.reduce((max, record) =>
          record.weight > max.weight ? record : max
        );
        prs.push({
          type: 'max_weight',
          value: maxWeightRecord.weight,
          date: maxWeightRecord.session_date,
          reps: maxWeightRecord.reps,
        });

        // Max volume PR
        const maxVolumeRecord = exerciseRecords.reduce((max, record) =>
          record.volume > max.volume ? record : max
        );
        prs.push({
          type: 'max_volume',
          value: maxVolumeRecord.volume,
          date: maxVolumeRecord.session_date,
        });

        // Max reps PR
        const maxRepsRecord = exerciseRecords.reduce((max, record) =>
          record.reps > max.reps ? record : max
        );
        prs.push({
          type: 'max_reps',
          value: maxRepsRecord.reps,
          date: maxRepsRecord.session_date,
        });

        setPersonalRecords(prs);
      }
    } catch (error) {
      console.error('Error fetching exercise history:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForPRs = () => {
    const currentVolume = currentWeight * currentReps;

    const weightPR = personalRecords.find((pr) => pr.type === 'max_weight');
    const volumePR = personalRecords.find((pr) => pr.type === 'max_volume');
    const repsPR = personalRecords.find((pr) => pr.type === 'max_reps');

    setIsPR({
      weight: currentWeight > 0 && (!weightPR || currentWeight > weightPR.value),
      volume: currentVolume > 0 && (!volumePR || currentVolume > volumePR.value),
      reps: currentReps > 0 && (!repsPR || currentReps > repsPR.value),
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
    if (currentValue > previousValue) return '📈 +' + Math.round(((currentValue - previousValue) / previousValue) * 100) + '%';
    if (currentValue < previousValue) return '📉 -' + Math.round(((previousValue - currentValue) / previousValue) * 100) + '%';
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
        {personalRecords.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <span>🏆</span> Personal Records
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {personalRecords.map((pr) => (
                <Card key={pr.type} variant="elevated" className="bg-gradient-to-br from-primary-500/5 to-secondary-500/5">
                  <CardContent className="pt-4 text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      {pr.type.replace('_', ' ')}
                    </p>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                      {pr.type === 'max_weight' ? `${pr.value}kg` :
                       pr.type === 'max_volume' ? `${Math.round(pr.value)}kg` :
                       pr.value}
                    </p>
                    {pr.reps && pr.type === 'max_weight' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        @ {pr.reps} reps
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(pr.date)}
                    </p>
                  </CardContent>
                </Card>
              ))}
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
                  <p className="text-sm font-medium">{formatDate(history[0].session_date)}</p>
                  <Badge variant="outline">{history[0].sets} sets</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {history[0].weight}kg
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
                      {Math.round(history[0].volume)}kg
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
              {history.slice(0, 10).map((record, index) => {
                const previousRecord = history[index + 1];
                const showProgress = previousRecord && index === 0;

                return (
                  <div
                    key={record.id}
                    className={`p-3 rounded-lg border transition-all ${
                      index === 0
                        ? 'bg-primary-500/10 border-primary-500/50'
                        : 'bg-muted/30 border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">
                            {formatDate(record.session_date)}
                          </p>
                          {index === 0 && (
                            <Badge variant="primary" className="text-xs">
                              Most Recent
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span className="text-muted-foreground">
                            {record.sets} sets × {record.reps} reps @ {record.weight}kg
                          </span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            {Math.round(record.volume)}kg volume
                          </span>
                        </div>
                        {showProgress && previousRecord && (
                          <div className="flex gap-3 mt-2 text-xs">
                            {record.weight !== previousRecord.weight && (
                              <span className={record.weight > previousRecord.weight ? 'text-green-600' : 'text-red-600'}>
                                {getProgressIndicator(record.weight, previousRecord.weight)} weight
                              </span>
                            )}
                            {record.volume !== previousRecord.volume && (
                              <span className={record.volume > previousRecord.volume ? 'text-green-600' : 'text-red-600'}>
                                {getProgressIndicator(record.volume, previousRecord.volume)} volume
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {history.length > 10 && (
                <p className="text-center text-sm text-muted-foreground py-2">
                  Showing 10 most recent sessions
                </p>
              )}
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
