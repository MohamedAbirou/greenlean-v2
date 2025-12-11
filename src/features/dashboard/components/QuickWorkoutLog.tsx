import { workoutTrackingService } from '@/features/workout/api/workoutTrackingService';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, Loader2, Plus, Save, Sparkles, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface QuickWorkoutLogProps {
  userId: string;
  onSuccess?: () => void;
}

interface ExerciseSet {
  exercise_name: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  rest_seconds: number;
  notes?: string;
}

interface AIWorkoutPlan {
  id: string;
  plan_data: {
    weekly_plan: Array<{
      day: string;
      workout_name?: string;
      exercises: Array<{
        name: string;
        sets: number;
        reps: string | number;
        weight_kg?: number;
        rest_seconds?: number;
        notes?: string;
      }>;
    }>;
  };
}

const workoutTypes = [
  { value: 'strength', label: 'Strength Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function QuickWorkoutLog({ userId, onSuccess }: QuickWorkoutLogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workoutType, setWorkoutType] = useState<string>('strength');
  const [duration, setDuration] = useState<number>(60);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(300);
  const [notes, setNotes] = useState<string>('');
  const [exercises, setExercises] = useState<ExerciseSet[]>([
    {
      exercise_name: '',
      set_number: 1,
      reps: 10,
      weight_kg: 0,
      rest_seconds: 60,
    },
  ]);

  // AI Workout Plan state
  const [activeWorkoutPlan, setActiveWorkoutPlan] = useState<AIWorkoutPlan | null>(null);
  const [loadingWorkoutPlan, setLoadingWorkoutPlan] = useState(false);
  const [logMode, setLogMode] = useState<'manual' | 'ai_plan'>('manual');
  const [selectedDay, setSelectedDay] = useState<string>(daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);

  // Load active AI workout plan when modal opens
  useEffect(() => {
    if (isOpen) {
      loadActiveWorkoutPlan();
    }
  }, [isOpen]);

  const loadActiveWorkoutPlan = async () => {
    setLoadingWorkoutPlan(true);
    try {
      const { data, error } = await supabase
        .from('ai_workout_plans')
        .select('id, plan_data')
        .eq('user_id', userId)
        .eq('is_active', true)
        .eq('status', 'active')
        .maybeSingle();

      if (!error && data) {
        setActiveWorkoutPlan(data as AIWorkoutPlan);
      }
    } catch (error) {
      console.error('Error loading workout plan:', error);
    } finally {
      setLoadingWorkoutPlan(false);
    }
  };

  // Load workout from AI plan
  const handleLoadAIPlanWorkout = (dayWorkout: AIWorkoutPlan['plan_data']['weekly_plan'][0]) => {
    // Convert AI plan exercises to exercise sets
    const planExercises: ExerciseSet[] = [];

    dayWorkout.exercises.forEach((exercise, exerciseIndex) => {
      const sets = typeof exercise.sets === 'number' ? exercise.sets : 3;
      const reps = typeof exercise.reps === 'string'
        ? parseInt(exercise.reps.split('-')[0]) || 10
        : exercise.reps;

      for (let i = 0; i < sets; i++) {
        planExercises.push({
          exercise_name: exercise.name,
          set_number: i + 1,
          reps: reps,
          weight_kg: exercise.weight_kg || 0,
          rest_seconds: exercise.rest_seconds || 60,
          notes: i === 0 ? exercise.notes : undefined,
        });
      }
    });

    setExercises(planExercises);
    setLogMode('manual'); // Switch to manual mode to allow editing
    toast.success('Workout loaded from plan! You can now adjust and log.');
  };

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      {
        exercise_name: '',
        set_number: exercises.length + 1,
        reps: 10,
        weight_kg: 0,
        rest_seconds: 60,
      },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    // Update set numbers
    const updatedExercises = newExercises.map((ex, i) => ({
      ...ex,
      set_number: i + 1,
    }));
    setExercises(updatedExercises);
  };

  const handleExerciseChange = (
    index: number,
    field: keyof ExerciseSet,
    value: string | number
  ) => {
    const newExercises = [...exercises];
    newExercises[index] = {
      ...newExercises[index],
      [field]: value,
    };
    setExercises(newExercises);
  };

  const handleSubmit = async () => {
    // Validation
    const validExercises = exercises.filter((ex) => ex.exercise_name.trim() !== '');
    if (validExercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    setLoading(true);
    try {
      // Check if this workout is from AI plan (based on whether exercises match)
      const fromAIPlan = activeWorkoutPlan && logMode === 'manual' && exercises.length > 1;
      const selectedDayWorkout = activeWorkoutPlan?.plan_data.weekly_plan.find(
        (day) => day.day === selectedDay
      );

      const result = await workoutTrackingService.logWorkoutSession(
        {
          user_id: userId,
          workout_date: new Date().toISOString(),
          workout_name: selectedDayWorkout?.workout_name || `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Workout`,
          workout_type: workoutType,
          duration_minutes: duration,
          calories_burned: caloriesBurned,
          from_ai_plan: fromAIPlan || false,
          workout_plan_id: fromAIPlan ? activeWorkoutPlan?.id : undefined,
          plan_day_name: fromAIPlan ? selectedDay : undefined,
          notes: notes || undefined,
        },
        validExercises
      );

      if (result.success) {
        toast.success('Workout logged successfully!');
        // Reset form
        setWorkoutType('strength');
        setDuration(60);
        setCaloriesBurned(300);
        setNotes('');
        setExercises([
          {
            exercise_name: '',
            set_number: 1,
            reps: 10,
            weight_kg: 0,
            rest_seconds: 60,
          },
        ]);
        setLogMode('manual');
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error('Failed to log workout');
      }
    } catch (error) {
      console.error('Failed to log workout:', error);
      toast.error('Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-44 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsOpen(true)}
        >
          <Dumbbell className="h-6 w-6" />
        </Button>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-4 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center">
                      <Dumbbell className="h-6 w-6 mr-2" />
                      Log Workout
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mode Tabs */}
                  {activeWorkoutPlan && (
                    <Tabs value={logMode} onValueChange={(v: any) => setLogMode(v)} className="mb-6">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">
                          <Dumbbell className="w-4 h-4 mr-2" />
                          Manual Entry
                        </TabsTrigger>
                        <TabsTrigger value="ai_plan">
                          <Sparkles className="w-4 h-4 mr-2" />
                          My Workout Plan
                        </TabsTrigger>
                      </TabsList>

                      {/* AI Plan Tab Content */}
                      <TabsContent value="ai_plan" className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="select-day">Select Day</Label>
                          <Select value={selectedDay} onValueChange={setSelectedDay}>
                            <SelectTrigger id="select-day" className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {daysOfWeek.map((day) => (
                                <SelectItem key={day} value={day}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {loadingWorkoutPlan ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {activeWorkoutPlan.plan_data.weekly_plan
                              .filter((day) => day.day === selectedDay)
                              .map((dayWorkout, index) => (
                                <Card
                                  key={index}
                                  className="p-4 cursor-pointer hover:bg-accent transition-colors"
                                  onClick={() => handleLoadAIPlanWorkout(dayWorkout)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        {dayWorkout.workout_name || `${selectedDay} Workout`}
                                      </div>
                                      <div className="text-sm text-muted-foreground mt-2">
                                        {dayWorkout.exercises.length} exercise{dayWorkout.exercises.length !== 1 ? 's' : ''}
                                      </div>
                                      <div className="mt-3 space-y-2">
                                        {dayWorkout.exercises.map((exercise, exerciseIndex) => (
                                          <div key={exerciseIndex} className="text-sm bg-background rounded p-2">
                                            <div className="font-medium">{exercise.name}</div>
                                            <div className="text-muted-foreground text-xs mt-1">
                                              {exercise.sets} sets x {exercise.reps} reps
                                              {exercise.weight_kg ? ` @ ${exercise.weight_kg}kg` : ''}
                                              {exercise.rest_seconds ? ` | Rest: ${exercise.rest_seconds}s` : ''}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <div className="mt-3">
                                        <Button
                                          variant="primary"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleLoadAIPlanWorkout(dayWorkout);
                                          }}
                                        >
                                          Load This Workout
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            {activeWorkoutPlan.plan_data.weekly_plan.filter(
                              (day) => day.day === selectedDay
                            ).length === 0 && (
                              <div className="text-center py-8 text-muted-foreground">
                                No workout planned for {selectedDay}
                              </div>
                            )}
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  )}

                  {/* Workout Details (only show in manual mode) */}
                  {(!activeWorkoutPlan || logMode === 'manual') && (
                  <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="workout-type">Workout Type</Label>
                        <Select value={workoutType} onValueChange={setWorkoutType}>
                          <SelectTrigger id="workout-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {workoutTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          min={1}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="calories">Estimated Calories Burned</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={caloriesBurned}
                        onChange={(e) => setCaloriesBurned(Number(e.target.value))}
                        min={0}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="How did the workout feel? Any achievements?"
                        rows={2}
                      />
                    </div>
                  </div>
                  )}

                  {/* Exercises (always show in manual mode) */}
                  {(!activeWorkoutPlan || logMode === 'manual') && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-lg">Exercises</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddExercise}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Exercise
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {exercises.map((exercise, index) => (
                        <Card key={index} className="p-4 bg-muted/30">
                          <div className="flex items-start justify-between mb-3">
                            <div className="text-sm font-mono text-muted-foreground">
                              Set #{exercise.set_number}
                            </div>
                            {exercises.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveExercise(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label>Exercise Name</Label>
                              <Input
                                value={exercise.exercise_name}
                                onChange={(e) =>
                                  handleExerciseChange(index, 'exercise_name', e.target.value)
                                }
                                placeholder="e.g., Bench Press, Squats"
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <Label>Reps</Label>
                                <Input
                                  type="number"
                                  value={exercise.reps}
                                  onChange={(e) =>
                                    handleExerciseChange(index, 'reps', Number(e.target.value))
                                  }
                                  min={1}
                                />
                              </div>
                              <div>
                                <Label>Weight (kg)</Label>
                                <Input
                                  type="number"
                                  value={exercise.weight_kg}
                                  onChange={(e) =>
                                    handleExerciseChange(
                                      index,
                                      'weight_kg',
                                      Number(e.target.value)
                                    )
                                  }
                                  min={0}
                                  step={0.5}
                                />
                              </div>
                              <div>
                                <Label>Rest (s)</Label>
                                <Input
                                  type="number"
                                  value={exercise.rest_seconds}
                                  onChange={(e) =>
                                    handleExerciseChange(
                                      index,
                                      'rest_seconds',
                                      Number(e.target.value)
                                    )
                                  }
                                  min={0}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                  )}

                  {/* Actions (always show) */}
                  {(!activeWorkoutPlan || logMode === 'manual') && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Workout'}
                    </Button>
                  </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
