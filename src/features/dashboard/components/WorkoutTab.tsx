/**
 * Workout Tab - INSANE UI/UX for Exercise Management
 * Clean, intuitive edit/swap/delete for exercises with smart AI integration
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Dumbbell, Plus, Trash2, Clock, Flame, Award, Zap, CheckCircle2, Edit2, X, Save, RefreshCw, Sparkles, Search, PenLine } from 'lucide-react';
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

  // State for exercise management
  const [editingExercise, setEditingExercise] = useState<{ workoutId: string; index: number } | null>(null);
  const [swappingExercise, setSwappingExercise] = useState<{ workoutId: string; index: number; mode: SwapMode } | null>(null);

  // Form state
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

  // Parse AI workout plan exercises
  const aiPlanExercises: any[] = [];
  if (activeWorkoutPlan?.weekly_plan) {
    try {
      const weeklyPlan = typeof activeWorkoutPlan.weekly_plan === 'string'
        ? JSON.parse(activeWorkoutPlan.weekly_plan)
        : activeWorkoutPlan.weekly_plan;

      Object.values(weeklyPlan || {}).forEach((day: any) => {
        if (Array.isArray(day.exercises)) {
          day.exercises.forEach((ex: any) => {
            if (!aiPlanExercises.some(e => e.name === ex.name)) {
              aiPlanExercises.push(ex);
            }
          });
        }
      });
    } catch (e) {
      console.error('Error parsing AI plan:', e);
    }
  }

  const handleDeleteWorkout = async (id: string) => {
    if (confirm('Delete this entire workout session?')) {
      await deleteWorkoutSession({ variables: { id } });
      refetch();
    }
  };

  const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
    if (confirm('Remove this exercise from the workout?')) {
      const workout = workoutLogs.find((w: any) => w.id === workoutId);
      if (!workout) return;

      const exercises = parseExercises(workout.exercises);
      const updatedExercises = exercises.filter((_: any, idx: number) => idx !== exerciseIndex);

      console.log('🔍 DELETE EXERCISE - Before mutation:', { workoutId, exerciseIndex, exercises, updatedExercises });

      const result = await updateWorkoutSession({
        variables: {
          id: workoutId,
          set: { exercises: updatedExercises },
        },
      });

      console.log('🔍 DELETE EXERCISE - After mutation:', result);
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

    console.log('🔍 EDIT EXERCISE - Before mutation:', { workoutId: editingExercise.workoutId, index: editingExercise.index, oldExercises: parseExercises(workout.exercises), newExercises: exercises });

    const result = await updateWorkoutSession({
      variables: {
        id: editingExercise.workoutId,
        set: { exercises: exercises },
      },
    });

    console.log('🔍 EDIT EXERCISE - After mutation:', result);
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

    console.log('🔍 SWAP WITH AI PLAN - Before mutation:', { workoutId: swappingExercise.workoutId, index: swappingExercise.index, oldExercise, aiExercise, newExercises: exercises });

    const result = await updateWorkoutSession({
      variables: {
        id: swappingExercise.workoutId,
        set: { exercises: exercises },
      },
    });

    console.log('🔍 SWAP WITH AI PLAN - After mutation:', result);
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

    console.log('🔍 SWAP WITH SEARCH - Before mutation:', { workoutId: swappingExercise.workoutId, index: swappingExercise.index, oldExercise, searchedExercise, newExercises: exercises });

    const result = await updateWorkoutSession({
      variables: {
        id: swappingExercise.workoutId,
        set: { exercises: exercises },
      },
    });

    console.log('🔍 SWAP WITH SEARCH - After mutation:', result);
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

    console.log('🔍 SWAP WITH MANUAL - Before mutation:', { workoutId: swappingExercise.workoutId, index: swappingExercise.index, manualForm: manualExerciseForm, newExercises: exercises });

    const result = await updateWorkoutSession({
      variables: {
        id: swappingExercise.workoutId,
        set: { exercises: exercises },
      },
    });

    console.log('🔍 SWAP WITH MANUAL - After mutation:', result);
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
      [field]: field === 'completed' ? value : Number(value),
    };
    setEditExerciseForm({
      ...editExerciseForm,
      sets: updatedSets,
    });
  };

  // Helper to parse exercises from JSONB
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
          <p className="text-muted-foreground mt-1">View and manage your training</p>
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

          <Card className="relative overflow-hidden border-2 border-blue-500/20 hover:border-blue-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <Clock className="h-5 w-5 text-blue-500 mb-2" />
              <p className="text-3xl font-bold">{totals.duration}</p>
              <p className="text-xs text-muted-foreground mt-1">Minutes</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-orange-500/20 hover:border-orange-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <Flame className="h-5 w-5 text-orange-500 mb-2" />
              <p className="text-3xl font-bold">{totals.calories}</p>
              <p className="text-xs text-muted-foreground mt-1">Calories</p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-2 border-green-500/20 hover:border-green-500/40 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <CardContent className="pt-6 relative z-10">
              <Zap className="h-5 w-5 text-green-500 mb-2" />
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
              const exercises = parseExercises(workout.exercises);

              return (
                <Card key={workout.id} className="group hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: `hsl(var(--${config.color}))` }}>
                  <CardContent className="py-6">
                    {/* Workout Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl shadow-lg`}>
                        {config.emoji}
                      </div>
                      <div className="flex-1">
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
                          {workout.duration_minutes} min • {exercises.length} exercises • {workout.calories_burned || 0} cal
                        </p>
                      </div>
                      <Button
                        onClick={() => handleDeleteWorkout(workout.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Exercises */}
                    {exercises.length > 0 && (
                      <div className="space-y-3">
                        {exercises.map((exercise: Exercise, idx: number) => {
                          const isEditingThisExercise = editingExercise?.workoutId === workout.id && editingExercise?.index === idx;
                          const isSwappingThisExercise = swappingExercise?.workoutId === workout.id && swappingExercise?.index === idx;
                          const sets = Array.isArray(exercise.sets) ? exercise.sets : [];
                          const totalSets = sets.length;

                          if (isSwappingThisExercise) {
                            return (
                              <Card key={idx} className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                <CardContent className="pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold flex items-center gap-2">
                                      <RefreshCw className="h-4 w-4 text-purple-600" />
                                      Swap: {exercise.name}
                                    </h5>
                                    <Button onClick={() => setSwappingExercise(null)} size="sm" variant="ghost">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>

                                  {/* Swap Options */}
                                  {!swappingExercise.mode && (
                                    <div className="grid grid-cols-3 gap-2">
                                      <Button
                                        onClick={() => setSwappingExercise({ ...swappingExercise, mode: 'aiPlan' })}
                                        variant="outline"
                                        className="flex flex-col items-center gap-2 h-auto py-4"
                                      >
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        <span className="text-xs">AI Plan</span>
                                      </Button>
                                      <Button
                                        onClick={() => setSwappingExercise({ ...swappingExercise, mode: 'search' })}
                                        variant="outline"
                                        className="flex flex-col items-center gap-2 h-auto py-4"
                                      >
                                        <Search className="h-5 w-5 text-blue-600" />
                                        <span className="text-xs">Search</span>
                                      </Button>
                                      <Button
                                        onClick={() => setSwappingExercise({ ...swappingExercise, mode: 'manual' })}
                                        variant="outline"
                                        className="flex flex-col items-center gap-2 h-auto py-4"
                                      >
                                        <PenLine className="h-5 w-5 text-green-600" />
                                        <span className="text-xs">Manual</span>
                                      </Button>
                                    </div>
                                  )}

                                  {/* AI Plan Selection */}
                                  {swappingExercise.mode === 'aiPlan' && (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                      <p className="text-sm text-muted-foreground mb-2">Choose from your AI workout plan:</p>
                                      {aiPlanExercises.length === 0 ? (
                                        <div className="p-4 bg-muted/30 rounded-lg text-center">
                                          <p className="text-sm text-muted-foreground">No AI workout plan found. Create one first!</p>
                                        </div>
                                      ) : (
                                        aiPlanExercises.map((aiEx, aiIdx) => (
                                          <button
                                            key={aiIdx}
                                            onClick={() => handleSwapWithAIPlan(aiEx)}
                                            className="w-full text-left p-3 rounded-lg border border-border hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all"
                                          >
                                            <p className="font-medium">{aiEx.name}</p>
                                            {aiEx.muscle_group && (
                                              <p className="text-xs text-muted-foreground mt-1">Target: {aiEx.muscle_group}</p>
                                            )}
                                          </button>
                                        ))
                                      )}
                                    </div>
                                  )}

                                  {/* Search Mode */}
                                  {swappingExercise.mode === 'search' && (
                                    <div className="mt-3">
                                      <ExerciseSearch onSelect={handleSwapWithSearch} />
                                    </div>
                                  )}

                                  {/* Manual Entry Mode */}
                                  {swappingExercise.mode === 'manual' && (
                                    <div className="space-y-3 mt-3">
                                      <div>
                                        <label className="text-sm font-medium mb-1 block">Exercise Name</label>
                                        <input
                                          type="text"
                                          value={manualExerciseForm.name}
                                          onChange={(e) => setManualExerciseForm({ ...manualExerciseForm, name: e.target.value })}
                                          placeholder="e.g., Bench Press"
                                          className="w-full px-3 py-2 border rounded-lg"
                                        />
                                      </div>
                                      <div className="grid grid-cols-3 gap-2">
                                        <div>
                                          <label className="text-sm font-medium mb-1 block">Sets</label>
                                          <input
                                            type="number"
                                            min="1"
                                            value={manualExerciseForm.sets}
                                            onChange={(e) => setManualExerciseForm({ ...manualExerciseForm, sets: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg text-center"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium mb-1 block">Reps</label>
                                          <input
                                            type="number"
                                            min="1"
                                            value={manualExerciseForm.reps}
                                            onChange={(e) => setManualExerciseForm({ ...manualExerciseForm, reps: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg text-center"
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium mb-1 block">Weight (kg)</label>
                                          <input
                                            type="number"
                                            min="0"
                                            step="0.5"
                                            value={manualExerciseForm.weight}
                                            onChange={(e) => setManualExerciseForm({ ...manualExerciseForm, weight: Number(e.target.value) })}
                                            className="w-full px-3 py-2 border rounded-lg text-center"
                                          />
                                        </div>
                                      </div>
                                      <Button
                                        onClick={handleSwapWithManual}
                                        disabled={!manualExerciseForm.name.trim()}
                                        className="w-full"
                                      >
                                        Swap Exercise
                                      </Button>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          }

                          if (isEditingThisExercise) {
                            return (
                              <Card key={idx} className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                                <CardContent className="pt-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h5 className="font-semibold flex items-center gap-2">
                                      <Edit2 className="h-4 w-4 text-blue-600" />
                                      Edit Exercise
                                    </h5>
                                  </div>

                                  <div className="space-y-3">
                                    <div>
                                      <label className="text-sm font-medium mb-1 block">Exercise Name</label>
                                      <input
                                        type="text"
                                        value={editExerciseForm.name}
                                        onChange={(e) => setEditExerciseForm({ ...editExerciseForm, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg"
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
                                          <div key={setIdx} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-900 rounded-lg">
                                            <span className="text-sm font-medium w-12">Set {setIdx + 1}</span>
                                            <input
                                              type="number"
                                              placeholder="Reps"
                                              value={set.reps}
                                              onChange={(e) => updateSet(setIdx, 'reps', e.target.value)}
                                              className="w-20 px-2 py-1 border rounded text-center text-sm"
                                            />
                                            <span className="text-xs">reps</span>
                                            <input
                                              type="number"
                                              placeholder="Weight"
                                              value={set.weight_kg}
                                              onChange={(e) => updateSet(setIdx, 'weight_kg', e.target.value)}
                                              className="w-20 px-2 py-1 border rounded text-center text-sm"
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

                                    <div className="flex gap-2 pt-2">
                                      <Button onClick={saveEditExercise} size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                                        <Save className="h-4 w-4 mr-1" />
                                        Save
                                      </Button>
                                      <Button onClick={() => setEditingExercise(null)} size="sm" variant="outline">
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          }

                          return (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-800">
                              <div className="flex-1">
                                <p className="text-sm font-medium">{exercise.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {totalSets} sets
                                  {sets.length > 0 && (
                                    <span> • {sets[0].weight_kg}kg × {sets[0].reps} reps</span>
                                  )}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  onClick={() => startEditExercise(workout.id, idx, exercise)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                                  title="Edit exercise"
                                >
                                  <Edit2 className="h-3 w-3 text-blue-600" />
                                </Button>
                                <Button
                                  onClick={() => startSwapExercise(workout.id, idx, null)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                                  title="Swap exercise"
                                >
                                  <RefreshCw className="h-3 w-3 text-purple-600" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteExercise(workout.id, idx)}
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                                  title="Delete exercise"
                                >
                                  <Trash2 className="h-3 w-3 text-red-600" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Notes */}
                    {workout.notes && (
                      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Notes</p>
                        <p className="text-sm">{workout.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Performance Summary */}
      {workoutLogs.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold">Performance Summary</h4>
                <p className="text-xs text-muted-foreground">Your training metrics for today</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round((totals.completed / workoutLogs.length) * 100)}%</p>
                  <p className="text-xs text-muted-foreground">Completion</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totals.duration / workoutLogs.length)}min</p>
                  <p className="text-xs text-muted-foreground">Avg Time</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{Math.round(totals.calories / workoutLogs.length)}</p>
                  <p className="text-xs text-muted-foreground">Avg Cals</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
