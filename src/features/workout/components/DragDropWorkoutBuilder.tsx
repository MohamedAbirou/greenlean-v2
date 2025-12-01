/**
 * Drag-and-Drop Workout Builder
 * Interactive workout creator with exercise reordering using @dnd-kit
 * Full-screen drawer experience for better UX
 */

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GripVertical,
  Trash2,
  Plus,
  Save,
  Clock,
  Flame,
  Dumbbell,
  Edit3,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  rest_seconds?: number;
  notes?: string;
}

interface Workout {
  name: string;
  exercises: Exercise[];
  notes: string;
  estimated_duration: number;
  estimated_calories: number;
}

interface DragDropWorkoutBuilderProps {
  show: boolean;
  onClose: () => void;
  onSave: (workout: Workout) => void;
  initialWorkout?: Workout;
}

function SortableExerciseCard({ exercise, onEdit, onDelete }: {
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`p-4 mb-3 ${isDragging ? 'shadow-2xl' : 'shadow-sm'} transition-shadow`}>
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </button>

          {/* Exercise Info */}
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">{exercise.name}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Dumbbell className="w-4 h-4" />
                {exercise.sets} sets × {exercise.reps} reps
              </span>
              {exercise.weight && (
                <span className="font-medium">{exercise.weight} kg</span>
              )}
              {exercise.rest_seconds && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {exercise.rest_seconds}s rest
                </span>
              )}
            </div>
            {exercise.notes && (
              <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function DragDropWorkoutBuilder({ show, onClose, onSave, initialWorkout }: DragDropWorkoutBuilderProps) {
  const [workout, setWorkout] = useState<Workout>(
    initialWorkout || {
      name: '',
      exercises: [],
      notes: '',
      estimated_duration: 0,
      estimated_calories: 0,
    }
  );
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState<Exercise>({
    id: '',
    name: '',
    sets: 3,
    reps: 10,
    weight: 0,
    rest_seconds: 60,
    notes: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWorkout((prev) => {
        const oldIndex = prev.exercises.findIndex((ex) => ex.id === active.id);
        const newIndex = prev.exercises.findIndex((ex) => ex.id === over.id);

        return {
          ...prev,
          exercises: arrayMove(prev.exercises, oldIndex, newIndex),
        };
      });
      toast.success('Exercise reordered');
    }
  };

  const handleAddExercise = () => {
    const exercise: Exercise = {
      ...newExercise,
      id: editingExercise?.id || `ex-${Date.now()}`,
    };

    if (editingExercise) {
      setWorkout((prev) => ({
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exercise.id ? exercise : ex
        ),
      }));
      toast.success('Exercise updated');
    } else {
      setWorkout((prev) => ({
        ...prev,
        exercises: [...prev.exercises, exercise],
      }));
      toast.success('Exercise added');
    }

    setNewExercise({
      id: '',
      name: '',
      sets: 3,
      reps: 10,
      weight: 0,
      rest_seconds: 60,
      notes: '',
    });
    setEditingExercise(null);
    setShowAddExercise(false);
  };

  const handleDeleteExercise = (id: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== id),
    }));
    toast.success('Exercise removed');
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setNewExercise(exercise);
    setShowAddExercise(true);
  };

  const calculateEstimates = () => {
    const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets, 0);
    const avgTimePerSet = 45; // seconds
    const restTime = workout.exercises.reduce((sum, ex) => sum + (ex.rest_seconds || 0) * ex.sets, 0);
    const duration = Math.ceil((totalSets * avgTimePerSet + restTime) / 60);
    const calories = Math.ceil(duration * 8); // Rough estimate: 8 cal/min

    return { duration, calories };
  };

  const handleSave = () => {
    if (!workout.name.trim()) {
      toast.error('Please enter a workout name');
      return;
    }
    if (workout.exercises.length === 0) {
      toast.error('Please add at least one exercise');
      return;
    }

    const { duration, calories } = calculateEstimates();
    onSave({
      ...workout,
      estimated_duration: duration,
      estimated_calories: calories,
    });

    // Reset form
    setWorkout({
      name: '',
      exercises: [],
      notes: '',
      estimated_duration: 0,
      estimated_calories: 0,
    });
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
        onClick={onClose}
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
              <h2 className="text-2xl font-bold text-foreground">Create Workout</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {workout.exercises.length === 0
                  ? 'Start by adding exercises'
                  : `${workout.exercises.length} exercises • ${calculateEstimates().duration}min • ~${calculateEstimates().calories}cal`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-custom">
            {/* Workout Name & Notes */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="workout-name">Workout Name*</Label>
                <Input
                  id="workout-name"
                  value={workout.name}
                  onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
                  placeholder="e.g., Upper Body Strength"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="workout-notes">Notes (optional)</Label>
                <Input
                  id="workout-notes"
                  value={workout.notes}
                  onChange={(e) => setWorkout({ ...workout, notes: e.target.value })}
                  placeholder="Any notes about this workout..."
                  className="mt-2"
                />
              </div>
            </div>

      {/* Exercise List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Exercises ({workout.exercises.length})</h3>
          <Button onClick={() => setShowAddExercise(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        {workout.exercises.length === 0 ? (
          <Card className="p-8 text-center">
            <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No exercises yet. Add your first exercise!</p>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={workout.exercises.map((ex) => ex.id)}
              strategy={verticalListSortingStrategy}
            >
              {workout.exercises.map((exercise) => (
                <SortableExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onEdit={() => handleEditExercise(exercise)}
                  onDelete={() => handleDeleteExercise(exercise.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

            {/* Estimates */}
            {workout.exercises.length > 0 && (
              <Card className="p-4 bg-muted">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">
                      Est. Duration: <strong>{calculateEstimates().duration} min</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm">
                      Est. Calories: <strong>{calculateEstimates().calories} kcal</strong>
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border bg-card flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="flex-1"
              disabled={!workout.name.trim() || workout.exercises.length === 0}
            >
              <Save className="w-4 h-4" />
              Save Workout
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Add/Edit Exercise Dialog */}
      <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingExercise ? 'Edit Exercise' : 'Add Exercise'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="exercise-name">Exercise Name*</Label>
              <Input
                id="exercise-name"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g., Bench Press"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sets">Sets*</Label>
                <Input
                  id="sets"
                  type="number"
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: Number(e.target.value) })}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="reps">Reps*</Label>
                <Input
                  id="reps"
                  type="number"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: Number(e.target.value) })}
                  min={1}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={newExercise.weight || ''}
                  onChange={(e) => setNewExercise({ ...newExercise, weight: Number(e.target.value) || undefined })}
                  min={0}
                  step={2.5}
                />
              </div>
              <div>
                <Label htmlFor="rest">Rest (seconds)</Label>
                <Input
                  id="rest"
                  type="number"
                  value={newExercise.rest_seconds || ''}
                  onChange={(e) => setNewExercise({ ...newExercise, rest_seconds: Number(e.target.value) || undefined })}
                  min={0}
                  step={15}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="exercise-notes">Notes</Label>
              <Input
                id="exercise-notes"
                value={newExercise.notes || ''}
                onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                placeholder="Form cues, tips, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddExercise(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExercise} disabled={!newExercise.name.trim()}>
              {editingExercise ? 'Update' : 'Add'} Exercise
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
}
