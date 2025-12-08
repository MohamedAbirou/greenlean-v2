/**
 * QuickDietStep - Question 3 of 3
 * Dietary preference selection - final question!
 * Uses design system components only
 */

import { Button, buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/design-system';
import { motion } from 'framer-motion';
import { Apple, Beef, ChevronLeft, Fish, Heart, Leaf, Sparkles, Wheat } from 'lucide-react';
import { useState } from 'react';

interface QuickDietStepProps {
  initialData?: {
    dietaryStyle?: 'balanced' | 'keto' | 'vegetarian' | 'vegan' | 'paleo' | 'mediterranean';
  };
  onComplete: (data: { dietaryStyle: string }) => void;
  onBack: () => void;
}

const DIET_TYPES = [
  {
    id: 'balanced',
    title: 'Balanced',
    description: 'Mix of all food groups',
    detail: 'Most flexible option',
    icon: Apple,
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'keto',
    title: 'Keto',
    description: 'Low carb, high fat',
    detail: 'Under 50g carbs/day',
    icon: Beef,
    gradient: 'from-orange-500 to-red-500',
  },
  {
    id: 'vegetarian',
    title: 'Vegetarian',
    description: 'No meat or fish',
    detail: 'Plant-based + dairy/eggs',
    icon: Leaf,
    gradient: 'from-green-400 to-teal-500',
  },
  {
    id: 'vegan',
    title: 'Vegan',
    description: 'No animal products',
    detail: '100% plant-based',
    icon: Leaf,
    gradient: 'from-lime-500 to-green-600',
  },
  {
    id: 'paleo',
    title: 'Paleo',
    description: 'Whole foods, no grains',
    detail: 'Like our ancestors',
    icon: Wheat,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'mediterranean',
    title: 'Mediterranean',
    description: 'Fish, olive oil, veggies',
    detail: 'Heart-healthy fats',
    icon: Fish,
    gradient: 'from-blue-500 to-cyan-500',
  },
];

export function QuickDietStep({ initialData, onComplete, onBack }: QuickDietStepProps) {
  const [selectedDiet, setSelectedDiet] = useState(initialData?.dietaryStyle || '');

  const isValid = selectedDiet !== '';

  const handleContinue = () => {
    if (!isValid) return;
    onComplete({ dietaryStyle: selectedDiet });
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-warning to-error mb-4"
          >
            <Apple className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Any dietary preferences?
          </h2>
          <p className="text-muted-foreground text-lg">
            Question 4 of 4 • Almost done! 🎉
          </p>
        </div>

        {/* Diet Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {DIET_TYPES.map((diet, index) => {
            const Icon = diet.icon;
            const isSelected = selectedDiet === diet.id;

            return (
              <motion.button
                key={diet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ scale: 1.05, y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedDiet(diet.id)}
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
                    layoutId="selected-diet"
                    className="absolute inset-0 bg-gradient-to-br from-primary-100/60 to-secondary-100/60 dark:from-primary-900/40 dark:to-secondary-900/40 rounded-2xl"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}

                <div className="relative">
                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br mb-3',
                    diet.gradient
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {diet.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1.5">
                    {diet.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {diet.detail}
                  </p>

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

        {/* Info Callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-foreground">
                <strong className="font-semibold">Don't worry!</strong> You can always adjust your preferences later in settings. We'll also consider any allergies or food restrictions you specify in your profile.
              </p>
            </div>
          </div>
        </motion.div>

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
              'min-w-[240px] h-14 text-lg font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700'
            )}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Create My Plan!
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
