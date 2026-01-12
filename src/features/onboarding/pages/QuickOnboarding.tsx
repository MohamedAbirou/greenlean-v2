/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * QuickOnboarding Page - 3 Questions to Personalized Plan
 * Streamlined onboarding experience replacing the old 12-question flow
 * Production-ready with full Supabase integration
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { mlService } from '@/services/ml';
import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { QuickActivityStep } from '../components/QuickActivityStep';
import { QuickDietStep } from '../components/QuickDietStep';
import { QuickGoalStep } from '../components/QuickGoalStep';
import { QuickPersonalInfoStep } from '../components/QuickPersonalInfoStep';

interface OnboardingData {
  // Essential fields (from PersonalInfoStep (BASIC))
  currentWeight: number;
  targetWeight?: number;
  height: number;
  age: number;
  gender: string;
  mainGoal: string;
  activityLevel: string;
  dietaryStyle: string;
}

const TOTAL_STEPS = 4;

const GENERATION_STEPS = [
  { icon: '📊', message: 'Analyzing your profile...' },
  { icon: '🧮', message: 'Calculating nutrition targets...' },
  { icon: '📝', message: 'Initializing your tracking...' },
  { icon: '🍽️', message: 'Generating your meal plans...' },
  { icon: '💪', message: 'Designing your workouts...' },
  { icon: '✨', message: 'Finalizing everything...' },
];

export function QuickOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({});

  const progress = (currentStep / TOTAL_STEPS) * 100;

  // Step completion handlers
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

  // Complete onboarding and save to database
  const handleComplete = async (data: OnboardingData) => {
    if (!user) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    try {
      setIsGenerating(true);

      // Step 1: Save profile data (already converted to metric in QuickPersonalInfoStep)
      setGenerationStep(0);
      await new Promise(resolve => setTimeout(resolve, 800));

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          weight: data.currentWeight,
          height: data.height,
          age: data.age,
          gender: data.gender,
          target_weight: data.targetWeight,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Step 2: Save quiz result with onboarding data
      setGenerationStep(1);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Step 3: Save quiz result with onboarding data
      setGenerationStep(2);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Exercise Frequency mapping
      let exerciseFrequency = '3-4 times/week';
      switch (data.activityLevel) {
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

      const quizData = {
        mainGoal: data.mainGoal,
        dietaryStyle: data.dietaryStyle,
        exerciseFrequency: exerciseFrequency,
        targetWeight: data.targetWeight,
        activityLevel: data.activityLevel,
      };

      const { error: quizError } = await supabase.from('quiz_results').insert({
        user_id: user.id,
        answers: quizData
      });

      if (quizError) throw quizError;

      // Step 4: Initialize user streak
      setGenerationStep(4);
      await new Promise(resolve => setTimeout(resolve, 500));

      const { error: streakError } = await supabase
        .from('user_streaks')
        .insert({
          user_id: user.id,
          streak_type: 'nutrition_logging',
          current_streak: 0,
          longest_streak: 0,
          total_days_logged: 0,
        });

      if (streakError && streakError.code !== '23505') {
        // Ignore duplicate key errors
        console.log('Streak not initialized:', streakError);
      }

      // Step 5: Initialize daily activity summary for today
      setGenerationStep(2);
      const today = new Date().toISOString().split('T')[0];

      const { error: activityError } = await supabase
        .from('daily_activity_summary')
        .upsert({
          user_id: user.id,
          activity_date: today,
          calories_consumed: 0,
          protein_g: 0,
          carbs_g: 0,
          fats_g: 0,
          water_glasses: 0,
          meals_logged: 0,
          workouts_completed: 0,
          workout_duration_minutes: 0,
          calories_burned: 0,
          logged_nutrition: false,
          logged_workout: false,
          logged_weight: false,
          completed_all_goals: false,
        }, {
          onConflict: 'user_id,activity_date',
        });

      if (activityError) {
        console.log('Activity summary not initialized:', activityError);
      }

      // Step 6: Initialize weight history with current weight
      if (data?.currentWeight) {
        const { error: weightError } = await supabase
          .from('weight_history')
          .insert({
            user_id: user.id,
            log_date: today,
            weight: data.currentWeight,
            source: 'onboarding',
            notes: 'Initial weight from onboarding',
          });

        if (weightError && weightError.code !== '23505') {
          console.log('Weight history not initialized:', weightError);
        }
      }

      // Step 7: Trigger AI plan generation (async - don't wait)
      setGenerationStep(3);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Save quiz result first to get the ID
      const { data: savedQuizResult } = await supabase
        .from('quiz_results')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (savedQuizResult?.id) {
        await mlService.generatePlansUnified(
          user.id,
          savedQuizResult.id,
          {
            main_goal: data.mainGoal,
            dietary_style: data.dietaryStyle,
            exercise_frequency: exerciseFrequency,
            target_weight: data.targetWeight!,
            activity_level: quizData.activityLevel,
            weight: data?.currentWeight,
            height: data?.height,
            age: data?.age,
            gender: data?.gender,
          },
          'openai',
          'gpt-4o-mini',
        );
      }

      // Success!
      setGenerationStep(5);
      await new Promise(resolve => setTimeout(resolve, 400));

      // Confetti celebration
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      });

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
        toast.success('🎉 Welcome to GreenLean!');
      }, 1500);

      setTimeout(() => {
        toast.info("Your personalized plans are generating.. We'll notify you once they are ready!");
      }, 2000)

    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to complete onboarding. Please try again.');
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  // Loading/Generation State
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-100 dark:from-background dark:via-muted dark:to-muted flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="mb-6"
          >
            <div className="relative inline-flex items-center justify-center">
              <Loader2 className="w-20 h-20 text-primary-600 animate-spin" />
              <Sparkles className="w-10 h-10 text-warning absolute" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-foreground mb-2">
            Creating Your Experience
          </h2>

          <AnimatePresence mode="wait">
            <motion.div
              key={generationStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6"
            >
              <p className="text-lg text-muted-foreground">
                {GENERATION_STEPS[generationStep]?.icon} {GENERATION_STEPS[generationStep]?.message}
              </p>
            </motion.div>
          </AnimatePresence>

          <Progress value={(generationStep / (GENERATION_STEPS.length - 1)) * 100} className="mb-4 h-2" />

          <p className="text-sm text-muted-foreground">
            Hang tight! We're personalizing everything just for you...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-100 dark:from-background dark:via-muted dark:to-muted">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
            Welcome to GreenLean
          </h1>
          <p className="text-muted-foreground text-lg">
            Just 4 quick questions to personalize your fitness journey
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-foreground">
              Question {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, type: 'spring' }}
          >
            {currentStep === 1 && (
              <QuickPersonalInfoStep
                initialData={onboardingData as any}
                onComplete={handleStepComplete}
              />
            )}
            {currentStep === 2 && (
              <QuickGoalStep
                initialData={onboardingData as any}
                onComplete={handleStepComplete}
                onBack={handleBack}
              />
            )}
            {currentStep === 3 && (
              <QuickActivityStep
                initialData={onboardingData as any}
                onComplete={handleStepComplete}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <QuickDietStep
                initialData={onboardingData as any}
                onComplete={handleStepComplete}
                onBack={handleBack}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 flex flex-wrap justify-center gap-8 text-center"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm">Science-backed calculations</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm">Personalized for you</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm">Adjustable anytime</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
