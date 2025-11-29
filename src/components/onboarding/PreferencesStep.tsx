import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Slider } from '@/shared/components/ui/slider';
import { Apple, Dumbbell, Clock, Zap } from 'lucide-react';
import type { OnboardingData } from '@/pages/Onboarding';

interface PreferencesStepProps {
  initialData: Partial<OnboardingData>;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const DIET_TYPES = [
  { value: 'balanced' as const, label: 'Balanced', description: 'Mix of all food groups' },
  { value: 'keto' as const, label: 'Keto', description: 'Low carb, high fat' },
  { value: 'vegetarian' as const, label: 'Vegetarian', description: 'No meat or fish' },
  { value: 'vegan' as const, label: 'Vegan', description: 'No animal products' },
  { value: 'paleo' as const, label: 'Paleo', description: 'Whole foods, no grains' },
  { value: 'mediterranean' as const, label: 'Mediterranean', description: 'Plant-based, healthy fats' },
];

const DIETARY_RESTRICTIONS = [
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Soy-Free',
  'Shellfish-Free',
  'Egg-Free',
];

const WORKOUT_TYPES = [
  { value: 'strength' as const, label: 'Strength Training', description: 'Build muscle and power' },
  { value: 'cardio' as const, label: 'Cardio', description: 'Improve endurance' },
  { value: 'mixed' as const, label: 'Mixed', description: 'Combination of both' },
  { value: 'flexibility' as const, label: 'Flexibility', description: 'Yoga and stretching' },
];

export function PreferencesStep({ initialData, onComplete, onBack }: PreferencesStepProps) {
  const [dietType, setDietType] = useState<OnboardingData['dietType'] | undefined>(
    initialData.dietType || 'balanced'
  );
  const [restrictions, setRestrictions] = useState<string[]>(
    initialData.dietaryRestrictions || []
  );
  const [workoutFrequency, setWorkoutFrequency] = useState<number>(
    initialData.workoutFrequency || 3
  );
  const [workoutDuration, setWorkoutDuration] = useState<number>(
    initialData.workoutDuration || 45
  );
  const [workoutType, setWorkoutType] = useState<OnboardingData['workoutType'] | undefined>(
    initialData.workoutType || 'mixed'
  );

  const toggleRestriction = (restriction: string) => {
    setRestrictions(prev =>
      prev.includes(restriction)
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const handleContinue = () => {
    if (!dietType || !workoutType) return;

    onComplete({
      dietType,
      dietaryRestrictions: restrictions,
      workoutFrequency,
      workoutDuration,
      workoutType,
    });
  };

  const isValid = dietType && workoutType;

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Customize your preferences</h2>
        <p className="text-muted-foreground">
          We'll tailor your meal and workout plans to match your lifestyle
        </p>
      </div>

      <div className="space-y-8">
        {/* Diet Type */}
        <div>
          <Label htmlFor="dietType" className="flex items-center gap-2 mb-3">
            <Apple className="w-4 h-4" />
            Dietary Preference
          </Label>
          <Select value={dietType} onValueChange={(value) => setDietType(value as OnboardingData['dietType'])}>
            <SelectTrigger>
              <SelectValue placeholder="Select your diet type" />
            </SelectTrigger>
            <SelectContent>
              {DIET_TYPES.map((diet) => (
                <SelectItem key={diet.value} value={diet.value}>
                  <div>
                    <div className="font-medium">{diet.label}</div>
                    <div className="text-xs text-muted-foreground">{diet.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <Label className="mb-3 block">Dietary Restrictions (Optional)</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DIETARY_RESTRICTIONS.map((restriction) => (
              <div key={restriction} className="flex items-center space-x-2">
                <Checkbox
                  id={restriction}
                  checked={restrictions.includes(restriction)}
                  onCheckedChange={() => toggleRestriction(restriction)}
                />
                <Label
                  htmlFor={restriction}
                  className="text-sm cursor-pointer"
                >
                  {restriction}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Type */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <Dumbbell className="w-4 h-4" />
            Workout Preference
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WORKOUT_TYPES.map((workout) => {
              const isSelected = workoutType === workout.value;

              return (
                <motion.button
                  key={workout.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setWorkoutType(workout.value)}
                  className={`
                    p-4 rounded-lg border-2 transition-all text-left
                    ${
                      isSelected
                        ? 'border-green-600 bg-green-50 dark:bg-green-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <h4 className="font-semibold mb-1">{workout.label}</h4>
                  <p className="text-sm text-muted-foreground">{workout.description}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Workout Frequency */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4" />
            Workout Frequency: <span className="text-green-600 font-semibold">{workoutFrequency} days/week</span>
          </Label>
          <Slider
            value={[workoutFrequency]}
            onValueChange={(value) => setWorkoutFrequency(value[0])}
            min={1}
            max={7}
            step={1}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>1 day</span>
            <span>7 days</span>
          </div>
        </div>

        {/* Workout Duration */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4" />
            Session Duration: <span className="text-green-600 font-semibold">{workoutDuration} minutes</span>
          </Label>
          <Slider
            value={[workoutDuration]}
            onValueChange={(value) => setWorkoutDuration(value[0])}
            min={15}
            max={120}
            step={15}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>15 min</span>
            <span>2 hours</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!isValid} size="lg" className="bg-green-600 hover:bg-green-700">
          Complete Setup
        </Button>
      </div>
    </Card>
  );
}
