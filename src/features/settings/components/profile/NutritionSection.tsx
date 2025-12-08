/**
 * Nutrition Section - Complete Profile
 * Collects: cooking skill, cooking time, grocery budget, meals per day,
 * meal prep preference, food allergies, disliked foods
 */

import { useState } from 'react';
import { ChefHat, Clock, DollarSign, Utensils, Calendar, AlertTriangle, X } from 'lucide-react';
import { Label } from '@/shared/components/ui/label';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import type { CompleteProfileData } from '../../types/profile';

interface NutritionSectionProps {
  data: CompleteProfileData;
  onChange: (data: CompleteProfileData) => void;
}

const COMMON_ALLERGIES = [
  'Dairy', 'Gluten', 'Nuts', 'Peanuts', 'Shellfish', 'Eggs', 'Soy', 'Fish'
];

export function NutritionSection({ data, onChange }: NutritionSectionProps) {
  const [customAllergy, setCustomAllergy] = useState('');
  const [customDisliked, setCustomDisliked] = useState('');

  const handleAllergyToggle = (allergy: string) => {
    const current = data.food_allergies || [];
    const updated = current.includes(allergy)
      ? current.filter(a => a !== allergy)
      : [...current, allergy];
    onChange({ ...data, food_allergies: updated });
  };

  const handleAddCustomAllergy = () => {
    if (customAllergy.trim()) {
      const current = data.food_allergies || [];
      onChange({ ...data, food_allergies: [...current, customAllergy.trim()] });
      setCustomAllergy('');
    }
  };

  const handleRemoveAllergy = (allergy: string) => {
    const updated = (data.food_allergies || []).filter(a => a !== allergy);
    onChange({ ...data, food_allergies: updated });
  };

  const handleAddDisliked = () => {
    if (customDisliked.trim()) {
      const current = data.disliked_foods || [];
      onChange({ ...data, disliked_foods: [...current, customDisliked.trim()] });
      setCustomDisliked('');
    }
  };

  const handleRemoveDisliked = (food: string) => {
    const updated = (data.disliked_foods || []).filter(f => f !== food);
    onChange({ ...data, disliked_foods: updated });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Nutrition Preferences</h3>
        <p className="text-muted-foreground">Help us create meal plans you'll love</p>
      </div>

      {/* Cooking Skill */}
      <div>
        <Label htmlFor="cooking_skill" className="flex items-center gap-2 mb-2">
          <ChefHat className="w-4 h-4" />
          Cooking Skill Level
        </Label>
        <Select value={data.cooking_skill} onValueChange={(value: any) => onChange({ ...data, cooking_skill: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your skill level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner - Simple recipes only</SelectItem>
            <SelectItem value="intermediate">Intermediate - Can follow most recipes</SelectItem>
            <SelectItem value="advanced">Advanced - Comfortable with complex techniques</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cooking Time & Budget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cooking_time" className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            Time Available for Cooking
          </Label>
          <Select value={data.cooking_time} onValueChange={(value: any) => onChange({ ...data, cooking_time: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15-30 min">15-30 minutes</SelectItem>
              <SelectItem value="30-45 min">30-45 minutes</SelectItem>
              <SelectItem value="45-60 min">45-60 minutes</SelectItem>
              <SelectItem value="60+ min">More than 1 hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="grocery_budget" className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4" />
            Weekly Grocery Budget
          </Label>
          <Select value={data.grocery_budget} onValueChange={(value: any) => onChange({ ...data, grocery_budget: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Budget-friendly ($50-75/week)</SelectItem>
              <SelectItem value="medium">Moderate ($75-125/week)</SelectItem>
              <SelectItem value="high">Premium ($125+/week)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Meals Per Day & Meal Prep */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="meals_per_day" className="flex items-center gap-2 mb-2">
            <Utensils className="w-4 h-4" />
            Preferred Meals Per Day
          </Label>
          <Input
            id="meals_per_day"
            type="number"
            min="1"
            max="6"
            placeholder="e.g., 3"
            value={data.meals_per_day || ''}
            onChange={(e) => onChange({ ...data, meals_per_day: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>

        <div>
          <Label htmlFor="meal_prep" className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            Meal Prep Preference
          </Label>
          <Select value={data.meal_prep_preference} onValueChange={(value: any) => onChange({ ...data, meal_prep_preference: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_prep">Prefer cooking fresh daily</SelectItem>
              <SelectItem value="some_prep">Some prep for convenience</SelectItem>
              <SelectItem value="batch_cooking">Love batch cooking on weekends</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Food Allergies */}
      <div>
        <Label className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-warning" />
          Food Allergies or Intolerances
        </Label>

        {/* Common Allergies Checkboxes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {COMMON_ALLERGIES.map((allergy) => (
            <div key={allergy} className="flex items-center space-x-2">
              <Checkbox
                id={`allergy-${allergy}`}
                checked={(data.food_allergies || []).includes(allergy)}
                onCheckedChange={() => handleAllergyToggle(allergy)}
              />
              <label
                htmlFor={`allergy-${allergy}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {allergy}
              </label>
            </div>
          ))}
        </div>

        {/* Custom Allergy Input */}
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add other allergy..."
            value={customAllergy}
            onChange={(e) => setCustomAllergy(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomAllergy())}
          />
          <Button type="button" onClick={handleAddCustomAllergy}>Add</Button>
        </div>

        {/* Selected Allergies */}
        {data.food_allergies && data.food_allergies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.food_allergies.map((allergy) => (
              <Badge key={allergy} variant="secondary" className="flex items-center gap-1">
                {allergy}
                <button
                  type="button"
                  onClick={() => handleRemoveAllergy(allergy)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Disliked Foods */}
      <div>
        <Label className="mb-3 block">Foods You Dislike (optional)</Label>
        <div className="flex gap-2 mb-3">
          <Input
            placeholder="Add food you don't like..."
            value={customDisliked}
            onChange={(e) => setCustomDisliked(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddDisliked())}
          />
          <Button type="button" onClick={handleAddDisliked}>Add</Button>
        </div>

        {/* Selected Disliked Foods */}
        {data.disliked_foods && data.disliked_foods.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.disliked_foods.map((food) => (
              <Badge key={food} variant="outline" className="flex items-center gap-1">
                {food}
                <button
                  type="button"
                  onClick={() => handleRemoveDisliked(food)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-info/10 border border-info">
        <p className="text-sm text-info-foreground">
          💡 <strong>Tip:</strong> The more specific you are, the better we can tailor your meal plans to your preferences and needs.
        </p>
      </div>
    </div>
  );
}
