/**
 * QuickGoalStep - Question 1 of 3
 * Streamlined goal selection with beautiful design
 * Uses design system components only
 */

import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface QuickGoalStepProps {
  initialData?: {
    mainGoal?: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
    targetWeight?: number;
  };
  onComplete: (data: { mainGoal: string; targetWeight?: number }) => void;
  onBack?: () => void;
}

const GOALS = [
  {
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Burn fat, feel lighter',
    icon: TrendingDown,
    gradient: 'from-red-500 to-orange-500',
  },
  {
    id: 'gain_muscle',
    title: 'Gain Muscle',
    description: 'Build strength & size',
    icon: TrendingUp,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'maintain',
    title: 'Stay Healthy',
    description: 'Maintain current weight',
    icon: Target,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'improve_health',
    title: 'Feel Better',
    description: 'Overall wellness',
    icon: Heart,
    gradient: 'from-purple-500 to-pink-500',
  },
];

export function QuickGoalStep({ initialData, onComplete, onBack }: QuickGoalStepProps) {
  const [selectedGoal, setSelectedGoal] = useState(initialData?.mainGoal || '');
  const [displayTargetWeight, setDisplayTargetWeight] = useState('');

  useEffect(() => {
    // Initialize display value if initialData exists
    if (initialData?.targetWeight) {
      setDisplayTargetWeight(initialData.targetWeight.toString());
    }
  }, [initialData?.targetWeight]);

  const showTargetWeight = selectedGoal === 'lose_weight' || selectedGoal === 'gain_muscle';
  const isValid = selectedGoal && (!showTargetWeight || displayTargetWeight);

  const handleContinue = () => {
    if (!isValid) return;

    const targetWeight = showTargetWeight && displayTargetWeight
      ? Number(displayTargetWeight)
      : undefined;

    onComplete({
      mainGoal: selectedGoal,
      targetWeight,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 mb-4"
          >
            <Target className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            What's your main goal?
          </h2>
          <p className="text-muted-foreground text-lg">
            Question 2 of 4 • We'll personalize everything for you
          </p>
        </div>

        {/* Goal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {GOALS.map((goal, index) => {
            const Icon = goal.icon;
            const isSelected = selectedGoal === goal.id;

            return (
              <motion.button
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedGoal(goal.id)}
                className={cn(
                  'relative p-6 rounded-2xl text-left transition-all duration-300',
                  'border-2',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selected-goal"
                    className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-secondary-100/50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-2xl"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}

                <div className="relative flex items-start gap-4">
                  <div className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br',
                    goal.gradient
                  )}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Target Weight (conditional) */}
        {showTargetWeight && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card variant="outline" padding="lg" className="max-w-md mx-auto">
              <Label htmlFor="targetWeight" className="text-base font-semibold mb-3 block">
                What's your target weight? (Kg)
              </Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                placeholder={'e.g., 70'}
                value={displayTargetWeight}
                onChange={(e) => setDisplayTargetWeight(e.target.value)}
                className="text-lg h-12"
              />
              <p className="text-sm text-muted-foreground mt-2">
                We'll create a safe, sustainable plan to help you reach your goal
              </p>
            </Card>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              size="lg"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'min-w-[120px]')}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          )}
          {!onBack && <div />}
          <Button
            onClick={handleContinue}
            disabled={!isValid}
            size="lg"
            className={cn(
              buttonVariants({ variant: 'primary', size: 'lg' }),
              'min-w-[200px] h-14 text-lg font-semibold'
            )}
          >
            Continue
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
