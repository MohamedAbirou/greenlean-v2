import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { User, Ruler, Weight, Calendar, Activity } from 'lucide-react';
import type { OnboardingData } from '@/pages/Onboarding';

interface StatsStepProps {
  initialData: Partial<OnboardingData>;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

const ACTIVITY_LEVELS = [
  {
    value: 'sedentary' as const,
    label: 'Sedentary',
    description: 'Little or no exercise',
  },
  {
    value: 'lightly_active' as const,
    label: 'Lightly Active',
    description: 'Exercise 1-3 days/week',
  },
  {
    value: 'moderately_active' as const,
    label: 'Moderately Active',
    description: 'Exercise 3-5 days/week',
  },
  {
    value: 'very_active' as const,
    label: 'Very Active',
    description: 'Exercise 6-7 days/week',
  },
  {
    value: 'extremely_active' as const,
    label: 'Extremely Active',
    description: 'Physical job + exercise',
  },
];

export function StatsStep({ initialData, onComplete, onBack }: StatsStepProps) {
  const [age, setAge] = useState<number | undefined>(initialData.age);
  const [gender, setGender] = useState<OnboardingData['gender'] | undefined>(initialData.gender);
  const [height, setHeight] = useState<number | undefined>(initialData.height);
  const [weight, setWeight] = useState<number | undefined>(initialData.weight);
  const [activityLevel, setActivityLevel] = useState<OnboardingData['activityLevel'] | undefined>(
    initialData.activityLevel
  );

  const handleContinue = () => {
    if (!age || !gender || !height || !weight || !activityLevel) return;

    onComplete({
      age,
      gender,
      height,
      weight,
      activityLevel,
    });
  };

  const isValid = age && gender && height && weight && activityLevel;

  return (
    <Card className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
        <p className="text-muted-foreground">
          This helps us calculate your personalized nutrition and workout plans
        </p>
      </div>

      <div className="space-y-6">
        {/* Age */}
        <div>
          <Label htmlFor="age" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Age
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="e.g., 25"
            value={age || ''}
            onChange={(e) => setAge(Number(e.target.value))}
            className="mt-2"
            min="13"
            max="120"
          />
        </div>

        {/* Gender */}
        <div>
          <Label className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4" />
            Gender
          </Label>
          <RadioGroup value={gender} onValueChange={(value) => setGender(value as OnboardingData['gender'])}>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2 flex-1">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="cursor-pointer">Female</Label>
              </div>
              <div className="flex items-center space-x-2 flex-1">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="cursor-pointer">Other</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height" className="flex items-center gap-2">
              <Ruler className="w-4 h-4" />
              Height (cm)
            </Label>
            <Input
              id="height"
              type="number"
              placeholder="e.g., 175"
              value={height || ''}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="mt-2"
              min="100"
              max="250"
            />
          </div>

          <div>
            <Label htmlFor="weight" className="flex items-center gap-2">
              <Weight className="w-4 h-4" />
              Current Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g., 70"
              value={weight || ''}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-2"
              min="30"
              max="300"
            />
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <Label htmlFor="activityLevel" className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4" />
            Activity Level
          </Label>
          <Select value={activityLevel} onValueChange={(value) => setActivityLevel(value as OnboardingData['activityLevel'])}>
            <SelectTrigger>
              <SelectValue placeholder="Select your activity level" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div>
                    <div className="font-medium">{level.label}</div>
                    <div className="text-xs text-muted-foreground">{level.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button onClick={onBack} variant="outline" size="lg">
          Back
        </Button>
        <Button onClick={handleContinue} disabled={!isValid} size="lg">
          Continue
        </Button>
      </div>
    </Card>
  );
}
