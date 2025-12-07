/**
 * Basic Info Section - Complete Profile
 * Collects: age, gender, height, weight, target weight, goal, activity level
 */

import { useState, useEffect } from 'react';
import { Scale, Ruler, Calendar, Target, Activity, TrendingDown, TrendingUp, Heart, Globe } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn } from '@/shared/design-system';
import type { CompleteProfileData } from '../../types/profile';
import type { UnitSystem } from '@/services/unitConversion';
import { formatWeight, formatHeight, parseWeight, parseHeight } from '@/services/unitConversion';
import { CountrySelect } from '@/shared/components/ui/country-select';

interface BasicInfoSectionProps {
  data: CompleteProfileData;
  onChange: (data: CompleteProfileData) => void;
  unitSystem: UnitSystem;
  country: string;
  onCountryChange: (country: string, unitSystem: UnitSystem) => void;
}

const GOALS = [
  { id: 'lose_weight', label: 'Lose Weight', icon: TrendingDown, color: 'text-red-500' },
  { id: 'gain_muscle', label: 'Gain Muscle', icon: TrendingUp, color: 'text-blue-500' },
  { id: 'maintain', label: 'Stay Healthy', icon: Target, color: 'text-green-500' },
  { id: 'improve_health', label: 'Feel Better', icon: Heart, color: 'text-purple-500' },
];

export function BasicInfoSection({ data, onChange, unitSystem, country, onCountryChange }: BasicInfoSectionProps) {
  // Display values in user's preferred unit system
  const [displayWeight, setDisplayWeight] = useState('');
  const [displayTargetWeight, setDisplayTargetWeight] = useState('');
  const [displayHeight, setDisplayHeight] = useState('');
  const [displayHeightFeet, setDisplayHeightFeet] = useState('');
  const [displayHeightInches, setDisplayHeightInches] = useState('');

  // Initialize display values from metric storage
  useEffect(() => {
    if (data.weight_kg) {
      const formatted = formatWeight(data.weight_kg, unitSystem);
      setDisplayWeight(formatted.value.toString());
    }
    if (data.target_weight_kg) {
      const formatted = formatWeight(data.target_weight_kg, unitSystem);
      setDisplayTargetWeight(formatted.value.toString());
    }
    if (data.height_cm) {
      if (unitSystem === 'imperial') {
        const formatted = formatHeight(data.height_cm, unitSystem);
        if (formatted.feet && formatted.inches !== undefined) {
          setDisplayHeightFeet(formatted.feet.toString());
          setDisplayHeightInches(formatted.inches.toString());
        }
      } else {
        setDisplayHeight(data.height_cm.toString());
      }
    }
  }, [data.weight_kg, data.target_weight_kg, data.height_cm, unitSystem]);

  const handleWeightChange = (value: string) => {
    setDisplayWeight(value);
    if (value) {
      const kg = parseWeight(Number(value), unitSystem === 'imperial' ? 'lbs' : 'kg');
      onChange({ ...data, weight_kg: kg });
    }
  };

  const handleTargetWeightChange = (value: string) => {
    setDisplayTargetWeight(value);
    if (value) {
      const kg = parseWeight(Number(value), unitSystem === 'imperial' ? 'lbs' : 'kg');
      onChange({ ...data, target_weight_kg: kg });
    }
  };

  const handleHeightChange = (value: string) => {
    setDisplayHeight(value);
    if (value) {
      const cm = parseHeight(Number(value), 'cm');
      onChange({ ...data, height_cm: cm });
    }
  };

  const handleHeightImperialChange = (feet: string, inches: string) => {
    setDisplayHeightFeet(feet);
    setDisplayHeightInches(inches);
    if (feet && inches !== undefined) {
      const cm = parseHeight({ feet: Number(feet), inches: Number(inches) }, 'ft/in');
      onChange({ ...data, height_cm: cm });
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

      {/* Age, Gender & Country */}
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

        <div>
          <Label htmlFor="country" className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4" />
            Country
          </Label>
          <CountrySelect
            value={country}
            onValueChange={onCountryChange}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Units: {unitSystem === 'imperial' ? 'lbs, ft/in' : 'kg, cm'}
          </p>
        </div>
      </div>

      {/* Physical Measurements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Weight */}
        <div>
          <Label htmlFor="weight" className="flex items-center gap-2 mb-2">
            <Scale className="w-4 h-4" />
            Current Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min={unitSystem === 'imperial' ? '66' : '30'}
            max={unitSystem === 'imperial' ? '550' : '250'}
            placeholder={unitSystem === 'imperial' ? 'e.g., 154' : 'e.g., 70'}
            value={displayWeight}
            onChange={(e) => handleWeightChange(e.target.value)}
          />
        </div>

        {/* Target Weight */}
        <div>
          <Label htmlFor="target_weight" className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4" />
            Target Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
          </Label>
          <Input
            id="target_weight"
            type="number"
            step="0.1"
            min={unitSystem === 'imperial' ? '66' : '30'}
            max={unitSystem === 'imperial' ? '550' : '250'}
            placeholder={unitSystem === 'imperial' ? 'e.g., 145' : 'e.g., 65'}
            value={displayTargetWeight}
            onChange={(e) => handleTargetWeightChange(e.target.value)}
          />
        </div>

        {/* Height */}
        {unitSystem === 'metric' ? (
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
        ) : (
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4" />
              Height (ft/in)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                step="1"
                min="3"
                max="8"
                placeholder="ft"
                value={displayHeightFeet}
                onChange={(e) => handleHeightImperialChange(e.target.value, displayHeightInches)}
              />
              <Input
                type="number"
                step="1"
                min="0"
                max="11"
                placeholder="in"
                value={displayHeightInches}
                onChange={(e) => handleHeightImperialChange(displayHeightFeet, e.target.value)}
              />
            </div>
          </div>
        )}
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
