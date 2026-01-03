/**
 * WorkoutTab - 2026 Premium Fitness Experience
 * Inspired by: Apple Fitness+, Strava, Whoop, Linear
 * NO MyFitnessPal vibes - Pure premium modern design
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ChevronRight, Clock, Dumbbell, Edit2, Flame, PenLine, Plus, RefreshCw, Save, Search, Sparkles, Target, Trash2, TrendingUp, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkoutPlan, useWorkoutSessionsByDate } from '../hooks/useDashboardData';
import { useDeleteWorkoutSession, useUpdateWorkoutSession } from '../hooks/useDashboardMutations';
import { DatePicker } from './DatePicker';
import { ExerciseSearch } from './ExerciseSearch';

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

export function WorkoutTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data, loading, refetch } = useWorkoutSessionsByDate(selectedDate);
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

  const workoutLogs = (data as any)?.workout_logsCollection?.edges?.map((e: any) => e.node) || [];
  const activeWorkoutPlan = (workoutPlanData as any)?.ai_workout_plansCollection?.edges?.[0]?.node;

  // Parse AI workout plan
  const planData = activeWorkoutPlan?.plan_data
    ? (typeof activeWorkoutPlan.plan_data === 'string' ? JSON.parse(activeWorkoutPlan.plan_data) : activeWorkoutPlan.plan_data)
    : null;
  const weeklyPlan = planData?.weekly_plan || [];
  const aiPlanExercises: any[] = [];

  if (Array.isArray(weeklyPlan)) {
    weeklyPlan.forEach((workout: any) => {
      if (Array.isArray(workout.exercises)) {
        workout.exercises.forEach((ex: any) => {
          if (!aiPlanExercises.some(e => e.name === ex.name)) {
            aiPlanExercises.push({ ...ex, workoutDay: workout.day, workoutFocus: workout.focus });
          }
        });
      }
    });
  }

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('Delete this entire workout session?')) {
      await deleteWorkoutSession({ variables: { id } });
      refetch();
    }
  };

  const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
    if (confirm('Remove this exercise?')) {
      const workout = workoutLogs.find((w: any) => w.id === workoutId);
      if (!workout) return;

      const exercises = parseExercises(workout.exercises);
      const updatedExercises = exercises.filter((_: any, idx: number) => idx !== exerciseIndex);

      await updateWorkoutSession({
        variables: {
          id: workoutId,
          set: { exercises: JSON.stringify(updatedExercises) },
        },
      });
      refetch();
    }
  };

  const startEditExercise = (workoutId: string, exerciseIndex: number, exercise: Exercise) => {
    setEditingExercise({ workoutId, index: exerciseIndex });
    setEditExerciseForm(JSON.parse(JSON.stringify(exercise)));
  };

  const saveEditExercise = async () => {
    if (!editingExercise) return;

    const workout = workoutLogs.find((w: any) => w.id === editingExercise.workoutId);
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
    refetch();
  };

  const startSwapExercise = (workoutId: string, index: number, mode: SwapMode) => {
    setSwappingExercise({ workoutId, index, mode });
  };

  const handleSwapWithAIPlan = async (aiExercise: any) => {
    if (!swappingExercise) return;

    const workout = workoutLogs.find((w: any) => w.id === swappingExercise.workoutId);
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
    refetch();
  };

  const handleSwapWithSearch = async (searchedExercise: any) => {
    if (!swappingExercise) return;

    const workout = workoutLogs.find((w: any) => w.id === swappingExercise.workoutId);
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
    refetch();
  };

  const handleSwapWithManual = async () => {
    if (!swappingExercise || !manualExerciseForm.name.trim()) return;

    const workout = workoutLogs.find((w: any) => w.id === swappingExercise.workoutId);
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
    refetch();
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
        return [];
      }
    }
    return [];
  };

  // Calculate totals
  const totals = workoutLogs.reduce(
    (acc: any, log: any) => ({
      duration: acc.duration + (log.duration_minutes || 0),
      calories: acc.calories + (log.calories_burned || 0),
      exercises: acc.exercises + (parseExercises(log.exercises)?.length || 0),
      workouts: acc.workouts + 1,
    }),
    { duration: 0, calories: 0, exercises: 0, workouts: 0 }
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
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
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Workout
          </Button>
        </div>
      </div>

      {/* Premium Stats Grid */}
      {workoutLogs.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Workouts', value: totals.workouts, icon: Dumbbell, gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50' },
            { label: 'Minutes', value: totals.duration, icon: Clock, gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50' },
            { label: 'Calories', value: totals.calories, icon: Flame, gradient: 'from-orange-500 to-red-500', bg: 'from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50' },
            { label: 'Exercises', value: totals.exercises, icon: Target, gradient: 'from-green-500 to-emerald-500', bg: 'from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50' },
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
                    <TrendingUp className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className={`text-3xl font-bold mb-1 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Workouts List - Modern Cards */}
      {workoutLogs.length === 0 ? (
        <Card className="border-2 border-dashed border-border hover:border-purple-500/50 transition-colors duration-300">
          <CardContent className="py-24 text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                <Dumbbell className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">Start Your Fitness Journey</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Log your first workout and watch your progress transform
            </p>
            <Button
              onClick={() => navigate('/dashboard/log-workout')}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Log First Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workoutLogs.map((workout: any) => {
            const exercises = parseExercises(workout.exercises);
            const isExpanded = expandedWorkout === workout.id;

            return (
              <Card
                key={workout.id}
                className="group relative overflow-hidden border border-border hover:border-purple-500/50 hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-background to-muted/30"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardContent className="relative">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Dumbbell className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                        <span className="text-xs">✓</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold capitalize truncate">{workout.workout_type}</h3>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                          {exercises.length} exercises
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {workout.duration_minutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="h-4 w-4" />
                          {workout.calories_burned || 0} cal
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedWorkout(isExpanded ? null : workout.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Exercises */}
                  {isExpanded && exercises.length > 0 && (
                    <div className="space-y-3 mt-6 pt-4 border-t border-border/50">
                      {exercises.map((exercise: Exercise, idx: number) => {
                        const isEditingThis = editingExercise?.workoutId === workout.id && editingExercise?.index === idx;
                        const isSwappingThis = swappingExercise?.workoutId === workout.id && swappingExercise?.index === idx;
                        const sets = Array.isArray(exercise.sets) ? exercise.sets : [];

                        if (isSwappingThis) {
                          return (
                            <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-500/50 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-semibold flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                  <RefreshCw className="h-4 w-4" />
                                  Swap Exercise
                                </h5>
                                <Button onClick={() => setSwappingExercise(null)} size="sm" variant="ghost">
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              {!swappingExercise.mode ? (
                                <div className="grid grid-cols-3 gap-3">
                                  {[
                                    { mode: 'aiPlan' as SwapMode, icon: Sparkles, label: 'AI Plan', gradient: 'from-purple-500 to-purple-600' },
                                    { mode: 'search' as SwapMode, icon: Search, label: 'Search', gradient: 'from-blue-500 to-blue-600' },
                                    { mode: 'manual' as SwapMode, icon: PenLine, label: 'Manual', gradient: 'from-green-500 to-green-600' },
                                  ].map((option) => {
                                    const Icon = option.icon;
                                    return (
                                      <button
                                        key={option.mode}
                                        onClick={() => setSwappingExercise({ ...swappingExercise, mode: option.mode })}
                                        className={`p-4 rounded-lg bg-gradient-to-br ${option.gradient} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex flex-col items-center gap-2`}
                                      >
                                        <Icon className="h-6 w-6" />
                                        <span className="text-xs font-medium">{option.label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : swappingExercise.mode === 'aiPlan' ? (
                                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                                  {aiPlanExercises.length === 0 ? (
                                    <p className="text-sm text-center text-muted-foreground py-8">No AI plan found</p>
                                  ) : (
                                    aiPlanExercises.map((aiEx, i) => (
                                      <button
                                        key={i}
                                        onClick={() => handleSwapWithAIPlan(aiEx)}
                                        className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-900 border border-border hover:border-purple-500 hover:shadow-md transition-all group"
                                      >
                                        <p className="font-medium group-hover:text-purple-600 transition-colors">{aiEx.name}</p>
                                        {aiEx.muscle_group && (
                                          <p className="text-xs text-muted-foreground mt-1">{aiEx.muscle_group}</p>
                                        )}
                                      </button>
                                    ))
                                  )}
                                </div>
                              ) : swappingExercise.mode === 'search' ? (
                                <ExerciseSearch onExerciseSelect={handleSwapWithSearch} />
                              ) : (
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    placeholder="Exercise name"
                                    value={manualExerciseForm.name}
                                    onChange={(e) => setManualExerciseForm({ ...manualExerciseForm, name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                  />
                                  <div className="grid grid-cols-3 gap-3">
                                    {['sets', 'reps', 'weight'].map((field) => (
                                      <input
                                        key={field}
                                        type="number"
                                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                        value={manualExerciseForm[field as keyof typeof manualExerciseForm]}
                                        onChange={(e) => setManualExerciseForm({ ...manualExerciseForm, [field]: Number(e.target.value) })}
                                        className="px-3 py-2 rounded-lg border border-border bg-background text-center focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                                      />
                                    ))}
                                  </div>
                                  <Button onClick={handleSwapWithManual} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                                    Swap Exercise
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        }

                        if (isEditingThis) {
                          return (
                            <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-2 border-blue-500/50 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="font-semibold text-blue-600 dark:text-blue-400">{editExerciseForm.name}</h5>
                                <div className="flex items-center gap-2">
                                  <Button onClick={saveEditExercise} size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                                    <Save className="h-4 w-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button onClick={() => setEditingExercise(null)} size="sm" variant="ghost">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {editExerciseForm.sets.map((set, setIdx) => (
                                  <div key={setIdx} className="flex items-center gap-2 p-3 bg-white dark:bg-slate-900 rounded-lg">
                                    <span className="w-8 text-sm font-medium text-muted-foreground">#{setIdx + 1}</span>
                                    <input
                                      type="number"
                                      value={set.reps}
                                      onChange={(e) => updateSet(setIdx, 'reps', e.target.value)}
                                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-center outline-none focus:border-blue-500"
                                      placeholder="Reps"
                                    />
                                    <span className="text-xs text-muted-foreground">×</span>
                                    <input
                                      type="number"
                                      value={set.weight_kg}
                                      onChange={(e) => updateSet(setIdx, 'weight_kg', e.target.value)}
                                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-center outline-none focus:border-blue-500"
                                      placeholder="Weight"
                                    />
                                    <span className="text-xs text-muted-foreground">kg</span>
                                    {editExerciseForm.sets.length > 1 && (
                                      <Button onClick={() => removeSetFromExercise(setIdx)} size="sm" variant="ghost" className="text-red-600">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                <Button onClick={addSetToExercise} variant="outline" size="sm" className="w-full">
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Set
                                </Button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="group/exercise p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-base mb-1">{exercise.name}</h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  {exercise.muscle_group && (
                                    <Badge variant="outline" className="text-xs">{exercise.muscle_group}</Badge>
                                  )}
                                  <span>{sets.length} sets</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover/exercise:opacity-100 transition-opacity">
                                <Button
                                  onClick={() => startEditExercise(workout.id, idx, exercise)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => startSwapExercise(workout.id, idx, null)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteExercise(workout.id, idx)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Sets Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                              {sets.map((set, setIdx) => (
                                <div key={setIdx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-border">
                                  <div className="text-xs text-muted-foreground mb-1">Set {setIdx + 1}</div>
                                  <div className="font-semibold text-sm">
                                    {set.reps} × {set.weight_kg}kg
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
