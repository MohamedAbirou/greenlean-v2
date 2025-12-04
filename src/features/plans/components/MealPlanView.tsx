/**
 * MealPlanView Component - Adaptive UI Based on Progressive Profiling Tier
 * Renders meal plan with tier-appropriate features:
 * - BASIC: Simple meals, basic hydration, shopping list, fewer tips (2-3), NO meal prep
 * - STANDARD: More customization, meal prep basics, more tips (4-6)
 * - PREMIUM: Full personalization, detailed meal prep, most tips (6-8)
 */

import { Card } from '@/shared/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChefHat,
  Clock,
  Droplets,
  Flame,
  Info,
  Lightbulb,
  ShoppingCart,
  TrendingUp,
  Utensils,
} from 'lucide-react';
import { useState } from 'react';

interface MealPlanViewProps {
  plan: any; // JSONB meal plan data from database
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
}

export function MealPlanView({ plan, tier }: MealPlanViewProps) {
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

  if (!plan) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-muted-foreground">No meal plan data available</p>
      </Card>
    );
  }

  const meals = plan.meals || [];
  const dailyTotals = plan.daily_totals || {};
  const hydration = plan.hydration_plan || {};
  const shoppingList = plan.shopping_list || {};
  const tips = plan.personalized_tips || [];
  const mealPrep = plan.meal_prep_strategy; // May be null for BASIC

  return (
    <div className="space-y-6">
      {/* Daily Nutrition Summary */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-bold text-foreground">Daily Nutrition Targets</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
            <p className="text-sm text-muted-foreground">Calories</p>
            <p className="text-2xl font-bold text-orange-600">{dailyTotals.calories || 0}</p>
            <p className="text-xs text-muted-foreground">{dailyTotals.variance || '± 5%'}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
            <p className="text-sm text-muted-foreground">Protein</p>
            <p className="text-2xl font-bold text-blue-600">{dailyTotals.protein || 0}g</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
            <p className="text-sm text-muted-foreground">Carbs</p>
            <p className="text-2xl font-bold text-green-600">{dailyTotals.carbs || 0}g</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg">
            <p className="text-sm text-muted-foreground">Fats</p>
            <p className="text-2xl font-bold text-yellow-600">{dailyTotals.fats || 0}g</p>
          </div>
        </div>
      </Card>

      {/* Meals List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Your Meals</h2>
          <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
            {meals.length} meals
          </span>
        </div>

        {meals.map((meal: any, index: number) => {
          const isExpanded = expandedMeal === index;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant="elevated"
                padding="md"
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setExpandedMeal(isExpanded ? null : index)}
              >
                {/* Meal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded uppercase">
                        {meal.meal_type}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meal.prep_time_minutes} min
                      </span>
                      <span className={`px-2 py-1 text-xs rounded ${
                        meal.difficulty === 'easy' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        meal.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {meal.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{meal.meal_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {meal.meal_timing}
                    </p>

                    {/* Macros */}
                    <div className="flex gap-4 text-sm">
                      <span><strong>{meal.total_calories}</strong> cal</span>
                      <span><strong>{meal.total_protein}g</strong> protein</span>
                      <span><strong>{meal.total_carbs}g</strong> carbs</span>
                      <span><strong>{meal.total_fats}g</strong> fats</span>
                    </div>

                    {/* Tags */}
                    {meal.tags && meal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {meal.tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <TrendingUp className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      {/* Foods/Ingredients */}
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Utensils className="w-4 h-4" />
                          Ingredients
                        </h4>
                        <div className="space-y-2">
                          {meal.foods?.map((food: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                              <span>
                                <strong>{food.name}</strong> - {food.portion}
                              </span>
                              <span className="text-muted-foreground">
                                {food.calories} cal | {food.protein}g P | {food.carbs}g C | {food.fats}g F
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recipe */}
                      {meal.recipe && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <ChefHat className="w-4 h-4" />
                            Recipe
                          </h4>
                          <p className="text-sm text-foreground bg-muted/50 p-3 rounded leading-relaxed">
                            {meal.recipe}
                          </p>
                        </div>
                      )}

                      {/* Tips */}
                      {meal.tips && meal.tips.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Tips
                          </h4>
                          <ul className="space-y-1">
                            {meal.tips.map((tip: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Hydration Plan - Always Show */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Droplets className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-foreground">Hydration Plan</h2>
        </div>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="font-semibold text-blue-700 dark:text-blue-300">
              {hydration.daily_water_intake || 'Stay hydrated throughout the day'}
            </p>
          </div>
          {hydration.timing && hydration.timing.length > 0 && (
            <div className="space-y-2">
              {hydration.timing.map((time: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>{time}</span>
                </div>
              ))}
            </div>
          )}
          {hydration.electrolyte_needs && (
            <div className="p-3 bg-accent/10 rounded-lg">
              <p className="text-sm flex items-start gap-2">
                <Info className="w-4 h-4 text-accent mt-0.5" />
                {hydration.electrolyte_needs}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Shopping List - Always Show */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold text-foreground">Shopping List</h2>
          {shoppingList.estimated_cost && (
            <span className="ml-auto px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">
              {shoppingList.estimated_cost}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shoppingList.proteins && shoppingList.proteins.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">Proteins</h4>
              <ul className="space-y-1">
                {shoppingList.proteins.map((item: string, i: number) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {shoppingList.vegetables && shoppingList.vegetables.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-green-600">Vegetables</h4>
              <ul className="space-y-1">
                {shoppingList.vegetables.map((item: string, i: number) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {shoppingList.carbs && shoppingList.carbs.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-yellow-600">Carbs</h4>
              <ul className="space-y-1">
                {shoppingList.carbs.map((item: string, i: number) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {shoppingList.fats && shoppingList.fats.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-orange-600">Healthy Fats</h4>
              <ul className="space-y-1">
                {shoppingList.fats.map((item: string, i: number) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {shoppingList.pantry_staples && shoppingList.pantry_staples.length > 0 && (
            <div className="md:col-span-2">
              <h4 className="font-semibold mb-2 text-purple-600">Pantry Staples</h4>
              <div className="flex flex-wrap gap-2">
                {shoppingList.pantry_staples.map((item: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Personalized Tips - Always Show (but BASIC has fewer) */}
      {tips.length > 0 && (
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-foreground">Personalized Tips</h2>
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-sm rounded-full">
              {tips.length} tips
            </span>
          </div>
          <div className="space-y-3">
            {tips.map((tip: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg"
              >
                <p className="text-sm text-foreground">{tip}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Meal Prep Strategy - CONDITIONAL (STANDARD/PREMIUM only) */}
      {mealPrep && (
        <Card variant="elevated" padding="lg" className="border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Meal Prep Strategy</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold rounded-full">
              {tier === 'PREMIUM' ? 'PREMIUM FEATURE' : 'STANDARD+'}
            </span>
          </div>

          <div className="space-y-4">
            {/* Batch Cooking */}
            {mealPrep.batch_cooking && mealPrep.batch_cooking.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-primary">Batch Cooking Ideas</h4>
                <ul className="space-y-2">
                  {mealPrep.batch_cooking.map((idea: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2 bg-primary/5 p-2 rounded">
                      <span className="text-primary font-bold">→</span>
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Storage Tips */}
            {mealPrep.storage_tips && mealPrep.storage_tips.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">Storage Tips</h4>
                <ul className="space-y-2">
                  {mealPrep.storage_tips.map((tip: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2 bg-blue-50 dark:bg-blue-950 p-2 rounded">
                      <span className="text-blue-600 font-bold">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Time-Saving Hacks */}
            {mealPrep.time_saving_hacks && mealPrep.time_saving_hacks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Time-Saving Hacks</h4>
                <ul className="space-y-2">
                  {mealPrep.time_saving_hacks.map((hack: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2 bg-green-50 dark:bg-green-950 p-2 rounded">
                      <span className="text-green-600 font-bold">→</span>
                      {hack}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
