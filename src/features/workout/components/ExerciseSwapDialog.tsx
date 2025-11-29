/**
 * ExerciseSwapDialog Component
 * Find and suggest alternative exercises based on muscle group and equipment
 * Allows users to swap exercises in their workout
 */

import { useState, useEffect } from 'react';
import { ModalDialog } from '@/shared/components/ui/modal-dialog';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Repeat,
  Search,
  Zap,
  Target,
  Dumbbell,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ExerciseDbService, type Exercise } from '../api/exerciseDbService';

interface ExerciseSwapDialogProps {
  open: boolean;
  onClose: () => void;
  currentExercise: Exercise;
  onSwap: (newExercise: Exercise) => void;
}

export function ExerciseSwapDialog({
  open,
  onClose,
  currentExercise,
  onSwap,
}: ExerciseSwapDialogProps) {
  const [alternatives, setAlternatives] = useState<Exercise[]>([]);
  const [filteredAlternatives, setFilteredAlternatives] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');

  useEffect(() => {
    if (open) {
      loadAlternatives();
    }
  }, [open, currentExercise]);

  useEffect(() => {
    filterAlternatives();
  }, [alternatives, searchQuery, equipmentFilter]);

  const loadAlternatives = async () => {
    setLoading(true);
    try {
      // Fetch exercises from same muscle group
      const service = new ExerciseDbService();
      const sameMuscleGroup = await service.searchByMuscleGroup(
        currentExercise.muscle_group
      );

      // Filter out current exercise and prioritize similar difficulty
      const difficultyOrder: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
      const filtered = sameMuscleGroup
        .filter((ex: Exercise) => ex.id !== currentExercise.id)
        .sort((a: Exercise, b: Exercise) => {
          // Prioritize same equipment
          if (a.equipment === currentExercise.equipment && b.equipment !== currentExercise.equipment) {
            return -1;
          }
          if (b.equipment === currentExercise.equipment && a.equipment !== currentExercise.equipment) {
            return 1;
          }
          // Then by difficulty
          const currentDiff = difficultyOrder[currentExercise.difficulty] || 2;
          const aDiff = difficultyOrder[a.difficulty] || 2;
          const bDiff = difficultyOrder[b.difficulty] || 2;
          return Math.abs(aDiff - currentDiff) - Math.abs(bDiff - currentDiff);
        });

      setAlternatives(filtered);
    } catch (error) {
      console.error('Error loading alternatives:', error);
      toast.error('Failed to load alternative exercises');
    } finally {
      setLoading(false);
    }
  };

  const filterAlternatives = () => {
    let filtered = alternatives;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.muscle_group.toLowerCase().includes(query) ||
        ex.equipment.toLowerCase().includes(query)
      );
    }

    // Filter by equipment
    if (equipmentFilter !== 'all') {
      filtered = filtered.filter((ex) => ex.equipment === equipmentFilter);
    }

    setFilteredAlternatives(filtered);
  };

  const handleSwap = (exercise: Exercise) => {
    onSwap(exercise);
    onClose();
  };

  const getEquipmentOptions = () => {
    const equipmentSet = new Set(alternatives.map((ex) => ex.equipment));
    return Array.from(equipmentSet);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-success bg-success-light dark:bg-success/20';
      case 'intermediate':
        return 'text-warning bg-warning-light dark:bg-warning/20';
      case 'advanced':
        return 'text-error bg-error-light dark:bg-error/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <ModalDialog open={open} onOpenChange={onClose} title="Find Alternative Exercise" size="lg">
      <div className="space-y-4">
        {/* Current Exercise */}
        <Card variant="outline" padding="md" className="bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                Current: {currentExercise.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {currentExercise.muscle_group} • {currentExercise.equipment} •{' '}
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(currentExercise.difficulty)}`}>
                  {currentExercise.difficulty}
                </span>
              </p>
            </div>
          </div>
        </Card>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search alternatives..."
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label>Equipment</Label>
            <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Equipment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Equipment</SelectItem>
                {getEquipmentOptions().map((equipment) => (
                  <SelectItem key={equipment} value={equipment} className="capitalize">
                    {equipment}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Repeat className="w-4 h-4" />
          <span>
            Showing {filteredAlternatives.length} alternative{filteredAlternatives.length !== 1 ? 's' : ''} for {currentExercise.muscle_group}
          </span>
        </div>

        {/* Alternatives List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : filteredAlternatives.length > 0 ? (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {filteredAlternatives.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  variant="outline"
                  padding="md"
                  className="hover:border-primary-300 dark:hover:border-primary-700 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    {/* Exercise Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {exercise.name}
                        </h4>
                        {exercise.equipment === currentExercise.equipment && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                            <Dumbbell className="w-3 h-3" />
                            Same Equipment
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="capitalize">{exercise.equipment}</span>
                        <span>•</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                          {exercise.difficulty}
                        </span>
                        {exercise.calories_per_minute && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {exercise.calories_per_minute} cal/min
                            </span>
                          </>
                        )}
                      </div>
                      {exercise.instructions && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                          {exercise.instructions}
                        </p>
                      )}
                    </div>

                    {/* Swap Button */}
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSwap(exercise)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Swap
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || equipmentFilter !== 'all'
                ? 'No matching alternatives found'
                : 'No alternatives available'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {searchQuery || equipmentFilter !== 'all'
                ? 'Try adjusting your filters'
                : `Try searching for exercises targeting ${currentExercise.muscle_group}`}
            </p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </ModalDialog>
  );
}
