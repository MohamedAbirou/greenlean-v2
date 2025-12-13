/**
 * Log Workout Page - Redesigned for Post-Workout Logging
 * Users log workouts AFTER completing them - no timers or completion tracking needed
 */

import { useAuth } from '@/features/auth';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { ArrowLeft, Calendar, Plus, Replace, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AIWorkoutPlanSelector } from '../components/AIWorkoutPlanSelector';
import { DatePicker } from '../components/DatePicker';
import { ExerciseHistory } from '../components/ExerciseHistory';
import { ExerciseSearch } from '../components/ExerciseSearch';
import { WorkoutVoiceInput } from '../components/WorkoutVoiceInput';
import { useActiveWorkoutPlan } from '../hooks/useDashboardData';
import { useCreateWorkoutSession } from '../hooks/useDashboardMutations';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipments: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
}

interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
}

interface WorkoutExercise extends Exercise {
  sets: ExerciseSet[];
  notes?: string;
}

const getToday = () => new Date().toISOString().split('T')[0];

// Component to show individual exercises from AI workout plan
function AIWorkoutExercisesList({ workoutPlan, onExerciseSelect, replacingExercise }: {
  workoutPlan: any;
  onExerciseSelect: (exercise: any) => void;
  replacingExercise: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Parse plan_data from GraphQL response
  const planData = workoutPlan?.plan_data
    ? (typeof workoutPlan.plan_data === 'string' ? JSON.parse(workoutPlan.plan_data) : workoutPlan.plan_data)
    : null;

  const weeklyPlan = planData?.weekly_plan || [];

  // Extract all exercises from all workouts
  const allExercises: any[] = [];
  if (Array.isArray(weeklyPlan)) {
    weeklyPlan.forEach((workout: any) => {
      if (Array.isArray(workout.exercises)) {
        workout.exercises.forEach((ex: any) => {
          allExercises.push({
            ...ex,
            workoutDay: workout.day,
            workoutFocus: workout.focus,
            intensity: workout.intensity,
          });
        });
      }
    });
  }

  // Filter exercises by search query
  const filteredExercises = searchQuery.trim()
    ? allExercises.filter(ex =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.workoutFocus?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allExercises;

  const handleAddExercise = (aiExercise: any) => {
    const exercise: Exercise = {
      id: `ai-${Date.now()}`,
      name: aiExercise.name,
      category: aiExercise.workoutFocus || 'strength',
      muscle_group: aiExercise.muscle_group || 'Mixed',
      equipments: Array.isArray(aiExercise.equipment_needed) ? aiExercise.equipment_needed : [],
      difficulty: aiExercise.intensity || 'intermediate',
      instructions: aiExercise.safety_notes,
    };
    onExerciseSelect(exercise);
  };

  if (allExercises.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No exercises found in your AI workout plan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search exercises from AI plan..."
          className="w-full px-4 py-2.5 border border-border rounded-lg bg-background"
        />
      </div>

      {/* Exercises List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {filteredExercises.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No exercises match your search</p>
        ) : (
          filteredExercises.map((exercise, idx) => (
            <button
              key={idx}
              onClick={() => handleAddExercise(exercise)}
              className="w-full text-left p-4 rounded-lg border border-border hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-base mb-1">{exercise.name}</p>
                  <div className="flex gap-2 flex-wrap text-xs">
                    <Badge variant="outline" className="text-xs">
                      {exercise.workoutDay}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {exercise.workoutFocus}
                    </Badge>
                    {exercise.sets && (
                      <span className="text-muted-foreground">
                        {exercise.sets} sets × {exercise.reps} reps
                      </span>
                    )}
                  </div>
                  {exercise.safety_notes && (
                    <p className="text-xs text-muted-foreground mt-1 italic">{exercise.safety_notes}</p>
                  )}
                </div>
                <Plus className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))
        )}
      </div>

      {!replacingExercise && filteredExercises.length > 0 && (
        <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-1">💡 Tip:</p>
          <p>Click any exercise to add it to your workout. You can adjust sets, reps, and weight after adding.</p>
        </div>
      )}
    </div>
  );
}

export function LogWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [workoutDate, setWorkoutDate] = useState(getToday());
  const [workoutType, setWorkoutType] = useState('strength');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [inputMethod, setInputMethod] = useState<'search' | 'voice' | 'aiPlan' | 'manual'>('search');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [historyExercise, setHistoryExercise] = useState<string | null>(null);
  const [historyCurrentWeight, setHistoryCurrentWeight] = useState(0);
  const [historyCurrentReps, setHistoryCurrentReps] = useState(0);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);

  // Manual entry form
  const [manualExerciseName, setManualExerciseName] = useState('');
  const [manualSets, setManualSets] = useState(3);
  const [manualReps, setManualReps] = useState(10);
  const [manualWeight, setManualWeight] = useState(0);

  const [createWorkoutSession, { loading: creating }] = useCreateWorkoutSession();
  const { data: workoutPlanData } = useActiveWorkoutPlan();

  const activeWorkoutPlan = (workoutPlanData as any)?.ai_workout_plansCollection?.edges?.[0]?.node;
  const isQuickLog = searchParams.get('quick') === 'true';

  const handleExerciseSelect = (exercise: Exercise) => {
    // If replacing an existing exercise
    if (replacingExerciseIndex !== null) {
      const updated = [...exercises];
      // Keep the sets from the old exercise, just replace the exercise details
      updated[replacingExerciseIndex] = {
        ...exercise,
        sets: updated[replacingExerciseIndex].sets,
        notes: updated[replacingExerciseIndex].notes,
      };
      setExercises(updated);
      setReplacingExerciseIndex(null);
      setInputMethod('search');
      return;
    }

    // Adding new exercise
    const newExercise: WorkoutExercise = {
      ...exercise,
      sets: [
        { setNumber: 1, reps: 10, weight: 0 },
        { setNumber: 2, reps: 10, weight: 0 },
        { setNumber: 3, reps: 10, weight: 0 },
      ],
      notes: '',
    };
    setExercises([...exercises, newExercise]);
    setActiveExerciseIndex(exercises.length);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
    if (activeExerciseIndex === index) {
      setActiveExerciseIndex(null);
    }
  };

  const handleReplaceExercise = (index: number) => {
    setReplacingExerciseIndex(index);
    setInputMethod('search');
  };

  const handleReplaceAllExercises = () => {
    setInputMethod('aiPlan');
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const exercise = updated[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
    });
    setExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets
      .filter((_, i) => i !== setIndex)
      .map((set, i) => ({ ...set, setNumber: i + 1 }));
    setExercises(updated);
  };

  const handleSetChange = (
    exerciseIndex: number,
    setIndex: number,
    field: 'reps' | 'weight',
    value: number
  ) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const handleExerciseNotesChange = (exerciseIndex: number, notes: string) => {
    const updated = [...exercises];
    updated[exerciseIndex].notes = notes;
    setExercises(updated);
  };

  const calculateStats = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalReps = exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps, 0),
      0
    );
    const totalVolume = exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
      0
    );

    return { totalSets, totalReps, totalVolume };
  };

  const handleLogWorkout = async () => {
    if (!user?.id || exercises.length === 0) return;

    const stats = calculateStats();

    // Format exercises as JSON array
    const exercisesData = exercises.map((ex) => {
      const sets = ex.sets.map((set) => ({
        set_number: Number(set.setNumber) || 1,
        reps: Number(set.reps) || 0,
        weight_kg: Number(set.weight) || 0,
      }));

      return {
        name: String(ex.name || 'Unknown Exercise'),
        category: String(ex.category || workoutType),
        muscle_group: String(ex.muscle_group || 'Mixed'),
        sets: sets,
      };
    });

    // Calculate estimated duration (3 minutes per set + 10 min warmup)
    const estimatedDuration = Math.max(stats.totalSets * 3 + 10, 15);

    // Estimate calories burned (5 cal/min for strength, 10 for cardio/HIIT)
    const calorieRate = workoutType === 'cardio' || workoutType === 'hiit' ? 10 : 5;
    const estimatedCalories = Math.round(estimatedDuration * calorieRate);

    try {
      await createWorkoutSession({
        variables: {
          input: {
            user_id: user.id,
            workout_date: workoutDate,
            workout_type: workoutType,
            exercises: JSON.stringify(exercisesData),
            duration_minutes: estimatedDuration,
            calories_burned: estimatedCalories,
            notes: workoutNotes || undefined,
          },
        },
      });

      navigate('/dashboard?tab=workout');
    } catch (error) {
      console.error('Error logging workout:', error);
      alert('Failed to log workout. Please try again.');
    }
  };

  const handleViewHistory = (exercise: WorkoutExercise) => {
    const maxWeight = Math.max(...exercise.sets.map((s) => s.weight), 0);
    const maxReps = Math.max(...exercise.sets.map((s) => s.reps), 0);

    setHistoryExercise(exercise.name);
    setHistoryCurrentWeight(maxWeight);
    setHistoryCurrentReps(maxReps);
  };

  const handleVoiceExercises = (voiceExercises: any[]) => {
    const newExercises: WorkoutExercise[] = voiceExercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      category: workoutType,
      muscle_group: 'Mixed',
      equipments: ex.equipment_needed,
      difficulty: 'intermediate' as const,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.reps,
        weight: ex.weight,
      })),
      notes: '',
    }));
    setExercises([...exercises, ...newExercises]);
    setInputMethod('search');
  };

  const handleAIWorkoutSelect = (aiExercises: any[]) => {
    // Replace ALL exercises with AI plan
    setExercises(aiExercises);
    setInputMethod('search');
  };

  const handleManualExerciseAdd = () => {
    if (!manualExerciseName.trim()) return;

    const newExercise: WorkoutExercise = {
      id: `manual-${Date.now()}`,
      name: manualExerciseName.trim(),
      category: workoutType,
      muscle_group: 'Mixed',
      equipments: [],
      difficulty: 'intermediate',
      sets: Array.from({ length: manualSets }, (_, i) => ({
        setNumber: i + 1,
        reps: manualReps,
        weight: manualWeight,
      })),
      notes: '',
    };

    setExercises([...exercises, newExercise]);
    setActiveExerciseIndex(exercises.length);

    // Reset form
    setManualExerciseName('');
    setManualSets(3);
    setManualReps(10);
    setManualWeight(0);
  };

  const stats = calculateStats();

  const workoutTypeConfig: Record<string, { emoji: string; color: string }> = {
    strength: { emoji: '💪', color: 'purple' },
    cardio: { emoji: '🏃', color: 'blue' },
    flexibility: { emoji: '🧘', color: 'green' },
    sports: { emoji: '⚽', color: 'orange' },
    hiit: { emoji: '⚡', color: 'red' },
    other: { emoji: '🏋️', color: 'gray' },
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          onClick={() => navigate('/dashboard?tab=workout')}
          variant="ghost"
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Log Workout</h1>
            <p className="text-muted-foreground">
              {isQuickLog ? 'Quick log your completed workout' : 'Log the workout you just finished'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {exercises.length > 0 && (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Workout Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Date and Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Workout Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Workout Date</label>
                <DatePicker selectedDate={workoutDate} onDateChange={setWorkoutDate} />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Workout Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(workoutTypeConfig).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => setWorkoutType(type)}
                      className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        workoutType === type
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                          : 'bg-muted hover:bg-muted/80 hover:scale-102'
                      }`}
                    >
                      <span className="mr-1.5">{config.emoji}</span>
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Workout Notes</label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="How did you feel? Any PRs? Notes about the workout..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          {exercises.length > 0 && (
            <Card className="border-primary-500/30">
              <CardHeader>
                <CardTitle className="text-base">Workout Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {exercises.length}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Exercises</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {stats.totalSets}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Sets</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalReps}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total Reps</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 rounded-xl">
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {Math.round(stats.totalVolume)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">kg Volume</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Log Button */}
          {exercises.length > 0 && (
            <Button
              onClick={handleLogWorkout}
              variant="primary"
              size="lg"
              fullWidth
              loading={creating}
              className="sticky bottom-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
            >
              Log {exercises.length} Exercise{exercises.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>

        {/* Right Column - Exercise Builder */}
        <div className="lg:col-span-2 space-y-6">
          {replacingExerciseIndex !== null && (
            <Card className="border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
              <CardContent className="py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    🔄 Replacing: <span className="font-bold">{exercises[replacingExerciseIndex]?.name}</span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplacingExerciseIndex(null);
                      setInputMethod('search');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Input Methods Tabs */}
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as any)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="search">🔍 Search</TabsTrigger>
              <TabsTrigger value="manual">✍️ Manual</TabsTrigger>
              <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
              <TabsTrigger value="aiPlan">🤖 AI Plan</TabsTrigger>
            </TabsList>

            {/* Exercise Search */}
            <TabsContent value="search">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {replacingExerciseIndex !== null ? 'Choose Replacement Exercise' : 'Search Exercises'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {replacingExerciseIndex !== null
                      ? 'Select an exercise to replace the current one'
                      : 'Search and add exercises to your workout'}
                  </p>
                </CardHeader>
                <CardContent>
                  <ExerciseSearch
                    onSelect={handleExerciseSelect}
                    selectedExercises={exercises.map((e) => e.id)}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manual Entry */}
            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle>Manual Exercise Entry</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Manually enter exercise details without searching the database
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Exercise Name</label>
                    <input
                      type="text"
                      value={manualExerciseName}
                      onChange={(e) => setManualExerciseName(e.target.value)}
                      placeholder="e.g., Bench Press, Squats, Pull-ups"
                      className="w-full px-3 py-2.5 border border-border rounded-lg bg-background"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && manualExerciseName.trim()) {
                          handleManualExerciseAdd();
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Sets</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={manualSets}
                        onChange={(e) => setManualSets(Number(e.target.value) || 1)}
                        className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-center"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Reps</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={manualReps}
                        onChange={(e) => setManualReps(Number(e.target.value) || 1)}
                        className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-center"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={manualWeight}
                        onChange={(e) => setManualWeight(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2.5 border border-border rounded-lg bg-background text-center"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleManualExerciseAdd}
                    fullWidth
                    disabled={!manualExerciseName.trim()}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Exercise
                  </Button>

                  <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                    <p className="font-medium mb-2">💡 Quick Tip:</p>
                    <p>
                      Manually enter exercises when you can't find them in the database or want to quickly log your workout without searching.
                      You can adjust sets, reps, and weight after adding.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Voice Input */}
            <TabsContent value="voice">
              <WorkoutVoiceInput
                onExercisesRecognized={handleVoiceExercises}
                onClose={() => setInputMethod('search')}
              />
            </TabsContent>

            {/* AI Workout Plan */}
            <TabsContent value="aiPlan">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {replacingExerciseIndex !== null ? 'Choose from AI Plan' : 'AI Workout Plan Exercises'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {replacingExerciseIndex !== null
                      ? 'Select an exercise from your AI plan to replace the current one'
                      : 'Add individual exercises from your personalized workout plan'}
                  </p>
                </CardHeader>
                <CardContent>
                  {!activeWorkoutPlan?.plan_data ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                        <span className="text-3xl">🤖</span>
                      </div>
                      <h3 className="text-xl font-bold mb-2">No AI Workout Plan Found</h3>
                      <p className="text-muted-foreground mb-6">
                        Generate a personalized workout plan first to use this feature
                      </p>
                      <Button onClick={() => navigate('/plans')}>Generate Workout Plan</Button>
                    </div>
                  ) : (
                    <AIWorkoutExercisesList
                      workoutPlan={activeWorkoutPlan}
                      onExerciseSelect={handleExerciseSelect}
                      replacingExercise={replacingExerciseIndex !== null}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Added Exercises */}
          {exercises.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Your Exercises ({exercises.length})</h3>
              </div>

              <div className="space-y-4">
                {exercises.map((exercise, exerciseIndex) => (
                  <Card
                    key={exerciseIndex}
                    className={`overflow-hidden transition-all ${
                      activeExerciseIndex === exerciseIndex ? 'border-primary-500 shadow-lg' : ''
                    }`}
                  >
                    {/* Exercise Header */}
                    <div className="bg-gradient-to-r from-muted/50 to-transparent p-4 border-b border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              #{exerciseIndex + 1}
                            </Badge>
                            <h4 className="text-lg font-semibold">{exercise.name}</h4>
                          </div>
                          <div className="flex gap-2 text-xs flex-wrap">
                            <Badge variant="outline" className="capitalize">
                              💪 {exercise.muscle_group}
                            </Badge>
                            <Badge variant="outline">
                              🔧 {exercise.equipments.join(' / ') || 'Bodyweight'}
                            </Badge>
                            <Badge
                              variant={
                                exercise.difficulty === 'beginner'
                                  ? 'success'
                                  : exercise.difficulty === 'intermediate'
                                  ? 'warning'
                                  : 'error'
                              }
                              className="capitalize"
                            >
                              {exercise.difficulty}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHistory(exercise)}
                            title="View Exercise History"
                          >
                            📊
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReplaceExercise(exerciseIndex)}
                            title="Replace with another exercise"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-950/30"
                          >
                            <Replace className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setActiveExerciseIndex(
                                activeExerciseIndex === exerciseIndex ? null : exerciseIndex
                              )
                            }
                          >
                            {activeExerciseIndex === exerciseIndex ? '▼' : '▶'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExercise(exerciseIndex)}
                            className="text-error hover:bg-error/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Exercise Details */}
                    {activeExerciseIndex === exerciseIndex && (
                      <CardContent className="pt-4 space-y-4">
                        {/* Sets Table */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold">Sets & Reps</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddSet(exerciseIndex)}
                              className="gap-1"
                            >
                              <Plus className="h-3 w-3" />
                              Add Set
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                              <div className="col-span-2">Set</div>
                              <div className="col-span-4">Reps</div>
                              <div className="col-span-5">Weight (kg)</div>
                              <div className="col-span-1"></div>
                            </div>

                            {/* Sets */}
                            {exercise.sets.map((set, setIndex) => (
                              <div
                                key={setIndex}
                                className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="col-span-2 font-semibold text-sm">
                                  {set.setNumber}
                                </div>
                                <div className="col-span-4">
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) =>
                                      handleSetChange(
                                        exerciseIndex,
                                        setIndex,
                                        'reps',
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-center bg-background"
                                  />
                                </div>
                                <div className="col-span-5">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={set.weight}
                                    onChange={(e) =>
                                      handleSetChange(
                                        exerciseIndex,
                                        setIndex,
                                        'weight',
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-center bg-background"
                                  />
                                </div>
                                <div className="col-span-1">
                                  {exercise.sets.length > 1 && (
                                    <button
                                      onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                      className="text-error hover:bg-error/10 rounded p-1 transition-colors"
                                      title="Remove set"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Exercise Notes */}
                        <div>
                          <label className="text-sm font-semibold mb-2 block">Notes</label>
                          <textarea
                            value={exercise.notes || ''}
                            onChange={(e) =>
                              handleExerciseNotesChange(exerciseIndex, e.target.value)
                            }
                            placeholder="Form notes, how it felt, any adjustments made..."
                            rows={2}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm resize-none"
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {exercises.length === 0 && inputMethod === 'search' && replacingExerciseIndex === null && (
            <Card className="border-dashed border-2">
              <CardContent className="py-16 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <span className="text-3xl">💪</span>
                </div>
                <h3 className="text-xl font-bold mb-2">No Exercises Added Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Search for exercises above or use voice/AI to build your workout
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Exercise History Modal */}
      {historyExercise && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ExerciseHistory
              exerciseName={historyExercise}
              currentWeight={historyCurrentWeight}
              currentReps={historyCurrentReps}
              onClose={() => setHistoryExercise(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
