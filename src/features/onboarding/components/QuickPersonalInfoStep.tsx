/**
 * QuickPersonalInfoStep - Essential fields for accurate calculations
 * Collects: weight, height, age, gender
 * Uses design system components only - NO hard-coded Tailwind!
 * Automatically detects and handles metric vs imperial units
 */

import { Button, buttonVariants } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/design-system';
import { motion } from 'framer-motion';
import { Calendar, ChevronRight, Ruler, Scale, User, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUnitSystemForCountry, detectCountryFromLocale, parseWeight, parseHeight, type UnitSystem } from '@/services/unitConversion';
import { CountrySelect } from '@/shared/components/ui/country-select';

interface QuickPersonalInfoStepProps {
  initialData?: {
    currentWeight?: number;
    height?: number;
    age?: number;
    gender?: 'male' | 'female' | 'other';
  };
  onComplete: (data: {
    currentWeight: number;
    height: number;
    age: number;
    gender: string;
    country: string;
    unitSystem: UnitSystem;
  }) => void;
}

const GENDERS = [
  {
    id: 'male',
    label: 'Male',
    icon: '♂️',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'female',
    label: 'Female',
    icon: '♀️',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'other',
    label: 'Other',
    icon: '⚧',
    gradient: 'from-purple-500 to-indigo-500',
  },
];

export function QuickPersonalInfoStep({ initialData, onComplete }: QuickPersonalInfoStepProps) {
  const [currentWeight, setCurrentWeight] = useState(initialData?.currentWeight || '');
  const [height, setHeight] = useState(initialData?.height || '');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const [age, setAge] = useState(initialData?.age || '');
  const [gender, setGender] = useState(initialData?.gender || '');
  const [country, setCountry] = useState<string>('US');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  // Detect country and unit system on mount
  useEffect(() => {
    const detectedCountry = detectCountryFromLocale();
    const detectedUnitSystem = getUnitSystemForCountry(detectedCountry);
    setCountry(detectedCountry);
    setUnitSystem(detectedUnitSystem);
  }, []);

  const handleCountryChange = (countryCode: string, newUnitSystem: UnitSystem) => {
    setCountry(countryCode);
    setUnitSystem(newUnitSystem);
  };

  const isValid = currentWeight && age && gender &&
    (unitSystem === 'metric' ? height : (heightFeet && heightInches));

  const handleContinue = () => {
    if (!isValid) return;

    // Convert to metric (kg and cm) for storage
    const weightKg = parseWeight(Number(currentWeight), unitSystem === 'imperial' ? 'lbs' : 'kg');
    const heightCm = unitSystem === 'imperial'
      ? parseHeight({ feet: Number(heightFeet), inches: Number(heightInches) }, 'ft/in')
      : parseHeight(Number(height), 'cm');

    onComplete({
      currentWeight: weightKg,
      height: heightCm,
      age: Number(age),
      gender: gender,
      country: country,
      unitSystem: unitSystem,
    });
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
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 mb-4"
          >
            <User className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Tell us about yourself
          </h2>
          <p className="text-muted-foreground text-lg">
            Question 1 of 4 • We need these for accurate calculations
          </p>
        </div>

        {/* Country Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Label className="text-base font-semibold mb-3 block text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Country
          </Label>
          <CountrySelect
            value={country}
            onValueChange={handleCountryChange}
          />
          <p className="text-xs text-muted-foreground mt-2">
            We'll use {unitSystem === 'imperial' ? 'imperial units (lbs, ft/in)' : 'metric units (kg, cm)'} based on your country
          </p>
        </motion.div>

        {/* Gender Selection */}
        <div className="mb-8">
          <Label className="text-base font-semibold mb-3 block text-foreground">
            Gender
          </Label>
          <div className="grid grid-cols-3 gap-4">
            {GENDERS.map((g, index) => {
              const isSelected = gender === g.id;

              return (
                <motion.button
                  key={g.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGender(g.id)}
                  className={cn(
                    'relative p-4 rounded-xl text-center transition-all duration-300',
                    'border-2',
                    isSelected
                      ? 'border-primary-500 bg-primary/30 shadow-lg'
                      : 'border-border bg-card hover:border-muted-foreground/30'
                  )}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="selected-gender"
                      className="absolute inset-0 bg-gradient-to-br from-primary-100/50 to-secondary-100/50 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl"
                      transition={{ type: 'spring', duration: 0.5 }}
                    />
                  )}

                  <div className="relative">
                    <div className={cn(
                      'text-3xl mb-2'
                    )}>
                      {g.icon}
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {g.label}
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Measurements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Weight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Label htmlFor="currentWeight" className="text-base font-semibold mb-3 block text-foreground flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Current Weight ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
            </Label>
            <Input
              id="currentWeight"
              type="number"
              step="0.1"
              min={unitSystem === 'imperial' ? '66' : '30'}
              max={unitSystem === 'imperial' ? '550' : '250'}
              placeholder={unitSystem === 'imperial' ? 'e.g., 154' : 'e.g., 70'}
              value={currentWeight}
              onChange={(e) => setCurrentWeight(e.target.value)}
              className="text-lg h-12"
            />
          </motion.div>

          {/* Height - Metric (cm) */}
          {unitSystem === 'metric' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="height" className="text-base font-semibold mb-3 block text-foreground flex items-center gap-2">
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
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="text-lg h-12"
              />
            </motion.div>
          ) : (
            /* Height - Imperial (ft/in) */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Label className="text-base font-semibold mb-3 block text-foreground flex items-center gap-2">
                <Ruler className="w-4 h-4" />
                Height (ft/in)
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="heightFeet"
                  type="number"
                  step="1"
                  min="3"
                  max="8"
                  placeholder="ft"
                  value={heightFeet}
                  onChange={(e) => setHeightFeet(e.target.value)}
                  className="text-lg h-12"
                />
                <Input
                  id="heightInches"
                  type="number"
                  step="1"
                  min="0"
                  max="11"
                  placeholder="in"
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  className="text-lg h-12"
                />
              </div>
            </motion.div>
          )}

          {/* Age */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Label htmlFor="age" className="text-base font-semibold mb-3 block text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Age (years)
            </Label>
            <Input
              id="age"
              type="number"
              step="1"
              min="13"
              max="120"
              placeholder="e.g., 30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="text-lg h-12"
            />
          </motion.div>
        </div>

        {/* Info Callout */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary-500/30 to-secondary-500/30 border border-primary"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">
                Why do we need this?
              </p>
              <p className="text-sm text-muted-foreground">
                These measurements are essential for calculating your BMR, TDEE, and personalized nutrition targets. All data is securely stored and used only to personalize your experience.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <div className="flex justify-center">
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
