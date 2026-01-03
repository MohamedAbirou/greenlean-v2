/**
 * Exercise Search Component
 * Production-grade exercise database search with infinite scroll
 */

import { Badge } from '@/shared/components/ui/badge';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_group: string;
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
}

interface ExerciseSearchProps {
  onExerciseSelect: (exercise: Exercise) => void;
  replacingExercise?: boolean;
  recentExercises?: Exercise[];
  selectedExercises?: string[];
}

export function ExerciseSearch({ onExerciseSelect, replacingExercise, recentExercises = [], selectedExercises = [] }: ExerciseSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'recent'>('search');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (replacingExercise) {
    console.log("replacing Exercise!");
  }

  const observer = useRef<IntersectionObserver | null>(null);
  const lastExerciseRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const categories = ['all', 'strength', 'cardio', 'flexibility', 'sports'];
  const muscleGroups = ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'full body'];

  const searchExercises = async (searchQuery: string, pageNum: number) => {
    setLoading(true);
    try {
      // Mock exercise database - replace with actual API
      await new Promise((resolve) => setTimeout(resolve, 400));

      const mockExercises: Exercise[] = Array.from({ length: 15 }, (_, i) => ({
        id: `exercise-${pageNum}-${i}`,
        name: searchQuery
          ? `${searchQuery} ${i + 1}`
          : `Exercise ${pageNum}-${i + 1}`,
        category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1],
        muscle_group: muscleGroups[Math.floor(Math.random() * muscleGroups.length)],
        equipment: ['Barbell', 'Dumbbell', 'Bodyweight', 'Machine', 'Cable'][Math.floor(Math.random() * 5)],
        difficulty: (['beginner', 'intermediate', 'advanced'] as const)[Math.floor(Math.random() * 3)],
        instructions: 'Detailed exercise instructions...',
      }));

      const filtered = filterCategory === 'all'
        ? mockExercises
        : mockExercises.filter((ex) => ex.category === filterCategory);

      if (pageNum === 1) {
        setResults(filtered);
      } else {
        setResults((prev) => [...prev, ...filtered]);
      }

      setHasMore(filtered.length === 15);
    } catch (error) {
      console.error('Error searching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchExercises(query, page);
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, page, filterCategory]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
    setResults([]);
    setHasMore(true);
  };

  const handleFilterChange = (category: string) => {
    setFilterCategory(category);
    setPage(1);
    setResults([]);
    setHasMore(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'gray';
    }
  };

  const renderExercise = (exercise: Exercise, _index: number, isLast: boolean) => {
    const isSelected = selectedExercises.includes(exercise.id);

    return (
      <div
        key={exercise.id}
        ref={isLast ? lastExerciseRef : null}
        className={`p-4 border rounded-lg transition-all cursor-pointer ${
          isSelected
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
            : 'border-border hover:bg-muted/50'
        }`}
        onClick={() => onExerciseSelect(exercise)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold">{exercise.name}</h4>
              {isSelected && (
                <Badge variant="primary" className="text-xs">
                  ✓ Added
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs capitalize">
                🏋️ {exercise.category}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                💪 {exercise.muscle_group}
              </Badge>
              <Badge variant="outline" className="text-xs">
                🔧 {exercise.equipment}
              </Badge>
              <Badge variant={getDifficultyColor(exercise.difficulty)} className="text-xs capitalize">
                {exercise.difficulty}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search exercises (e.g., bench press, squat)..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full px-4 py-3 pl-12 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleFilterChange(cat)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-primary-500 text-white'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Exercise Database
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Recent ({recentExercises.length})
        </button>
      </div>

      {/* Results */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {activeTab === 'search' && (
          <>
            {results.map((exercise, index) =>
              renderExercise(exercise, index, index === results.length - 1)
            )}
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            )}
            {!loading && results.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">💪</p>
                <p>No exercises found</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'recent' && (
          <>
            {recentExercises.length > 0 ? (
              recentExercises.map((exercise, index) => renderExercise(exercise, index, false))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">📋</p>
                <p>No recent exercises</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
