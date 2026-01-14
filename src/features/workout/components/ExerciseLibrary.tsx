
/**
 * ExerciseLibrary Component
 * Browse, search, and filter 1,300+ exercises
 * Beautiful UI with GIF demonstrations
 */

import { cn } from '@/lib/utils';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { Dumbbell, Filter, Info, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ExerciseDbService, STATIC_EXERCISES, type Exercise } from '../api/exerciseDbService';

interface ExerciseLibraryProps {
  onSelectExercise: (exercise: Exercise) => void;
  selectedExercises?: Exercise[];
  className?: string;
}

export function ExerciseLibrary({
  onSelectExercise,
  selectedExercises = [],
  className,
}: ExerciseLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>(STATIC_EXERCISES);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Filters
  const [muscleGroupFilter, setMuscleGroupFilter] = useState<string>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const isApiConfigured = ExerciseDbService.isConfigured();

  const searchExercises = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 3) return;

    setIsLoading(true);
    try {
      let exercises: Exercise[] = [];

      if (isApiConfigured) {
        const exerciseResults = await ExerciseDbService.searchExercises(searchQuery);
        exercises = exerciseResults.map((exercise: any) => ExerciseDbService.toExercise(exercise));
        setExercises((prev) => [...prev, ...exercises]);
      }
    } catch (error) {
      console.error('Error searching exercises:', error);
      setExercises(STATIC_EXERCISES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery) {
        searchExercises(searchQuery);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleQueryChange = (value: string) => {
    setSearchQuery(value);
    setExercises([]);
  };

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscle_group?.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter;

      // Muscle group filter
      const matchesMuscleGroup =
        muscleGroupFilter === 'all' || exercise.muscle_group === muscleGroupFilter;

      // Equipment filter
      const matchesEquipment =
        equipmentFilter === 'all' || exercise.equipment === equipmentFilter;

      // Difficulty filter
      const matchesDifficulty =
        difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMuscleGroup &&
        matchesEquipment &&
        matchesDifficulty
      );
    });
  }, [exercises, searchQuery, categoryFilter, muscleGroupFilter, equipmentFilter, difficultyFilter]);

  const isExerciseSelected = (exercise: Exercise) => {
    return selectedExercises.some((ex) => ex.id === exercise.id);
  };

  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  const handleAddExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    setSelectedExercise(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-success text-white';
      case 'intermediate':
        return 'bg-warning text-white';
      case 'advanced':
        return 'bg-error text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cardio':
        return '🏃';
      case 'strength':
        return '💪';
      case 'flexibility':
        return '🧘';
      case 'balance':
        return '⚖️';
      default:
        return '🏋️';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search exercises by name or muscle group..."
          className="pl-10 pr-20"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* API Status */}
      {!isApiConfigured && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Configure ExerciseDB API to access 1,300+ exercises with GIF
            demonstrations. Add VITE_EXERCISEDB_API_KEY to your .env file.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Currently showing {STATIC_EXERCISES.length} built-in exercises.
          </p>
        </div>
      )}

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card variant="outline" padding="sm">
              <div className="flex flex-wrap gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Category
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="balance">Balance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Muscle Group Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Muscle Group
                  </label>
                  <Select value={muscleGroupFilter} onValueChange={setMuscleGroupFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Muscle Groups</SelectItem>
                      <SelectItem value="chest">Chest</SelectItem>
                      <SelectItem value="back">Back</SelectItem>
                      <SelectItem value="legs">Legs</SelectItem>
                      <SelectItem value="shoulders">Shoulders</SelectItem>
                      <SelectItem value="arms">Arms</SelectItem>
                      <SelectItem value="core">Core</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Equipment Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Equipment
                  </label>
                  <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Equipment</SelectItem>
                      <SelectItem value="body weight">Body Weight</SelectItem>
                      <SelectItem value="dumbbell">Dumbbell</SelectItem>
                      <SelectItem value="barbell">Barbell</SelectItem>
                      <SelectItem value="cable">Cable</SelectItem>
                      <SelectItem value="machine">Machine</SelectItem>
                      <SelectItem value="band">Resistance Band</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Difficulty
                  </label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter('all');
                    setMuscleGroupFilter('all');
                    setEquipmentFilter('all');
                    setDifficultyFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            'Loading exercises...'
          ) : (
            <>
              Showing <strong>{filteredExercises.length}</strong> of{' '}
              <strong>{exercises.length}</strong> exercises
            </>
          )}
        </p>
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-scroll max-h-[40rem]">
        <AnimatePresence>
          {filteredExercises.map((exercise) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
            >
              <Card
                variant={isExerciseSelected(exercise) ? 'elevated' : 'outline'}
                padding="md"
                className={cn(
                  'cursor-pointer transition-all hover:shadow-lg',
                  isExerciseSelected(exercise) && 'ring-2 ring-primary-600'
                )}
                onClick={() => handleExerciseClick(exercise)}
              >
                {/* Exercise GIF or Icon */}
                <div className="relative mb-3 rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center">
                  {exercise.gif_url ? (
                    <img
                      src={exercise.gif_url}
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Dumbbell className="w-16 h-16 text-gray-400" />
                  )}
                  {isExerciseSelected(exercise) && (
                    <div className="absolute top-2 right-2 bg-success rounded-full p-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Exercise Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {exercise.name}
                    </h3>
                    <span className="text-xl flex-shrink-0">{getCategoryIcon(exercise.category)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {exercise.muscle_group}
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', getDifficultyColor(exercise.difficulty))}>
                      {exercise.difficulty}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground capitalize">
                    {exercise.equipment}
                  </p>

                  {exercise.calories_per_minute && (
                    <p className="text-xs text-muted-foreground">
                      ~{exercise.calories_per_minute} cal/min
                    </p>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {!isLoading && filteredExercises.length === 0 && (
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-muted-foreground">No exercises found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or search query
          </p>
        </div>
      )}

      {/* Exercise Detail Modal */}
      <AnimatePresence>
        {selectedExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 shadow-2xl flex items-center justify-center p-4"
            onClick={() => setSelectedExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Card variant="elevated" padding="lg">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      {selectedExercise.name}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{selectedExercise.muscle_group}</Badge>
                      <Badge variant="outline" className={getDifficultyColor(selectedExercise.difficulty)}>
                        {selectedExercise.difficulty}
                      </Badge>
                      <Badge variant="outline">{selectedExercise.category}</Badge>
                      <Badge variant="outline" className="capitalize">
                        {selectedExercise.equipment}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedExercise(null)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* GIF/Image */}
                {selectedExercise.gif_url && (
                  <div className="mb-6 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedExercise.gif_url}
                      alt={selectedExercise.name}
                      className="w-full h-auto"
                    />
                  </div>
                )}

                {/* Instructions */}
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    Instructions
                  </h3>
                  <ol className="space-y-2">
                    {selectedExercise.instructions?.map((instruction, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground flex gap-3"
                      >
                        <span className="font-semibold text-primary-600 flex-shrink-0">
                          {index + 1}.
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Secondary Muscles */}
                {selectedExercise.secondary_muscles && selectedExercise.secondary_muscles.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-foreground mb-2">
                      Secondary Muscles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedExercise.secondary_muscles.map((muscle, index) => (
                        <Badge key={index} variant="outline" className="capitalize">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Calories Info */}
                {selectedExercise.calories_per_minute && (
                  <div className="mb-6 bg-secondary-500/20 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong>Estimated burn:</strong> ~{selectedExercise.calories_per_minute}{' '}
                      calories per minute
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => handleAddExercise(selectedExercise)}
                    disabled={isExerciseSelected(selectedExercise)}
                  >
                    {isExerciseSelected(selectedExercise) ? 'Already Added' : 'Add to Workout'}
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedExercise(null)}>
                    Close
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
