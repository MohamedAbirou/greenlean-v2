/**
 * MealTemplatesList Component
 * Display and manage meal templates
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Star, Clock, Utensils, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { useMealTemplates } from '../../hooks/useMealTemplates';
import { CreateTemplateModal } from './CreateTemplateModal';
import type { MealTemplate } from '../../types/food.types';

export function MealTemplatesList() {
  const {
    templates,
    loading,
    isCreateModalOpen,
    setIsCreateModalOpen,
    toggleFavorite,
    deleteTemplate,
    logTemplate,
  } = useMealTemplates();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMealType = selectedMealType === 'all' || template.meal_type === selectedMealType;
    return matchesSearch && matchesMealType;
  });

  const handleQuickLog = async (template: MealTemplate) => {
    await logTemplate(template);
  };

  const mealTypes = [
    { id: 'all', label: 'All Meals', icon: Utensils },
    { id: 'breakfast', label: 'Breakfast', icon: '🍳' },
    { id: 'lunch', label: 'Lunch', icon: '🥗' },
    { id: 'dinner', label: 'Dinner', icon: '🍽️' },
    { id: 'snack', label: 'Snacks', icon: '🍎' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Utensils className="w-8 h-8 text-primary-600" />
          </motion.div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meal Templates</h2>
          <p className="text-muted-foreground mt-1">
            Save your favorite meals for quick logging
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Meal Type Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {mealTypes.map((type) => {
          const isActive = selectedMealType === type.id;
          const Icon = typeof type.icon === 'string' ? null : type.icon;

          return (
            <button
              key={type.id}
              onClick={() => setSelectedMealType(type.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
                ${isActive
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-card hover:bg-accent text-foreground border border-border'
                }
              `}
            >
              {Icon ? <Icon className="w-4 h-4" /> : <span>{type.icon}</span>}
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed"
        >
          <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first meal template to speed up food logging
          </p>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-card rounded-lg border border-border p-4 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      {template.is_favorite && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {template.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => toggleFavorite(template.id, template.is_favorite)}
                    className="p-1 hover:bg-accent rounded transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        template.is_favorite
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                </div>

                {/* Macros */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Calories</p>
                    <p className="font-semibold">{Math.round(template.total_calories)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Protein</p>
                    <p className="font-semibold text-primary-600">{Math.round(template.total_protein)}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Carbs</p>
                    <p className="font-semibold text-accent-600">{Math.round(template.total_carbs)}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Fat</p>
                    <p className="font-semibold text-secondary-600">{Math.round(template.total_fat)}g</p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {template.meal_type && (
                      <Badge variant="secondary" className="text-xs">
                        {template.meal_type}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Used {template.use_count}x</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleQuickLog(template)}
                    className="flex-1"
                    size="sm"
                  >
                    Quick Log
                  </Button>
                  <Button
                    onClick={() => deleteTemplate(template.id)}
                    variant="destructive"
                    size="sm"
                    className="px-3"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create Template Modal */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
