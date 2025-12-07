/**
 * Complete Profile Page
 * Allows users to fill out ALL profile fields at once
 * Alternative to progressive profiling via micro surveys
 * Immediately unlocks PREMIUM tier (100% profile completion)
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Heart,
  Sparkles,
  User,
  Utensils
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { BasicInfoSection } from '../components/profile/BasicInfoSection';
import { FitnessSection } from '../components/profile/FitnessSection';
import { HealthLifestyleSection } from '../components/profile/HealthLifestyleSection';
import { NutritionSection } from '../components/profile/NutritionSection';

import { mlService } from '@/services/ml';
import { detectUnitSystem, type UnitSystem } from '@/services/unitConversion';
import type { CompleteProfileData } from '../types/profile';

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils },
  { id: 'fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'health', label: 'Health & Lifestyle', icon: Heart },
];

export function CompleteProfile() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');

  const [formData, setFormData] = useState<CompleteProfileData>({
    // Basic (from profiles table - only fields that exist!)
    age: profile?.age || undefined,
    gender: profile?.gender || undefined,
    height_cm: profile?.height_cm || undefined,
    weight_kg: profile?.weight_kg || undefined,
    target_weight_kg: profile?.target_weight_kg || undefined,
    activity_level: profile?.activity_level || undefined,
    // Note: main_goal, dietary_preference are loaded from quiz_results below
    main_goal: undefined,
    dietary_preference: undefined,

    // Nutrition (from user_profile_extended)
    cooking_skill: undefined,
    cooking_time: undefined,
    grocery_budget: undefined,
    meals_per_day: undefined,
    meal_prep_preference: undefined,
    food_allergies: [],
    disliked_foods: [],

    // Fitness (from user_profile_extended)
    gym_access: undefined,
    equipment_available: [],
    workout_location_preference: undefined,
    injuries_limitations: [],
    fitness_experience: undefined,

    // Health & Lifestyle (from user_profile_extended)
    health_conditions: [],
    medications: [],
    sleep_quality: undefined,
    stress_level: undefined,
    energy_level: undefined,
    work_schedule: undefined,
    family_size: undefined,
    dietary_restrictions: [],
  });

  // Detect unit system on mount
  useEffect(() => {
    const detected = detectUnitSystem();
    setUnitSystem(detected);
  }, []);

  // Fetch existing quiz results and extended profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;

      // 1. Fetch quiz_results for main_goal and dietary_preference
      const { data: quizData } = await supabase
        .from('quiz_results')
        .select('answers')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (quizData?.answers) {
        setFormData(prev => ({
          ...prev,
          main_goal: quizData.answers.mainGoal || undefined,
          dietary_preference: quizData.answers.dietaryStyle || undefined,
        }));
      }

      // 2. Fetch user_profile_extended for micro-survey fields
      const { data: extendedData } = await supabase
        .from('user_profile_extended')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (extendedData) {
        setFormData(prev => ({
          ...prev,
          cooking_skill: extendedData.cooking_skill || undefined,
          cooking_time: extendedData.cooking_time || undefined,
          grocery_budget: extendedData.grocery_budget || undefined,
          meals_per_day: extendedData.meals_per_day || undefined,
          meal_prep_preference: extendedData.meal_prep_preference || undefined,
          food_allergies: extendedData.food_allergies || [],
          disliked_foods: extendedData.disliked_foods || [],
          gym_access: extendedData.gym_access ?? undefined,
          equipment_available: extendedData.equipment_available || [],
          workout_location_preference: extendedData.workout_location_preference || undefined,
          injuries_limitations: extendedData.injuries_limitations || [],
          fitness_experience: extendedData.fitness_experience || undefined,
          health_conditions: extendedData.health_conditions || [],
          medications: extendedData.medications || [],
          sleep_quality: extendedData.sleep_quality || undefined,
          stress_level: extendedData.stress_level || undefined,
          energy_level: extendedData.energy_level || undefined,
          work_schedule: extendedData.work_schedule || undefined,
          family_size: extendedData.family_size || undefined,
          dietary_restrictions: extendedData.dietary_restrictions || [],
        }));
      }
    };

    fetchProfileData();
  }, [user]);

  const progress = ((currentSection + 1) / SECTIONS.length) * 100;

  const handleNext = () => {
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please log in to continue');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update profiles table (only columns that exist!)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          age: formData.age,
          gender: formData.gender,
          height_cm: formData.height_cm,
          weight_kg: formData.weight_kg,
          target_weight_kg: formData.target_weight_kg,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Map exercise_frequency from activity_level (like onboarding does)
      let exerciseFrequency = '3-4 times/week';
      switch (formData.activity_level) {
        case 'sedentary':
          exerciseFrequency = 'Never';
          break;
        case 'lightly_active':
          exerciseFrequency = '1-2 times/week';
          break;
        case 'moderately_active':
          exerciseFrequency = '3-5 times/week';
          break;
        case 'very_active':
          exerciseFrequency = '6-7 times/week';
          break;
        case 'extremely_active':
          exerciseFrequency = 'Daily';
          break;
      }

      // 3. Update or create quiz_results with JSONB answers
      const quizData = {
        mainGoal: formData.main_goal,
        dietaryStyle: formData.dietary_preference, // Maps to dietaryStyle in quiz_results
        exerciseFrequency: exerciseFrequency,
        targetWeight: formData.target_weight_kg,
        activityLevel: formData.activity_level,
      };

      // Check if quiz_results exists for this user
      const { data: existingQuiz } = await supabase
        .from('quiz_results')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingQuiz) {
        // Update existing quiz result
        const { error: quizError } = await supabase
          .from('quiz_results')
          .update({
            answers: quizData,
          })
          .eq('id', existingQuiz.id);

        if (quizError) throw quizError;
      } else {
        // Create new quiz result
        const { error: quizError } = await supabase
          .from('quiz_results')
          .insert({
            user_id: user.id,
            answers: quizData,
          });

        if (quizError) throw quizError;
      }

      // Upsert user_profile_extended
      const { error: extendedError } = await supabase
        .from('user_profile_extended')
        .upsert({
          user_id: user.id,
          cooking_skill: formData.cooking_skill,
          cooking_time: formData.cooking_time,
          grocery_budget: formData.grocery_budget,
          meals_per_day: formData.meals_per_day,
          meal_prep_preference: formData.meal_prep_preference,
          food_allergies: formData.food_allergies,
          disliked_foods: formData.disliked_foods,
          gym_access: formData.gym_access,
          equipment_available: formData.equipment_available,
          workout_location_preference: formData.workout_location_preference,
          injuries_limitations: formData.injuries_limitations,
          fitness_experience: formData.fitness_experience,
          health_conditions: formData.health_conditions,
          medications: formData.medications,
          sleep_quality: formData.sleep_quality,
          stress_level: formData.stress_level,
          energy_level: formData.energy_level,
          work_schedule: formData.work_schedule,
          family_size: formData.family_size,
          dietary_restrictions: formData.dietary_restrictions,
          completeness_percentage: 100, // Complete profile = 100%
          current_tier: 'PREMIUM',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (extendedError) throw extendedError;

      // Trigger plan regeneration with reason 'profile_completion'
      await mlService.regeneratePlans(user.id, true, true, 'profile_completion');
      
      // Celebration!
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
      });

      toast.success('🎉 Profile completed! Your plans are being regenerated with full personalization.');

      // Navigate to plans page after a short delay
      setTimeout(() => {
        navigate('/plans');
      }, 2000);

    } catch (error: any) {
      console.error('Profile completion error:', error);
      toast.error(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-100 dark:from-background dark:via-muted dark:to-muted">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <Sparkles className="w-6 h-6 text-secondary-600" />
          </div>
          <p className="text-muted-foreground text-lg">
            Fill out all fields to unlock <span className="font-semibold text-primary-600">PREMIUM</span> personalization
          </p>
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-foreground">
              Section {currentSection + 1} of {SECTIONS.length}: {SECTIONS[currentSection].label}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Section Navigation Pills */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          {SECTIONS.map((section, index) => {
            const Icon = section.icon;
            const isActive = index === currentSection;
            const isCompleted = index < currentSection;

            return (
              <button
                key={section.id}
                onClick={() => setCurrentSection(index)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-300
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-lg scale-105'
                    : isCompleted
                    ? 'bg-success/20 text-success border-2 border-success'
                    : 'bg-card text-muted-foreground border-2 border-border hover:border-primary-300'
                  }
                `}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={currentSection}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 md:p-8">
            {currentSection === 0 && (
              <BasicInfoSection
                data={formData}
                onChange={setFormData}
                unitSystem={unitSystem}
              />
            )}
            {currentSection === 1 && (
              <NutritionSection
                data={formData}
                onChange={setFormData}
              />
            )}
            {currentSection === 2 && (
              <FitnessSection
                data={formData}
                onChange={setFormData}
              />
            )}
            {currentSection === 3 && (
              <HealthLifestyleSection
                data={formData}
                onChange={setFormData}
              />
            )}
          </Card>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8">
          <Button
            onClick={handleBack}
            variant="outline"
            size="lg"
            disabled={currentSection === 0}
            className="min-w-[120px]"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            size="lg"
            disabled={isSubmitting}
            className="min-w-[200px] bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700"
          >
            {isSubmitting ? (
              'Saving...'
            ) : currentSection === SECTIONS.length - 1 ? (
              <>
                Complete Profile
                <Sparkles className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>
            Don't worry, you can always update these later in Settings.
            <br />
            The more we know, the better we can personalize your experience!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
