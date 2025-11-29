import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Target, TrendingDown, TrendingUp, Heart } from 'lucide-react';
import type { OnboardingData } from '@/pages/Onboarding';

interface GoalsStepProps {
  initialData: Partial<OnboardingData>;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const GOALS = [
  {
    id: 'lose_weight' as const,
    title: 'Lose Weight',
    description: 'Burn fat and achieve your target weight',
    icon: TrendingDown,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
  },
  {
    id: 'gain_muscle' as const,
    title: 'Gain Muscle',
    description: 'Build strength and muscle mass',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  {
    id: 'maintain' as const,
    title: 'Maintain Weight',
    description: 'Stay healthy and maintain current weight',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  {
    id: 'improve_health' as const,
    title: 'Improve Health',
    description: 'Focus on overall wellness and vitality',
    icon: Heart,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  },
];

export function GoalsStep({ initialData, onComplete }: GoalsStepProps) {
  const [selectedGoal, setSelectedGoal] = useState<OnboardingData['goal'] | undefined>(
    initialData.goal
  );
  const [targetWeight, setTargetWeight] = useState<number | undefined>(
    initialData.targetWeight
  );

  const showTargetWeight = selectedGoal === 'lose_weight' || selectedGoal === 'gain_muscle';

  const handleContinue = () => {
    if (!selectedGoal) return;

    onComplete({
      goal: selectedGoal,
      targetWeight: showTargetWeight ? targetWeight : undefined,
    });
  };

  const isValid = selectedGoal && (!showTargetWeight || targetWeight);

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">What's your primary goal?</h2>
        <p className="text-muted-foreground">
          We'll personalize your experience based on your fitness objective
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const isSelected = selectedGoal === goal.id;

          return (
            <motion.button
              key={goal.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedGoal(goal.id)}
              className={`
                relative p-6 rounded-lg border-2 transition-all text-left
                ${
                  isSelected
                    ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              {isSelected && (
                <motion.div
                  layoutId="selected-goal"
                  className="absolute inset-0 bg-green-100/50 dark:bg-green-900/20 rounded-lg"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}

              <div className="relative flex items-start gap-4">
                <div className={`p-3 rounded-lg ${goal.bgColor}`}>
                  <Icon className={`w-6 h-6 ${goal.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{goal.title}</h3>
                  <p className="text-sm text-muted-foreground">{goal.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {showTargetWeight && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6"
        >
          <Label htmlFor="targetWeight">Target Weight (kg)</Label>
          <Input
            id="targetWeight"
            type="number"
            placeholder="e.g., 70"
            value={targetWeight || ''}
            onChange={(e) => setTargetWeight(Number(e.target.value))}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            We'll help you reach your goal safely and sustainably
          </p>
        </motion.div>
      )}

      <div className="flex justify-end">
        <Button onClick={handleContinue} disabled={!isValid} size="lg">
          Continue
        </Button>
      </div>
    </Card>
  );
}
