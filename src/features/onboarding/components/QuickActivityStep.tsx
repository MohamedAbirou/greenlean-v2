/**
 * QuickActivityStep - Question 2 of 3
 * Activity level selection - critical for calorie calculation
 * Uses design system components only
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, buttonVariants } from '@/shared/components/ui/button';
import { Activity, Armchair, Footprints, Bike, Zap, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/design-system';

interface QuickActivityStepProps {
  initialData?: {
    activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  };
  onComplete: (data: { activityLevel: string }) => void;
  onBack: () => void;
}

const ACTIVITY_LEVELS = [
  {
    id: 'sedentary',
    title: 'Minimal Activity',
    description: 'Desk job, little to no exercise',
    detail: 'Less than 3,000 steps/day',
    icon: Armchair,
    gradient: 'from-gray-500 to-gray-600',
    multiplier: '1.2x',
  },
  {
    id: 'lightly_active',
    title: 'Lightly Active',
    description: 'Light exercise 1-3 days/week',
    detail: '3,000-6,000 steps/day',
    icon: Footprints,
    gradient: 'from-blue-400 to-blue-500',
    multiplier: '1.375x',
  },
  {
    id: 'moderately_active',
    title: 'Moderately Active',
    description: 'Exercise 3-5 days/week',
    detail: '6,000-10,000 steps/day',
    icon: Bike,
    gradient: 'from-green-500 to-emerald-500',
    multiplier: '1.55x',
  },
  {
    id: 'very_active',
    title: 'Very Active',
    description: 'Hard exercise 6-7 days/week',
    detail: '10,000-12,000 steps/day',
    icon: Activity,
    gradient: 'from-orange-500 to-red-500',
    multiplier: '1.725x',
  },
  {
    id: 'extremely_active',
    title: 'Extremely Active',
    description: 'Physical job + daily training',
    detail: '12,000+ steps/day',
    icon: Zap,
    gradient: 'from-purple-500 to-pink-500',
    multiplier: '1.9x',
  },
];

export function QuickActivityStep({ initialData, onComplete, onBack }: QuickActivityStepProps) {
  const [selectedActivity, setSelectedActivity] = useState(initialData?.activityLevel || '');

  const isValid = selectedActivity !== '';

  const handleContinue = () => {
    if (!isValid) return;
    onComplete({ activityLevel: selectedActivity });
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-success to-primary-500 mb-4"
          >
            <Activity className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            How active are you?
          </h2>
          <p className="text-muted-foreground text-lg">
            Question 2 of 3 • This helps us calculate your calorie needs
          </p>
        </div>

        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {ACTIVITY_LEVELS.map((activity, index) => {
            const Icon = activity.icon;
            const isSelected = selectedActivity === activity.id;

            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedActivity(activity.id)}
                className={cn(
                  'relative p-5 rounded-2xl text-left transition-all duration-300',
                  'border-2',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-xl'
                    : 'border-border bg-card hover:border-muted-foreground/30 hover:shadow-md'
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="selected-activity"
                    className="absolute inset-0 bg-gradient-to-br from-primary-100/60 to-secondary-100/60 dark:from-primary-900/40 dark:to-secondary-900/40 rounded-2xl"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}

                <div className="relative">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br mb-3',
                    activity.gradient
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    {activity.detail}
                  </p>

                  {/* Multiplier Badge */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {activity.multiplier} BMR
                    </span>
                  </div>

                  {/* Checkmark */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-0 right-0 w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center"
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

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={onBack}
            variant="outline"
            size="lg"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'min-w-[120px]')}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
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
