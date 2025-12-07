/**
 * Profile Tab - Personal Information & Stats
 */

import { useState, useEffect } from 'react';
import { User, Ruler, Scale, Target, Calendar, Sparkles, ArrowRight, Globe } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { CountrySelect } from '@/shared/components/ui/country-select';
import { getUnitSystemForCountry, formatWeight, formatHeight, parseWeight, parseHeight, type UnitSystem } from '@/services/unitConversion';
import { WeightDisplay } from '@/shared/components/display/WeightDisplay';
import { HeightDisplay } from '@/shared/components/display/HeightDisplay';

export function ProfileTab() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState<string>(profile?.country || 'US');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  // Display values in user's unit system
  const [displayWeight, setDisplayWeight] = useState('');
  const [displayTargetWeight, setDisplayTargetWeight] = useState('');
  const [displayHeight, setDisplayHeight] = useState('');
  const [displayHeightFeet, setDisplayHeightFeet] = useState('');
  const [displayHeightInches, setDisplayHeightInches] = useState('');

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    age: profile?.age || '',
    gender: profile?.gender || '',
    height_cm: profile?.height_cm || 0,
    weight_kg: profile?.weight_kg || 0,
    target_weight_kg: profile?.target_weight_kg || 0,
  });

  // Initialize unit system from profile
  useEffect(() => {
    if (profile) {
      const userCountry = profile.country || 'US';
      const userUnitSystem = profile.unit_system as UnitSystem || getUnitSystemForCountry(userCountry);

      setCountry(userCountry);
      setUnitSystem(userUnitSystem);

      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || '',
        gender: profile.gender || '',
        height_cm: profile.height_cm || 0,
        weight_kg: profile.weight_kg || 0,
        target_weight_kg: profile.target_weight_kg || 0,
      });
    }
  }, [profile]);

  // Update display values when formData or unitSystem changes
  useEffect(() => {
    if (formData.weight_kg) {
      const formatted = formatWeight(formData.weight_kg, unitSystem);
      setDisplayWeight(formatted.value.toString());
    }
    if (formData.target_weight_kg) {
      const formatted = formatWeight(formData.target_weight_kg, unitSystem);
      setDisplayTargetWeight(formatted.value.toString());
    }
    if (formData.height_cm) {
      if (unitSystem === 'imperial') {
        const formatted = formatHeight(formData.height_cm, unitSystem);
        if (formatted.value.feet !== undefined && formatted.value.inches !== undefined) {
          setDisplayHeightFeet(formatted.value.feet.toString());
          setDisplayHeightInches(formatted.value.inches.toString());
        }
      } else {
        setDisplayHeight(formData.height_cm.toString());
      }
    }
  }, [formData, unitSystem]);

  const handleCountryChange = (countryCode: string, newUnitSystem: UnitSystem) => {
    setCountry(countryCode);
    setUnitSystem(newUnitSystem);
  };

  const handleWeightChange = (value: string) => {
    setDisplayWeight(value);
    if (value) {
      const kg = parseWeight(Number(value), unitSystem === 'imperial' ? 'lbs' : 'kg');
      setFormData(prev => ({ ...prev, weight_kg: kg }));
    }
  };

  const handleTargetWeightChange = (value: string) => {
    setDisplayTargetWeight(value);
    if (value) {
      const kg = parseWeight(Number(value), unitSystem === 'imperial' ? 'lbs' : 'kg');
      setFormData(prev => ({ ...prev, target_weight_kg: kg }));
    }
  };

  const handleHeightChange = (value: string) => {
    setDisplayHeight(value);
    if (value) {
      const cm = parseHeight(Number(value), 'cm');
      setFormData(prev => ({ ...prev, height_cm: cm }));
    }
  };

  const handleHeightImperialChange = (feet: string, inches: string) => {
    setDisplayHeightFeet(feet);
    setDisplayHeightInches(inches);
    if (feet && inches !== undefined) {
      const cm = parseHeight({ feet: Number(feet), inches: Number(inches) }, 'ft/in');
      setFormData(prev => ({ ...prev, height_cm: cm }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          age: parseInt(formData.age as string) || null,
          gender: formData.gender,
          height_cm: formData.height_cm || null,
          weight_kg: formData.weight_kg || null,
          target_weight_kg: formData.target_weight_kg || null,
          country: country,
          unit_system: unitSystem,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Complete Profile CTA */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 border-2 border-primary-200 dark:border-primary-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                Unlock Premium Personalization
              </h3>
              <p className="text-sm text-muted-foreground">
                Complete your full profile to get maximum personalization, health adaptations, and tailored plans. Unlock PREMIUM tier instantly!
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => navigate('/settings/complete-profile')}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white border-0 flex-shrink-0"
          >
            Complete Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Basic Info */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center">
            <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Basic Information</h3>
            <p className="text-sm text-muted-foreground">Your personal details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              placeholder="John Doe"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              placeholder="30"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
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
            <Label htmlFor="country" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Country
            </Label>
            <CountrySelect
              value={country}
              onValueChange={handleCountryChange}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Determines your unit system (metric/imperial)
            </p>
          </div>
        </div>
      </Card>

      {/* Physical Stats */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-950 flex items-center justify-center">
            <Ruler className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </div>
          <div>
            <h3 className="font-semibold">Physical Measurements</h3>
            <p className="text-sm text-muted-foreground">Track your body metrics</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Height */}
          {unitSystem === 'metric' ? (
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="1"
                min="120"
                max="250"
                placeholder="175"
                value={displayHeight}
                onChange={(e) => handleHeightChange(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <Label>Height (ft/in)</Label>
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

          {/* Current Weight */}
          <div>
            <Label htmlFor="weight">Current Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              min={unitSystem === 'imperial' ? '66' : '30'}
              max={unitSystem === 'imperial' ? '550' : '250'}
              placeholder={unitSystem === 'imperial' ? '154' : '70'}
              value={displayWeight}
              onChange={(e) => handleWeightChange(e.target.value)}
            />
          </div>

          {/* Target Weight */}
          <div>
            <Label htmlFor="target_weight">Target Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})</Label>
            <Input
              id="target_weight"
              type="number"
              step="0.1"
              min={unitSystem === 'imperial' ? '66' : '30'}
              max={unitSystem === 'imperial' ? '550' : '250'}
              placeholder={unitSystem === 'imperial' ? '145' : '65'}
              value={displayTargetWeight}
              onChange={(e) => handleTargetWeightChange(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
