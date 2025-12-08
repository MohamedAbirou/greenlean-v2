/**
 * Basic Info Section - Complete Profile
 * Collects: age, gender, height, weight, target weight, goal, activity level
 */

import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn } from '@/shared/design-system';
import { Activity, Calendar, Heart, Ruler, Scale, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CompleteProfileData } from '../../types/profile';

interface BasicInfoSectionProps {
  data: CompleteProfileData;
  onChange: (data: CompleteProfileData) => void;
}

const GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: TrendingDown, color: 'text-red-500' },
  { id: 'gain_muscle', label: 'Gain Muscle', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'maintain', label: 'Stay Healthy', icon: Target, color: 'text-green-500' },
  { id: 'improve_health', label: 'Feel Better', icon: Heart, color: 'text-purple-500' },
];

export function BasicInfoSection({ data, onChange }: BasicInfoSectionProps) {
  // Display values in user's preferred unit system
  const [displayWeight, setDisplayWeight] = useState('');
  const [displayTargetWeight, setDisplayTargetWeight] = useState('');
  const [displayHeight, setDisplayHeight] = useState('');

  // Initialize display values from metric storage
  useEffect(() => {
    if (data.weight) {
      setDisplayWeight(data.weight.toString());
    }
    if (data.target_weight) {
      setDisplayTargetWeight(data.target_weight.toString());
    }
    if (data.height) {
      setDisplayHeight(data.height.toString());
    }
  }, [data.weight, data.target_weight, data.height]);

  const handleWeightChange = (value: string) => {
    setDisplayWeight(value);
    if (value) {
      onChange({ ...data, weight: Number(value) });
    }
  };

  const handleTargetWeightChange = (value: string) => {
    setDisplayTargetWeight(value);
    if (value) {
      onChange({ ...data, target_weight: Number(value) });
    }
  };

  const handleHeightChange = (value: string) => {
    setDisplayHeight(value);
    if (value) {
      onChange({ ...data, height: Number(value) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Basic Information</h3>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>

      {/* Goal Selection */}
      <div>
        <Label className="text-base font-semibold mb-3 block">What's your main goal?</Label>
        <div className="grid grid-cols-2 gap-3">
          {GOALS.map((goal) => {
            const Icon = goal.icon;
            const isSelected = data.main_goal === goal.id;

            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => onChange({ ...data, main_goal: goal.id as any })}
                className={cn(
                  'p-4 rounded-xl border-2 text-left transition-all duration-300',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                    : 'border-border bg-card hover:border-primary-300'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-6 h-6', isSelected ? 'text-primary-600' : goal.color)} />
                  <span className={cn('font-semibold', isSelected ? 'text-primary-600' : 'text-foreground')}>
                    {goal.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Age, Gender */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="age" className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            Age (years)
          </Label>
          <Input
            id="age"
            type="number"
            min="13"
            max="120"
            placeholder="e.g., 30"
            value={data.age || ''}
            onChange={(e) => onChange({ ...data, age: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        <div>
          <Label htmlFor="gender" className="mb-2 block">Gender</Label>
          <Select value={data.gender} onValueChange={(value: any) => onChange({ ...data, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Physical Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Weight */}
        <div>
          <Label htmlFor="weight" className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4" />
            Current Weight (Kg)
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min={'30'}
            max={'250'}
            placeholder={'e.g., 70'}
            value={displayWeight}
            onChange={(e) => handleWeightChange(e.target.value)}
          />
        </div>

        {/* Target Weight */}
        <div>
          <Label htmlFor="target_weight" className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" />
            Target Weight (Kg)
          </Label>
          <Input
            id="target_weight"
            type="number"
            step="0.1"
            min={'30'}
            max={'250'}
            placeholder={'e.g., 65'}
            value={displayTargetWeight}
            onChange={(e) => handleTargetWeightChange(e.target.value)}
          />
        </div>

        {/* Height */}
        <div>
          <Label htmlFor="height" className="flex items-center gap-2 mb-2">
            <Ruler className="w-4 h-4" />
            Height (cm)
          </Label>
          <Input
            id="height"
            type="number"
            step="1"
            min="120"
            max="250"
            placeholder="e.g., 170"
            value={displayHeight}
            onChange={(e) => handleHeightChange(e.target.value)}
          />
        </div>
      </div>

      {/* Activity Level */}
      <div>
        <Label htmlFor="activity_level" className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4" />
          Activity Level
        </Label>
        <Select value={data.activity_level} onValueChange={(value: any) => onChange({ ...data, activity_level: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sedentary (little to no exercise)</SelectItem>
            <SelectItem value="lightly_active">Lightly Active (1-2 days/week)</SelectItem>
            <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
            <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
            <SelectItem value="extremely_active">Extremely Active (athlete level)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Dietary Preference */}
      <div>
        <Label htmlFor="dietary_preference" className="mb-2 block">Dietary Style Preference</Label>
        <Select value={data.dietary_preference} onValueChange={(value: any) => onChange({ ...data, dietary_preference: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select dietary style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="balanced">Balanced</SelectItem>
            <SelectItem value="keto">Keto</SelectItem>
            <SelectItem value="vegetarian">Vegetarian</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="paleo">Paleo</SelectItem>
            <SelectItem value="mediterranean">Mediterranean</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
