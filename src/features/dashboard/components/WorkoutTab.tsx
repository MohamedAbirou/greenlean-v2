/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WorkoutTab - 2026 Premium Fitness Experience
 * Integrated with optimized data service and enhanced UI/UX
 */

import { useAuth } from '@/features/auth';
import type { ExerciseDisplayData, WorkoutDisplayData } from '@/features/workout/api/workoutDisplayService';
import { workoutDisplayService } from '@/features/workout/api/workoutDisplayService';
import { ExerciseLibrary } from '@/features/workout/components/ExerciseLibrary';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Edit2,
  Eye,
  Flame,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  X,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useActiveWorkoutPlan } from '../hooks/useDashboardData';
import { useDeleteWorkoutSession, useUpdateWorkoutSession } from '../hooks/useDashboardMutations';
import { DatePicker } from './DatePicker';

const getToday = () => new Date().toISOString().split('T')[0];

interface ExerciseSet {
  set_number?: number;
  reps: number;
  weight_kg: number;
  completed?: boolean;
}

interface Exercise {
  name: string;
  category?: string;
  muscle_group?: string;
  sets: ExerciseSet[];
}

type SwapMode = 'aiPlan' | 'search' | 'manual' | null;

// Exercise Detail Modal Component
const ExerciseDetailModal = ({
  exercise,
  onClose
}: {
  exercise: ExerciseDisplayData;
  onClose: () => void;
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-primary-500 to-secondary-500">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{exercise.exercise_name}</h2>
              <p className="text-primary-100">{exercise.muscle_group} • Exercise History & PRs</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Personal Records */}
          {exercise.personalRecord && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Trophy className="h-5 w-5 text-warning" />
                Personal Records
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Max Weight',
                    value: exercise.personalRecord.max_weight_kg ? `${exercise.personalRecord.max_weight_kg}kg` : 'N/A',
                    date: exercise.personalRecord.max_weight_date,
                    icon: TrendingUp,
                    color: 'blue'
                  },
                  {
                    label: 'Max Reps',
                    value: exercise.personalRecord.max_reps || 'N/A',
                    date: exercise.personalRecord.max_reps_date,
                    icon: Zap,
                    color: 'orange'
                  },
                  {
                    label: 'Max Volume',
                    value: exercise.personalRecord.max_volume_kg ? `${Math.round(exercise.personalRecord.max_volume_kg)}kg` : 'N/A',
                    date: exercise.personalRecord.max_volume_date,
                    icon: Award,
                    color: 'purple'
                  },
                ].map((pr, idx) => {
                  const Icon = pr.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-muted border-2 border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium text-muted-foreground">{pr.label}</span>
                      </div>
                      <p className="text-3xl font-bold text-foreground mb-1">
                        {pr.value}
                      </p>
                      {pr.date && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(pr.date)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent History */}
          {exercise.recentHistory && exercise.recentHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5 text-success" />
                Recent History
              </h3>
              <div className="space-y-3">
                {exercise.recentHistory.map((entry, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-muted border border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-2">
                          {formatDate(entry.date)}
                        </p>
                        <div className="flex gap-6 text-sm">
                          <span className="text-primary-600 dark:text-primary-400 font-semibold">
                            {entry.avg_weight}kg
                          </span>
                          <span className="text-success font-semibold">
                            {entry.avg_reps} reps
                          </span>
                          <span className="text-secondary-600 dark:text-secondary-400 font-semibold">
                            {Math.round(entry.total_volume)}kg volume
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Exercise Card Component
const ExerciseCard = ({
  exercise,
  workoutId,
  onDelete,
  onEdit,
  onReplace,
  onViewDetails
}: {
  exercise: ExerciseDisplayData;
  workoutId: string;
  onDelete: () => void;
  onEdit: () => void;
  onReplace: () => void;
  onViewDetails: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasPR = exercise.sets.some(s => s.is_pr_weight || s.is_pr_reps || s.is_pr_volume);
  const totalVolume = exercise.sets.reduce((sum, set) => sum + (set.reps * set.weight_kg), 0);

  return (
    <div className="bg-card rounded-xl border-2 border-border overflow-hidden hover:shadow-lg hover:border-primary-500/50 transition-all">
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-foreground">{exercise.exercise_name}</h4>
              {hasPR && (
                <div className="flex items-center gap-1 px-2 py-1 bg-warning/20 text-warning rounded-full text-xs font-bold border border-warning/50">
                  <Trophy className="h-3 w-3" />
                  PR
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              {exercise.muscle_group && (
                <Badge variant="outline" className="text-xs">{exercise.muscle_group}</Badge>
              )}
              <span>{exercise.sets.length} sets</span>
              <span>•</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400">
                {Math.round(totalVolume)}kg volume
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors group"
              title="View History & PRs"
            >
              <Eye className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-900/30 rounded-lg transition-colors"
              title="Edit Exercise"
            >
              <Edit2 className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
            </button>
            <button
              onClick={() => startSwapExercise(workout.id, idx, null)}
              className="p-2 hover:bg-accent-100 dark:hover:bg-accent-900/30 rounded-lg transition-colors"
              title="Swap Exercise"
            >
              <RefreshCw className="h-4 w-4 text-accent-600 dark:text-accent-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 hover:bg-error/20 rounded-lg transition-colors"
              title="Delete Exercise"
            >
              <Trash2 className="h-4 w-4 text-error" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Sets Preview */}
        {!isExpanded && (
          <div className="flex gap-2 flex-wrap">
            {exercise.sets.slice(0, 3).map((set, idx) => (
              <div key={set.id} className="px-3 py-1 bg-muted rounded-lg text-xs font-medium">
                {set.reps} × {set.weight_kg}kg
              </div>
            ))}
            {exercise.sets.length > 3 && (
              <div className="px-3 py-1 bg-muted rounded-lg text-xs font-medium text-muted-foreground">
                +{exercise.sets.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Sets */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="space-y-2">
            {exercise.sets.map((set, idx) => (
              <div
                key={set.id}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${set.is_pr_weight || set.is_pr_reps || set.is_pr_volume
                  ? 'bg-gradient-to-r from-warning/20 to-accent/20 border-2 border-warning/50'
                  : 'bg-card border border-border'
                  }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="w-12 text-sm font-bold text-muted-foreground">
                    Set {set.set_number}
                  </span>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {set.reps}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">reps</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-success">
                        {set.weight_kg}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">kg</span>
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-secondary-600 dark:text-secondary-400">
                        {Math.round(set.reps * set.weight_kg)}
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">kg vol</span>
                    </div>
                  </div>
                </div>

                {(set.is_pr_weight || set.is_pr_reps || set.is_pr_volume) && (
                  <div className="flex gap-1">
                    {set.is_pr_weight && (
                      <div className="px-2 py-1 bg-warning text-white rounded text-xs font-bold" title="Weight PR">
                        ⚡W
                      </div>
                    )}
                    {set.is_pr_reps && (
                      <div className="px-2 py-1 bg-accent text-white rounded text-xs font-bold" title="Reps PR">
                        🔥R
                      </div>
                    )}
                    {set.is_pr_volume && (
                      <div className="px-2 py-1 bg-error text-white rounded text-xs font-bold" title="Volume PR">
                        💪V
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Workout Card Component
const WorkoutCard = ({
  workout,
  onDelete,
  onEditExercise,
  onReplaceExercise,
  onDeleteExercise
}: {
  workout: WorkoutDisplayData;
  onDelete: () => void;
  onEditExercise: (exerciseIndex: number) => void;
  onReplaceExercise: (exerciseIndex: number) => void;
  onDeleteExercise: (exerciseIndex: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDisplayData | null>(null);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const hasPRs = workout.exercises.some(ex =>
    ex.sets.some(s => s.is_pr_weight || s.is_pr_reps || s.is_pr_volume)
  );

  return (
    <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:border-primary-500/50 bg-gradient-to-br from-card to-muted/30">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  {workout.workout_name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formatDate(workout.session_date)}
                </p>
              </div>
            </div>

            {hasPRs && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-warning to-accent text-white rounded-full text-xs font-bold shadow-md animate-pulse">
                <Trophy className="h-3 w-3" />
                NEW PR!
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Exercises', value: workout.total_exercises, icon: Target, color: 'primary' },
            { label: 'Total Sets', value: workout.total_sets, icon: Zap, color: 'secondary' },
            { label: 'Volume', value: `${Math.round(workout.total_volume_kg)}kg`, icon: TrendingUp, color: 'success' },
            { label: 'Calories', value: workout.calories_burned || 0, icon: Flame, color: 'accent' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="p-3 rounded-xl bg-muted/50 border border-border hover:border-primary-500/50 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20">
          <CardContent className="p-6 space-y-4">
            {workout.exercises.map((exercise, idx) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                workoutId={workout.id}
                onViewDetails={() => setSelectedExercise(exercise)}
                onEdit={() => onEditExercise(idx)}
                onReplace={() => onReplaceExercise(idx)}
                onDelete={() => onDeleteExercise(idx)}
              />
            ))}
          </CardContent>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </Card>
  );
};

export function WorkoutTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [workouts, setWorkouts] = useState<WorkoutDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'strength' | 'cardio' | 'prs'>('all');

  const { data: workoutPlanData } = useActiveWorkoutPlan();
  const [deleteWorkoutSession] = useDeleteWorkoutSession();
  const [updateWorkoutSession] = useUpdateWorkoutSession();

  const [editingExercise, setEditingExercise] = useState<{ workoutId: string; index: number } | null>(null);
  const [swappingExercise, setSwappingExercise] = useState<{ workoutId: string; index: number; mode: SwapMode } | null>(null);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  const [editExerciseForm, setEditExerciseForm] = useState<Exercise>({
    name: '',
    sets: [],
  });

  const [manualExerciseForm, setManualExerciseForm] = useState({
    name: '',
    sets: 3,
    reps: 10,
    weight: 0,
  });

  const activeWorkoutPlan = (workoutPlanData as any)?.ai_workout_plansCollection?.edges?.[0]?.node;

  // Load workouts
  useEffect(() => {
    if (user?.id) {
      loadWorkouts();
    }
  }, [user?.id, selectedDate, filter]);

  const loadWorkouts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { workouts: fetchedWorkouts } = await workoutDisplayService.getWorkoutsForDisplay(
        user.id,
        {
          startDate: selectedDate,
          endDate: selectedDate,
          limit: 50,
          workoutType: filter === 'all' || filter === 'prs' ? undefined : filter,
          includePRsOnly: filter === 'prs',
        }
      );
      setWorkouts(fetchedWorkouts);
    } catch (error) {
      console.error('Error loading workouts:', error);
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm('Delete this entire workout session?')) return;

    try {
      await deleteWorkoutSession({ variables: { id } });
      toast.success('Workout deleted');
      loadWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
    if (confirm('Remove this exercise?')) {
      const workout = workouts.find((w: any) => w.id === workoutId);
      if (!workout) return;

      const exercises = parseExercises(workout.exercises);
      const updatedExercises = exercises.filter((_: any, idx: number) => idx !== exerciseIndex);

      await updateWorkoutSession({
        variables: {
          id: workoutId,
          set: { exercises: JSON.stringify(updatedExercises) },
        },
      });
      loadWorkouts();
    }
  };

    const startEditExercise = (workoutId: string, exerciseIndex: number, exercise: Exercise) => {
    setEditingExercise({ workoutId, index: exerciseIndex });
    setEditExerciseForm(JSON.parse(JSON.stringify(exercise)));
  };

  const saveEditExercise = async () => {
    if (!editingExercise) return;

    const workout = workouts.find((w: any) => w.id === editingExercise.workoutId);
    if (!workout) return;

    const exercises = parseExercises(workout.exercises);
    exercises[editingExercise.index] = editExerciseForm;

    await updateWorkoutSession({
      variables: {
        id: editingExercise.workoutId,
        set: { exercises: JSON.stringify(exercises) },
      },
    });
    setEditingExercise(null);
    loadWorkouts();
  };

  const startSwapExercise = (workoutId: string, index: number, mode: SwapMode) => {
    setSwappingExercise({ workoutId, index, mode });
  };

  const handleSwapWithAIPlan = async (aiExercise: any) => {
    if (!swappingExercise) return;

    const workout = workouts.find((w: any) => w.id === swappingExercise.workoutId);
    if (!workout) return;

    const exercises = parseExercises(workout.exercises);
    const oldExercise = exercises[swappingExercise.index];

    exercises[swappingExercise.index] = {
      name: aiExercise.name,
      category: aiExercise.category || oldExercise.category,
      muscle_group: aiExercise.muscle_group || oldExercise.muscle_group,
      sets: oldExercise.sets,
    };

    await updateWorkoutSession({
      variables: {
        id: swappingExercise.workoutId,
        set: { exercises: JSON.stringify(exercises) },
      },
    });
    setSwappingExercise(null);
    loadWorkouts();
  };

  const handleSwapWithSearch = async (searchedExercise: any) => {
    if (!swappingExercise) return;

    const workout = workouts.find((w: any) => w.id === swappingExercise.workoutId);
    if (!workout) return;

    const exercises = parseExercises(workout.exercises);
    const oldExercise = exercises[swappingExercise.index];

    exercises[swappingExercise.index] = {
      name: searchedExercise.name,
      category: searchedExercise.category || oldExercise.category,
      muscle_group: searchedExercise.muscle_group || oldExercise.muscle_group,
      sets: oldExercise.sets,
    };

    await updateWorkoutSession({
      variables: {
        id: swappingExercise.workoutId,
        set: { exercises: JSON.stringify(exercises) },
      },
    });
    setSwappingExercise(null);
    loadWorkouts();
  };

  const handleSwapWithManual = async () => {
    if (!swappingExercise || !manualExerciseForm.name.trim()) return;

    const workout = workouts.find((w: any) => w.id === swappingExercise.workoutId);
    if (!workout) return;

    const exercises = parseExercises(workout.exercises);

    exercises[swappingExercise.index] = {
      name: manualExerciseForm.name.trim(),
      category: 'strength',
      muscle_group: 'Mixed',
      sets: Array.from({ length: manualExerciseForm.sets }, (_, i) => ({
        set_number: i + 1,
        reps: manualExerciseForm.reps,
        weight_kg: manualExerciseForm.weight,
      })),
    };

    await updateWorkoutSession({
      variables: {
        id: swappingExercise.workoutId,
        set: { exercises: JSON.stringify(exercises) },
      },
    });
    setSwappingExercise(null);
    setManualExerciseForm({ name: '', sets: 3, reps: 10, weight: 0 });
    loadWorkouts();
  };

  const addSetToExercise = () => {
    const lastSet = editExerciseForm.sets[editExerciseForm.sets.length - 1];
    setEditExerciseForm({
      ...editExerciseForm,
      sets: [
        ...editExerciseForm.sets,
        {
          set_number: editExerciseForm.sets.length + 1,
          reps: lastSet?.reps || 10,
          weight_kg: lastSet?.weight_kg || 0,
        },
      ],
    });
  };

  const removeSetFromExercise = (setIndex: number) => {
    setEditExerciseForm({
      ...editExerciseForm,
      sets: editExerciseForm.sets.filter((_, idx) => idx !== setIndex).map((set, i) => ({
        ...set,
        set_number: i + 1,
      })),
    });
  };

  const updateSet = (setIndex: number, field: keyof ExerciseSet, value: any) => {
    const updatedSets = [...editExerciseForm.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: Number(value),
    };
    setEditExerciseForm({
      ...editExerciseForm,
      sets: updatedSets,
    });
  };

  const parseExercises = (exercises: any): Exercise[] => {
    if (Array.isArray(exercises)) return exercises;
    if (typeof exercises === 'string') {
      try {
        return JSON.parse(exercises);
      } catch (e) {
        console.log(e);
        return [];
      }
    }
    return [];
  };

  const handleReplaceExercise = (workoutId: string, exerciseIndex: number) => {
    setSwappingExercise({ workoutId, index: exerciseIndex, mode: null });
  };

  // Calculate totals
  const totals = workouts.reduce(
    (acc, workout) => ({
      duration: acc.duration + (workout.duration_minutes || 0),
      calories: acc.calories + (workout.calories_burned || 0),
      exercises: acc.exercises + workout.total_exercises,
      workouts: acc.workouts + 1,
    }),
    { duration: 0, calories: 0, exercises: 0, workouts: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading your workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Floating Action Header */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-4 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
          <Button
            onClick={() => navigate('/dashboard/log-workout')}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Workout
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'strength', 'cardio', 'prs'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${filter === filterType
              ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
              : 'bg-card text-foreground hover:shadow-md border border-border'
              }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Premium Stats Grid */}
      {workouts.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Workouts', value: totals.workouts, icon: Dumbbell, gradient: 'from-primary-500 to-secondary-500', bg: 'from-primary-500/20 to-secondary-500/20' },
            { label: 'Minutes', value: totals.duration, icon: Clock, gradient: 'from-secondary-500 to-accent-500', bg: 'from-secondary-500/20 to-accent-500/20' },
            { label: 'Calories', value: totals.calories, icon: Flame, gradient: 'from-accent-500 to-error', bg: 'from-accent-500/20 to-error/20' },
            { label: 'Exercises', value: totals.exercises, icon: Target, gradient: 'from-success to-primary-500', bg: 'from-success/20 to-primary-500/20' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className={`group relative overflow-hidden border-0 bg-gradient-to-br ${stat.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className={`text-3xl font-bold mb-1 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Workouts List */}
      {workouts.length === 0 ? (
        <Card className="border-2 border-dashed border-border hover:border-primary-500/50 transition-colors duration-300">
          <CardContent className="py-24 text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                <Dumbbell className="h-10 w-10 text-primary-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">No Workouts Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {filter === 'prs'
                ? 'No personal records found for this date'
                : 'Start your fitness journey by logging your first workout'}
            </p>
            <Button
              onClick={() => navigate('/dashboard/log-workout')}
              size="lg"
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Log Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onDelete={() => handleDeleteWorkout(workout.id)}
              onEditExercise={(idx) => {
                const exercise = workout.exercises[idx];
                const convertedExercise: Exercise = {
                  name: exercise.exercise_name,
                  category: exercise.exercise_category,
                  muscle_group: exercise.muscle_group,
                  sets: exercise.sets.map(s => ({
                    set_number: s.set_number,
                    reps: s.reps,
                    weight_kg: s.weight_kg,
                  }))
                };
                startEditExercise(workout.id, idx, convertedExercise);
              }}
              onReplaceExercise={(idx) => handleReplaceExercise(workout.id, idx)}
              onDeleteExercise={(idx) => handleDeleteExercise(workout.id, idx)}
            />
          ))}
        </div>
      )}

      {/* Swap Exercise Modal */}
      {swappingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSwappingExercise(null)}>
          <div
            className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary-500 to-secondary-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Swap Exercise
                </h3>
                <button
                  onClick={() => setSwappingExercise(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {!swappingExercise.mode ? (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { mode: 'aiPlan' as SwapMode, icon: Sparkles, label: 'AI Plan', gradient: 'from-primary-500 to-secondary-600' },
                    { mode: 'search' as SwapMode, icon: Search, label: 'Search', gradient: 'from-secondary-500 to-accent-600' },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.mode}
                        onClick={() => setSwappingExercise({ ...swappingExercise, mode: option.mode })}
                        className={`p-6 rounded-xl bg-gradient-to-br ${option.gradient} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-3`}
                      >
                        <Icon className="h-8 w-8" />
                        <span className="font-semibold">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : swappingExercise.mode === 'search' ? (
                <ExerciseLibrary
                  onSelectExercise={(exercise) => {
                    toast.success(`Swapped to ${exercise.name}`);
                    setSwappingExercise(null);
                    loadWorkouts();
                  }}
                />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">AI Plan swap coming soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// /* eslint-disable @typescript-eslint/no-explicit-any */
// /**
//  * WorkoutTab - 2026 Premium Fitness Experience
//  * Inspired by: Apple Fitness+, Strava, Whoop, Linear
//  * NO MyFitnessPal vibes - Pure premium modern design
//  */

// import { ExerciseLibrary } from '@/features/workout/components/ExerciseLibrary';
// import { Badge } from '@/shared/components/ui/badge';
// import { Button } from '@/shared/components/ui/button';
// import { Card, CardContent } from '@/shared/components/ui/card';
// import { ChevronRight, Clock, Dumbbell, Edit2, Flame, PenLine, Plus, RefreshCw, Save, Search, Sparkles, Target, Trash2, TrendingUp, X } from 'lucide-react';
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useActiveWorkoutPlan, useWorkoutSessionsByDate } from '../hooks/useDashboardData';
// import { useDeleteWorkoutSession, useUpdateWorkoutSession } from '../hooks/useDashboardMutations';
// import { DatePicker } from './DatePicker';

// const getToday = () => new Date().toISOString().split('T')[0];

// interface ExerciseSet {
//   set_number?: number;
//   reps: number;
//   weight_kg: number;
//   completed?: boolean;
// }

// interface Exercise {
//   name: string;
//   category?: string;
//   muscle_group?: string;
//   sets: ExerciseSet[];
// }

// type SwapMode = 'aiPlan' | 'search' | 'manual' | null;

// export function WorkoutTab() {
//   const navigate = useNavigate();
//   const [selectedDate, setSelectedDate] = useState(getToday());

//   const { data, loading, refetch } = useWorkoutSessionsByDate(selectedDate);
//   const { data: workoutPlanData } = useActiveWorkoutPlan();
//   const [deleteWorkoutSession] = useDeleteWorkoutSession();
//   const [updateWorkoutSession] = useUpdateWorkoutSession();

//   const [editingExercise, setEditingExercise] = useState<{ workoutId: string; index: number } | null>(null);
//   const [swappingExercise, setSwappingExercise] = useState<{ workoutId: string; index: number; mode: SwapMode } | null>(null);
//   const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

//   const [editExerciseForm, setEditExerciseForm] = useState<Exercise>({
//     name: '',
//     sets: [],
//   });

//   const [manualExerciseForm, setManualExerciseForm] = useState({
//     name: '',
//     sets: 3,
//     reps: 10,
//     weight: 0,
//   });

//   const workoutLogs = data || [];
//   const activeWorkoutPlan = (workoutPlanData as any)?.ai_workout_plansCollection?.edges?.[0]?.node;

//   // Parse AI workout plan
//   const planData = activeWorkoutPlan?.plan_data
//     ? (typeof activeWorkoutPlan.plan_data === 'string' ? JSON.parse(activeWorkoutPlan.plan_data) : activeWorkoutPlan.plan_data)
//     : null;
//   const weeklyPlan = planData?.weekly_plan || [];
//   const aiPlanExercises: any[] = [];

//   if (Array.isArray(weeklyPlan)) {
//     weeklyPlan.forEach((workout: any) => {
//       if (Array.isArray(workout.exercises)) {
//         workout.exercises.forEach((ex: any) => {
//           if (!aiPlanExercises.some(e => e.name === ex.name)) {
//             aiPlanExercises.push({ ...ex, workoutDay: workout.day, workoutFocus: workout.focus });
//           }
//         });
//       }
//     });
//   }

//   const handleDeleteWorkout = async (id: string) => {
//     if (confirm('Delete this entire workout session?')) {
//       await deleteWorkoutSession({ variables: { id } });
//       refetch();
//     }
//   };

//   const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
//     if (confirm('Remove this exercise?')) {
//       const workout = workoutLogs.find((w: any) => w.id === workoutId);
//       if (!workout) return;

//       const exercises = parseExercises(workout.exercises);
//       const updatedExercises = exercises.filter((_: any, idx: number) => idx !== exerciseIndex);

//       await updateWorkoutSession({
//         variables: {
//           id: workoutId,
//           set: { exercises: JSON.stringify(updatedExercises) },
//         },
//       });
//       refetch();
//     }
//   };

//   const startEditExercise = (workoutId: string, exerciseIndex: number, exercise: Exercise) => {
//     setEditingExercise({ workoutId, index: exerciseIndex });
//     setEditExerciseForm(JSON.parse(JSON.stringify(exercise)));
//   };

//   const saveEditExercise = async () => {
//     if (!editingExercise) return;

//     const workout = workoutLogs.find((w: any) => w.id === editingExercise.workoutId);
//     if (!workout) return;

//     const exercises = parseExercises(workout.exercises);
//     exercises[editingExercise.index] = editExerciseForm;

//     await updateWorkoutSession({
//       variables: {
//         id: editingExercise.workoutId,
//         set: { exercises: JSON.stringify(exercises) },
//       },
//     });
//     setEditingExercise(null);
//     refetch();
//   };

//   const startSwapExercise = (workoutId: string, index: number, mode: SwapMode) => {
//     setSwappingExercise({ workoutId, index, mode });
//   };

//   const handleSwapWithAIPlan = async (aiExercise: any) => {
//     if (!swappingExercise) return;

//     const workout = workoutLogs.find((w: any) => w.id === swappingExercise.workoutId);
//     if (!workout) return;

//     const exercises = parseExercises(workout.exercises);
//     const oldExercise = exercises[swappingExercise.index];

//     exercises[swappingExercise.index] = {
//       name: aiExercise.name,
//       category: aiExercise.category || oldExercise.category,
//       muscle_group: aiExercise.muscle_group || oldExercise.muscle_group,
//       sets: oldExercise.sets,
//     };

//     await updateWorkoutSession({
//       variables: {
//         id: swappingExercise.workoutId,
//         set: { exercises: JSON.stringify(exercises) },
//       },
//     });
//     setSwappingExercise(null);
//     refetch();
//   };

//   const handleSwapWithSearch = async (searchedExercise: any) => {
//     if (!swappingExercise) return;

//     const workout = workoutLogs.find((w: any) => w.id === swappingExercise.workoutId);
//     if (!workout) return;

//     const exercises = parseExercises(workout.exercises);
//     const oldExercise = exercises[swappingExercise.index];

//     exercises[swappingExercise.index] = {
//       name: searchedExercise.name,
//       category: searchedExercise.category || oldExercise.category,
//       muscle_group: searchedExercise.muscle_group || oldExercise.muscle_group,
//       sets: oldExercise.sets,
//     };

//     await updateWorkoutSession({
//       variables: {
//         id: swappingExercise.workoutId,
//         set: { exercises: JSON.stringify(exercises) },
//       },
//     });
//     setSwappingExercise(null);
//     refetch();
//   };

//   const handleSwapWithManual = async () => {
//     if (!swappingExercise || !manualExerciseForm.name.trim()) return;

//     const workout = workoutLogs.find((w: any) => w.id === swappingExercise.workoutId);
//     if (!workout) return;

//     const exercises = parseExercises(workout.exercises);

//     exercises[swappingExercise.index] = {
//       name: manualExerciseForm.name.trim(),
//       category: 'strength',
//       muscle_group: 'Mixed',
//       sets: Array.from({ length: manualExerciseForm.sets }, (_, i) => ({
//         set_number: i + 1,
//         reps: manualExerciseForm.reps,
//         weight_kg: manualExerciseForm.weight,
//       })),
//     };

//     await updateWorkoutSession({
//       variables: {
//         id: swappingExercise.workoutId,
//         set: { exercises: JSON.stringify(exercises) },
//       },
//     });
//     setSwappingExercise(null);
//     setManualExerciseForm({ name: '', sets: 3, reps: 10, weight: 0 });
//     refetch();
//   };

//   const addSetToExercise = () => {
//     const lastSet = editExerciseForm.sets[editExerciseForm.sets.length - 1];
//     setEditExerciseForm({
//       ...editExerciseForm,
//       sets: [
//         ...editExerciseForm.sets,
//         {
//           set_number: editExerciseForm.sets.length + 1,
//           reps: lastSet?.reps || 10,
//           weight_kg: lastSet?.weight_kg || 0,
//         },
//       ],
//     });
//   };

//   const removeSetFromExercise = (setIndex: number) => {
//     setEditExerciseForm({
//       ...editExerciseForm,
//       sets: editExerciseForm.sets.filter((_, idx) => idx !== setIndex).map((set, i) => ({
//         ...set,
//         set_number: i + 1,
//       })),
//     });
//   };

//   const updateSet = (setIndex: number, field: keyof ExerciseSet, value: any) => {
//     const updatedSets = [...editExerciseForm.sets];
//     updatedSets[setIndex] = {
//       ...updatedSets[setIndex],
//       [field]: Number(value),
//     };
//     setEditExerciseForm({
//       ...editExerciseForm,
//       sets: updatedSets,
//     });
//   };

//   const parseExercises = (exercises: any): Exercise[] => {
//     if (Array.isArray(exercises)) return exercises;
//     if (typeof exercises === 'string') {
//       try {
//         return JSON.parse(exercises);
//       } catch (e) {
//         console.log(e);
//         return [];
//       }
//     }
//     return [];
//   };

//   // Calculate totals
//   const totals = workoutLogs.reduce(
//     (acc: any, log: any) => ({
//       duration: acc.duration + (log.duration_minutes || 0),
//       calories: acc.calories + (log.calories_burned || 0),
//       exercises: acc.exercises + (parseExercises(log.exercises)?.length || 0),
//       workouts: acc.workouts + 1,
//     }),
//     { duration: 0, calories: 0, exercises: 0, workouts: 0 }
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center py-24">
//         <div className="text-center space-y-4">
//           <div className="relative w-16 h-16 mx-auto">
//             <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
//             <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
//           </div>
//           <p className="text-sm text-muted-foreground animate-pulse">Loading your workouts...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 pb-12">
//       {/* Floating Action Header */}
//       <div className="sticky top-0 z-30 -mx-4 px-4 py-4 backdrop-blur-xl bg-background/80 border-b border-border/50">
//         <div className="flex items-center justify-between gap-4">
//           <div className="flex-1">
//             <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
//           </div>
//           <Button
//             onClick={() => navigate('/dashboard/log-workout')}
//             className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Log Workout
//           </Button>
//         </div>
//       </div>

//       {/* Premium Stats Grid */}
//       {workoutLogs.length > 0 && (
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//           {[
//             { label: 'Workouts', value: totals.workouts, icon: Dumbbell, gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-500/20 to-pink-500/20' },
//             { label: 'Minutes', value: totals.duration, icon: Clock, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/20 to-cyan-500/20' },
//             { label: 'Calories', value: totals.calories, icon: Flame, gradient: 'from-orange-500 to-red-500', bg: 'from-orange-500/20 to-red-500/20' },
//             { label: 'Exercises', value: totals.exercises, icon: Target, gradient: 'from-green-500 to-emerald-500', bg: 'from-green-500/20 to-emerald-500/20' },
//           ].map((stat, idx) => {
//             const Icon = stat.icon;
//             return (
//               <Card key={idx} className={`group relative overflow-hidden border-0 bg-gradient-to-br ${stat.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
//                 <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
//                 <CardContent className="p-6 relative">
//                   <div className="flex items-start justify-between mb-4">
//                     <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
//                       <Icon className="h-5 w-5 text-white" />
//                     </div>
//                     <TrendingUp className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
//                   </div>
//                   <p className={`text-3xl font-bold mb-1 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
//                   <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}

//       {/* Workouts List - Modern Cards */}
//       {workoutLogs.length === 0 ? (
//         <Card className="border-2 border-dashed border-border hover:border-purple-500/50 transition-colors duration-300">
//           <CardContent className="py-24 text-center">
//             <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
//               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" />
//               <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
//                 <Dumbbell className="h-10 w-10 text-purple-500" />
//               </div>
//             </div>
//             <h3 className="text-2xl font-bold mb-3">Start Your Fitness Journey</h3>
//             <p className="text-muted-foreground mb-8 max-w-md mx-auto">
//               Log your first workout and watch your progress transform
//             </p>
//             <Button
//               onClick={() => navigate('/dashboard/log-workout')}
//               size="lg"
//               className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
//             >
//               <Plus className="h-5 w-5 mr-2" />
//               Log First Workout
//             </Button>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="space-y-4">
//           {workoutLogs.map((workout: any) => {
//             const exercises = parseExercises(workout.exercises);
//             const isExpanded = expandedWorkout === workout.id;

//             return (
//               <Card
//                 key={workout.id}
//                 className="group relative overflow-hidden border border-border hover:border-purple-500/50 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-muted/30"
//               >
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

//                 <CardContent className="relative">
//                   {/* Header */}
//                   <div className="flex items-start gap-4 transition-all" onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}>
//                     <div className="relative">
//                       <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
//                         <Dumbbell className="h-8 w-8 text-white" />
//                       </div>
//                       <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
//                         <span className="text-xs">✓</span>
//                       </div>
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 mb-2">
//                         <h3 className="text-xl font-bold capitalize truncate">{workout.workout_type}</h3>
//                         <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
//                           {exercises.length} exercises
//                         </Badge>
//                       </div>
//                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
//                         <span className="flex items-center gap-1">
//                           <Clock className="h-4 w-4" />
//                           {workout.duration_minutes} min
//                         </span>
//                         <span className="flex items-center gap-1">
//                           <Flame className="h-4 w-4" />
//                           {workout.calories_burned || 0} cal
//                         </span>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
//                         className="opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
//                       </Button>
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={() => handleDeleteWorkout(workout.id)}
//                         className="opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>

//                   {/* Exercises */}
//                   {isExpanded && exercises.length > 0 && (
//                     <div className="space-y-3 mt-6 pt-4 border-t border-border/50">
//                       {exercises.map((exercise: Exercise, idx: number) => {
//                         const isEditingThis = editingExercise?.workoutId === workout.id && editingExercise?.index === idx;
//                         const isSwappingThis = swappingExercise?.workoutId === workout.id && swappingExercise?.index === idx;
//                         const sets = Array.isArray(exercise.sets) ? exercise.sets : [];

//                         if (isSwappingThis) {
//                           return (
//                             <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-purple-500/50 animate-in fade-in slide-in-from-top-2 duration-300">
//                               <div className="flex items-center justify-between mb-4">
//                                 <h5 className="font-semibold flex items-center gap-2 text-purple-599">
//                                   <RefreshCw className="h-4 w-4" />
//                                   Swap Exercise
//                                 </h5>
//                                 <Button onClick={() => setSwappingExercise(null)} size="sm" variant="ghost">
//                                   <X className="h-4 w-4" />
//                                 </Button>
//                               </div>

//                               {!swappingExercise.mode ? (
//                                 <div className="grid grid-cols-3 gap-3">
//                                   {[
//                                     { mode: 'aiPlan' as SwapMode, icon: Sparkles, label: 'AI Plan', gradient: 'from-purple-500 to-purple-600' },
//                                     { mode: 'search' as SwapMode, icon: Search, label: 'Search', gradient: 'from-blue-500 to-blue-600' },
//                                     { mode: 'manual' as SwapMode, icon: PenLine, label: 'Manual', gradient: 'from-green-500 to-green-600' },
//                                   ].map((option) => {
//                                     const Icon = option.icon;
//                                     return (
//                                       <button
//                                         key={option.mode}
//                                         onClick={() => setSwappingExercise({ ...swappingExercise, mode: option.mode })}
//                                         className={`p-4 rounded-lg bg-gradient-to-br ${option.gradient} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2`}
//                                       >
//                                         <Icon className="h-6 w-6" />
//                                         <span className="text-xs font-medium">{option.label}</span>
//                                       </button>
//                                     );
//                                   })}
//                                 </div>
//                               ) : swappingExercise.mode === 'aiPlan' ? (
//                                 <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
//                                   {aiPlanExercises.length === 0 ? (
//                                     <p className="text-sm text-center text-muted-foreground py-8">No AI plan found</p>
//                                   ) : (
//                                     aiPlanExercises.map((aiEx, i) => (
//                                       <button
//                                         key={i}
//                                         onClick={() => handleSwapWithAIPlan(aiEx)}
//                                         className="w-full text-left p-3 rounded-lg bg-card border border-border hover:border-purple-500 hover:shadow-md transition-all"
//                                       >
//                                         <p className="font-medium hover:text-purple-600 transition-colors">{aiEx.name}</p>
//                                         {aiEx.muscle_group && (
//                                           <p className="text-xs text-muted-foreground mt-1">{aiEx.muscle_group}</p>
//                                         )}
//                                       </button>
//                                     ))
//                                   )}
//                                 </div>
//                               ) : swappingExercise.mode === 'search' ? (
//                                 <ExerciseLibrary
//                                   onSelectExercise={handleSwapWithSearch}
//                                 />
//                               ) : (
//                                 <div className="space-y-3">
//                                   <input
//                                     type="text"
//                                     placeholder="Exercise name"
//                                     value={manualExerciseForm.name}
//                                     onChange={(e) => setManualExerciseForm({ ...manualExerciseForm, name: e.target.value })}
//                                     className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
//                                   />
//                                   <div className="grid grid-cols-3 gap-3">
//                                     {['sets', 'reps', 'weight'].map((field) => (
//                                       <input
//                                         key={field}
//                                         type="number"
//                                         placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
//                                         value={manualExerciseForm[field as keyof typeof manualExerciseForm]}
//                                         onChange={(e) => setManualExerciseForm({ ...manualExerciseForm, [field]: Number(e.target.value) })}
//                                         className="px-3 py-2 rounded-lg border border-border bg-background text-center focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
//                                       />
//                                     ))}
//                                   </div>
//                                   <Button onClick={handleSwapWithManual} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
//                                     Swap Exercise
//                                   </Button>
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         }

//                         if (isEditingThis) {
//                           return (
//                             <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-500/50 animate-in fade-in slide-in-from-top-2 duration-300">
//                               <div className="flex items-center justify-between mb-4">
//                                 <h5 className="font-semibold text-blue-600 dark:text-blue-400">{editExerciseForm.name}</h5>
//                                 <div className="flex items-center gap-2">
//                                   <Button onClick={saveEditExercise} size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
//                                     <Save className="h-4 w-4 mr-1" />
//                                     Save
//                                   </Button>
//                                   <Button onClick={() => setEditingExercise(null)} size="sm" variant="ghost">
//                                     <X className="h-4 w-4" />
//                                   </Button>
//                                 </div>
//                               </div>

//                               <div className="space-y-2">
//                                 {editExerciseForm.sets.map((set, setIdx) => (
//                                   <div key={setIdx} className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg">
//                                     <span className="w-8 text-sm font-medium text-muted-foreground">#{setIdx + 1}</span>
//                                     <input
//                                       type="number"
//                                       value={set.reps}
//                                       onChange={(e) => updateSet(setIdx, 'reps', e.target.value)}
//                                       className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-center outline-none focus:border-blue-500"
//                                       placeholder="Reps"
//                                     />
//                                     <span className="text-xs text-muted-foreground">×</span>
//                                     <input
//                                       type="number"
//                                       value={set.weight_kg}
//                                       onChange={(e) => updateSet(setIdx, 'weight_kg', e.target.value)}
//                                       className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-center outline-none focus:border-blue-500"
//                                       placeholder="Weight"
//                                     />
//                                     <span className="text-xs text-muted-foreground">kg</span>
//                                     {editExerciseForm.sets.length > 1 && (
//                                       <Button onClick={() => removeSetFromExercise(setIdx)} size="sm" variant="ghost" className="text-red-600">
//                                         <Trash2 className="h-4 w-4" />
//                                       </Button>
//                                     )}
//                                   </div>
//                                 ))}
//                                 <Button onClick={addSetToExercise} variant="outline" size="sm" className="w-full">
//                                   <Plus className="h-4 w-4 mr-1" />
//                                   Add Set
//                                 </Button>
//                               </div>
//                             </div>
//                           );
//                         }

//                         return (
//                           <div key={idx} className="group/exercise p-4 rounded-xl bg-gradient-hero hover:shadow-md transition-all duration-200">
//                             <div className="flex items-start justify-between mb-3">
//                               <div className="flex-1">
//                                 <h4 className="font-semibold text-base mb-1">{exercise.name}</h4>
//                                 <div className="flex items-center gap-3 text-sm text-muted-foreground">
//                                   {exercise.muscle_group && (
//                                     <Badge variant="outline" className="text-xs">{exercise.muscle_group}</Badge>
//                                   )}
//                                   <span>{sets.length} sets</span>
//                                 </div>
//                               </div>

//                               <div className="flex items-center gap-1 opacity-0 group-hover/exercise:opacity-100 transition-opacity">
//                                 <Button
//                                   onClick={() => startEditExercise(workout.id, idx, exercise)}
//                                   size="sm"
//                                   variant="ghost"
//                                   className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
//                                 >
//                                   <Edit2 className="h-4 w-4" />
//                                 </Button>
//                                 <Button
//                                   onClick={() => startSwapExercise(workout.id, idx, null)}
//                                   size="sm"
//                                   variant="ghost"
//                                   className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
//                                 >
//                                   <RefreshCw className="h-4 w-4" />
//                                 </Button>
//                                 <Button
//                                   onClick={() => handleDeleteExercise(workout.id, idx)}
//                                   size="sm"
//                                   variant="ghost"
//                                   className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </div>

//                             {/* Sets Grid */}
//                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
//                               {sets.map((set, setIdx) => (
//                                 <div key={setIdx} className="p-2 rounded-lg bg-card border border-border">
//                                   <div className="text-xs text-muted-foreground mb-1">Set {setIdx + 1}</div>
//                                   <div className="font-semibold text-sm">
//                                     {set.reps} × {set.weight_kg}kg
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }
