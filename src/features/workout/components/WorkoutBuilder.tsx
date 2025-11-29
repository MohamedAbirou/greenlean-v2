/**
 * WorkoutBuilder Component
 * Create custom workouts by selecting exercises from the library
 * Configure sets, reps, rest times, and save workouts
 */

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import { ModalDialog } from '@/shared/components/ui/modal-dialog';
import {
  Save,
  Trash2,
  Clock,
  Flame,
  Library,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { ExerciseLibrary } from './ExerciseLibrary';
import type { Exercise } from '../api/exerciseDbService';
import { cn } from '@/lib/utils';

interface WorkoutExercise extends Exercise {
  sets: number;
  reps: number;
  rest_seconds: number;
  notes?: string;
}

interface WorkoutBuilderProps {
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

export function WorkoutBuilder({ show, onClose, onSave }: WorkoutBuilderProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);

  // Calculate total duration and calories
  const calculateStats = () => {
    let totalDuration = 0;
    let totalCalories = 0;

    exercises.forEach((exercise) => {
      // Estimate time per set (reps * 2 seconds + rest)
      const timePerSet = exercise.reps * 2 + exercise.rest_seconds;
      const exerciseDuration = (timePerSet * exercise.sets) / 60; // convert to minutes
      totalDuration += exerciseDuration;

      // Calculate calories (calories_per_minute * duration)
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
    toast.success(`Added ${exercise.name} to workout`);
  };

  const handleUpdateExercise = (index: number, updates: Partial<WorkoutExercise>) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === index ? { ...ex, ...updates } : ex))
    );
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
    toast.success('Workout saved successfully!');
    onClose();
  };

  return (
    <>
      <ModalDialog open={show && !showLibrary} onOpenChange={onClose} title="Create Workout" size="lg">
        <div className="space-y-6">
          {/* Workout Name */}
          <div>
            <Label>Workout Name*</Label>
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Upper Body Strength, HIIT Cardio"
            />
          </div>

          {/* Stats Summary */}
          {exercises.length > 0 && (
            <Card variant="outline" padding="md">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Exercises</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {exercises.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    <Clock className="w-4 h-4" />
                    Duration
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.duration}m
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4" />
                    Calories
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    ~{stats.calories}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Add Exercise Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowLibrary(true)}
          >
            <Library className="w-4 h-4" />
            Add Exercise from Library
          </Button>

          {/* Exercise List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
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
                      {/* Drag Handle */}
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          onClick={() => handleMoveExercise(index, 'up')}
                          disabled={index === 0}
                          className={cn(
                            'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors',
                            index === 0 && 'opacity-30 cursor-not-allowed'
                          )}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveExercise(index, 'down')}
                          disabled={index === exercises.length - 1}
                          className={cn(
                            'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors',
                            index === exercises.length - 1 && 'opacity-30 cursor-not-allowed'
                          )}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Exercise Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                              {index + 1}. {exercise.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {exercise.muscle_group} • {exercise.equipment}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveExercise(index)}
                            className="text-error hover:text-error/80 transition-colors"
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
                        <div>
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
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {exercises.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <Library className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  No exercises added yet
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
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
              placeholder="Any additional notes about this workout..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
        </div>
      </ModalDialog>

      {/* Exercise Library Modal */}
      {showLibrary && (
        <ModalDialog
          open={showLibrary}
          onOpenChange={() => setShowLibrary(false)}
          title="Exercise Library"
          size="xl"
        >
          <ExerciseLibrary
            onSelectExercise={handleAddExercise}
            selectedExercises={exercises}
          />
        </ModalDialog>
      )}
    </>
  );
}
