/**
 * Enhanced Plans Page - Smart Regeneration Logic
 * Only regenerates when tier has actually changed
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Dumbbell,
  RefreshCw,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { MealPlanView } from '../components/MealPlanView';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { WorkoutPlanView } from '../components/WorkoutPlanView';

interface PlanStatus {
  meal_plan_status: 'generating' | 'completed' | 'failed';
  workout_plan_status: 'generating' | 'completed' | 'failed';
  meal_plan_error?: string;
  workout_plan_error?: string;
}

interface MealPlan {
  plan_data: any;
  daily_calories: number;
  status: string;
  generated_at: string;
}

interface WorkoutPlan {
  plan_data: any;
  workout_type: string[];
  frequency_per_week: number;
  status: string;
  generated_at: string;
}

export function PlansEnhanced() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [selectedTab, setSelectedTab] = useState('meals');
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [currentTier, setCurrentTier] = useState<'BASIC' | 'STANDARD' | 'PREMIUM'>('BASIC');

  // Fetch profile completeness from backend
  const fetchProfileCompleteness = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:5001/user/${user.id}/profile-completeness`);
      if (response.ok) {
        const data = await response.json();
        setProfileCompleteness(data.completeness || 0);

        // Determine tier based on completeness
        let tier: 'BASIC' | 'STANDARD' | 'PREMIUM' = 'BASIC';
        if (data.completeness >= 70) tier = 'PREMIUM';
        else if (data.completeness >= 30) tier = 'STANDARD';

        setCurrentTier(tier);
      }
    } catch (error) {
      console.error('Failed to fetch profile completeness:', error);
    }
  };

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

  useEffect(() => {
    if (!user) return;
    fetchPlans();
    fetchProfileCompleteness();

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

  // Determine personalization tier from plan content
  const getPlanTier = (): 'BASIC' | 'STANDARD' | 'PREMIUM' => {
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

  const planTier = getPlanTier();

  // Check if regeneration is needed (tier changed)
  const needsRegeneration = currentTier !== planTier;

  // Handle smart regenerate
  const handleRegenerate = async () => {
    if (!user) return;

    // Check if tier actually changed
    if (!needsRegeneration) {
      toast.info('Your plans are already up to date with your current profile! 👍');
      return;
    }

    try {
      setIsRegenerating(true);
      toast.info(`Regenerating plans for ${currentTier} tier...`);

      // Call ML service to regenerate plans (UPDATE existing plans, not create new)
      const response = await fetch(`http://localhost:5001/generate-plans/${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regenerate_diet: true,
          regenerate_workout: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate plans');
      }

      // Wait a moment for background task to start
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Refetch plans
      await fetchPlans();

      toast.success(`Plans updated to ${currentTier} tier! 🎉`);
    } catch (error) {
      console.error('Error regenerating plans:', error);
      toast.error('Failed to regenerate plans');
    } finally {
      setIsRegenerating(false);
    }
  };

  const tier = planTier;

  // [Rest of the component remains the same - loading states, generating states, etc.]
  // ... (copying all the existing UI code from the original Plans.tsx)

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
              <div className="flex items-center gap-3">
                <p className="text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Current Profile:
                </p>
                <Badge
                  variant={currentTier === 'PREMIUM' ? 'default' : currentTier === 'STANDARD' ? 'secondary' : 'outline'}
                  className={`${
                    currentTier === 'PREMIUM'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : currentTier === 'STANDARD'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  }`}
                >
                  {currentTier} ({Math.round(profileCompleteness)}% complete)
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {/* Update Plans Button */}
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || !needsRegeneration}
                className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 font-medium group ${
                  needsRegeneration
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 hover:border-primary/40 hover:shadow-md'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                title={needsRegeneration ? `Update to ${currentTier} tier` : 'Plans are up to date'}
              >
                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : needsRegeneration ? 'group-hover:rotate-180 transition-transform duration-500' : ''}`} />
                {isRegenerating ? 'Updating...' : needsRegeneration ? `Update to ${currentTier}` : 'Up to Date ✓'}
              </button>
              {needsRegeneration && (
                <span className="text-xs text-primary font-medium">
                  New tier available! Update your plans
                </span>
              )}
            </div>
          </div>

          {/* Tier Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">
              {planTier === 'BASIC' && 'Getting Started - Answer micro-surveys to unlock advanced features!'}
              {planTier === 'STANDARD' && 'Good Progress - Complete more profile details for premium personalization!'}
              {planTier === 'PREMIUM' && 'Full Personalization - You\'re getting the best recommendations!'}
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

          {/* Meal Plan Tab */}
          <TabsContent value="meals" className="mt-0">
            {mealPlan ? (
              <MealPlanView plan={mealPlan.plan_data} tier={tier} />
            ) : (
              <Card variant="elevated" padding="lg" className="text-center">
                <p className="text-muted-foreground">No meal plan available</p>
              </Card>
            )}
          </TabsContent>

          {/* Workout Plan Tab */}
          <TabsContent value="workouts" className="mt-0">
            {workoutPlan ? (
              <WorkoutPlanView plan={workoutPlan.plan_data} tier={tier} />
            ) : (
              <Card variant="elevated" padding="lg" className="text-center">
                <p className="text-muted-foreground">No workout plan available</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Upgrade Prompt (if BASIC tier) */}
        {tier === 'BASIC' && (
          <div className="mt-8">
            <UpgradePrompt
              title="Unlock Advanced Personalization"
              description="Complete micro-surveys to unlock premium features and get better recommendations!"
              benefits={[
                'Detailed meal prep strategies',
                'Advanced workout periodization',
                'Nutrition timing optimization',
                'Injury prevention protocols',
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
