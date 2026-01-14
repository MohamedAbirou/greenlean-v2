/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MealPlanView Component - Adaptive UI Based on Progressive Profiling Tier
 * Updated to support new meal JSON format with expandable structure
 * Renders meal plan with tier-appropriate features:
 * - BASIC: Simple meals, basic hydration, shopping list, fewer tips (2-3), NO meal prep
 * - PREMIUM: Full personalization, detailed meal prep, most tips (6-8), micronutrients, substitutions
 */

import { Card } from '@/shared/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Apple,
  ChefHat,
  ChevronDown,
  Clock,
  Droplets,
  Flame,
  Info,
  Lightbulb,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Utensils,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface MealPlanViewProps {
  plan: any; // JSONB meal plan data from database
  tier: 'BASIC' | 'PREMIUM';
  currentTier: 'BASIC' | 'PREMIUM';
  status: any;
  handleRegenerate: () => void;
  isRegenerating: boolean;
  needsMealRegeneration: boolean;
}

export function MealPlanView({ plan, tier, currentTier, status, handleRegenerate, isRegenerating, needsMealRegeneration }: MealPlanViewProps) {
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

  // Generating state
  if (status.meal_plan_status === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-6"
          >
            <Zap className="w-16 h-16 text-primary-600 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Generating Your Meal Plan</h2>
          <p className="text-muted-foreground mb-4">
            Our AI is creating personalized meal plans for you...
          </p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Meal Plan</span>
          </div>
          <p className="text-xs text-muted-foreground mt-4">This usually takes 30-60 seconds...</p>
        </Card>
      </div>
    );
  }

  // Failed state
  if (status.meal_plan_status === 'failed' && !plan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Meal Plan Generation Failed</h2>
          <p className="text-muted-foreground mb-4">
            {status.meal_plan_error || 'Something went wrong'}
          </p>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Try Again
          </button>
        </Card>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-4">
          <div className='flex items-center gap-3'>
            <Flame className="w-6 h-6 text-orange-500" />
            <h2 className="text-2xl font-bold text-foreground">Daily Nutrition Targets</h2>
          </div>
          <div className="flex flex-col gap-2">
            {/* Update Plans Button */}
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating || !needsMealRegeneration}
              className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium group ${needsMealRegeneration
                ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 hover:border-primary/40 hover:shadow-md'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              title={needsMealRegeneration ? `Update to ${currentTier} tier` : 'Meal Plan is up to date'}
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : needsMealRegeneration ? 'group-hover:rotate-180 transition-transform duration-500' : ''}`} />
              {isRegenerating ? 'Updating...' : needsMealRegeneration ? `Update to ${currentTier}` : 'Up to Date ✓'}
            </button>
            {needsMealRegeneration && (
              <span className="text-xs text-primary font-medium">
                New tier available! Update your meal plan
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/80 rounded-lg">
            <p className="text-sm text-muted-foreground">Calories</p>
            <p className="text-2xl font-bold text-orange-600">{dailyTotals.calories || 0}</p>
            <p className="text-xs text-muted-foreground">{dailyTotals.variance || '± 5%'}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-secondary-500/10 to-secondary-500/80 rounded-lg">
            <p className="text-sm text-muted-foreground">Protein</p>
            <p className="text-2xl font-bold text-blue-600">{dailyTotals.protein || 0}g</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/80 rounded-lg">
            <p className="text-sm text-muted-foreground">Carbs</p>
            <p className="text-2xl font-bold text-green-600">{dailyTotals.carbs || 0}g</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-yellow-500/80 rounded-lg">
            <p className="text-sm text-muted-foreground">Fats</p>
            <p className="text-2xl font-bold text-yellow-600">{dailyTotals.fats || 0}g</p>
          </div>
        </div>
      </Card>

      {/* Meals List - Expandable */}
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
                padding="lg"
                className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-primary/20"
                onClick={() => setExpandedMeal(isExpanded ? null : index)}
              >
                {/* Meal Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-3 py-1 bg-gradient-to-r from-primary to-secondary-500 text-white text-xs font-semibold rounded-full uppercase">
                        {meal.meal_type}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {meal.prep_time_minutes} min
                      </span>
                      <span className={`px-2 py-1 text-xs rounded font-medium ${meal.difficulty === 'easy' ? 'bg-green-500/20 text-green-500' :
                        meal.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-red-500/20 text-red-500'
                        }`}>
                        {meal.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{meal.meal_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meal.meal_timing}
                    </p>

                    {/* Macros - Horizontal Pills */}
                    <div className="flex gap-3 flex-wrap mb-3">
                      <div className="px-3 py-1.5 bg-orange-500/20 rounded-full flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-sm font-semibold text-orange-500">{meal.total_calories} cal</span>
                      </div>
                      <div className="px-3 py-1.5 bg-blue-500/20 rounded-full">
                        <span className="text-sm font-semibold text-blue-500">{meal.total_protein}g protein</span>
                      </div>
                      <div className="px-3 py-1.5 bg-green-500/20 rounded-full">
                        <span className="text-sm font-semibold text-green-500">{meal.total_carbs}g carbs</span>
                      </div>
                      <div className="px-3 py-1.5 bg-yellow-500/20 rounded-full">
                        <span className="text-sm font-semibold text-yellow-500">{meal.total_fats}g fats</span>
                      </div>
                      {meal.total_fiber && (
                        <div className="px-3 py-1.5 bg-purple-500/20 rounded-full">
                          <span className="text-sm font-semibold text-purple-500">{meal.total_fiber}g fiber</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {meal.tags && meal.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {meal.tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-accent/50 text-accent-foreground text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-6 pt-6 border-t border-border space-y-6">
                        {/* Key Micronutrients - PREMIUM ONLY */}
                        {tier === 'PREMIUM' && meal.key_micronutrients && (
                          <div className="p-4 bg-gradient-to-br from-violet-500/20 to-purple-500/20 rounded-lg border-2 border-violet-500">
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-violet-500">
                              <Sparkles className="w-4 h-4" />
                              Key Micronutrients (PREMIUM)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {Object.entries(meal.key_micronutrients).map(([nutrient, value]: [string, any]) => (
                                <div key={nutrient} className="flex items-center gap-2 text-sm">
                                  <span className="text-violet-500">•</span>
                                  <span className="capitalize">{nutrient.replace('_', ' ')}:</span>
                                  <span className="font-semibold">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ingredients (PREMIUM has separate list) */}
                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Apple className="w-4 h-4 text-primary" />
                              Ingredients
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {meal.ingredients.map((ingredient: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                                  <span className="text-primary">✓</span>
                                  <span>{ingredient}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Foods/Nutrition Breakdown (if no ingredients, use foods) */}
                        {(!meal.ingredients || meal.ingredients.length === 0) && meal.foods && meal.foods.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Utensils className="w-4 h-4 text-primary" />
                              Nutrition Breakdown
                            </h4>
                            <div className="space-y-2">
                              {meal.foods.map((food: any, i: number) => (
                                <div key={i} className="flex justify-between items-center text-sm bg-muted/50 p-3 rounded">
                                  <div>
                                    <span className="font-semibold">{food.name}</span>
                                    <span className="text-muted-foreground ml-2">— {food.portion}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {food.calories}cal | {food.protein}g P | {food.carbs}g C | {food.fats}g F
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Instructions (PREMIUM has step-by-step array) */}
                        {meal.instructions && meal.instructions.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <ChefHat className="w-4 h-4 text-primary" />
                              Instructions
                            </h4>
                            <ol className="space-y-2">
                              {meal.instructions.map((instruction: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {i + 1}
                                  </span>
                                  <span className="pt-0.5">{instruction}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Recipe (fallback natural text if no instructions) */}
                        {(!meal.instructions || meal.instructions.length === 0) && meal.recipe && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <ChefHat className="w-4 h-4 text-primary" />
                              Recipe
                            </h4>
                            <p className="text-sm text-foreground bg-muted/50 p-4 rounded leading-relaxed whitespace-pre-line">
                              {meal.recipe}
                            </p>
                          </div>
                        )}

                        {/* Why This Meal - PREMIUM ONLY */}
                        {tier === 'PREMIUM' && meal.why_this_meal && (
                          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border-2 border-blue-500">
                            <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-500">
                              <Info className="w-4 h-4" />
                              Why This Meal? (PREMIUM)
                            </h4>
                            <p className="text-sm text-blue-600 leading-relaxed">{meal.why_this_meal}</p>
                          </div>
                        )}

                        {/* Tips */}
                        {meal.tips && meal.tips.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-yellow-500" />
                              Tips
                            </h4>
                            <ul className="space-y-2">
                              {meal.tips.map((tip: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-sm bg-yellow-500/20 p-2 rounded">
                                  <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Substitutions - PREMIUM ONLY */}
                        {tier === 'PREMIUM' && meal.substitutions && meal.substitutions.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-500">
                              <Sparkles className="w-4 h-4" />
                              Smart Substitutions (PREMIUM)
                            </h4>
                            <div className="space-y-2">
                              {meal.substitutions.map((sub: string, i: number) => (
                                <div key={i} className="flex items-start gap-2 text-sm bg-purple-500/20 p-3 rounded border border-purple-500">
                                  <span className="text-purple-500">→</span>
                                  <span>{sub}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Allergen Info - PREMIUM ONLY */}
                        {tier === 'PREMIUM' && meal.allergen_info && (
                          <div className="p-3 bg-red-500/20 rounded-lg border border-red-500">
                            <p className="text-sm flex items-start gap-2 text-red-500">
                              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span><strong>Allergen Info:</strong> {meal.allergen_info}</span>
                            </p>
                          </div>
                        )}
                      </div>
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
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <p className="font-semibold text-blue-500">
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
          {tier === 'PREMIUM' && hydration.hydration_tips && hydration.hydration_tips.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Hydration Tips:</h4>
              <ul className="space-y-1">
                {hydration.hydration_tips.map((tip: string, i: number) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-blue-500">💧</span>
                    {tip}
                  </li>
                ))}
              </ul>
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
            <span className="ml-auto px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-semibold">
              {shoppingList.estimated_cost}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shoppingList.proteins && shoppingList.proteins.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-blue-600">🥩 Proteins</h4>
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
              <h4 className="font-semibold mb-2 text-green-600">🥬 Vegetables</h4>
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
          {shoppingList.fruits && shoppingList.fruits.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-pink-600">🍎 Fruits</h4>
              <ul className="space-y-1">
                {shoppingList.fruits.map((item: string, i: number) => (
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
              <h4 className="font-semibold mb-2 text-yellow-600">🌾 Carbs</h4>
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
              <h4 className="font-semibold mb-2 text-orange-600">🥑 Healthy Fats</h4>
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
              <h4 className="font-semibold mb-2 text-purple-600">🧂 Pantry Staples</h4>
              <div className="flex flex-wrap gap-2">
                {shoppingList.pantry_staples.map((item: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-500 text-xs rounded">
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
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm rounded-full">
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
                className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg"
              >
                <p className="text-sm text-foreground">{tip}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Meal Prep Strategy - CONDITIONAL (PREMIUM only) */}
      {mealPrep && (
        <Card variant="elevated" padding="lg" className="border-2 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Meal Prep Strategy</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-primary to-secondary-500 text-white text-xs font-semibold rounded-full">
              {tier === 'PREMIUM' && 'PREMIUM FEATURE'}
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
                    <li key={i} className="text-sm flex items-start gap-2 bg-blue-500/20 p-2 rounded">
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
                    <li key={i} className="text-sm flex items-start gap-2 bg-green-500/20 p-2 rounded">
                      <span className="text-green-600 font-bold">→</span>
                      {hack}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weekly Schedule - PREMIUM ONLY */}
            {tier === 'PREMIUM' && mealPrep.weekly_schedule && (
              <div>
                <h4 className="font-semibold mb-2 text-purple-600">Weekly Prep Schedule (PREMIUM)</h4>
                <div className="space-y-2">
                  {Object.entries(mealPrep.weekly_schedule).map(([day, schedule]: [string, any]) => (
                    <div key={day} className="flex items-start gap-2 text-sm bg-purple-500/20 p-3 rounded">
                      <span className="font-semibold capitalize text-purple-500 min-w-[80px]">{day}:</span>
                      <span>{schedule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Notes - If available */}
      {plan.notes && (
        <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-accent/5 to-accent/10 border border-accent/20">
          <p className="text-sm text-muted-foreground italic flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{plan.notes}</span>
          </p>
        </Card>
      )}
    </div>
  );
}
