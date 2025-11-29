/**
 * FoodSearch Component
 * Autocomplete search for foods using Nutritionix API
 * Beautiful, fast, and user-friendly
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, Package, Leaf, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/lib/utils';
import { NutritionixService, type NutritionixSearchResult, type FoodItem } from '../api/nutritionixService';
import { AnimatePresence, motion } from 'framer-motion';

interface FoodSearchProps {
  onSelectFood: (food: FoodItem) => void;
  placeholder?: string;
  className?: string;
}

export function FoodSearch({ onSelectFood, placeholder, className }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<NutritionixSearchResult>({ common: [], branded: [] });
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ common: [], branded: [] });
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const searchResults = await NutritionixService.searchFoods(query);
      setResults(searchResults);
      setShowResults(true);
      setIsSearching(false);
      setSelectedIndex(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const totalResults = (results.common?.length || 0) + (results.branded?.length || 0);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalResults);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalResults) % totalResults);
      } else if (e.key === 'Enter' && showResults && totalResults > 0) {
        e.preventDefault();
        handleSelectResult(selectedIndex);
      } else if (e.key === 'Escape') {
        setShowResults(false);
      }
    },
    [results, showResults, selectedIndex]
  );

  const handleSelectResult = async (index: number) => {
    const commonLength = results.common?.length || 0;

    let foodData: FoodItem | null = null;

    if (index < commonLength) {
      // Common food (natural language)
      const commonItem = results.common?.[index];
      if (commonItem) {
        setIsSearching(true);
        const nutritionData = await NutritionixService.getNutritionDetails(commonItem.food_name);
        if (nutritionData) {
          foodData = NutritionixService.toFoodItem(nutritionData);
        }
        setIsSearching(false);
      }
    } else {
      // Branded food
      const brandedItem = results.branded?.[index - commonLength];
      if (brandedItem) {
        setIsSearching(true);
        const nutritionData = await NutritionixService.getBrandedFood(brandedItem.nix_item_id);
        if (nutritionData) {
          foodData = NutritionixService.toFoodItem(nutritionData);
        }
        setIsSearching(false);
      }
    }

    if (foodData) {
      onSelectFood(foodData);
      setQuery('');
      setShowResults(false);
      setResults({ common: [], branded: [] });
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ common: [], branded: [] });
    setShowResults(false);
    inputRef.current?.focus();
  };

  const totalResults = (results.common?.length || 0) + (results.branded?.length || 0);
  const hasResults = totalResults > 0;

  return (
    <div ref={searchRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder || 'Search for foods...'}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-600 animate-spin" />
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2"
          >
            <Card
              variant="elevated"
              padding="none"
              className="max-h-[400px] overflow-y-auto shadow-xl border border-gray-200 dark:border-gray-700"
            >
              {/* Common Foods */}
              {results.common && results.common.length > 0 && (
                <div>
                  <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Leaf className="w-4 h-4 text-success" />
                      Common Foods
                    </div>
                  </div>
                  {results.common.map((item, index) => (
                    <button
                      key={`common-${index}`}
                      onClick={() => handleSelectResult(index)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800',
                        selectedIndex === index && 'bg-primary-50 dark:bg-primary-900/20'
                      )}
                    >
                      {item.photo?.thumb && (
                        <img
                          src={item.photo.thumb}
                          alt={item.food_name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.food_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.serving_qty} {item.serving_unit}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Branded Foods */}
              {results.branded && results.branded.length > 0 && (
                <div>
                  <div className="sticky top-0 bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Package className="w-4 h-4 text-primary-600" />
                      Branded Foods
                    </div>
                  </div>
                  {results.branded.map((item, index) => (
                    <button
                      key={`branded-${index}`}
                      onClick={() => handleSelectResult((results.common?.length || 0) + index)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left border-b border-gray-100 dark:border-gray-800',
                        selectedIndex === (results.common?.length || 0) + index &&
                          'bg-primary-50 dark:bg-primary-900/20'
                      )}
                    >
                      {item.photo?.thumb && (
                        <img
                          src={item.photo.thumb}
                          alt={item.food_name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.food_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {item.brand_name} • {item.nf_calories} cal
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      <AnimatePresence>
        {showResults && !hasResults && !isSearching && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2"
          >
            <Card variant="elevated" padding="md" className="text-center">
              <p className="text-gray-500 dark:text-gray-400">No foods found for "{query}"</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Try a different search term
              </p>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
