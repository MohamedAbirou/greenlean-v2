/**
 * Fitness Section - Complete Profile
 * Collects: gym access, equipment, workout location, injuries, fitness experience
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { cn } from '@/shared/design-system';
import { AlertCircle, Award, Blend, Building2, Home, Trees, X } from 'lucide-react';
import { useState } from 'react';
import type { CompleteProfileData } from '../../types/profile';

interface FitnessSectionProps {
  data: CompleteProfileData;
  onChange: (data: CompleteProfileData) => void;
}

const EQUIPMENT_OPTIONS = [
  'Dumbbells',
  'Barbell',
  'Kettlebells',
  'Resistance Bands',
  'Pull-up Bar',
  'Bench',
  'Yoga Mat',
  'Jump Rope',
  'None',
];

const WORKOUT_LOCATIONS = [
  { id: 'gym', label: 'Gym', icon: Building2 },
  { id: 'home', label: 'Home', icon: Home },
  { id: 'outdoor', label: 'Outdoor', icon: Trees },
  { id: 'mixed', label: 'Mixed', icon: Blend },
];

export function FitnessSection({ data, onChange }: FitnessSectionProps) {
  const [customInjury, setCustomInjury] = useState('');

  const handleEquipmentToggle = (equipment: string) => {
    const current = data.equipment_available || [];
    const updated = current.includes(equipment)
      ? current.filter(e => e !== equipment)
      : [...current, equipment];
    onChange({ ...data, equipment_available: updated });
  };

  const handleAddInjury = () => {
    if (customInjury.trim()) {
      const current = data.injuries_limitations || [];
      onChange({ ...data, injuries_limitations: [...current, customInjury.trim()] });
      setCustomInjury('');
    }
  };

  const handleRemoveInjury = (injury: string) => {
    const updated = (data.injuries_limitations || []).filter(i => i !== injury);
    onChange({ ...data, injuries_limitations: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Fitness Setup</h3>
        <p className="text-muted-foreground">Tell us about your workout environment</p>
      </div>

      {/* Gym Access */}
      <div>
        <Label className="mb-3 block">Do you have access to a gym?</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ ...data, gym_access: true })}
            className={cn(
              'p-4 rounded-xl border-2 text-center transition-all duration-300',
              data.gym_access === true
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                : 'border-border bg-card hover:border-primary-300'
            )}
          >
            <Building2 className={cn('w-8 h-8 mx-auto mb-2', data.gym_access === true ? 'text-primary-600' : 'text-muted-foreground')} />
            <span className={cn('font-semibold', data.gym_access === true ? 'text-primary-600' : 'text-foreground')}>
              Yes, I have gym access
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ ...data, gym_access: false })}
            className={cn(
              'p-4 rounded-xl border-2 text-center transition-all duration-300',
              data.gym_access === false
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                : 'border-border bg-card hover:border-primary-300'
            )}
          >
            <Home className={cn('w-8 h-8 mx-auto mb-2', data.gym_access === false ? 'text-primary-600' : 'text-muted-foreground')} />
            <span className={cn('font-semibold', data.gym_access === false ? 'text-primary-600' : 'text-foreground')}>
              No, I work out at home
            </span>
          </button>
        </div>
      </div>

      {/* Workout Location Preference */}
      <div>
        <Label className="mb-3 block">Where do you prefer to work out?</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {WORKOUT_LOCATIONS.map((location) => {
            const Icon = location.icon;
            const isSelected = data.workout_location_preference === location.id;

            return (
              <button
                key={location.id}
                type="button"
                onClick={() => onChange({ ...data, workout_location_preference: location.id as any })}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all duration-300',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                    : 'border-border bg-card hover:border-primary-300'
                )}
              >
                <Icon className={cn('w-6 h-6 mx-auto mb-2', isSelected ? 'text-primary-600' : 'text-muted-foreground')} />
                <span className={cn('text-sm font-semibold', isSelected ? 'text-primary-600' : 'text-foreground')}>
                  {location.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Equipment Available */}
      <div>
        <Label className="mb-3 block">What fitness equipment do you have available?</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <div key={equipment} className="flex items-center space-x-2">
              <Checkbox
                id={`equipment-${equipment}`}
                checked={(data.equipment_available || []).includes(equipment)}
                onCheckedChange={() => handleEquipmentToggle(equipment)}
              />
              <label
                htmlFor={`equipment-${equipment}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {equipment}
              </label>
            </div>
          ))}
        </div>

        {/* Selected Equipment */}
        {data.equipment_available && data.equipment_available.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-muted/50">
            {data.equipment_available.map((equipment) => (
              <Badge key={equipment} variant="secondary">
                {equipment}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Fitness Experience */}
      <div>
        <Label htmlFor="fitness_experience" className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4" />
          Fitness Experience Level
        </Label>
        <Select value={data.fitness_experience} onValueChange={(value: any) => onChange({ ...data, fitness_experience: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your experience level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner - New to fitness</SelectItem>
            <SelectItem value="intermediate">Intermediate - Regular exerciser</SelectItem>
            <SelectItem value="advanced">Advanced - Years of experience</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Injuries or Limitations */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-warning" />
          Injuries or Physical Limitations
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Let us know about any injuries or limitations so we can adjust your workouts accordingly.
        </p>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder="e.g., Knee injury, Lower back pain..."
            value={customInjury}
            onChange={(e) => setCustomInjury(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInjury())}
          />
          <Button type="button" onClick={handleAddInjury}>Add</Button>
        </div>

        {/* Selected Injuries */}
        {data.injuries_limitations && data.injuries_limitations.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.injuries_limitations.map((injury) => (
              <Badge key={injury} variant="error" className="flex items-center gap-1">
                {injury}
                <button
                  type="button"
                  onClick={() => handleRemoveInjury(injury)}
                  className="ml-1 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-success/10 border border-success text-sm text-success-foreground">
            ✅ No injuries or limitations reported
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-info/10 border border-info">
        <p className="text-sm text-info-foreground">
          💡 <strong>Tip:</strong> Being honest about injuries helps us create safe, effective workouts that won't aggravate existing conditions.
        </p>
      </div>
    </div>
  );
}
