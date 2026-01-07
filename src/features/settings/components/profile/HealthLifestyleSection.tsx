/**
 * Health & Lifestyle Section - Complete Profile
 * Collects: health conditions, medications, sleep quality, stress level,
 * energy level, work schedule, family size, dietary restrictions
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Slider } from '@/shared/components/ui/slider';
import { Brain, Heart, Moon, Pill, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import type { CompleteProfileData } from '../../types/profile';

interface HealthLifestyleSectionProps {
  data: CompleteProfileData;
  onChange: (data: CompleteProfileData) => void;
}

const DIETARY_RESTRICTIONS = [
  'Halal',
  'Kosher',
  'Low Sodium',
  'Low Sugar',
  'Diabetic-friendly',
  'Heart-healthy',
  'FODMAP',
];

export function HealthLifestyleSection({ data, onChange }: HealthLifestyleSectionProps) {
  const [customCondition, setCustomCondition] = useState('');
  const [customMedication, setCustomMedication] = useState('');

  const handleAddCondition = () => {
    if (customCondition.trim()) {
      const current = data.health_conditions || [];
      onChange({ ...data, health_conditions: [...current, customCondition.trim()] });
      setCustomCondition('');
    }
  };

  const handleRemoveCondition = (condition: string) => {
    const updated = (data.health_conditions || []).filter(c => c !== condition);
    onChange({ ...data, health_conditions: updated });
  };

  const handleAddMedication = () => {
    if (customMedication.trim()) {
      const current = data.medications || [];
      onChange({ ...data, medications: [...current, customMedication.trim()] });
      setCustomMedication('');
    }
  };

  const handleRemoveMedication = (medication: string) => {
    const updated = (data.medications || []).filter(m => m !== medication);
    onChange({ ...data, medications: updated });
  };

  const handleRestrictionToggle = (restriction: string) => {
    const current = data.dietary_restrictions || [];
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    onChange({ ...data, dietary_restrictions: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Health & Lifestyle</h3>
        <p className="text-muted-foreground">Final details to optimize your experience</p>
      </div>

      {/* Health Conditions */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-error" />
          Health Conditions
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Any health conditions we should know about (e.g., diabetes, high blood pressure)?
        </p>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder="e.g., Diabetes, High blood pressure..."
            value={customCondition}
            onChange={(e) => setCustomCondition(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCondition())}
          />
          <Button type="button" onClick={handleAddCondition}>Add</Button>
        </div>

        {data.health_conditions && data.health_conditions.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.health_conditions.map((condition) => (
              <Badge key={condition} variant="error" className="flex items-center gap-1">
                {condition}
                <button
                  type="button"
                  onClick={() => handleRemoveCondition(condition)}
                  className="ml-1 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-success/10 border border-success text-sm text-success-foreground">
            ✅ No health conditions reported
          </div>
        )}
      </div>

      {/* Medications */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Pill className="w-4 h-4 text-info" />
          Current Medications
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          List any medications you're currently taking (optional but helpful).
        </p>

        <div className="flex gap-2 mb-3">
          <Input
            placeholder="e.g., Metformin, Blood pressure medication..."
            value={customMedication}
            onChange={(e) => setCustomMedication(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMedication())}
          />
          <Button type="button" onClick={handleAddMedication}>Add</Button>
        </div>

        {data.medications && data.medications.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.medications.map((medication) => (
              <Badge key={medication} variant="info" className="flex items-center gap-1">
                {medication}
                <button
                  type="button"
                  onClick={() => handleRemoveMedication(medication)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            No medications listed
          </div>
        )}
      </div>

      {/* Sleep Quality Slider */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Moon className="w-4 h-4 text-primary" />
          Sleep Quality
        </Label>
        <div className="space-y-3">
          <Slider
            value={[data.sleep_quality || 5]}
            onValueChange={(value) => onChange({ ...data, sleep_quality: value[0] })}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Very Poor</span>
            <span className="font-semibold text-primary-600">{data.sleep_quality || 5}/10</span>
            <span>Excellent</span>
          </div>
        </div>
      </div>

      {/* Stress Level Slider */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-warning" />
          Stress Level
        </Label>
        <div className="space-y-3">
          <Slider
            value={[data.stress_level || 5]}
            onValueChange={(value) => onChange({ ...data, stress_level: value[0] })}
            min={1}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Very Calm</span>
            <span className="font-semibold text-warning-600">{data.stress_level || 5}/10</span>
            <span>Very Stressed</span>
          </div>
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-4 h-4" />
          Dietary Restrictions (optional)
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <div key={restriction} className="flex items-center space-x-2">
              <Checkbox
                id={`restriction-${restriction}`}
                checked={(data.dietary_restrictions || []).includes(restriction)}
                onCheckedChange={() => handleRestrictionToggle(restriction)}
              />
              <label
                htmlFor={`restriction-${restriction}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {restriction}
              </label>
            </div>
          ))}
        </div>

        {data.dietary_restrictions && data.dietary_restrictions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data.dietary_restrictions.map((restriction) => (
              <Badge key={restriction} variant="outline">
                {restriction}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Success Message */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-success/10 to-primary/10 border-2 border-success">
        <p className="text-sm font-semibold text-foreground mb-1">
          🎉 Almost done!
        </p>
        <p className="text-sm text-muted-foreground">
          Click "Complete Profile" to unlock <span className="font-semibold text-primary-600">PREMIUM</span> personalization and regenerate your plans with all this information.
        </p>
      </div>
    </div>
  );
}
