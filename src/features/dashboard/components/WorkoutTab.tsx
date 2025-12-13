/**
 * Modern Workout Tab - Premium Exercise Tracking
 * Full edit/swap/delete functionality for exercises
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Dumbbell, Plus, Trash2, Clock, Flame, TrendingUp, Award, Zap, CheckCircle2, Edit2, X, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutSessionsByDate } from '../hooks/useDashboardData';
import { useDeleteWorkoutSession, useUpdateWorkoutSession } from '../hooks/useDashboardMutations';
import { DatePicker } from './DatePicker';
import { ExerciseSearch } from './ExerciseSearch';

const getToday = () => new Date().toISOString().split('T')[0];

interface ExerciseSet {
  reps: number;
  weight_kg: number;
  completed: boolean;
}

interface Exercise {
  name: string;
  sets: ExerciseSet[];
}

export function WorkoutTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data, loading, refetch } = useWorkoutSessionsByDate(selectedDate);
  const [deleteWorkoutSession] = useDeleteWorkoutSession();
  const [updateWorkoutSession] = useUpdateWorkoutSession();

  // Edit state
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<{ workoutId: string; index: number } | null>(null);
  const [swappingExercise, setSwappingExercise] = useState<{ workoutId: string; index: number } | null>(null);

  // Form state
  const [editWorkoutForm, setEditWorkoutForm] = useState({
    workout_type: '',
    duration_minutes: 0,
    calories_burned: 0,
    notes: '',
  });

  const [editExerciseForm, setEditExerciseForm] = useState<Exercise>({
    name: '',
    sets: [],
  });

  const workoutLogs = (data as any)?.workout_logsCollection?.edges?.map((e: any) => e.node) || [];

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('Delete this workout log?')) {
      await deleteWorkoutSession({ variables: { id } });
      refetch();
    }
  };

  const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
    if (confirm('Delete this exercise?')) {
      const workout = workoutLogs.find((w: any) => w.id === workoutId);
      if (!workout) return;

      const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
      const updatedExercises = exercises.filter((_: any, idx: number) => idx !== exerciseIndex);

      await updateWorkoutSession({
        variables: {
          id: workoutId,
          set: {
            exercises: updatedExercises,
          },
        },
      });
      refetch();
    }
  };

  const startEditWorkout = (workout: any) => {
    setEditingWorkoutId(workout.id);
    setEditWorkoutForm({
      workout_type: workout.workout_type || '',
      duration_minutes: Number(workout.duration_minutes) || 0,
      calories_burned: Number(workout.calories_burned) || 0,
      notes: workout.notes || '',
    });
  };

  const saveEditWorkout = async (workoutId: string) => {
    await updateWorkoutSession({
      variables: {
        id: workoutId,
        set: {
          workout_type: editWorkoutForm.workout_type,
          duration_minutes: Number(editWorkoutForm.duration_minutes),
          calories_burned: Number(editWorkoutForm.calories_burned),
          notes: editWorkoutForm.notes,
        },
      },
    });
    setEditingWorkoutId(null);
    refetch();
  };

  const startEditExercise = (workoutId: string, exerciseIndex: number, exercise: Exercise) => {
    setEditingExercise({ workoutId, index: exerciseIndex });
    setEditExerciseForm(JSON.parse(JSON.stringify(exercise))); // Deep clone
  };

  const saveEditExercise = async () => {
    if (!editingExercise) return;

    const workout = workoutLogs.find((w: any) => w.id === editingExercise.workoutId);
    if (!workout) return;

    const exercises = Array.isArray(workout.exercises) ? [...workout.exercises] : [];
    exercises[editingExercise.index] = editExerciseForm;

    await updateWorkoutSession({
      variables: {
        id: editingExercise.workoutId,
        set: {
          exercises: exercises,
        },
      },
    });
    setEditingExercise(null);
    refetch();
  };

  const startSwapExercise = (workoutId: string, exerciseIndex: number) => {
    setSwappingExercise({ workoutId, index: exerciseIndex });
  };

  const handleSwapExercise = async (selectedExercise: any) => {
    if (!swappingExercise) return;

    const workout = workoutLogs.find((w: any) => w.id === swappingExercise.workoutId);
    if (!workout) return;

    const exercises = Array.isArray(workout.exercises) ? [...workout.exercises] : [];
    const oldExercise = exercises[swappingExercise.index];

    // Replace exercise but keep the sets structure
    exercises[swappingExercise.index] = {
      name: selectedExercise.name,
      sets: oldExercise.sets || [],
    };

    await updateWorkoutSession({
      variables: {
        id: swappingExercise.workoutId,
        set: {
          exercises: exercises,
        },
      },
    });
    setSwappingExercise(null);
    refetch();
  };

  const addSetToExercise = () => {
    setEditExerciseForm({
      ...editExerciseForm,
      sets: [
        ...editExerciseForm.sets,
        { reps: 10, weight_kg: 0, completed: true },
      ],
    });
  };

  const removeSetFromExercise = (setIndex: number) => {
    setEditExerciseForm({
      ...editExerciseForm,
      sets: editExerciseForm.sets.filter((_, idx) => idx !== setIndex),
    });
  };

  const updateSet = (setIndex: number, field: keyof ExerciseSet, value: any) => {
    const updatedSets = [...editExerciseForm.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: field === 'completed' ? value : Number(value),
    };
    setEditExerciseForm({
      ...editExerciseForm,
      sets: updatedSets,
    });
  };

  // Calculate totals
  const totals = workoutLogs.reduce(
    (acc: any, log: any) => ({
      duration: acc.duration + (log.duration_minutes || 0),
      calories: acc.calories + (log.calories_burned || 0),
      exercises: acc.exercises + (log.exercises?.length || 0),
      completed: acc.completed + (log.completed ? 1 : 0),
    }),
    { duration: 0, calories: 0, exercises: 0, completed: 0 }
  );

  const workoutTypeConfig: Record<string, { emoji: string, color: string, gradient: string }> = {
    strength: { emoji: '💪', color: 'purple', gradient: 'from-purple-500 to-pink-600' },
    cardio: { emoji: '🏃', color: 'blue', gradient: 'from-blue-500 to-cyan-600' },
    hiit: { emoji: '⚡', color: 'orange', gradient: 'from-orange-500 to-red-600' },
    flexibility: { emoji: '🧘', color: 'green', gradient: 'from-green-500 to-emerald-600' },
    sports: { emoji: '⚽', color: 'yellow', gradient: 'from-yellow-500 to-orange-600' },
    other: { emoji: '🏋️', color: 'gray', gradient: 'from-gray-500 to-slate-600' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Dumbbell className="h-6 w-6 text-purple-600" />
            Workout Tracker
          </h2>
          <p className="text-muted-foreground mt-1">Track your training sessions</p>
        </div>
        <Button onClick={() => navigate('/dashboard/log-workout')} className="bg-gradient-to-r from-purple-500 to-pink-600">
          <Plus className="h-4 w-4 mr-2" />
          Log Workout
        </Button>
      </div>

      {/* Date Picker */}
      <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Stats Grid */}
      {workoutLogs.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Workouts */}
          <Card className="relative overflow-hidden border-2 border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="h-5 w-5 text-purple-500" />
                <Badge variant={totals.completed === workoutLogs.length ? 'success' : 'secondary'}>
                  {totals.completed}/{workoutLogs.length}
                </Badge>
              </div>
              <p className="text-3xl font-bold">{workoutLogs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Workouts</p>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card className="relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold">{totals.duration}</p>
              <p className="text-xs text-muted-foreground mt-1">Minutes</p>
            </CardContent>
          </Card>

          {/* Calories */}
          <Card className="relative overflow-hidden border-2 border-orange-500/20 hover:border-orange-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold">{totals.calories}</p>
              <p className="text-xs text-muted-foreground mt-1">Calories</p>
            </CardContent>
          </Card>

          {/* Exercises */}
          <Card className="relative overflow-hidden border-2 border-green-500/20 hover:border-green-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Zap className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold">{totals.exercises}</p>
              <p className="text-xs text-muted-foreground mt-1">Exercises</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workouts List */}
      <div>
        <h3 className="text-xl font-bold mb-4">Training Sessions</h3>

        {workoutLogs.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
                <Dumbbell className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No Workouts Logged Yet</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your training to see your progress!
              </p>
              <Button onClick={() => navigate('/dashboard/log-workout')} className="bg-gradient-to-r from-purple-500 to-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Workout
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {workoutLogs.map((workout: any) => {
              const config = workoutTypeConfig[workout.workout_type] || workoutTypeConfig.other;
              const exercises = Array.isArray(workout.exercises) ? workout.exercises : [];
              const isEditingWorkout = editingWorkoutId === workout.id;

              return (
                <Card key={workout.id} className="group hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: `hsl(var(--${config.color}))` }}>
                  <CardContent className="py-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Workout Header */}
                        {isEditingWorkout ? (
                          <div className="space-y-4 mb-4">
                            <h4 className="font-bold text-lg">Edit Workout Details</h4>

                            <div>
                              <label className="text-sm font-medium mb-1 block">Workout Type</label>
                              <select
                                value={editWorkoutForm.workout_type}
                                onChange={(e) => setEditWorkoutForm({ ...editWorkoutForm, workout_type: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                              >
                                <option value="strength">Strength</option>
                                <option value="cardio">Cardio</option>
                                <option value="hiit">HIIT</option>
                                <option value="flexibility">Flexibility</option>
                                <option value="sports">Sports</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium mb-1 block">Duration (minutes)</label>
                                <input
                                  type="number"
                                  value={editWorkoutForm.duration_minutes}
                                  onChange={(e) => setEditWorkoutForm({ ...editWorkoutForm, duration_minutes: Number(e.target.value) })}
                                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Calories Burned</label>
                                <input
                                  type="number"
                                  value={editWorkoutForm.calories_burned}
                                  onChange={(e) => setEditWorkoutForm({ ...editWorkoutForm, calories_burned: Number(e.target.value) })}
                                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-1 block">Notes</label>
                              <textarea
                                value={editWorkoutForm.notes}
                                onChange={(e) => setEditWorkoutForm({ ...editWorkoutForm, notes: e.target.value })}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                rows={2}
                              />
                            </div>

                            <div className="flex gap-2">
                              <Button onClick={() => saveEditWorkout(workout.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                                <Save className="h-4 w-4 mr-1" />
                                Save
                              </Button>
                              <Button onClick={() => setEditingWorkoutId(null)} size="sm" variant="outline">
                                <X className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 mb-4">
                            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl`}>
                              {config.emoji}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-lg font-bold capitalize">{workout.workout_type} Workout</h4>
                                {workout.completed && (
                                  <Badge variant="success" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {workout.duration_minutes} min • {exercises.length} exercises • {workout.calories_burned || 0} cal burned
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Exercises List */}
                        {exercises.length > 0 && !isEditingWorkout && (
                          <div className="ml-0 md:ml-[68px] space-y-2">
                            <p className="text-sm font-semibold text-muted-foreground mb-2">Exercises:</p>
                            <div className="grid grid-cols-1 gap-3">
                              {exercises.map((exercise: Exercise, idx: number) => {
                                const isEditingThisExercise = editingExercise?.workoutId === workout.id && editingExercise?.index === idx;
                                const isSwappingThisExercise = swappingExercise?.workoutId === workout.id && swappingExercise?.index === idx;
                                const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
                                const completedSets = sets.filter((s: any) => s.completed).length;
                                const totalSets = sets.length;

                                if (isSwappingThisExercise) {
                                  return (
                                    <div key={idx} className="p-4 border-2 border-purple-500 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold">Replace Exercise: {exercise.name}</h5>
                                        <Button onClick={() => setSwappingExercise(null)} size="sm" variant="ghost">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <ExerciseSearch onSelect={handleSwapExercise} />
                                    </div>
                                  );
                                }

                                if (isEditingThisExercise) {
                                  return (
                                    <div key={idx} className="p-4 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                      <h5 className="font-semibold mb-3">Edit Exercise</h5>

                                      <div className="space-y-3">
                                        <div>
                                          <label className="text-sm font-medium mb-1 block">Exercise Name</label>
                                          <input
                                            type="text"
                                            value={editExerciseForm.name}
                                            onChange={(e) => setEditExerciseForm({ ...editExerciseForm, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                                          />
                                        </div>

                                        <div>
                                          <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-medium">Sets</label>
                                            <Button onClick={addSetToExercise} size="sm" variant="outline">
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add Set
                                            </Button>
                                          </div>

                                          <div className="space-y-2">
                                            {editExerciseForm.sets.map((set, setIdx) => (
                                              <div key={setIdx} className="flex items-center gap-2">
                                                <span className="text-sm font-medium w-12">Set {setIdx + 1}</span>
                                                <input
                                                  type="number"
                                                  placeholder="Reps"
                                                  value={set.reps}
                                                  onChange={(e) => updateSet(setIdx, 'reps', e.target.value)}
                                                  className="w-20 px-2 py-1 border border-border rounded bg-background text-sm"
                                                />
                                                <span className="text-xs">reps</span>
                                                <input
                                                  type="number"
                                                  placeholder="Weight"
                                                  value={set.weight_kg}
                                                  onChange={(e) => updateSet(setIdx, 'weight_kg', e.target.value)}
                                                  className="w-20 px-2 py-1 border border-border rounded bg-background text-sm"
                                                />
                                                <span className="text-xs">kg</span>
                                                <Button
                                                  onClick={() => removeSetFromExercise(setIdx)}
                                                  size="sm"
                                                  variant="ghost"
                                                  className="text-red-600"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        <div className="flex gap-2">
                                          <Button onClick={saveEditExercise} size="sm" className="bg-green-600 hover:bg-green-700">
                                            <Save className="h-4 w-4 mr-1" />
                                            Save
                                          </Button>
                                          <Button onClick={() => setEditingExercise(null)} size="sm" variant="outline">
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{exercise.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {completedSets}/{totalSets} sets
                                        {sets.length > 0 && (
                                          <span> • {sets[0].weight_kg}kg × {sets[0].reps} reps</span>
                                        )}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {completedSets === totalSets && (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                                      )}
                                      <Button
                                        onClick={() => startEditExercise(workout.id, idx, exercise)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={() => startSwapExercise(workout.id, idx)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-purple-600"
                                      >
                                        <RefreshCw className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        onClick={() => handleDeleteExercise(workout.id, idx)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-600"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {workout.notes && !isEditingWorkout && (
                          <div className="ml-0 md:ml-[68px] mt-3 p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">Note</p>
                            <p className="text-sm mt-1">{workout.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Workout Actions */}
                      {!isEditingWorkout && (
                        <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => startEditWorkout(workout)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteWorkout(workout.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Insights */}
      {workoutLogs.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold">Performance Summary</h4>
                <p className="text-xs text-muted-foreground">Your training metrics for today</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round((totals.completed / workoutLogs.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totals.duration / workoutLogs.length)}min</p>
                  <p className="text-xs text-muted-foreground">Avg Duration</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totals.calories / workoutLogs.length)}</p>
                  <p className="text-xs text-muted-foreground">Avg Calories</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
