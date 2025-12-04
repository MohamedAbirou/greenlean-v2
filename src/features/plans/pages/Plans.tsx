/**
 * Plans Page - Progressive Profiling Edition
 * Shows meal and workout plans with adaptive UI based on tier (BASIC/STANDARD/PREMIUM)
 *
 * UI automatically adapts based on JSON response content:
 * - BASIC: Simple meals, generic workouts, fewer tips
 * - STANDARD: More customization, meal prep basics
 * - PREMIUM: Full personalization, all advanced features
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Card } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Apple,
  ArrowRight,
  ChefHat,
  Dumbbell,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MealPlanView } from '../components/MealPlanView';
import { WorkoutPlanView } from '../components/WorkoutPlanView';
import { UpgradePrompt } from '../components/UpgradePrompt';

interface PlanStatus {
  meal_plan_status: 'generating' | 'completed' | 'failed';
  workout_plan_status: 'generating' | 'completed' | 'failed';
  meal_plan_error?: string;
  workout_plan_error?: string;
}

interface MealPlan {
  plan_data: any;  // JSONB from database
  daily_calories: number;
  status: string;
  generated_at: string;
}

interface WorkoutPlan {
  plan_data: any;  // JSONB from database
  workout_type: string[];
  frequency_per_week: number;
  status: string;
  generated_at: string;
}

export function Plans() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [selectedTab, setSelectedTab] = useState('meals');

  // Fetch plans from database
  const fetchPlans = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch latest meal plan
      const { data: mealData, error: mealError } = await supabase
        .from('ai_meal_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mealError) throw mealError;
      setMealPlan(mealData);

      // Fetch latest workout plan
      const { data: workoutData, error: workoutError } = await supabase
        .from('ai_workout_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (workoutError) throw workoutError;
      setWorkoutPlan(workoutData);

      // Update plan status
      if (mealData || workoutData) {
        setPlanStatus({
          meal_plan_status: mealData?.status || 'generating',
          workout_plan_status: workoutData?.status || 'generating',
        });
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for plan completion (if generating)
  useEffect(() => {
    if (!user) return;

    fetchPlans();

    // Poll every 5 seconds if still generating
    const pollInterval = setInterval(() => {
      if (
        planStatus?.meal_plan_status === 'generating' ||
        planStatus?.workout_plan_status === 'generating'
      ) {
        fetchPlans();
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [user, planStatus?.meal_plan_status, planStatus?.workout_plan_status]);

  // Handle regenerate plans
  const handleRegenerate = async () => {
    if (!user) return;

    try {
      setIsRegenerating(true);
      toast.info('Regenerating your plans...');

      // TODO: Call ML service to regenerate plans
      // For now, just refetch
      await fetchPlans();

      toast.success('Plans regenerated successfully!');
    } catch (error) {
      console.error('Error regenerating plans:', error);
      toast.error('Failed to regenerate plans');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Determine personalization tier based on plan content
  const getPersonalizationTier = (): 'BASIC' | 'STANDARD' | 'PREMIUM' => {
    if (!mealPlan?.plan_data) return 'BASIC';

    const tips = mealPlan.plan_data.personalized_tips || [];
    const mealPrep = mealPlan.plan_data.meal_prep_strategy;

    if (tips.length >= 6 && mealPrep?.batch_cooking?.length > 2) {
      return 'PREMIUM';
    } else if (tips.length >= 4 && mealPrep) {
      return 'STANDARD';
    }
    return 'BASIC';
  };

  const tier = getPersonalizationTier();

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="mb-6"
          >
            <Loader2 className="w-16 h-16 text-primary-600 animate-spin mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Loading Your Plans</h2>
          <p className="text-muted-foreground">Please wait while we fetch your personalized plans...</p>
        </Card>
      </div>
    );
  }

  // No plans yet state
  if (!mealPlan && !workoutPlan && planStatus?.meal_plan_status !== 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-lg text-center">
          <div className="mb-6">
            <Sparkles className="w-20 h-20 text-warning mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground mb-2">No Plans Yet</h2>
            <p className="text-muted-foreground text-lg">
              Complete your onboarding to get personalized meal and workout plans!
            </p>
          </div>
          <button
            onClick={() => (window.location.href = '/onboarding')}
            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </button>
        </Card>
      </div>
    );
  }

  // Generating state
  if (planStatus?.meal_plan_status === 'generating' || planStatus?.workout_plan_status === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-6"
          >
            <Zap className="w-16 h-16 text-primary-600 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Generating Your Plans</h2>
          <p className="text-muted-foreground mb-4">
            Our AI is creating personalized {planStatus.meal_plan_status === 'generating' && 'meal '}
            {planStatus.workout_plan_status === 'generating' && 'workout '} plans for you...
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            {planStatus.meal_plan_status === 'generating' && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Meal Plan</span>
              </div>
            )}
            {planStatus.workout_plan_status === 'generating' && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Workout Plan</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-4">This usually takes 30-60 seconds...</p>
        </Card>
      </div>
    );
  }

  // Failed state
  if (planStatus?.meal_plan_status === 'failed' || planStatus?.workout_plan_status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
        <Card variant="elevated" padding="lg" className="w-full max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Generation Failed</h2>
          <p className="text-muted-foreground mb-4">
            {planStatus.meal_plan_error || planStatus.workout_plan_error || 'Something went wrong'}
          </p>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  // Main plans view
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                Your Personalized Plans
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Personalization Level:{' '}
                <span className={`font-semibold ${
                  tier === 'PREMIUM' ? 'text-purple-600' :
                  tier === 'STANDARD' ? 'text-blue-600' :
                  'text-green-600'
                }`}>
                  {tier}
                </span>
              </p>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          </div>

          {/* Tier Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {tier === 'BASIC' && 'Getting Started - Answer more questions to unlock advanced features!'}
              {tier === 'STANDARD' && 'Good Progress - Fill out more details for premium personalization!'}
              {tier === 'PREMIUM' && 'Full Personalization - You\'re getting the best recommendations!'}
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger
              value="meals"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600"
            >
              <ChefHat className="w-4 h-4" />
              Meal Plan
            </TabsTrigger>
            <TabsTrigger
              value="workouts"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600"
            >
              <Dumbbell className="w-4 h-4" />
              Workout Plan
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="meals" className="mt-0">
              {mealPlan ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <MealPlanView plan={mealPlan.plan_data} tier={tier} />

                  {/* Upgrade Prompt for BASIC users */}
                  {tier === 'BASIC' && (
                    <div className="mt-6">
                      <UpgradePrompt
                        title="🚀 Unlock Advanced Meal Planning"
                        description="Get meal prep strategies, advanced tips, and more personalized recipes!"
                        benefits={[
                          'Batch cooking guides',
                          'Time-saving meal prep hacks',
                          'Storage and reheating tips',
                          '2x more personalized tips',
                        ]}
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <Card padding="lg" className="text-center">
                  <Apple className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No meal plan available</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="workouts" className="mt-0">
              {workoutPlan ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <WorkoutPlanView plan={workoutPlan.plan_data} tier={tier} />

                  {/* Upgrade Prompt for BASIC users */}
                  {tier === 'BASIC' && (
                    <div className="mt-6">
                      <UpgradePrompt
                        title="💪 Unlock Advanced Training Features"
                        description="Get periodization plans, injury prevention, and nutrition timing guidance!"
                        benefits={[
                          'Progressive overload strategies',
                          'Deload week planning',
                          'Injury prevention protocols',
                          'Pre/post workout nutrition timing',
                        ]}
                      />
                    </div>
                  )}
                </motion.div>
              ) : (
                <Card padding="lg" className="text-center">
                  <Dumbbell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No workout plan available</p>
                </Card>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
