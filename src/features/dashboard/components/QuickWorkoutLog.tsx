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
import { Textarea } from '@/shared/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';

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

const workoutTypes = [
  { value: 'strength', label: 'Strength Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'sports', label: 'Sports' },
  { value: 'other', label: 'Other' },
];

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
      alert('Please add at least one exercise');
      return;
    }

    setLoading(true);
    try {
      const result = await workoutTrackingService.logWorkoutSession(
        {
          user_id: userId,
          workout_date: new Date().toISOString(),
          workout_type: workoutType,
          duration_minutes: duration,
          total_calories_burned: caloriesBurned,
          notes: notes || null,
        },
        validExercises
      );

      if (result.success) {
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
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        alert('Failed to log workout');
      }
    } catch (error) {
      console.error('Failed to log workout:', error);
      alert('Failed to log workout');
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

                  {/* Workout Details */}
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

                  {/* Exercises */}
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

                  {/* Actions */}
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
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
