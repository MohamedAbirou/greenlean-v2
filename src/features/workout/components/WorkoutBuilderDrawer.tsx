/**
 * WorkoutBuilderDrawer Component
 * Full-screen drawer experience for building workouts
 * Better UX than modal - proper space for exercise library
 */

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import {
  Save,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ExerciseLibrary } from './ExerciseLibrary';
import type { Exercise } from '../api/exerciseDbService';

interface WorkoutExercise extends Exercise {
  sets: number;
  reps: number;
  rest_seconds: number;
  notes?: string;
}

interface WorkoutBuilderDrawerProps {
  show: boolean;
  onClose: () => void;
  onSave: (workout: {
    name: string;
    exercises: WorkoutExercise[];
    notes: string;
    estimated_duration: number;
    estimated_calories: number;
  }) => void;
}

export function WorkoutBuilderDrawer({ show, onClose, onSave }: WorkoutBuilderDrawerProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  // Block body scroll when drawer is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  // Calculate total duration and calories
  const calculateStats = () => {
    let totalDuration = 0;
    let totalCalories = 0;

    exercises.forEach((exercise) => {
      const timePerSet = exercise.reps * 2 + exercise.rest_seconds;
      const exerciseDuration = (timePerSet * exercise.sets) / 60;
      totalDuration += exerciseDuration;

      const exerciseCalories = (exercise.calories_per_minute || 5) * exerciseDuration;
      totalCalories += exerciseCalories;
    });

    return {
      duration: Math.round(totalDuration),
      calories: Math.round(totalCalories),
    };
  };

  const stats = calculateStats();

  const handleAddExercise = (exercise: Exercise) => {
    const workoutExercise: WorkoutExercise = {
      ...exercise,
      sets: 3,
      reps: 10,
      rest_seconds: 60,
    };
    setExercises((prev) => [...prev, workoutExercise]);
    setShowLibrary(false);
    toast.success(`Added ${exercise.name}`);
  };

  const handleUpdateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    setExercises((prev) => prev.map((ex, i) => (i === index ? { ...ex, ...updates } : ex)));
  };

  const handleRemoveExercise = (index: number) => {
    const exercise = exercises[index];
    setExercises((prev) => prev.filter((_, i) => i !== index));
    toast.success(`Removed ${exercise.name}`);
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const newExercises = [...exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= exercises.length) return;

    [newExercises[index], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[index],
    ];

    setExercises(newExercises);
  };

  const handleSave = () => {
    if (!workoutName.trim()) {
      toast.error('Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    onSave({
      name: workoutName,
      exercises,
      notes: workoutNotes,
      estimated_duration: stats.duration,
      estimated_calories: stats.calories,
    });

    // Reset form
    setWorkoutName('');
    setWorkoutNotes('');
    setExercises([]);
    onClose();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={showLibrary ? undefined : onClose}
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-background shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-card">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {showLibrary ? 'Exercise Library' : 'Create Workout'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {showLibrary
                  ? 'Browse and select exercises'
                  : exercises.length === 0
                  ? 'Start by adding exercises'
                  : `${exercises.length} exercises • ${stats.duration}min • ~${stats.calories}cal`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-custom">
            {showLibrary ? (
              /* Exercise Library View */
              <ExerciseLibrary onSelectExercise={handleAddExercise} selectedExercises={exercises} />
            ) : (
              /* Workout Builder View */
              <>
                {/* Workout Name */}
                <div>
                  <Label>Workout Name*</Label>
                  <Input
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="e.g., Upper Body Strength, HIIT Cardio"
                    className="mt-2"
                  />
                </div>

                {/* Add Exercise Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowLibrary(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Exercise from Library
                </Button>

                {/* Exercise List */}
                <div className="space-y-3">
                  <AnimatePresence>
                    {exercises.map((exercise, index) => (
                      <motion.div
                        key={`${exercise.id}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout
                      >
                        <Card variant="outline" padding="md">
                          <div className="flex items-start gap-3">
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-1 pt-1">
                              <button
                                onClick={() => handleMoveExercise(index, 'up')}
                                disabled={index === 0}
                                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleMoveExercise(index, 'down')}
                                disabled={index === exercises.length - 1}
                                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Exercise Info */}
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-foreground">
                                    {index + 1}. {exercise.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground capitalize">
                                    {exercise.muscle_group} • {exercise.equipment}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemoveExercise(index)}
                                  className="text-destructive hover:text-destructive/80 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Sets, Reps, Rest */}
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <Label className="text-xs">Sets</Label>
                                  <Input
                                    type="number"
                                    value={exercise.sets}
                                    onChange={(e) =>
                                      handleUpdateExercise(index, {
                                        sets: Math.max(1, Number(e.target.value)),
                                      })
                                    }
                                    min="1"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Reps</Label>
                                  <Input
                                    type="number"
                                    value={exercise.reps}
                                    onChange={(e) =>
                                      handleUpdateExercise(index, {
                                        reps: Math.max(1, Number(e.target.value)),
                                      })
                                    }
                                    min="1"
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Rest (s)</Label>
                                  <Input
                                    type="number"
                                    value={exercise.rest_seconds}
                                    onChange={(e) =>
                                      handleUpdateExercise(index, {
                                        rest_seconds: Math.max(0, Number(e.target.value)),
                                      })
                                    }
                                    min="0"
                                    className="mt-1"
                                  />
                                </div>
                              </div>

                              {/* Exercise Notes */}
                              <Input
                                value={exercise.notes || ''}
                                onChange={(e) =>
                                  handleUpdateExercise(index, { notes: e.target.value })
                                }
                                placeholder="Notes (optional)"
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {exercises.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
                      <div className="text-4xl mb-3">💪</div>
                      <p className="text-foreground font-medium">No exercises added yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Click "Add Exercise from Library" to get started
                      </p>
                    </div>
                  )}
                </div>

                {/* Workout Notes */}
                <div>
                  <Label>Workout Notes (Optional)</Label>
                  <Input
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="Any additional notes..."
                    className="mt-2"
                  />
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!showLibrary && (
            <div className="p-6 border-t border-border bg-card flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex-1"
                disabled={!workoutName.trim() || exercises.length === 0}
              >
                <Save className="w-4 h-4" />
                Save Workout
              </Button>
            </div>
          )}

          {showLibrary && (
            <div className="p-6 border-t border-border bg-card">
              <Button variant="outline" onClick={() => setShowLibrary(false)} className="w-full">
                <X className="w-4 h-4" />
                Back to Workout
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
