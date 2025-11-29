import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useAuth } from '@/features/auth';
import { useSaveOnboardingDataMutation, useGenerateAiMealPlanMutation, useGenerateAiWorkoutPlanMutation } from '@/generated/graphql';
import { canGenerateMealPlan, canGenerateWorkoutPlan } from '@/core/redis';
import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Step components
import { GoalsStep } from '@/components/onboarding/GoalsStep';
import { StatsStep } from '@/components/onboarding/StatsStep';
import { PreferencesStep } from '@/components/onboarding/PreferencesStep';

// Onboarding data interface
export interface OnboardingData {
  // Step 1: Goals
  goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_health';
  targetWeight?: number;

  // Step 2: Physical Stats
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';

  // Step 3: Preferences
  dietType: 'balanced' | 'keto' | 'vegetarian' | 'vegan' | 'paleo' | 'mediterranean';
  dietaryRestrictions: string[];
  workoutFrequency: number; // days per week
  workoutDuration: number; // minutes per session
  workoutType: 'strength' | 'cardio' | 'mixed' | 'flexibility';
}

const TOTAL_STEPS = 3;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');

  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const [saveOnboarding] = useSaveOnboardingDataMutation();
  const [generateMealPlan] = useGenerateAiMealPlanMutation();
  const [generateWorkoutPlan] = useGenerateAiWorkoutPlanMutation();

  useEffect(() => {
    // Check if user is already onboarded
    if (!user) {
      navigate('/sign-in');
    }
  }, [user, navigate]);

  const progress = (currentStep / TOTAL_STEPS) * 100;

  const handleStepComplete = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      // All steps complete - generate plans
      handleComplete({ ...onboardingData, ...stepData } as OnboardingData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async (data: OnboardingData) => {
    if (!user) return;

    try {
      setIsGenerating(true);
      setGenerationStatus('Saving your profile...');

      // Step 1: Save profile data
      await saveOnboarding({
        variables: {
          userId: user.id,
          updates: {
            age: data.age,
            gender: data.gender,
            height_cm: data.height,
            weight_kg: data.weight,
            target_weight_kg: data.targetWeight,
            occupation_activity: data.activityLevel,
            onboarding_completed: true,
            onboarding_step: 3,
          },
        },
      });

      // Step 2: Check rate limits
      setGenerationStatus('Checking rate limits...');

      const mealPlanLimit = await canGenerateMealPlan(user.id);
      if (!mealPlanLimit.allowed) {
        toast.error(mealPlanLimit.error || 'Rate limit exceeded for meal plans');
        setIsGenerating(false);
        return;
      }

      const workoutPlanLimit = await canGenerateWorkoutPlan(user.id);
      if (!workoutPlanLimit.allowed) {
        toast.error(workoutPlanLimit.error || 'Rate limit exceeded for workout plans');
        setIsGenerating(false);
        return;
      }

      // Step 3: Calculate nutrition targets
      setGenerationStatus('Calculating your nutrition targets...');
      const { dailyCalories, protein, carbs, fats } = calculateNutrition(data);

      // Step 4: Generate AI Meal Plan
      setGenerationStatus('✨ Generating your personalized meal plan...');

      const mealPlanData = {
        user_id: user.id,
        plan_data: {
          goal: data.goal,
          dietType: data.dietType,
          restrictions: data.dietaryRestrictions,
          meals: [], // AI will generate this
        },
        daily_calories: dailyCalories,
        daily_protein: protein,
        daily_carbs: carbs,
        daily_fats: fats,
        preferences: data.dietType,
        restrictions: data.dietaryRestrictions.join(', '),
        status: 'completed',
        is_active: true,
      };

      await generateMealPlan({
        variables: { input: mealPlanData },
      });

      // Step 5: Generate AI Workout Plan
      setGenerationStatus('💪 Creating your workout plan...');

      const workoutPlanData = {
        user_id: user.id,
        plan_data: {
          workoutType: data.workoutType,
          frequency: data.workoutFrequency,
          duration: data.workoutDuration,
          exercises: [], // AI will generate this
        },
        workout_type: data.workoutType,
        duration_per_session: `${data.workoutDuration} minutes`,
        frequency_per_week: data.workoutFrequency,
        status: 'completed',
        is_active: true,
      };

      await generateWorkoutPlan({
        variables: { input: workoutPlanData },
      });

      // Step 6: Success!
      setGenerationStatus('🎉 All done!');

      // Confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate('/dashboard');
        toast.success('Welcome to GreenLean! Your personalized plans are ready!');
      }, 2000);

    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding. Please try again.');
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  // Calculate nutrition based on user data
  const calculateNutrition = (data: OnboardingData) => {
    // Harris-Benedict BMR calculation
    let bmr: number;
    if (data.gender === 'male') {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
    } else {
      bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9,
    };

    const tdee = bmr * activityMultipliers[data.activityLevel];

    // Adjust based on goal
    let dailyCalories = tdee;
    if (data.goal === 'lose_weight') {
      dailyCalories = tdee - 500; // 500 cal deficit
    } else if (data.goal === 'gain_muscle') {
      dailyCalories = tdee + 300; // 300 cal surplus
    }

    // Macro distribution (protein: 30%, carbs: 40%, fats: 30%)
    const protein = Math.round((dailyCalories * 0.3) / 4); // 4 cal per gram
    const carbs = Math.round((dailyCalories * 0.4) / 4);
    const fats = Math.round((dailyCalories * 0.3) / 9); // 9 cal per gram

    return {
      dailyCalories: Math.round(dailyCalories),
      protein,
      carbs,
      fats,
    };
  };

  if (!user) {
    return null;
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-green-600 animate-spin" />
                <Sparkles className="w-8 h-8 text-yellow-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">Creating Your Experience</h2>
          <p className="text-muted-foreground mb-6">{generationStatus}</p>

          <Progress value={100} className="mb-4" />

          <p className="text-sm text-muted-foreground">
            This may take a few moments. We're crafting personalized plans just for you!
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Welcome to GreenLean
          </h1>
          <p className="text-muted-foreground">
            Let's personalize your fitness journey in just 3 quick steps
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && (
              <GoalsStep
                initialData={onboardingData}
                onComplete={handleStepComplete}
                onBack={handleBack}
              />
            )}
            {currentStep === 2 && (
              <StatsStep
                initialData={onboardingData}
                onComplete={handleStepComplete}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <PreferencesStep
                initialData={onboardingData}
                onComplete={handleStepComplete}
                onBack={handleBack}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
