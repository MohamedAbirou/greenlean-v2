import { workoutTrackingService } from '@/features/workout/api/workoutTrackingService';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Target,
  Timer,
  Trash2,
  Trophy,
  Zap
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

interface WorkoutListProps {
  userId: string;
  selectedDate: Date;
}

interface WorkoutSession {
  id: string;
  user_id: string;
  session_date: string;
  workout_type: string;
  duration_minutes: number;
  total_volume_kg: number;
  total_calories_burned: number;
  notes: string | null;
  from_ai_plan: boolean;
  ai_workout_plan_id: string | null;
  created_at: string;
  exercises: ExerciseSet[];
}

interface ExerciseSet {
  id: string;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  rest_seconds: number;
  is_personal_record: boolean;
  notes: string | null;
}

interface PlanAdherence {
  adherence_percentage: number;
  sessions_completed: number;
  sessions_planned: number;
  plan_name: string;
}

const workoutTypeColors: Record<string, string> = {
  strength: 'bg-blue-500',
  cardio: 'bg-red-500',
  flexibility: 'bg-purple-500',
  sports: 'bg-green-500',
  other: 'bg-gray-500',
};

const workoutTypeIcons: Record<string, React.ReactNode> = {
  strength: <Dumbbell className="h-4 w-4" />,
  cardio: <Activity className="h-4 w-4" />,
  flexibility: <Target className="h-4 w-4" />,
  sports: <Zap className="h-4 w-4" />,
  other: <Timer className="h-4 w-4" />,
};

export function WorkoutList({ userId, selectedDate }: WorkoutListProps) {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());
  const [aiPlanAdherence, setAiPlanAdherence] = useState<PlanAdherence | null>(null);
  const [loadingAdherence, setLoadingAdherence] = useState(false);

  const dateString = selectedDate.toISOString().split('T')[0];

  const {
    data: workouts,
    isLoading,
    hasMore,
    error,
    observerTarget,
    loadMore,
    refresh,
  } = useInfiniteScroll<WorkoutSession>({
    fetchFunction: async (limit, offset) => {
      const result = await workoutTrackingService.getWorkoutHistory(
        userId,
        dateString,
        dateString,
        limit,
        offset
      );
      return result.data || [];
    },
    initialLimit: 10,
    pageSize: 10,
  });

  console.log("Workouts: ", workouts);

  // Load AI plan adherence
  useEffect(() => {
    loadAiPlanAdherence();
  }, [userId, dateString]);

  const loadAiPlanAdherence = async () => {
    setLoadingAdherence(true);
    try {
      const result = await workoutTrackingService.getWorkoutPlanAdherence(
        userId,
        dateString
      );
      if (result.success && result.data) {
        setAiPlanAdherence(result.data);
      }
    } catch (error) {
      console.error('Failed to load AI plan adherence:', error);
    } finally {
      setLoadingAdherence(false);
    }
  };

  const toggleSessionExpansion = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this workout session?')) return;

    const result = await workoutTrackingService.deleteWorkoutSession(sessionId);
    if (result.success) {
      refresh();
      loadAiPlanAdherence();
    } else {
      alert('Failed to delete workout session');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <p className="text-destructive">Failed to load workouts: {error.message}</p>
        <Button onClick={refresh} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* AI Plan Adherence */}
      {loadingAdherence ? (
        <Card className="p-6">
          <Skeleton className="h-20 w-full" />
        </Card>
      ) : aiPlanAdherence && aiPlanAdherence.sessions_planned > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">AI Workout Plan Adherence</p>
                <p className="text-lg font-semibold">{aiPlanAdherence.plan_name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {Math.round(aiPlanAdherence.adherence_percentage || 0)}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {aiPlanAdherence.sessions_completed} of {aiPlanAdherence.sessions_planned} sessions
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}

      {/* Workouts List */}
      {isLoading && workouts.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : workouts?.length === 0 ? (
        <Card className="p-12 text-center">
          <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">No workouts logged</p>
          <p className="text-muted-foreground">
            Start tracking your workouts to see your progress!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {workouts?.map((session, index) => {
              const isExpanded = expandedSessions.has(session.id);
              const workoutColor = workoutTypeColors[session.workout_type] || workoutTypeColors.other;
              const workoutIcon = workoutTypeIcons[session.workout_type] || workoutTypeIcons.other;
              const hasPRs = session.exercises?.some((ex) => ex.is_personal_record);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className={`${workoutColor} rounded-lg p-2 text-white`}>
                            {workoutIcon}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold capitalize">
                                {session.workout_type} Workout
                              </h3>
                              {session.from_ai_plan && (
                                <Badge variant="secondary" className="text-xs">
                                  <Target className="h-3 w-3 mr-1" />
                                  AI Plan
                                </Badge>
                              )}
                              {hasPRs && (
                                <Badge variant="default" className="text-xs bg-amber-500">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  PR!
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(session.session_date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSessionExpansion(session.id)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      {/* Session Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Duration</p>
                          <p className="text-lg font-semibold">
                            {formatDuration(session.duration_minutes)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Volume</p>
                          <p className="text-lg font-semibold">
                            {Math.round(session.total_volume_kg)} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Calories</p>
                          <p className="text-lg font-semibold">
                            {Math.round(session.total_calories_burned)}
                          </p>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{session.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Expanded Exercise Details */}
                    <AnimatePresence>
                      {isExpanded && session.exercises && session.exercises.length > 0 && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="border-t bg-muted/30 p-6">
                            <h4 className="font-semibold mb-4">Exercises</h4>
                            <div className="space-y-4">
                              {session.exercises.map((exercise) => (
                                <div
                                  key={exercise.id}
                                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="text-sm font-mono text-muted-foreground">
                                      #{exercise.set_number}
                                    </div>
                                    <div>
                                      <p className="font-medium">{exercise.exercise_name}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {exercise.reps} reps × {exercise.weight_kg} kg
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {exercise.is_personal_record && (
                                      <Badge variant="default" className="bg-amber-500">
                                        <Trophy className="h-3 w-3 mr-1" />
                                        PR
                                      </Badge>
                                    )}
                                    <div className="text-sm text-muted-foreground">
                                      {exercise.rest_seconds}s rest
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Loading More Indicator */}
          {hasMore && (
            <div ref={observerTarget} className="py-4">
              <Card className="p-4">
                <Skeleton className="h-20 w-full" />
              </Card>
            </div>
          )}

          {!hasMore && workouts.length > 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No more workouts to load
            </p>
          )}
        </div>
      )}
    </div>
  );
}
