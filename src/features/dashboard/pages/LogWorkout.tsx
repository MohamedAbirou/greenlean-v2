/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Log Workout Page - COMPLETE IMPLEMENTATION
 * Features: ExerciseDB, Templates, History, Plate Calculator, Progressive Overload
 */

import { useAuth } from '@/features/auth';
import type { Exercise } from '@/features/workout/api/exerciseDbService';
import { WorkoutTemplateService, type WorkoutTemplate } from '@/features/workout/api/WorkoutTemplateService';
import { ExerciseLibrary } from '@/features/workout/components/ExerciseLibrary';
import { ProgressiveOverloadTracker } from '@/features/workout/components/ProgressiveOverloadTracker';
import { WorkoutTemplates } from '@/features/workout/components/WorkoutTemplates';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  ArrowLeft,
  Book,
  Calculator,
  Calendar,
  Check,
  Dumbbell,
  Edit2,
  History,
  Mic,
  Plus,
  Replace,
  Save,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  X,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { DatePicker } from '../components/DatePicker';
import { ExerciseHistory } from '../components/ExerciseHistory';
import { PlateCalculator } from '../components/PlateCalculator';
import { WorkoutVoiceInput } from '../components/WorkoutVoiceInput';
import { useActiveWorkoutPlan } from '../hooks/useDashboardData';
import { useCreateWorkoutSession } from '../hooks/useDashboardMutations';

type LogMethod = 'search' | 'manual' | 'voice' | 'aiPlan' | 'template';

const getToday = () => new Date().toISOString().split('T')[0];

// AI Workout Plan Selector
function AIWorkoutPlanSelector({
  workoutPlan,
  onWorkoutSelect,
  onExerciseSelect,
}: {
  workoutPlan: any;
  onWorkoutSelect: (exercises: Exercise[]) => void;
  onExerciseSelect: (exercise: Exercise) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'workouts' | 'exercises'>('workouts');

  const planData = workoutPlan?.plan_data
    ? (typeof workoutPlan.plan_data === 'string' ? JSON.parse(workoutPlan.plan_data) : workoutPlan.plan_data)
    : null;

  const weeklyPlan = planData?.weekly_plan || [];

  const allExercises: any[] = [];
  weeklyPlan.forEach((workout: any) => {
    if (Array.isArray(workout.exercises)) {
      workout.exercises.forEach((ex: any) => {
        allExercises.push({
          ...ex,
          workoutDay: workout.day,
          workoutFocus: workout.focus,
          workoutType: workout.workout_type,
        });
      });
    }
  });

  const filteredWorkouts = searchQuery.trim()
    ? weeklyPlan.filter((workout: any) =>
      workout.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.workout_type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : weeklyPlan;

  const filteredExercises = searchQuery.trim()
    ? allExercises.filter(ex =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.workoutFocus?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allExercises;

  const handleAddExercise = (aiExercise: any) => {
    const exercise: Exercise = {
      id: `ai-${Date.now()}-${Math.random()}`,
      name: aiExercise.name,
      category: aiExercise.category || 'compound',
      muscle_group: aiExercise.muscle_groups?.join(', ') || 'Mixed',
      equipment: aiExercise.equipment_needed || [],
      difficulty: aiExercise.difficulty || 'intermediate',
      sets: Array.from({ length: aiExercise.sets || 3 }, (_, i) => ({
        exercise_id: `ai-${Date.now()}-${Math.random()}`,
        exercise_name: aiExercise.name,
        set_number: i + 1,
        reps: parseInt(aiExercise.reps?.split('-')[0] || '10'),
        weight_kg: 0,
        notes: aiExercise.why_this_exercise || '',
      })),
      instructions: aiExercise.instructions,
      notes: aiExercise.why_this_exercise || '',
    };
    onExerciseSelect(exercise);
  };

  const handleSelectWholeWorkout = (workout: any) => {
    const exercises: Exercise[] = (workout.exercises || []).map((ex: any) => ({
      id: `ai-${Date.now()}-${Math.random()}`,
      name: ex.name,
      category: ex.category || 'compound',
      muscle_group: ex.muscle_groups?.join(', ') || 'Mixed',
      equipment: ex.equipment_needed || [],
      difficulty: ex.difficulty || 'intermediate',
      sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
        setNumber: i + 1,
        reps: parseInt(ex.reps?.split('-')[0] || '10'),
        weight: 0,
      })),
      notes: ex.why_this_exercise || '',
    }));
    onWorkoutSelect(exercises);
  };

  const dayEmoji: Record<string, string> = {
    Monday: '💪',
    Tuesday: '🔥',
    Wednesday: '⚡',
    Thursday: '🏋️',
    Friday: '💥',
    Saturday: '🎯',
    Sunday: '🧘',
  };

  if (weeklyPlan.length === 0) {
    return (
      <div className="text-center py-12">
        <Sparkles className="h-10 w-10 mx-auto mb-4 text-purple-500" />
        <p className="font-semibold">No AI Workout Plan Found</p>
        <p className="text-sm text-muted-foreground mt-2">Create an AI workout plan first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI plan workouts or exercises..."
            className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setViewMode('workouts')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'workouts'
              ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md'
              : 'hover:bg-background'
              }`}
          >
            Full Workouts
          </button>
          <button
            onClick={() => setViewMode('exercises')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${viewMode === 'exercises'
              ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md'
              : 'hover:bg-background'
              }`}
          >
            Exercises
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {viewMode === 'workouts' ? (
          filteredWorkouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No workouts match search</p>
          ) : (
            filteredWorkouts.map((workout: any, idx: number) => (
              <Card key={idx} className="p-0 hover:shadow-xl transition-all border-2 hover:border-purple-500/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{dayEmoji[workout.day] || '🏃'}</span>
                        <div>
                          <h3 className="font-bold text-lg">{workout.day}</h3>
                          <p className="text-sm text-muted-foreground">{workout.workout_type}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 mb-3 text-sm">
                        <span className="text-purple-600 font-bold">{workout.focus}</span>
                        <span className="text-orange-600 font-bold">{workout.duration_minutes} min</span>
                      </div>
                      <Badge variant="outline">{workout.exercises?.length || 0} exercises</Badge>
                    </div>
                    <Button
                      onClick={() => handleSelectWholeWorkout(workout)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Workout
                    </Button>
                  </div>
                  {workout.exercises && workout.exercises.length > 0 && (
                    <details>
                      <summary className="cursor-pointer text-sm font-semibold text-primary-600 hover:underline">
                        View {workout.exercises.length} exercises
                      </summary>
                      <div className="mt-3 space-y-2 pl-4 border-l-2 border-purple-500/30">
                        {workout.exercises.map((ex: any, exIdx: number) => (
                          <div key={exIdx} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50">
                            <div>
                              <p className="font-medium">{ex.name}</p>
                              <p className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps} reps</p>
                            </div>
                            <button
                              onClick={() => handleAddExercise(ex)}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 text-xs font-semibold"
                            >
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))
          )
        ) : (
          filteredExercises.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No exercises match search</p>
          ) : (
            filteredExercises.map((ex: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handleAddExercise(ex)}
                className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold mb-1">{ex.name}</p>
                    <div className="flex gap-2 flex-wrap text-xs mb-2">
                      <Badge variant="outline">{dayEmoji[ex.workoutDay]} {ex.workoutDay}</Badge>
                      <span className="text-muted-foreground">{ex.muscle_groups?.join(', ')}</span>
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="font-semibold">{ex.sets} sets × {ex.reps} reps</span>
                      <span className="text-muted-foreground">{ex.category}</span>
                    </div>
                  </div>
                  <Plus className="h-5 w-5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))
          )
        )}
      </div>
    </div>
  );
}

// MAIN COMPONENT
export function LogWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [logMethod, setLogMethod] = useState<LogMethod>('search');
  const [workoutDate, setWorkoutDate] = useState(getToday());
  const [workoutType, setWorkoutType] = useState<string | 'strength' | 'cardio' | 'flexibility' | 'sports' | 'hybrid' | 'other'>(searchParams.get('type') || 'strength');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);

  // Modals
  const [showExerciseHistory, setShowExerciseHistory] = useState<{ index: number; exercise: Exercise } | null>(null);
  const [showPlateCalculator, setShowPlateCalculator] = useState<{ weight: number } | null>(null);
  const [showProgressiveOverload, setShowProgressiveOverload] = useState<{ index: number; exercise: Exercise } | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const { data: workoutPlanData } = useActiveWorkoutPlan();
  const [createWorkoutSession, { loading: creating }] = useCreateWorkoutSession();

  const activeWorkoutPlan = (workoutPlanData as any)?.ai_workout_plansCollection?.edges?.[0]?.node;

  // Manual entry
  const [manualExerciseName, setManualExerciseName] = useState('');
  const [manualSets, setManualSets] = useState(3);
  const [manualReps, setManualReps] = useState(10);
  const [manualWeight, setManualWeight] = useState(0);

  const handleExerciseSelect = (exercise: Exercise) => {
    if (replacingExerciseIndex !== null) {
      const updated = [...exercises];
      updated[replacingExerciseIndex] = {
        ...updated[replacingExerciseIndex],
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        muscle_group: exercise.muscle_group,
        equipment: exercise.equipment,
        difficulty: exercise.difficulty,
      };
      setExercises(updated);
      setReplacingExerciseIndex(null);
      return;
    }

    const newExercise: Exercise = {
      id: exercise.id,
      name: exercise.name,
      category: exercise.category,
      muscle_group: exercise.muscle_group,
      equipment: exercise.equipment,
      difficulty: exercise.difficulty,
      sets: [
        { exercise_name: exercise.name, set_number: 1, reps: 10, weight_kg: 0 },
        { exercise_name: exercise.name, set_number: 2, reps: 10, weight_kg: 0 },
        { exercise_name: exercise.name, set_number: 3, reps: 10, weight_kg: 0 },
      ],
      notes: '',
    };
    setExercises([...exercises, newExercise]);
    setActiveExerciseIndex(exercises.length);
  };

  const handleWorkoutSelect = (workoutExercises: Exercise[]) => {
    setExercises(workoutExercises);
    setLogMethod('search');
  };

  const handleTemplateSelect = (template: WorkoutTemplate) => {
    const templateExercises: Exercise[] = template.exercises.map((ex) => ({
      id: ex.id,
      name: ex.name,
      category: ex.category,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      sets: Array.from({ length: ex.sets.length }, (_, i) => ({
        exercise_name: ex.name,
        set_number: i + 1,
        reps: ex.sets[i].reps,
        weight_kg: ex.sets[i].weight_kg || 0,
      })),
      notes: ex.notes || '',
    }));
    setExercises(templateExercises);
    setLogMethod('search');
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
    if (activeExerciseIndex === index) setActiveExerciseIndex(null);
  };

  const handleReplaceExercise = (index: number) => {
    setReplacingExerciseIndex(index);
    setLogMethod('search');
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const exercise = updated[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    exercise.sets.push({
      exercise_name: exercise.name,
      set_number: exercise.sets.length + 1,
      reps: lastSet?.reps || 10,
      weight_kg: lastSet?.weight_kg || 0,
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
    field: 'reps' | 'weight_kg',
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

  const handleManualExerciseAdd = () => {
    if (!manualExerciseName.trim()) return;

    const newExercise: Exercise = {
      id: `manual-${Date.now()}`,
      name: manualExerciseName.trim(),
      category: workoutType,
      muscle_group: 'Mixed',
      equipment: "",
      difficulty: "beginner",
      sets: Array.from({ length: manualSets }, (_, i) => ({
        exercise_name: manualExerciseName.trim(),
        set_number: i + 1,
        reps: manualReps,
        weight_kg: manualWeight,
      })),
      notes: '',
    };

    setExercises([...exercises, newExercise]);
    setActiveExerciseIndex(exercises.length);

    setManualExerciseName('');
    setManualSets(3);
    setManualReps(10);
    setManualWeight(0);
  };

  const handleVoiceExercises = (voiceExercises: any[]) => {
    const newExercises: Exercise[] = voiceExercises.map((ex) => ({
      id: ex.id || `voice-${Date.now()}-${Math.random()}`,
      name: ex.name,
      category: workoutType,
      muscle_group: 'Mixed',
      equipment: ex.equipment,
      difficulty: ex.difficulty,
      sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
        exercise_name: ex.name,
        set_number: i + 1,
        reps: ex.reps || 10,
        weight_kg: ex.weight || 0,
      })),
      notes: '',
    }));
    setExercises([...exercises, ...newExercises]);
    setLogMethod('search');
  };

  const calculateStats = () => {
    const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const totalReps = exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps!, 0),
      0
    );
    const totalVolume = exercises.reduce(
      (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.reps! * set.weight_kg!, 0),
      0
    );

    return { totalSets, totalReps, totalVolume };
  };

  const handleSaveTemplate = async () => {
    if (!user?.id || !templateName.trim() || exercises.length === 0) {
      toast.error('Please enter a template name');
      return;
    }

    try {
      await WorkoutTemplateService.createTemplate(user.id, {
        name: templateName,
        description: templateDescription,
        workout_type: workoutType,
        exercises: exercises.map(ex => ({
          id: ex.id,
          name: ex.name,
          category: ex.category, // strength, cardio, flexibility, balance
          muscle_group: ex.muscle_group, // chest, back, legs, shoulders, arms, core, cardio
          equipment: ex.equipment, // barbell, dumbbell, bodyweight, machine, cable, etc.
          description: ex.description,
          difficulty: ex.difficulty,
          sets: ex.sets,
          instructions: ex.instructions,
          secondary_muscles: ex.secondary_muscles,
          calories_per_minute: ex.calories_per_minute,
          notes: ex.notes,
        })),
        estimated_duration_minutes: Math.max(stats.totalSets * 3 + 10, 15),
      });

      toast.success('Template saved!');
      setShowSaveTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleLogWorkout = async () => {
    if (!user?.id || exercises.length === 0) return;

    const stats = calculateStats();

    const exercisesData = exercises.map((ex) => {
      const sets = ex.sets.map((set) => ({
        exercise_name: ex.name,
        exercise_category: ex.category,
        set_number: Number(set.set_number) || 1,
        reps: Number(set.reps) || 0,
        weight_kg: Number(set.weight_kg) || 0,
      }));

      return {
        name: String(ex.name || 'Unknown Exercise'),
        category: String(ex.category || workoutType),
        muscle_group: String(ex.muscle_group || 'Mixed'),
        sets: sets,
      };
    });

    const estimatedDuration = Math.max(stats.totalSets * 3 + 10, 15);
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

      toast.success('Workout logged successfully! 💪');
      navigate('/dashboard?tab=workout');
    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to log workout');
    }
  };

  const stats = calculateStats();

  const workoutTypeConfig: Record<string, { emoji: string; gradient: string }> = {
    strength: { emoji: '💪', gradient: 'from-purple-500 to-indigo-500' },
    cardio: { emoji: '🏃', gradient: 'from-blue-500 to-cyan-500' },
    flexibility: { emoji: '🧘', gradient: 'from-green-500 to-teal-500' },
    sports: { emoji: '⚽', gradient: 'from-orange-500 to-amber-500' },
    hiit: { emoji: '⚡', gradient: 'from-red-500 to-pink-500' },
    other: { emoji: '🏋️', gradient: 'from-gray-500 to-slate-500' },
  };

  const inputMethods = [
    { id: 'search', label: 'Search', icon: Search, gradient: 'from-blue-500 to-cyan-500', description: 'Exercise database' },
    { id: 'aiPlan', label: 'AI Plan', icon: Sparkles, gradient: 'from-purple-500 to-pink-500', description: 'Your AI plan' },
    { id: 'template', label: 'Templates', icon: Book, gradient: 'from-amber-500 to-orange-500', description: 'Saved workouts' },
    { id: 'manual', label: 'Manual', icon: Edit2, gradient: 'from-green-500 to-emerald-500', description: 'Enter manually' },
    { id: 'voice', label: 'Voice', icon: Mic, gradient: 'from-orange-500 to-red-500', description: 'Speak workout' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Hero */}
        <div className="relative rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 text-white shadow-2xl mb-8">
          <Button
            onClick={() => navigate('/dashboard?tab=workout')}
            variant="ghost"
            className="mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 rounded-2xl bg-white/20">
              <Dumbbell className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-2">Log Your Workout</h1>
              <p className="text-purple-100 text-xl">Track exercises the smart way</p>
            </div>
          </div>
          <DatePicker selectedDate={workoutDate} onDateChange={setWorkoutDate} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT - Input */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workout Type */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  Workout Type
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(workoutTypeConfig).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => setWorkoutType(type)}
                      className={`p-4 rounded-2xl border-2 transition-all ${workoutType === type
                        ? 'border-transparent shadow-xl scale-105 bg-gradient-to-br ' + config.gradient
                        : 'border-border hover:border-purple-500/50'
                        }`}
                    >
                      <div className="text-4xl mb-2">{config.emoji}</div>
                      <p className={`font-bold capitalize text-xs ${workoutType === type ? 'text-white' : ''}`}>
                        {type}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Input Methods */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary-600" />
                  Choose Input Method
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                  {inputMethods.map((method) => {
                    const Icon = method.icon;
                    const isActive = logMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setLogMethod(method.id as LogMethod)}
                        className={`p-4 rounded-xl border-2 transition-all ${isActive
                          ? 'border-transparent shadow-lg scale-105'
                          : 'border-border hover:border-primary-500/50'
                          }`}
                      >
                        <Icon className={`h-6 w-6 mx-auto mb-2 ${isActive ? 'text-primary-600' : 'text-muted-foreground'}`} />
                        <p className={`font-semibold text-sm ${isActive ? 'text-primary-600' : ''}`}>
                          {method.label}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="min-h-[400px]">
                  {logMethod === 'search' && (
                    <ExerciseLibrary
                      onSelectExercise={handleExerciseSelect}
                      selectedExercises={exercises}
                    />
                  )}

                  {logMethod === 'aiPlan' && (
                    <AIWorkoutPlanSelector
                      workoutPlan={activeWorkoutPlan}
                      onWorkoutSelect={handleWorkoutSelect}
                      onExerciseSelect={handleExerciseSelect}
                    />
                  )}

                  {logMethod === 'template' && (
                    <WorkoutTemplates onTemplateSelect={handleTemplateSelect} />
                  )}

                  {logMethod === 'manual' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border-2 border-purple-500/20">
                        <p className="font-semibold flex items-center gap-2">
                          <Edit2 className="h-4 w-4 text-purple-600" />
                          Manual Entry
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="block text-sm font-semibold mb-2">Exercise Name *</label>
                          <input
                            type="text"
                            value={manualExerciseName}
                            onChange={(e) => setManualExerciseName(e.target.value)}
                            placeholder="e.g., Barbell Bench Press"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Sets</label>
                          <input
                            type="number"
                            value={manualSets}
                            onChange={(e) => setManualSets(Number(e.target.value))}
                            min="1"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Reps</label>
                          <input
                            type="number"
                            value={manualReps}
                            onChange={(e) => setManualReps(Number(e.target.value))}
                            min="1"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-sm font-semibold mb-2">Weight (kg)</label>
                          <input
                            type="number"
                            value={manualWeight}
                            onChange={(e) => setManualWeight(Number(e.target.value))}
                            step="2.5"
                            min="0"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleManualExerciseAdd}
                        disabled={!manualExerciseName}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Exercise
                      </Button>
                    </div>
                  )}

                  {logMethod === 'voice' && (
                    <WorkoutVoiceInput
                      onExercisesRecognized={handleVoiceExercises}
                      onClose={() => setLogMethod('search')}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT - Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-purple-600" />
                  Workout Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Exercises', value: exercises.length, color: 'purple' },
                    { label: 'Total Sets', value: stats.totalSets, color: 'blue' },
                    { label: 'Total Reps', value: stats.totalReps, color: 'green' },
                    { label: 'Volume (kg)', value: Math.round(stats.totalVolume), color: 'orange' },
                  ].map((stat, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-50 dark:from-${stat.color}-900/20 border-2 border-${stat.color}-200/50`}>
                      <p className={`text-xs font-semibold text-${stat.color}-600 mb-1`}>{stat.label}</p>
                      <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Workout Notes</label>
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="How did you feel? Any PRs?"
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-border rounded-xl bg-background text-sm resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleLogWorkout}
                    disabled={exercises.length === 0 || creating}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-6 text-base font-semibold"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Logging...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Log Workout
                      </>
                    )}
                  </Button>

                  {exercises.length > 0 && (
                    <Button
                      onClick={() => setShowSaveTemplate(true)}
                      variant="outline"
                      className="w-full border-2"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Exercises List */}
            {exercises.length > 0 && (
              <Card className="border-0 px-2 shadow-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 overflow-y-scroll max-h-[30rem]">
                <CardHeader className="border-b mb-2">
                  <CardTitle className="flex items-center gap-3">
                    <Dumbbell className="h-5 w-5 text-purple-600" />
                    Workout Exercises
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 p-1 '>
                  {exercises.map((exercise, exIdx) => (
                    <Card key={exIdx} className="p-0 hover:shadow-xl transition-all border-2 hover:border-purple-500/50">
                      <CardContent className='p-3'>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 overflow-hidden">
                            <div className='flex items-start justify-between'>
                              <div>
                                <h3 className="font-bold text-lg mb-1">{exercise.name}</h3>
                                <div className="flex gap-2 flex-wrap mb-3">
                                  <Badge variant="outline">{exercise.muscle_group}</Badge>
                                  <Badge variant="outline">{exercise.category}</Badge>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReplaceExercise(exIdx)}
                                  className="text-purple-600"
                                  title="Switch"
                                >
                                  <Replace className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveExercise(exIdx)}
                                  className="text-red-600"
                                  title="Annihilate"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Sets */}
                            <div className="flex-1 gap-2 mb-3 space-y-2">
                              {exercise.sets.map((set, setIdx) => (
                                <div key={setIdx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                  <span className="text-sm font-semibold w-12">Set {set.set_number}</span>
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', Number(e.target.value))}
                                    className="w-16 px-2 py-1 border-2 border-border rounded-lg bg-background text-sm"
                                    min="1"
                                  />
                                  <span className="text-xs text-muted-foreground">reps</span>
                                  <input
                                    type="number"
                                    value={set.weight_kg}
                                    onChange={(e) => handleSetChange(exIdx, setIdx, 'weight_kg', Number(e.target.value))}
                                    className="w-16 px-2 py-1 border-2 border-border rounded-lg bg-background text-sm"
                                    step="2.5"
                                    min="0"
                                  />
                                  <span className="text-xs text-muted-foreground">kg</span>
                                  {exercise.sets.length > 1 && (
                                    <button
                                      onClick={() => handleRemoveSet(exIdx, setIdx)}
                                      className="ml-auto p-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-3">
                              <Button onClick={() => handleAddSet(exIdx)} variant="outline" size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Set
                              </Button>
                              <Button
                                onClick={() => setShowExerciseHistory({ index: exIdx, exercise })}
                                variant="outline"
                                size="sm"
                              >
                                <History className="h-4 w-4 mr-1" />
                                History
                              </Button>
                              <Button
                                onClick={() => setShowProgressiveOverload({ index: exIdx, exercise })}
                                variant="outline"
                                size="sm"
                              >
                                <TrendingUp className="h-4 w-4 mr-1" />
                                PRs
                              </Button>
                              {exercise.sets[0].weight_kg! > 0 && (
                                <Button
                                  onClick={() => setShowPlateCalculator({ weight: exercise.sets[0].weight_kg! })}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Calculator className="h-4 w-4 mr-1" />
                                  Plates
                                </Button>
                              )}
                            </div>

                            <textarea
                              value={exercise.notes}
                              onChange={(e) => handleExerciseNotesChange(exIdx, e.target.value)}
                              placeholder="Notes..."
                              rows={2}
                              className="w-full px-3 py-2 border-2 border-border rounded-lg bg-background text-sm resize-none"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showExerciseHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowExerciseHistory(null)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <ExerciseHistory
              exerciseName={showExerciseHistory.exercise.name}
              currentWeight={showExerciseHistory.exercise.sets[0]?.weight_kg}
              currentReps={showExerciseHistory.exercise.sets[0]?.reps}
              onClose={() => setShowExerciseHistory(null)}
            />
          </div>
        </div>
      )}

      {showPlateCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowPlateCalculator(null)}>
          <div className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <PlateCalculator
              targetWeight={showPlateCalculator.weight}
              onClose={() => setShowPlateCalculator(null)}
            />
          </div>
        </div>
      )}

      {showProgressiveOverload && user && (
        <ProgressiveOverloadTracker
          open={!!showProgressiveOverload}
          onClose={() => setShowProgressiveOverload(null)}
          exerciseId={showProgressiveOverload.exercise.id}
          exerciseName={showProgressiveOverload.exercise.name}
          userId={user.id}
          currentSets={showProgressiveOverload.exercise.sets.length}
          currentReps={showProgressiveOverload.exercise.sets[0]?.reps || 10}
        />
      )}

      {showSaveTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowSaveTemplate(false)}>
          <Card className="max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Save as Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Template Name *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Upper Body Day"
                  className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-border rounded-xl bg-background resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowSaveTemplate(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} disabled={!templateName.trim()} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}