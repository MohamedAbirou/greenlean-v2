import { Card } from '@/shared/components/ui/card';
import { motion } from 'framer-motion';
import { Check, TrendingDown, TrendingUp } from 'lucide-react';

interface NutritionGoalsProps {
  current: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

interface MacroProgressProps {
  name: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

function MacroProgress({ name, current, goal, unit, color }: MacroProgressProps) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const isComplete = current >= goal;
  const isOver = current > goal * 1.1; // 10% over

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{name}</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold">
            {Math.round(current)}/{goal}{unit}
          </span>
          {isComplete && !isOver && <Check className="h-4 w-4 text-green-600" />}
          {isOver && <TrendingUp className="h-4 w-4 text-amber-600" />}
        </div>
      </div>

      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} ${isOver ? 'opacity-75' : ''}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{Math.round(percentage)}% of goal</span>
        <span>{Math.round(goal - current)} {unit} remaining</span>
      </div>
    </div>
  );
}

export function NutritionGoals({ current, goals }: NutritionGoalsProps) {
  const caloriePercentage = goals.calories > 0 ? (current.calories / goals.calories) * 100 : 0;
  const isOnTrack = caloriePercentage >= 80 && caloriePercentage <= 110;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Daily Nutrition Goals</h3>
        <div className="flex items-center space-x-2">
          {isOnTrack ? (
            <div className="flex items-center text-green-600 text-sm">
              <Check className="h-4 w-4 mr-1" />
              On Track
            </div>
          ) : caloriePercentage > 110 ? (
            <div className="flex items-center text-amber-600 text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              Over Goal
            </div>
          ) : (
            <div className="flex items-center text-blue-600 text-sm">
              <TrendingDown className="h-4 w-4 mr-1" />
              Below Goal
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Calories */}
        <MacroProgress
          name="Calories"
          current={current.calories}
          goal={goals.calories}
          unit=" kcal"
          color="bg-gradient-to-r from-purple-500 to-pink-500"
        />

        {/* Protein */}
        <MacroProgress
          name="Protein"
          current={current.protein}
          goal={goals.protein}
          unit="g"
          color="bg-gradient-to-r from-red-500 to-orange-500"
        />

        {/* Carbs */}
        <MacroProgress
          name="Carbohydrates"
          current={current.carbs}
          goal={goals.carbs}
          unit="g"
          color="bg-gradient-to-r from-blue-500 to-cyan-500"
        />

        {/* Fats */}
        <MacroProgress
          name="Fats"
          current={current.fats}
          goal={goals.fats}
          unit="g"
          color="bg-gradient-to-r from-yellow-500 to-amber-500"
        />
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground text-center">
          {isOnTrack ? (
            <p>Great job! You're on track with your nutrition goals today. 🎯</p>
          ) : caloriePercentage > 110 ? (
            <p>You've exceeded your calorie goal. Consider lighter meals for the rest of the day.</p>
          ) : (
            <p>You have {Math.round(goals.calories - current.calories)} calories remaining today.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
