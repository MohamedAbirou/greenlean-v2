/**
 * Log Workout Page - Production Grade
 * Comprehensive workout logging with exercise search and builder
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAuth } from '@/features/auth';
import { DateScroller } from '../components/DateScroller';
import { ExerciseSearch } from '../components/ExerciseSearch';
import { ExerciseHistory } from '../components/ExerciseHistory';
import { WorkoutVoiceInput } from '../components/WorkoutVoiceInput';
import { AIWorkoutPlanSelector } from '../components/AIWorkoutPlanSelector';
import { useCreateWorkoutSession } from '../hooks/useDashboardMutations';
import { useActiveWorkoutPlan } from '../hooks/useDashboardData';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
}

interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutExercise extends Exercise {
  sets: ExerciseSet[];
  notes?: string;
}

const getToday = () => new Date().toISOString().split('T')[0];

export function LogWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [workoutDate, setWorkoutDate] = useState(getToday());
  const [workoutType, setWorkoutType] = useState('strength');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [inputMethod, setInputMethod] = useState<'search' | 'voice' | 'aiPlan'>('search');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [historyExercise, setHistoryExercise] = useState<string | null>(null);
  const [historyCurrentWeight, setHistoryCurrentWeight] = useState(0);
  const [historyCurrentReps, setHistoryCurrentReps] = useState(0);

  // Rest timer
  const [restTimer, setRestTimer] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(90);

  // Plate calculator
  const [showPlateCalculator, setShowPlateCalculator] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState(100);

  const [createWorkoutSession, { loading: creating }] = useCreateWorkoutSession();
  const { data: workoutPlanData } = useActiveWorkoutPlan();

  const activeWorkoutPlan = (workoutPlanData as any)?.ai_workout_plansCollection?.edges?.[0]?.node;

  const isQuickLog = searchParams.get('quick') === 'true';

  const handleExerciseSelect = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      ...exercise,
      sets: [
        { setNumber: 1, reps: 10, weight: 0, completed: false },
        { setNumber: 2, reps: 10, weight: 0, completed: false },
        { setNumber: 3, reps: 10, weight: 0, completed: false },
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

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const exercise = updated[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    exercise.sets.push({
      setNumber: exercise.sets.length + 1,
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      completed: false,
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
    field: 'reps' | 'weight' | 'completed',
    value: number | boolean
  ) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value as never;
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
    const completedSets = exercises.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );

    return { totalSets, totalReps, totalVolume, completedSets };
  };

  const handleLogWorkout = async () => {
    if (!user?.id || exercises.length === 0) return;

    const stats = calculateStats();

    const workoutData = {
      user_id: user.id,
      session_date: workoutDate,
      workout_name: `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Training`,
      workout_type: workoutType,
      notes: workoutNotes || null,
      status: stats.completedSets === stats.totalSets ? 'completed' : 'in_progress',
      total_exercises: exercises.length,
      total_sets: stats.totalSets,
      total_reps: stats.totalReps,
      total_volume_kg: Math.round(stats.totalVolume),
      exercises: exercises.map((ex) => ({
        name: ex.name,
        category: ex.category,
        muscle_group: ex.muscle_group,
        equipment: ex.equipment,
        sets: ex.sets.length,
        reps: ex.sets.reduce((sum, s) => sum + s.reps, 0) / ex.sets.length,
        notes: ex.notes,
      })),
    };

    await createWorkoutSession({
      variables: {
        input: workoutData,
      },
    });

    navigate('/dashboard?tab=workout');
  };

  const handleViewHistory = (exercise: WorkoutExercise) => {
    // Calculate current max weight and reps from sets
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
      equipment: 'Mixed',
      difficulty: 'intermediate' as const,
      sets: Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.reps,
        weight: ex.weight,
        completed: false,
      })),
      notes: '',
    }));
    setExercises([...exercises, ...newExercises]);
    setInputMethod('search');
  };

  const handleAIWorkoutSelect = (aiExercises: any[]) => {
    const newExercises: WorkoutExercise[] = aiExercises.map((ex) => ({
      ...ex,
    }));
    setExercises([...exercises, ...newExercises]);
    setInputMethod('search');
  };

  const stats = calculateStats();

  const workoutTypeIcons: Record<string, string> = {
    strength: '💪',
    cardio: '🏃',
    flexibility: '🧘',
    sports: '⚽',
    hiit: '⚡',
    other: '🏋️',
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button onClick={() => navigate('/dashboard?tab=workout')} variant="ghost" className="mb-4">
          ← Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Log Workout</h1>
            <p className="text-muted-foreground mt-2">
              {isQuickLog ? 'Quick log your workout' : 'Build your workout session'}
            </p>
          </div>
          {exercises.length > 0 && (
            <Badge variant="primary" className="text-lg px-4 py-2">
              {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Workout Details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Date and Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Workout Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Date</label>
                <DateScroller selectedDate={workoutDate} onDateChange={setWorkoutDate} />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Workout Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['strength', 'cardio', 'hiit', 'flexibility', 'sports', 'other'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setWorkoutType(type)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        workoutType === type
                          ? 'bg-primary-500 text-white shadow-md'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <span className="mr-1">{workoutTypeIcons[type]}</span>
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
                  placeholder="How did you feel? Any PRs?"
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          {exercises.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Workout Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {exercises.length}
                    </p>
                    <p className="text-xs text-muted-foreground">Exercises</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.totalSets}
                    </p>
                    <p className="text-xs text-muted-foreground">Sets</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.totalReps}
                    </p>
                    <p className="text-xs text-muted-foreground">Reps</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {Math.round(stats.totalVolume)}
                    </p>
                    <p className="text-xs text-muted-foreground">kg Volume</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Completion</span>
                    <span className="font-semibold">
                      {stats.totalSets > 0
                        ? Math.round((stats.completedSets / stats.totalSets) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success transition-all"
                      style={{
                        width: `${stats.totalSets > 0 ? (stats.completedSets / stats.totalSets) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rest Timer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">⏱️ Rest Timer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-2 block">Rest Time (seconds)</label>
                <input
                  type="number"
                  value={restTimer}
                  onChange={(e) => setRestTimer(parseInt(e.target.value) || 90)}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                  disabled={timerActive}
                />
              </div>
              {timerActive ? (
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary-600 mb-2">{timerRemaining}s</p>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setTimerActive(false);
                      setTimerRemaining(restTimer);
                    }}
                  >
                    Stop Timer
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    setTimerActive(true);
                    setTimerRemaining(restTimer);
                    const interval = setInterval(() => {
                      setTimerRemaining((prev) => {
                        if (prev <= 1) {
                          clearInterval(interval);
                          setTimerActive(false);
                          return restTimer;
                        }
                        return prev - 1;
                      });
                    }, 1000);
                  }}
                >
                  Start Rest Timer
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Plate Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🏋️ Plate Calculator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!showPlateCalculator ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Calculate plates needed for barbell loading
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => setShowPlateCalculator(true)}
                  >
                    Open Calculator
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Target Weight</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPlateCalculator(false)}
                    >
                      ✕
                    </Button>
                  </div>
                  <input
                    type="number"
                    value={plateCalcWeight}
                    onChange={(e) => setPlateCalcWeight(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-center text-lg font-semibold"
                    placeholder="100"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      // Open in modal or navigate to full calculator
                      window.open(
                        `/dashboard/plate-calculator?weight=${plateCalcWeight}`,
                        '_blank',
                        'width=600,height=800'
                      );
                    }}
                  >
                    Calculate Plates
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Log Button */}
          {exercises.length > 0 && (
            <Button
              onClick={handleLogWorkout}
              variant="primary"
              size="lg"
              fullWidth
              loading={creating}
              className="sticky bottom-4"
            >
              Log Workout ({exercises.length} exercises)
            </Button>
          )}
        </div>

        {/* Right Column - Exercise Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Methods Tabs */}
          <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as any)}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="search">🔍 Search</TabsTrigger>
              <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
              <TabsTrigger value="aiPlan">🤖 AI Plan</TabsTrigger>
            </TabsList>

            {/* Exercise Search */}
            <TabsContent value="search">
              <Card>
                <CardHeader>
                  <CardTitle>Search Exercises</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Search and add exercises to your workout
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

            {/* Voice Input */}
            <TabsContent value="voice">
              <WorkoutVoiceInput
                onExercisesRecognized={handleVoiceExercises}
                onClose={() => setInputMethod('search')}
              />
            </TabsContent>

            {/* AI Workout Plan */}
            <TabsContent value="aiPlan">
              <AIWorkoutPlanSelector
                workoutPlan={activeWorkoutPlan}
                onSelectWorkout={handleAIWorkoutSelect}
                onClose={() => setInputMethod('search')}
              />
            </TabsContent>
          </Tabs>

          {/* Added Exercises */}
          {exercises.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Workout Exercises ({exercises.length})
                </h3>
              </div>

              <div className="space-y-4">
                {exercises.map((exercise, exerciseIndex) => (
                  <Card
                    key={exerciseIndex}
                    className={`overflow-hidden ${activeExerciseIndex === exerciseIndex ? 'border-primary-500' : ''}`}
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
                          <div className="flex gap-2 text-xs">
                            <Badge variant="outline" className="capitalize">
                              💪 {exercise.muscle_group}
                            </Badge>
                            <Badge variant="outline">🔧 {exercise.equipment}</Badge>
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
                            className="text-error"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Exercise Details */}
                    {activeExerciseIndex === exerciseIndex && (
                      <CardContent className="pt-4 space-y-4">
                        {/* Sets Table */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold">Sets</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddSet(exerciseIndex)}
                            >
                              + Add Set
                            </Button>
                          </div>

                          <div className="space-y-2">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                              <div className="col-span-2">Set</div>
                              <div className="col-span-3">Reps</div>
                              <div className="col-span-4">Weight (kg)</div>
                              <div className="col-span-2">Done</div>
                              <div className="col-span-1"></div>
                            </div>

                            {/* Sets */}
                            {exercise.sets.map((set, setIndex) => (
                              <div
                                key={setIndex}
                                className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg ${
                                  set.completed ? 'bg-success/10' : 'bg-muted/30'
                                }`}
                              >
                                <div className="col-span-2 font-semibold text-sm">{set.setNumber}</div>
                                <div className="col-span-3">
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
                                    className="w-full px-2 py-1 border border-border rounded text-sm text-center"
                                  />
                                </div>
                                <div className="col-span-4">
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
                                    className="w-full px-2 py-1 border border-border rounded text-sm text-center"
                                  />
                                </div>
                                <div className="col-span-2 flex justify-center">
                                  <button
                                    onClick={() =>
                                      handleSetChange(
                                        exerciseIndex,
                                        setIndex,
                                        'completed',
                                        !set.completed
                                      )
                                    }
                                    className={`w-6 h-6 rounded border-2 transition-all ${
                                      set.completed
                                        ? 'bg-success border-success text-white'
                                        : 'border-border hover:border-success'
                                    }`}
                                  >
                                    {set.completed && '✓'}
                                  </button>
                                </div>
                                <div className="col-span-1">
                                  {exercise.sets.length > 1 && (
                                    <button
                                      onClick={() => handleRemoveSet(exerciseIndex, setIndex)}
                                      className="text-error hover:bg-error/10 rounded p-1"
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
                            placeholder="Form notes, how it felt, etc."
                            rows={2}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </>
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
