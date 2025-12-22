/**
 * Food Search Component
 * Production-grade food database search with infinite scroll
 * Uses Nutritionix API as primary source with USDA as fallback
 */

import { NutritionixService } from '@/features/nutrition/api/nutritionixService';
import { USDAProxyService } from '@/features/nutrition/api/usdaProxyService';
import { USDAService } from '@/features/nutrition/api/usdaService';
import { Badge } from '@/shared/components/ui/badge';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Food {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size?: string;
  verified?: boolean;
}

interface FoodSearchProps {
  onSelect: (food: Food) => void;
  recentFoods?: Food[];
  frequentFoods?: Food[];
  selectedFoods?: string[];
}

export function FoodSearch({ onSelect, recentFoods = [], frequentFoods = [], selectedFoods = [] }: FoodSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'frequent'>('search');
  const [apiSource, setApiSource] = useState<'nutritionix' | 'usda'>(
    NutritionixService.isConfigured() ? 'nutritionix' : 'usda'
  );

  const observer = useRef<IntersectionObserver | null>(null);
  const lastFoodRef = useCallback(
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

  const searchFoods = async (searchQuery: string, pageNum: number) => {
    if (!searchQuery || searchQuery.length < 2) return;

    setLoading(true);
    try {
      let foods: Food[] = [];

      // Try Nutritionix first if configured
      if (apiSource === 'nutritionix' && NutritionixService.isConfigured()) {
        try {
          const nutritionixResults = await NutritionixService.searchFoods(searchQuery);

          // Convert common and branded foods
          const commonFoods = nutritionixResults.common?.slice(0, 10).map((item) => ({
            id: `nutritionix-common-${item.tag_id}`,
            name: item.food_name,
            calories: 0, // Placeholder - fetch details on selection
            protein: 0,
            carbs: 0,
            fats: 0,
            serving_size: `${item.serving_qty} ${item.serving_unit}`,
            verified: true,
          })) || [];

          const brandedFoods = nutritionixResults.branded?.slice(0, 15).map((item) => ({
            id: `nutritionix-branded-${item.nix_item_id}`,
            name: item.food_name,
            brand: item.brand_name,
            calories: Math.round(item.nf_calories || 0),
            protein: 0,
            carbs: 0,
            fats: 0,
            serving_size: `${item.serving_qty} ${item.serving_unit}`,
            verified: true,
          })) || [];

          foods = [...commonFoods, ...brandedFoods];
          setHasMore(false); // Nutritionix returns all at once
        } catch (error) {
          console.error('Nutritionix search failed, falling back to USDA:', error);
          setApiSource('usda');
        }
      }

      // Fallback to USDA or use USDA if selected
      if (foods.length === 0 || apiSource === 'usda') {
        // const usdaResults = await USDAService.searchFoods(searchQuery, pageNum, 25);
        const usdaResults = await USDAProxyService.searchFoods(searchQuery, pageNum, 25);
        foods = usdaResults.foods.map((food: any) => USDAService.toFoodItem(food));
        setHasMore(usdaResults.currentPage < usdaResults.totalPages);
      }

      if (pageNum === 1) {
        setResults(foods);
      } else {
        setResults((prev) => [...prev, ...foods]);
      }
    } catch (error) {
      console.error('Error searching foods:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) {
        searchFoods(query, page);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, page]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
    setResults([]);
    setHasMore(true);
  };

  const renderFood = (food: Food, _index: number, isLast: boolean) => {
    const isSelected = selectedFoods.includes(food.id);

    return (
      <div
        key={food.id}
        ref={isLast ? lastFoodRef : null}
        className={`p-4 border rounded-lg transition-all cursor-pointer ${
          isSelected
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
            : 'border-border hover:bg-muted/50'
        }`}
        onClick={() => onSelect(food)}
      >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{food.name}</h4>
            {food.verified && (
              <Badge variant="success" className="text-xs">
                ✓ Verified
              </Badge>
            )}
            {isSelected && (
              <Badge variant="primary" className="text-xs">
                Added
              </Badge>
            )}
          </div>
          {food.brand && (
            <p className="text-sm text-muted-foreground">{food.brand}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{food.serving_size || '100g'}</p>
        </div>
        <div className="text-right ml-4">
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {food.calories}
          </p>
          <p className="text-xs text-muted-foreground">kcal</p>
          <div className="flex gap-2 mt-2 text-xs">
            <span className="text-purple-600 dark:text-purple-400">P:{food.protein}g</span>
            <span className="text-green-600 dark:text-green-400">C:{food.carbs}g</span>
            <span className="text-amber-600 dark:text-amber-400">F:{food.fats}g</span>
          </div>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* API Source Selector */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Database:</span>
        <button
          onClick={() => {
            setApiSource('nutritionix');
            setQuery('');
            setResults([]);
          }}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            apiSource === 'nutritionix'
              ? 'bg-primary-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          disabled={!NutritionixService.isConfigured()}
        >
          Nutritionix {NutritionixService.isConfigured() ? '✓' : '(Not configured)'}
        </button>
        <button
          onClick={() => {
            setApiSource('usda');
            setQuery('');
            setResults([]);
          }}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            apiSource === 'usda'
              ? 'bg-primary-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          USDA
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Search ${apiSource === 'nutritionix' ? 'Nutritionix (700k+)' : 'USDA (400k+)'} database...`}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          className="w-full px-4 py-3 pl-12 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
          autoFocus
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
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
          Search Results
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'recent'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Recent ({recentFoods.length})
        </button>
        <button
          onClick={() => setActiveTab('frequent')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'frequent'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Frequent ({frequentFoods.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {activeTab === 'search' && (
          <>
            {results.map((food, index) =>
              renderFood(food, index, index === results.length - 1)
            )}
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            )}
            {!loading && results.length === 0 && query && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">🔍</p>
                <p>No results found for "{query}"</p>
              </div>
            )}
            {!query && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">🍎</p>
                <p>Start typing to search the USDA database</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'recent' && (
          <>
            {recentFoods.length > 0 ? (
              recentFoods.map((food, index) => renderFood(food, index, false))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">📋</p>
                <p>No recent foods</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'frequent' && (
          <>
            {frequentFoods.length > 0 ? (
              frequentFoods.map((food, index) => renderFood(food, index, false))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">⭐</p>
                <p>No frequent foods yet</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
