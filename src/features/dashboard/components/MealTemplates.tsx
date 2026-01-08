/**
 * Meal Templates Component - PRODUCTION
 * Complete integration with database and GraphQL
 */

import { useMealTemplates } from '@/features/food/hooks/useMealTemplates';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  serving_size?: string;
  quantity: number;
}

interface MealTemplatesProps {
  onTemplateSelect: (foods: FoodItem[]) => void;
  onClose?: () => void;
}

export function MealTemplates({
  onTemplateSelect,
  onClose,
}: MealTemplatesProps) {
  const {
    templates,
    loading,
    isDeleting,
    favoriteTemplates,
    toggleFavorite,
    deleteTemplate,
    applyTemplate,
  } = useMealTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'alphabetical'>('recent');

  // Filter templates based on search and meal type
  const filteredTemplates = (activeTab === 'favorites' ? favoriteTemplates : templates)
    .filter(template => {
      const matchesSearch = searchQuery.trim() === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMealType = selectedMealType === 'all' || template.meal_type === selectedMealType;

      return matchesSearch && matchesMealType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.use_count || 0) - (a.use_count || 0);
        case 'alphabetical':
          return a.name.localeCompare(b.name);
        case 'recent':
        default:
          return new Date(b.last_used_at || b.created_at).getTime() -
            new Date(a.last_used_at || a.created_at).getTime();
      }
    });

  const handleUseTemplate = async (template: any) => {
    try {
      // Parse foods from template
      let foods = template.foods;
      if (typeof foods === 'string') {
        foods = JSON.parse(foods);
      }

      // Convert template foods to FoodItem format
      const convertedFoods: FoodItem[] = foods.map((food: any, index: number) => ({
        id: `template-${template.id}-${index}`,
        name: food.food_name,
        brand: food.brand_name || 'Template',
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fat,
        serving_size: food.serving_unit || food.serving_size || 'serving',
        quantity: food.quantity || 1,
      }));

      // Call the parent's handler
      onTemplateSelect(convertedFoods);

      // Increment use count
      await applyTemplate(template);
    } catch (error) {
      console.error('Failed to use template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (window.confirm(`Delete template "${templateName}"? This cannot be undone.`)) {
      await deleteTemplate(templateId);
    }
  };

  const handleToggleFavorite = async (templateId: string, currentFavorite: boolean) => {
    await toggleFavorite(templateId, currentFavorite);
  };

  const mealTypeConfig: Record<string, { emoji: string; gradient: string; bg: string }> = {
    breakfast: { emoji: '🌅', gradient: 'from-orange-500 to-amber-500', bg: 'from-orange-500/20 to-amber-500/20' },
    lunch: { emoji: '🌞', gradient: 'from-yellow-500 to-amber-500', bg: 'from-yellow-500/20 to-amber-500/20' },
    dinner: { emoji: '🌙', gradient: 'from-blue-500 to-indigo-500', bg: 'from-blue-500/20 to-indigo-500/20' },
    snack: { emoji: '🍎', gradient: 'from-green-500 to-emerald-500', bg: 'from-green-500/20 to-emerald-500/20' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Meal Templates</h3>
          <p className="text-sm text-muted-foreground">
            Save and reuse your favorite meal combinations
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Close
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-11 pr-4 py-3 border-2 border-border rounded-xl bg-background hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-300"
          />
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {/* Meal Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMealType('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedMealType === 'all'
                  ? 'bg-primary-500 text-white'
                  : 'bg-muted hover:bg-muted/80'
                }`}
            >
              All
            </button>
            {Object.entries(mealTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedMealType === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-muted hover:bg-muted/80'
                  }`}
              >
                {config.emoji} {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-border" />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 border-2 border-border rounded-lg bg-background text-sm font-medium focus:border-primary-500 focus:outline-none"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Popular</option>
            <option value="alphabetical">A-Z</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          All Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 font-medium transition-colors ${activeTab === 'favorites'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          ⭐ Favorites ({favoriteTemplates.length})
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <Loader2 className="inline-block animate-spin h-8 w-8 text-primary-500" />
          <p className="text-sm text-muted-foreground mt-2">Loading templates...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h4 className="text-lg font-semibold mb-2">
              {activeTab === 'favorites' ? 'No Favorite Templates' :
                searchQuery || selectedMealType !== 'all' ? 'No Templates Found' : 'No Templates Yet'}
            </h4>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              {activeTab === 'favorites'
                ? 'Star your frequently used templates to find them quickly'
                : searchQuery || selectedMealType !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Create your first template by selecting foods and clicking "Save as Template"'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Templates Grid */}
      {!loading && filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template: any) => {
            let foods = template.foods;
            if (typeof foods === 'string') {
              try {
                foods = JSON.parse(foods);
              } catch {
                foods = [];
              }
            }
            const foodCount = Array.isArray(foods) ? foods.length : 0;
            const config = mealTypeConfig[template.meal_type] || mealTypeConfig.snack;

            return (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{config.emoji}</span>
                        <h4 className="font-semibold">{template.name}</h4>
                        {template.meal_type && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {template.meal_type}
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(template.id, template.is_favorite);
                      }}
                      className="text-2xl hover:scale-110 transition-transform"
                      disabled={isDeleting}
                    >
                      {template.is_favorite ? '⭐' : '☆'}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {Math.round(template.total_calories || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">cal</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(template.total_protein || 0)}g
                      </p>
                      <p className="text-xs text-muted-foreground">protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {Math.round(template.total_carbs || 0)}g
                      </p>
                      <p className="text-xs text-muted-foreground">carbs</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                        {Math.round(template.total_fats || 0)}g
                      </p>
                      <p className="text-xs text-muted-foreground">fat</p>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Used {template.use_count || 0}x</span>
                    </div>
                    <span>{foodCount} food{foodCount !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleUseTemplate(template)}
                      disabled={isDeleting}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id, template.name);
                      }}
                      disabled={isDeleting}
                      className="text-error hover:bg-error/10"
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}