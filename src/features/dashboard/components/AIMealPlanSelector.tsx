/**
 * AI Meal Plan Selector Component
 * Select and log meals from your AI-generated personalized meal plan
 * Integrates with LogMeal workflow for seamless food logging
 */

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Meal {
  meal_type: string;
  meal_name: string;
  meal_timing: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fiber?: number;
  prep_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  foods: Array<{
    food_name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }>;
  instructions?: string[];
}

interface AIMealPlanSelectorProps {
  mealPlan: any; // GraphQL node with plan_data as JSON
  selectedMealType: string;
  onSelectMeal: (foods: any[]) => void;
  onClose?: () => void;
}

export function AIMealPlanSelector({
  mealPlan,
  selectedMealType,
  onSelectMeal,
  onClose,
}: AIMealPlanSelectorProps) {
  const navigate = useNavigate();
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

  // Parse plan_data from GraphQL response
  const planData = mealPlan?.plan_data ?
    (typeof mealPlan.plan_data === 'string' ? JSON.parse(mealPlan.plan_data) : mealPlan.plan_data)
    : null;

  if (!planData || !planData.meals || planData.meals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Meal Plan</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">Generate Your Personalized Meal Plan</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get AI-powered meal recommendations based on your goals, preferences, and dietary needs.
          </p>
          <Button variant="primary" onClick={() => navigate('/plans')}>
            Generate Meal Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  const meals = planData.meals || [];
  const dailyTotals = planData.daily_totals || {};

  // Filter meals by selected meal type
  const filteredMeals = meals.filter(
    (meal) => meal.meal_type.toLowerCase() === selectedMealType.toLowerCase()
  );

  // If no meals for this type, show all meals
  const displayMeals = filteredMeals.length > 0 ? filteredMeals : meals;

  const handleSelectMeal = (meal: Meal) => {
    // Convert meal foods to the format expected by LogMeal
    const foods = meal.foods.map((food, index) => ({
      id: `ai-plan-${Date.now()}-${index}`,
      name: food.food_name,
      brand: 'AI Meal Plan',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      serving_size: food.unit,
      quantity: food.quantity,
      verified: true,
    }));

    onSelectMeal(foods);
  };

  const getMealTypeEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '🌞';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI Meal Plan</h3>
          <p className="text-sm text-muted-foreground">
            Select meals from your personalized plan
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Close
          </Button>
        )}
      </div>

      {/* Daily Summary */}
      <Card className="border-primary-500/50 bg-gradient-to-r from-primary-500/5 to-secondary-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Daily Nutrition Targets</CardTitle>
            <Badge variant="success">Active Plan</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {dailyTotals.calories || mealPlan.daily_calories}
              </p>
              <p className="text-xs text-muted-foreground">Calories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {dailyTotals.protein || 0}g
              </p>
              <p className="text-xs text-muted-foreground">Protein</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {dailyTotals.carbs || 0}g
              </p>
              <p className="text-xs text-muted-foreground">Carbs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {dailyTotals.fats || 0}g
              </p>
              <p className="text-xs text-muted-foreground">Fats</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meal Type Filter Info */}
      {filteredMeals.length > 0 && filteredMeals.length < meals.length && (
        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
          <span className="text-sm">
            Showing <strong>{filteredMeals.length}</strong> {selectedMealType} meal
            {filteredMeals.length !== 1 ? 's' : ''} from your plan
          </span>
        </div>
      )}

      {/* Meals List */}
      {displayMeals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h4 className="text-lg font-semibold mb-2">No Meals in Plan</h4>
            <p className="text-sm text-muted-foreground">
              Your meal plan doesn't have any meals yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayMeals.map((meal, index) => {
            const isExpanded = expandedMeal === index;

            return (
              <Card
                key={index}
                className="transition-all hover:shadow-lg cursor-pointer border-2 border-transparent hover:border-primary-500/30"
              >
                <CardContent className="pt-6 space-y-4">
                  {/* Meal Header */}
                  <div onClick={() => setExpandedMeal(isExpanded ? null : index)}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge variant="primary" className="uppercase">
                            {getMealTypeEmoji(meal.meal_type)} {meal.meal_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            🕐 {meal.prep_time_minutes} min
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(meal.difficulty)}`}>
                            {meal.difficulty}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-bold mb-1">{meal.meal_name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Best time: {meal.meal_timing}
                        </p>
                      </div>
                      <button
                        className="text-muted-foreground hover:text-foreground transition-transform"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                      >
                        ⌄
                      </button>
                    </div>

                    {/* Nutrition Pills */}
                    <div className="flex gap-2 flex-wrap">
                      <div className="px-3 py-1.5 bg-orange-50 dark:bg-orange-950 rounded-full">
                        <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          {meal.total_calories} cal
                        </span>
                      </div>
                      <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950 rounded-full">
                        <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          {meal.total_protein}g protein
                        </span>
                      </div>
                      <div className="px-3 py-1.5 bg-green-50 dark:bg-green-950 rounded-full">
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          {meal.total_carbs}g carbs
                        </span>
                      </div>
                      <div className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-950 rounded-full">
                        <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                          {meal.total_fats}g fats
                        </span>
                      </div>
                      {meal.total_fiber && (
                        <div className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950 rounded-full">
                          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                            {meal.total_fiber}g fiber
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-border space-y-4">
                      {/* Foods List */}
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Ingredients:</h5>
                        <ul className="space-y-2">
                          {meal.foods.map((food, foodIndex) => (
                            <li
                              key={foodIndex}
                              className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded"
                            >
                              <span className="font-medium">{food.food_name}</span>
                              <span className="text-muted-foreground">
                                {food.quantity} {food.unit}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Instructions */}
                      {meal.instructions && meal.instructions.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2">Instructions:</h5>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                            {meal.instructions.map((instruction, i) => (
                              <li key={i}>{instruction}</li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleSelectMeal(meal)}
                  >
                    Add {meal.meal_name} to {selectedMealType}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* View Full Plan */}
      <div className="flex items-center justify-center pt-4">
        <Button variant="outline" onClick={() => navigate('/plans')}>
          View Full Meal Plan →
        </Button>
      </div>

      {/* Info */}
      <div className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/20">
        <h4 className="text-sm font-semibold mb-1">🤖 AI-Powered Personalization</h4>
        <p className="text-xs text-muted-foreground">
          These meals are tailored to your fitness goals, dietary preferences, and nutritional needs.
          All ingredients and portions are pre-calculated for optimal results.
        </p>
      </div>
    </div>
  );
}
