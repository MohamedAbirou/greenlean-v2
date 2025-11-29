/**
 * Meal Templates Manager
 * Save, browse, and quick-add favorite meals
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  BookmarkPlus,
  Flame,
  Heart,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  Utensils,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface MealTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    food_id: string;
    food_name: string;
    qty: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }>;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  is_favorite: boolean;
  created_at: string;
}

interface MealTemplatesManagerProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: MealTemplate) => void;
  currentMeal?: {
    meal_type: string;
    foods: any[];
  };
}

export function MealTemplatesManager({
  open,
  onClose,
  onSelectTemplate,
  currentMeal,
}: MealTemplatesManagerProps) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MealTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateDesc, setSaveTemplateDesc] = useState('');

  useEffect(() => {
    if (open && user) {
      loadTemplates();
    }
  }, [open, user]);

  const loadTemplates = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('meal_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load meal templates');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentMeal = async () => {
    if (!user || !currentMeal || !saveTemplateName.trim()) {
      toast.error('Please provide a name for the template');
      return;
    }

    try {
      // Calculate totals from current meal foods
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      currentMeal.foods.forEach((food: any) => {
        totalCalories += food.calories || 0;
        totalProtein += food.protein || 0;
        totalCarbs += food.carbs || 0;
        totalFats += food.fats || 0;
      });

      const { error } = await supabase.from('meal_templates').insert({
        user_id: user.id,
        name: saveTemplateName.trim(),
        description: saveTemplateDesc.trim() || null,
        meal_type: currentMeal.meal_type,
        foods: currentMeal.foods,
        total_calories: Math.round(totalCalories),
        total_protein: Math.round(totalProtein),
        total_carbs: Math.round(totalCarbs),
        total_fats: Math.round(totalFats),
        is_favorite: false,
      });

      if (error) throw error;

      toast.success(`Saved "${saveTemplateName}" as template!`);
      setSaveTemplateName('');
      setSaveTemplateDesc('');
      setShowSaveDialog(false);
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleToggleFavorite = async (template: MealTemplate) => {
    try {
      const { error } = await supabase
        .from('meal_templates')
        .update({ is_favorite: !template.is_favorite })
        .eq('id', template.id);

      if (error) throw error;

      setTemplates((prev) =>
        prev.map((t) =>
          t.id === template.id ? { ...t, is_favorite: !t.is_favorite } : t
        )
      );

      toast.success(
        template.is_favorite ? 'Removed from favorites' : 'Added to favorites'
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorite');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('meal_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      toast.success('Template deleted');
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleSelectTemplate = (template: MealTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
      onClose();
      toast.success(`Added "${template.name}" to your log!`);
    }
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMealType =
      selectedMealType === 'all' || template.meal_type === selectedMealType;

    return matchesSearch && matchesMealType;
  });

  const getMealTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🍎',
    };
    return icons[type] || '🍽️';
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookmarkPlus className="w-5 h-5" />
              Meal Templates
            </DialogTitle>
            <DialogDescription>
              Save and reuse your favorite meals for faster logging
            </DialogDescription>
          </DialogHeader>

          {/* Actions Bar */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Meal Type Filter */}
            <div className="flex gap-2">
              {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <Button
                  key={type}
                  variant={selectedMealType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMealType(type)}
                >
                  {type === 'all' ? 'All' : getMealTypeIcon(type)}
                </Button>
              ))}
            </div>

            {/* Save Current Meal Button */}
            {currentMeal && currentMeal.foods.length > 0 && (
              <Button onClick={() => setShowSaveDialog(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Save Current Meal
              </Button>
            )}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {isLoading ? (
              <div className="col-span-2 flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <Utensils className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedMealType !== 'all'
                    ? 'No templates match your filters'
                    : 'Save your favorite meals as templates for quick logging'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">
                                {getMealTypeIcon(template.meal_type)}
                              </span>
                              <CardTitle className="text-base">
                                {template.name}
                              </CardTitle>
                              {template.is_favorite && (
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            {template.description && (
                              <CardDescription className="text-sm">
                                {template.description}
                              </CardDescription>
                            )}
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleFavorite(template)}
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                template.is_favorite
                                  ? 'fill-red-500 text-red-500'
                                  : ''
                              }`}
                            />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Macros */}
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                              <Flame className="w-3 h-3" />
                              Cals
                            </div>
                            <div className="font-semibold">
                              {template.total_calories}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              Protein
                            </div>
                            <div className="font-semibold">
                              {template.total_protein}g
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              Carbs
                            </div>
                            <div className="font-semibold">
                              {template.total_carbs}g
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">
                              Fats
                            </div>
                            <div className="font-semibold">
                              {template.total_fats}g
                            </div>
                          </div>
                        </div>

                        {/* Foods Preview */}
                        <div className="text-xs text-muted-foreground">
                          {template.foods.length} item
                          {template.foods.length !== 1 ? 's' : ''}:{' '}
                          {template.foods.slice(0, 3).map((f: any, i: number) => (
                            <span key={i}>
                              {f.food_name}
                              {i < Math.min(2, template.foods.length - 1)
                                ? ', '
                                : ''}
                            </span>
                          ))}
                          {template.foods.length > 3 && '...'}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            size="sm"
                            onClick={() => handleSelectTemplate(template)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Quick Add
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Give your meal a name so you can quickly add it again later
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., My Protein Breakfast"
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="template-desc">Description (Optional)</Label>
              <Textarea
                id="template-desc"
                placeholder="e.g., High protein breakfast for busy mornings"
                value={saveTemplateDesc}
                onChange={(e) => setSaveTemplateDesc(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCurrentMeal}
              disabled={!saveTemplateName.trim()}
            >
              <BookmarkPlus className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
