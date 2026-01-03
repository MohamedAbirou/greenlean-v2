/**
 * Exercise Alternatives System
 * Suggests alternative exercises based on muscle group and equipment
 * Can be used inline (collapsible) or as a dialog
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { ModalDialog } from '@/shared/components/ui/modal-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import type { Exercise } from '../api/exerciseDbService';

interface ExerciseAlternativesProps {
  currentExercise: {
    id: string;
    name: string;
    muscle_group: string;
    equipment?: string | string[];
  };
  onSwapExercise: (alternative: Exercise) => void;
  // Optional dialog mode
  open?: boolean;
  onClose?: () => void;
}

// Mock exercise database - in production, this would come from Supabase
const EXERCISE_DATABASE: Exercise[] = [
  // Chest Exercises
  {
    id: 'bench-press', name: 'Barbell Bench Press', muscle_group: 'chest', equipment: ['barbell', 'bench'], difficulty: 'intermediate', description: 'Classic chest builder',
    category: '',
    instructions: []
  },
  {
    id: 'dumbbell-press', name: 'Dumbbell Bench Press', muscle_group: 'chest', equipment: ['dumbbells', 'bench'], difficulty: 'intermediate', description: 'Better ROM than barbell',
    category: '',
    instructions: []
  },
  {
    id: 'pushups', name: 'Push-ups', muscle_group: 'chest', equipment: ['bodyweight'], difficulty: 'beginner', description: 'No equipment needed',
    category: '',
    instructions: []
  },
  {
    id: 'cable-fly', name: 'Cable Fly', muscle_group: 'chest', equipment: ['cable'], difficulty: 'intermediate', description: 'Constant tension on chest',
    category: '',
    instructions: []
  },
  {
    id: 'dips', name: 'Chest Dips', muscle_group: 'chest', equipment: ['dip station'], difficulty: 'intermediate', description: 'Lower chest focus',
    category: '',
    instructions: []
  },

  // Back Exercises
  {
    id: 'pull-ups', name: 'Pull-ups', muscle_group: 'back', equipment: ['pull-up bar'], difficulty: 'intermediate', description: 'King of back exercises',
    category: '',
    instructions: []
  },
  {
    id: 'lat-pulldown', name: 'Lat Pulldown', muscle_group: 'back', equipment: ['cable'], difficulty: 'beginner', description: 'Pull-up alternative',
    category: '',
    instructions: []
  },
  {
    id: 'barbell-row', name: 'Barbell Row', muscle_group: 'back', equipment: ['barbell'], difficulty: 'intermediate', description: 'Thick back builder',
    category: '',
    instructions: []
  },
  {
    id: 'dumbbell-row', name: 'Single-Arm Dumbbell Row', muscle_group: 'back', equipment: ['dumbbell', 'bench'], difficulty: 'beginner', description: 'Unilateral back work',
    category: '',
    instructions: []
  },
  {
    id: 'seated-row', name: 'Seated Cable Row', muscle_group: 'back', equipment: ['cable'], difficulty: 'beginner', description: 'Mid-back focus',
    category: '',
    instructions: []
  },

  // Legs Exercises
  {
    id: 'barbell-squat', name: 'Barbell Back Squat', muscle_group: 'legs', equipment: ['barbell', 'rack'], difficulty: 'intermediate', description: 'The king of leg exercises',
    category: '',
    instructions: []
  },
  {
    id: 'goblet-squat', name: 'Goblet Squat', muscle_group: 'legs', equipment: ['dumbbell'], difficulty: 'beginner', description: 'Easier to learn',
    category: '',
    instructions: []
  },
  {
    id: 'leg-press', name: 'Leg Press', muscle_group: 'legs', equipment: ['machine'], difficulty: 'beginner', description: 'Machine-based squat alternative',
    category: '',
    instructions: []
  },
  {
    id: 'lunges', name: 'Walking Lunges', muscle_group: 'legs', equipment: ['bodyweight'], difficulty: 'beginner', description: 'Unilateral leg work',
    category: '',
    instructions: []
  },
  {
    id: 'romanian-deadlift', name: 'Romanian Deadlift', muscle_group: 'legs', equipment: ['barbell'], difficulty: 'intermediate', description: 'Hamstring focus',
    category: '',
    instructions: []
  },

  // Shoulders Exercises
  {
    id: 'overhead-press', name: 'Barbell Overhead Press', muscle_group: 'shoulders', equipment: ['barbell'], difficulty: 'intermediate', description: 'Full shoulder developer',
    category: '',
    instructions: []
  },
  {
    id: 'dumbbell-press', name: 'Dumbbell Shoulder Press', muscle_group: 'shoulders', equipment: ['dumbbells'], difficulty: 'beginner', description: 'Better ROM',
    category: '',
    instructions: []
  },
  {
    id: 'lateral-raise', name: 'Lateral Raises', muscle_group: 'shoulders', equipment: ['dumbbells'], difficulty: 'beginner', description: 'Side delt isolation',
    category: '',
    instructions: []
  },
  {
    id: 'face-pulls', name: 'Face Pulls', muscle_group: 'shoulders', equipment: ['cable'], difficulty: 'beginner', description: 'Rear delt health',
    category: '',
    instructions: []
  },

  // Arms Exercises
  {
    id: 'barbell-curl', name: 'Barbell Bicep Curl', muscle_group: 'arms', equipment: ['barbell'], difficulty: 'beginner', description: 'Classic bicep builder',
    category: '',
    instructions: []
  },
  {
    id: 'dumbbell-curl', name: 'Dumbbell Curl', muscle_group: 'arms', equipment: ['dumbbells'], difficulty: 'beginner', description: 'Unilateral arm work',
    category: '',
    instructions: []
  },
  {
    id: 'tricep-dips', name: 'Tricep Dips', muscle_group: 'arms', equipment: ['dip station'], difficulty: 'intermediate', description: 'Compound tricep exercise',
    category: '',
    instructions: []
  },
  {
    id: 'skull-crushers', name: 'Skull Crushers', muscle_group: 'arms', equipment: ['barbell', 'bench'], difficulty: 'intermediate', description: 'Tricep mass builder',
    category: '',
    instructions: []
  },
];

function getAlternatives(exercise: ExerciseAlternativesProps['currentExercise']): Exercise[] {
  return EXERCISE_DATABASE
    .filter((ex) => {
      // Same muscle group but different exercise
      return (
        ex.muscle_group === exercise.muscle_group &&
        ex.name.toLowerCase() !== exercise.name.toLowerCase()
      );
    })
    .slice(0, 5); // Limit to 5 alternatives
}

export function ExerciseAlternatives({
  currentExercise,
  onSwapExercise,
  open,
  onClose,
}: ExerciseAlternativesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const alternatives = getAlternatives(currentExercise);
  const isDialogMode = open !== undefined && onClose !== undefined;

  const handleSwap = (alternative: Exercise) => {
    setSelectedId(alternative.id);
    setTimeout(() => {
      onSwapExercise(alternative);
      setSelectedId(null);
      setIsOpen(false);
      if (onClose) onClose();
    }, 300);
  };

  if (alternatives.length === 0) {
    return null;
  }

  const difficultyColors = {
    beginner: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  // Render alternatives list
  const alternativesList = (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-3 space-y-2"
    >
      {alternatives.map((alt, index) => (
        <motion.div
          key={alt.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card
            className={`p-3 transition-all ${selectedId === alt.id
                ? 'bg-primary/10 border-primary'
                : 'hover:border-primary/50'
              }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">{alt.name}</h4>
                </div>

                {alt.description && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {alt.description}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs ${difficultyColors[alt.difficulty]}`}
                  >
                    {alt.difficulty}
                  </Badge>
                  {(alt.equipment as string[]).map((eq) => (
                    <Badge
                      key={eq}
                      variant="secondary"
                      className="text-xs"
                    >
                      {eq}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                variant={selectedId === alt.id ? 'default' : 'outline'}
                onClick={() => handleSwap(alt)}
                disabled={selectedId !== null}
              >
                {selectedId === alt.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );

  // Dialog mode
  if (isDialogMode) {
    return (
      <ModalDialog
        open={open!}
        onOpenChange={onClose!}
        title={`Alternatives for ${currentExercise.name}`}
        size="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Here are {alternatives.length} alternative exercises for the same muscle group:
          </p>
          <AnimatePresence>
            {alternativesList}
          </AnimatePresence>
        </div>
      </ModalDialog>
    );
  }

  // Inline collapsible mode
  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          View Alternatives ({alternatives.length})
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {isOpen && (
        <AnimatePresence>
          {alternativesList}
        </AnimatePresence>
      )}
    </div>
  );
}
