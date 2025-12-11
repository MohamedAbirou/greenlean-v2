/**
 * Meal Templates Component
 * Save and reuse favorite meal combinations
 * Production-ready template management with full CRUD
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { useMealTemplates } from '@/features/food/hooks/useMealTemplates';

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
  onSelectTemplate: (foods: FoodItem[]) => void;
  currentFoods?: FoodItem[];
  onClose?: () => void;
}

export function MealTemplates({
  onSelectTemplate,
  currentFoods = [],
  onClose,
}: MealTemplatesProps) {
  const {
    templates,
    loading,
    isCreating,
    isDeleting,
    createTemplate,
    deleteTemplate,
    toggleFavorite,
    favoriteTemplates,
  } = useMealTemplates();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');

  const handleCreateTemplate = async () => {
    if (!newTemplateName || currentFoods.length === 0) return;

    const templateFoods = currentFoods.map((food) => ({
      food_name: food.name,
      brand_name: food.brand,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fats,
      quantity: food.quantity,
      serving_unit: food.serving_size || 'serving',
    }));

    await createTemplate(
      newTemplateName,
      newTemplateDescription,
      templateFoods,
      selectedMealType || undefined
    );

    setNewTemplateName('');
    setNewTemplateDescription('');
    setSelectedMealType('');
    setShowCreateModal(false);
  };

  const handleUseTemplate = (template: any) => {
    try {
      const foods = JSON.parse(template.foods || '[]');
      const convertedFoods: FoodItem[] = foods.map((food: any, index: number) => ({
        id: `template-${template.id}-${index}`,
        name: food.food_name,
        brand: food.brand_name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fat,
        serving_size: food.serving_unit,
        quantity: food.quantity || 1,
      }));
      onSelectTemplate(convertedFoods);
    } catch (error) {
      console.error('Failed to parse template foods:', error);
    }
  };

  const displayTemplates = activeTab === 'favorites' ? favoriteTemplates : templates;

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

      {/* Create Template Button */}
      {currentFoods.length > 0 && !showCreateModal && (
        <Card className="border-dashed border-2 border-primary-500/50 bg-primary-500/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">💾</div>
              <h4 className="font-semibold mb-2">Save Current Selection as Template</h4>
              <p className="text-sm text-muted-foreground mb-4">
                You have {currentFoods.length} food{currentFoods.length !== 1 ? 's' : ''} selected
              </p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Template
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Template Form */}
      {showCreateModal && (
        <Card className="border-primary-500">
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template Name *</label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Post-Workout Breakfast, Protein Lunch"
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description (Optional)</label>
              <textarea
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                placeholder="Add notes about this meal template..."
                rows={2}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Meal Type (Optional)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type === selectedMealType ? '' : type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedMealType === type
                        ? 'bg-primary-500 text-white'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {type === 'breakfast' && '🌅'}
                    {type === 'lunch' && '🌞'}
                    {type === 'dinner' && '🌙'}
                    {type === 'snack' && '🍎'}
                    <span className="ml-1 capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Foods Preview */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Foods in Template:</h4>
              <ul className="space-y-1 text-sm">
                {currentFoods.map((food, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{food.name}</span>
                    <span className="text-muted-foreground">
                      {food.quantity}x ({food.calories * food.quantity} cal)
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleCreateTemplate}
                disabled={!newTemplateName || isCreating}
                loading={isCreating}
                fullWidth
              >
                Save Template
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates List */}
      <div>
        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b border-border">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ⭐ Favorites ({favoriteTemplates.length})
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading templates...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && displayTemplates.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h4 className="text-lg font-semibold mb-2">
                {activeTab === 'favorites' ? 'No Favorite Templates' : 'No Templates Yet'}
              </h4>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                {activeTab === 'favorites'
                  ? 'Star your frequently used templates to find them quickly'
                  : 'Create your first template by selecting foods and clicking "Create Template"'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Templates Grid */}
        {!loading && displayTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayTemplates.map((template: any) => {
              const foods = JSON.parse(template.foods || '[]');
              const foodCount = foods.length;

              return (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <CardContent className="pt-6 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
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
                          toggleFavorite(template.id, template.is_favorite);
                        }}
                        className="text-2xl hover:scale-110 transition-transform"
                      >
                        {template.is_favorite ? '⭐' : '☆'}
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          {template.total_calories || 0}
                        </p>
                        <p className="text-xs text-muted-foreground">cal</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {template.total_protein || 0}g
                        </p>
                        <p className="text-xs text-muted-foreground">protein</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {template.total_carbs || 0}g
                        </p>
                        <p className="text-xs text-muted-foreground">carbs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                          {template.total_fat || 0}g
                        </p>
                        <p className="text-xs text-muted-foreground">fat</p>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                      <span>{foodCount} food{foodCount !== 1 ? 's' : ''}</span>
                      <span>Used {template.use_count || 0}x</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        onClick={() => handleUseTemplate(template)}
                      >
                        Use Template
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `Delete template "${template.name}"? This cannot be undone.`
                            )
                          ) {
                            deleteTemplate(template.id);
                          }
                        }}
                        disabled={isDeleting}
                        className="text-error hover:bg-error/10"
                      >
                        🗑️
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
