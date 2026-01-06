/**
 * Log Workout Page - REVOLUTIONARY 2026 UX/UI
 * The most intuitive, feature-rich workout logging experience ever created
 * Features: AI Plan, Search, Manual, Voice, Real-time Stats, Set Management, Templates
 */

import { useAuth } from '@/features/auth';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  ArrowLeft,
  Book,
  Calendar,
  Check,
  Dumbbell,
  Edit2,
  Mic,
  Plus, Replace,
  Save,
  Search,
  Sparkles,
  Target,
  Trash2, X,
  Zap
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DatePicker } from '../components/DatePicker';
import { ExerciseSearch } from '../components/ExerciseSearch';
// import { WorkoutTemplates } from '../components/WorkoutTemplates';
import { toast } from 'sonner';
import { VoiceInput } from '../components/VoiceInput';
import { useActiveWorkoutPlan } from '../hooks/useDashboardData';
import { useCreateWorkoutSession } from '../hooks/useDashboardMutations';

type LogMethod = 'search' | 'manual' | 'voice' | 'aiPlan' | 'template';

interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight: number;
}

interface WorkoutExercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipments?: string[];
  difficulty?: string;
  sets: ExerciseSet[];
  notes?: string;
}

const getToday = () => new Date().toISOString().split('T')[0];

// REVOLUTIONARY AI WORKOUT PLAN COMPONENT
function AIWorkoutPlanSelector({ workoutPlan, onWorkoutSelect, onExerciseSelect, replacingExercise }: {
  workoutPlan: any;
  onWorkoutSelect: (exercises: WorkoutExercise[]) => void;
  onExerciseSelect: (exercise: WorkoutExercise) => void;
  replacingExercise: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'workouts' | 'exercises'>('workouts');

  // Parse plan_data from GraphQL response
  const planData = workoutPlan?.plan_data
    ? (typeof workoutPlan.plan_data === 'string' ? JSON.parse(workoutPlan.plan_data) : workoutPlan.plan_data)
    : null;

  const weeklyPlan = planData?.weekly_plan || [];

  // Extract all exercises from all workouts
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

  // Filter
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
    const exercise: WorkoutExercise = {
      id: `ai-${Date.now()}-${Math.random()}`,
      name: aiExercise.name,
      category: aiExercise.category || 'compound',
      muscle_group: aiExercise.muscle_groups?.join(', ') || 'Mixed',
      equipments: aiExercise.equipment_needed || [],
      difficulty: aiExercise.difficulty || 'intermediate',
      sets: Array.from({ length: aiExercise.sets || 3 }, (_, i) => ({
        setNumber: i + 1,
        reps: parseInt(aiExercise.reps?.split('-')[0] || '10'),
        weight: 0,
      })),
      notes: aiExercise.why_this_exercise || '',
    };
    onExerciseSelect(exercise);
  };

  const handleSelectWholeWorkout = (workout: any) => {
    const exercises: WorkoutExercise[] = (workout.exercises || []).map((ex: any) => ({
      id: `ai-${Date.now()}-${Math.random()}`,
      name: ex.name,
      category: ex.category || 'compound',
      muscle_group: ex.muscle_groups?.join(', ') || 'Mixed',
      equipments: ex.equipment_needed || [],
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
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-xl">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <p className="font-semibold text-lg mb-2">No AI Workout Plan Found</p>
        <p className="text-muted-foreground text-sm">Create an AI workout plan first to use this feature</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workouts or exercises from AI plan..."
            className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          />
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setViewMode('workouts')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${viewMode === 'workouts'
              ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md'
              : 'hover:bg-background'
              }`}
          >
            Full Workouts
          </button>
          <button
            onClick={() => setViewMode('exercises')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${viewMode === 'exercises'
              ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md'
              : 'hover:bg-background'
              }`}
          >
            Individual Exercises
          </button>
        </div>
      </div>

      {/* Workouts View */}
      {viewMode === 'workouts' && (
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredWorkouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No workouts match your search</p>
          ) : (
            filteredWorkouts.map((workout: any, idx: number) => (
              <Card key={idx} className="p-0 group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500/50">
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

                      {/* Workout Info */}
                      <div className="flex gap-4 mb-3">
                        <div className="text-sm">
                          <span className="text-purple-600 dark:text-purple-400 font-bold">{workout.focus}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-orange-600 dark:text-orange-400 font-bold">{workout.duration_minutes} min</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-red-600 dark:text-red-400 font-bold">{workout.estimated_calories_burned || 0} cal</span>
                        </div>
                      </div>

                      {/* Badge */}
                      <Badge variant="outline" className="mb-3">
                        {workout.intensity} Intensity • {workout.exercises?.length || 0} exercises
                      </Badge>

                      <p className="text-sm text-muted-foreground">
                        RPE Target: {workout.rpe_target}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleSelectWholeWorkout(workout)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Workout
                    </Button>
                  </div>

                  {/* Expandable Exercises List */}
                  {workout.exercises && workout.exercises.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                        View {workout.exercises.length} exercises
                      </summary>
                      <div className="mt-3 space-y-2 pl-4 border-l-2 border-purple-500/30">
                        {workout.exercises.map((ex: any, exIdx: number) => (
                          <div key={exIdx} className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-muted/50">
                            <div className="flex-1">
                              <p className="font-medium">{ex.name}</p>
                              <p className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps} reps</p>
                            </div>
                            <button
                              onClick={() => handleAddExercise(ex)}
                              className="px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors text-xs font-semibold"
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
          )}
        </div>
      )}

      {/* Individual Exercises View */}
      {viewMode === 'exercises' && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {filteredExercises.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No exercises match your search</p>
          ) : (
            filteredExercises.map((ex: any, idx: number) => (
              <button
                key={idx}
                onClick={() => handleAddExercise(ex)}
                className="w-full text-left p-4 rounded-xl border-2 border-border hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-base mb-1">{ex.name}</p>
                    <div className="flex gap-2 flex-wrap text-xs mb-2">
                      <Badge variant="outline" className="text-xs">
                        {dayEmoji[ex.workoutDay]} {ex.workoutDay}
                      </Badge>
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
          )}
        </div>
      )}

      {!replacingExercise && (viewMode === 'workouts' ? filteredWorkouts : filteredExercises).length > 0 && (
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border-2 border-purple-500/20">
          <p className="font-semibold mb-1 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-600" />
            AI-Powered Workout Planning
          </p>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'workouts'
              ? 'Select entire workouts or individual exercises from your personalized AI workout plan'
              : 'Browse all exercises across your weekly plan and add them individually'
            }
          </p>
        </div>
      )}
    </div>
  );
}

// MAIN LOG WORKOUT COMPONENT
export function LogWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [logMethod, setLogMethod] = useState<LogMethod>('search');
  const [workoutDate, setWorkoutDate] = useState(getToday());
  const [workoutType, setWorkoutType] = useState<string>(searchParams.get('type') || 'strength');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number | null>(null);
  const [replacingExerciseIndex, setReplacingExerciseIndex] = useState<number | null>(null);

  const { data: workoutPlanData } = useActiveWorkoutPlan();
  // const { data: todayWorkouts } = useWorkoutSessionsByDate(workoutDate);
  const [createWorkoutSession, { loading: creating }] = useCreateWorkoutSession();

  const activeWorkoutPlan = (workoutPlanData as any)?.ai_workout_plansCollection?.edges?.[0]?.node;

  // const isQuickLog = searchParams.get('quick') === 'true';

  // Manual entry state
  const [manualExerciseName, setManualExerciseName] = useState('');
  const [manualSets, setManualSets] = useState(3);
  const [manualReps, setManualReps] = useState(10);
  const [manualWeight, setManualWeight] = useState(0);

  const handleExerciseSelect = (exercise: any) => {
    // If replacing an existing exercise
    if (replacingExerciseIndex !== null) {
      const updated = [...exercises];
      updated[replacingExerciseIndex] = {
        ...exercise,
        sets: updated[replacingExerciseIndex].sets,
        notes: updated[replacingExerciseIndex].notes,
      };
      setExercises(updated);
      setReplacingExerciseIndex(null);
      setLogMethod('search');
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

  const handleWorkoutSelect = (workoutExercises: WorkoutExercise[]) => {
    // Replace all exercises with AI workout
    setExercises(workoutExercises);
    setLogMethod('search');
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
    if (activeExerciseIndex === index) {
      setActiveExerciseIndex(null);
    }
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

  const handleVoiceExercises = (voiceExercises: any[]) => {
    const newExercises: WorkoutExercise[] = voiceExercises.map((ex) => ({
      id: ex.id || `voice-${Date.now()}-${Math.random()}`,
      name: ex.name,
      category: workoutType,
      muscle_group: 'Mixed',
      equipments: ex.equipment_needed || [],
      difficulty: 'intermediate' as const,
      sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
        setNumber: i + 1,
        reps: ex.reps || 10,
        weight: ex.weight || 0,
      })),
      notes: '',
    }));
    setExercises([...exercises, ...newExercises]);
    setLogMethod('search');
  };

  // const handleTemplateSelect = (templateExercises: WorkoutExercise[]) => {
  //   setExercises([...exercises, ...templateExercises]);
  //   setLogMethod('search');
  // };

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
      toast.error('Failed to log workout. Please try again.');
    }
  };

  const stats = calculateStats();

  const workoutTypeConfig: Record<string, { emoji: string; gradient: string; bg: string }> = {
    strength: { emoji: '💪', gradient: 'from-purple-500 to-indigo-500', bg: 'from-purple-500/20 to-indigo-500/20' },
    cardio: { emoji: '🏃', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-500/20 to-cyan-500/20' },
    flexibility: { emoji: '🧘', gradient: 'from-green-500 to-teal-500', bg: 'from-green-500/20 to-teal-500/20' },
    sports: { emoji: '⚽', gradient: 'from-orange-500 to-amber-500', bg: 'from-orange-500/20 to-amber-500/20' },
    hiit: { emoji: '⚡', gradient: 'from-red-500 to-pink-500', bg: 'from-red-500/20 to-pink-500/20' },
    other: { emoji: '🏋️', gradient: 'from-gray-500 to-slate-500', bg: 'from-gray-500/20 to-slate-500/20' },
  };

  const inputMethods = [
    { id: 'search', label: 'Search', icon: Search, gradient: 'from-blue-500 to-cyan-500', description: 'Find exercises from database' },
    { id: 'aiPlan', label: 'AI Plan', icon: Sparkles, gradient: 'from-purple-500 to-pink-500', description: 'Use your personalized plan' },
    { id: 'manual', label: 'Manual', icon: Edit2, gradient: 'from-green-500 to-emerald-500', description: 'Enter exercise manually' },
    { id: 'voice', label: 'Voice', icon: Mic, gradient: 'from-orange-500 to-red-500', description: 'Speak your workout' },
    { id: 'template', label: 'Templates', icon: Book, gradient: 'from-amber-500 to-orange-500', description: 'Use saved workouts' },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* PREMIUM HERO SECTION */}
        <div className="relative rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 text-white shadow-2xl mb-8">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative z-10">
            <Button
              onClick={() => navigate('/dashboard?tab=workout')}
              variant="ghost"
              className="mb-6 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                <Dumbbell className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-5xl font-bold mb-2">Log Your Workout</h1>
                <p className="text-purple-100 text-xl">
                  Track exercises the smart way - AI-powered, voice-enabled, effortless
                </p>
              </div>
            </div>
            <DatePicker selectedDate={workoutDate} onDateChange={setWorkoutDate} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN - Input Methods */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workout Type Selector */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="p-0 border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <span>Select Workout Type</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 px-0">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {Object.entries(workoutTypeConfig).map(([type, config]) => (
                    <button
                      key={type}
                      onClick={() => setWorkoutType(type)}
                      className={`group relative overflow-hidden p-4 rounded-2xl border-2 transition-all duration-300 ${workoutType === type
                        ? `border-transparent shadow-xl scale-105`
                        : 'border-border hover:border-purple-500/50 hover:scale-102'
                        }`}
                      style={workoutType === type ? {
                        background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                        backgroundImage: `linear-gradient(135deg, rgb(147 51 234) 0%, rgb(99 102 241) 100%)`,
                      } : {}}
                    >
                      {workoutType === type && (
                        <div className="absolute inset-0 bg-gradient-to-br opacity-20 animate-pulse" style={{
                          backgroundImage: `linear-gradient(135deg, rgb(255 255 255) 0%, transparent 100%)`,
                        }} />
                      )}
                      <div className="relative text-center">
                        <div className="text-4xl mb-2">{config.emoji}</div>
                        <p className={`font-bold capitalize text-xs ${workoutType === type ? 'text-white' : ''}`}>
                          {type}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Input Methods Grid */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="p-0 border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <span>Choose Input Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 px-0">
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-6">
                  {inputMethods.map((method) => {
                    const Icon = method.icon;
                    const isActive = logMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        onClick={() => setLogMethod(method.id as LogMethod)}
                        className={`group relative overflow-hidden p-4 rounded-xl border-2 transition-all duration-300 ${isActive
                          ? 'border-transparent shadow-lg scale-105'
                          : 'border-border hover:border-primary-500/50 hover:scale-102'
                          }`}
                      >
                        <div className="relative text-center">
                          <Icon className={`h-6 w-6 mx-auto mb-2 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'tet-muted-foreground'}`} />
                          <p className={`font-semibold text-sm ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`}>
                            {method.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Input Method Content */}
                <div className="min-h-[400px]">
                  {logMethod === 'search' && (
                    <ExerciseSearch
                      onExerciseSelect={handleExerciseSelect}
                      replacingExercise={replacingExerciseIndex !== null}
                    />
                  )}

                  {logMethod === 'aiPlan' && (
                    <AIWorkoutPlanSelector
                      workoutPlan={activeWorkoutPlan}
                      onWorkoutSelect={handleWorkoutSelect}
                      onExerciseSelect={handleExerciseSelect}
                      replacingExercise={replacingExerciseIndex !== null}
                    />
                  )}

                  {logMethod === 'manual' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border-2 border-purple-500/20 mb-4">
                        <p className="font-semibold mb-1 flex items-center gap-2">
                          <Edit2 className="h-4 w-4 text-purple-600" />
                          Manual Entry
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Enter exercise information manually
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
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Sets *</label>
                          <input
                            type="number"
                            value={manualSets}
                            onChange={(e) => setManualSets(Number(e.target.value))}
                            min="1"
                            max="10"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Reps *</label>
                          <input
                            type="number"
                            value={manualReps}
                            onChange={(e) => setManualReps(Number(e.target.value))}
                            min="1"
                            max="100"
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
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
                            className="w-full px-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleManualExerciseAdd}
                        disabled={!manualExerciseName}
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-6 text-base font-semibold"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Exercise to Workout
                      </Button>
                    </div>
                  )}

                  {logMethod === 'voice' && (
                    <VoiceInput onFoodsRecognized={handleVoiceExercises} />
                  )}

                  {/* {logMethod === 'template' && (
                    <WorkoutTemplates onTemplateSelect={handleTemplateSelect} />
                  )} */}
                </div>
              </CardContent>
            </Card>

            {/* Exercises List */}
            {exercises.length > 0 && (
              <div className="space-y-4">
                {exercises.map((exercise, exIdx) => (
                  <Card key={exIdx} className="p-0 group hover:shadow-xl transition-all duration-300 border-2 hover:border-purple-500/50">
                    <CardContent className='p-6'>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{exercise.name}</h3>
                          <div className="flex gap-2 flex-wrap mb-3">
                            <Badge variant="outline">{exercise.muscle_group}</Badge>
                            <Badge variant="outline">{exercise.category}</Badge>
                          </div>

                          {/* Sets Grid */}
                          <div className="grid grid-cols-1 gap-2 mb-3">
                            {exercise.sets.map((set, setIdx) => (
                              <div key={setIdx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <span className="text-sm font-semibold w-12">Set {set.setNumber}</span>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={set.reps}
                                    onChange={(e) => handleSetChange(exIdx, setIdx, 'reps', Number(e.target.value))}
                                    className="w-16 px-2 py-1 border-2 border-border rounded-lg bg-background text-sm"
                                    min="1"
                                  />
                                  <span className="text-xs text-muted-foreground">reps</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    value={set.weight}
                                    onChange={(e) => handleSetChange(exIdx, setIdx, 'weight', Number(e.target.value))}
                                    className="w-16 px-2 py-1 border-2 border-border rounded-lg bg-background text-sm"
                                    step="2.5"
                                    min="0"
                                  />
                                  <span className="text-xs text-muted-foreground">kg</span>
                                </div>
                                {exercise.sets.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveSet(exIdx, setIdx)}
                                    className="ml-auto p-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>

                          <Button
                            onClick={() => handleAddSet(exIdx)}
                            variant="outline"
                            size="sm"
                            className="mb-3"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Set
                          </Button>

                          {/* Notes */}
                          <textarea
                            value={exercise.notes}
                            onChange={(e) => handleExerciseNotesChange(exIdx, e.target.value)}
                            placeholder="Notes (e.g., felt strong, used good form...)"
                            rows={2}
                            className="w-full px-3 py-2 border-2 border-border rounded-lg bg-background text-sm resize-none"
                          />
                        </div>

                        <div className="flex flex-col gap-2 ml-3">
                          <button
                            onClick={() => handleReplaceExercise(exIdx)}
                            className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-colors"
                            title="Replace"
                          >
                            <Replace className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveExercise(exIdx)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Workout Summary */}
          <div className="space-y-6">
            {/* Real-time Stats Calculator */}
            <Card className={`border-0 shadow-2xl bg-gradient-to-br ${workoutTypeConfig[workoutType].bg}`}>
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${workoutTypeConfig[workoutType].gradient} shadow-lg`}>
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <span>Workout Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-950/10 border-2 border-purple-200/50 dark:border-purple-900/30">
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Exercises</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{exercises.length}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-950/10 border-2 border-blue-200/50 dark:border-blue-900/30">
                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Total Sets</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalSets}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900/20 dark:to-green-950/10 border-2 border-green-200/50 dark:border-green-900/30">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">Total Reps</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalReps}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-900/20 dark:to-orange-950/10 border-2 border-orange-200/50 dark:border-orange-900/30">
                    <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Volume (kg)</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{Math.round(stats.totalVolume)}</p>
                  </div>
                </div>

                {/* Workout Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Workout Notes</label>
                  <textarea
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="How did you feel? Any PRs? Notes about the workout..."
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-border rounded-xl bg-background text-sm resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleLogWorkout}
                    disabled={exercises.length === 0 || creating}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 py-6 text-base font-semibold"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                        Logging Workout...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Log {workoutTypeConfig[workoutType].emoji} {workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Workout
                      </>
                    )}
                  </Button>

                  {exercises.length > 0 && (
                    <Button
                      onClick={() => {/* TODO: Save as template */ }}
                      variant="outline"
                      className="w-full border-2 hover:bg-primary-50 dark:hover:bg-primary-950/20"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Template
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            {exercises.length === 0 && (
              <Card className="border-2 border-primary-500/20 bg-gradient-to-br from-primary-500/20 to-purple-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold mb-2">Pro Tips</p>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Use AI Plan for structured workouts</li>
                        <li>• Voice input for hands-free logging</li>
                        <li>• Track progressive overload</li>
                        <li>• Save frequent routines as templates</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}