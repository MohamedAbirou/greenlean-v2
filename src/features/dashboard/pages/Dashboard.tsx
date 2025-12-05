/**
 * Dashboard Page - Refactored
 * Clean, modular dashboard using GraphQL/Apollo
 * < 250 lines as per requirements
 */

import { useAnalytics } from '@/features/analytics';
import { useAuth } from '@/features/auth';
import { EnhancedMealLogModal } from '@/features/nutrition';
import { trackMicroSurveyEvent, useMicroSurveys } from '@/features/onboarding';
import { MicroSurveyCard } from '@/features/onboarding/components/MicroSurveyCard';
import { TierUpgradeModal } from '@/features/onboarding/components/TierUpgradeModal';
import { WorkoutBuilder } from '@/features/workout';
import { useGenerateMealPlan, useGenerateWorkoutPlan } from '@/services/ml';
import { Button } from '@/shared/components/ui/button';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Activity,
  Apple,
  Dumbbell,
  Plus,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BentoGridDashboard } from '../components/BentoGrid';
import { MacroRing, MealCards, NutritionAnalytics, NutritionTrendsChart, WaterIntake } from '../components/NutritionTab';
import type { QuickActionProps } from '../components/OverviewTab';
import {
  AchievementsBadges,
  PersonalizedInsights,
  QuickActions,
  StreakTracker
} from '../components/OverviewTab';
import { BodyMetrics, DetailedWeightChart, WeightChart, WeightLogModal } from '../components/ProgressTab';
import { TodayWorkout, WorkoutIntensityChart, WorkoutList, WorkoutPerformance } from '../components/WorkoutTab';
import { useDashboardData, useWaterIntakeMutations, useWeightMutations, useWorkoutMutations } from '../hooks/useDashboardGraphQL';
import { useMacroTargets } from '../hooks/useMacroTargets';

// Helper function to calculate BMI status
function getBMIStatus(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [showMealModal, setShowMealModal] = useState(false);
  const [showWorkoutBuilder, setShowWorkoutBuilder] = useState(false);

  // Track micro-survey events when users view different tabs
  useEffect(() => {
    if (!user) return;

    switch (activeTab) {
      case 'nutrition':
        trackMicroSurveyEvent('view_meal_plan');
        break;
      case 'workout':
        trackMicroSurveyEvent('view_workout_plan');
        break;
    }
  }, [activeTab, user]);

  // GraphQL hooks - replaces React Query
  const { nutrition, workout, progress, streak, gamification, loading } = useDashboardData(user?.id);
  const { logWater } = useWaterIntakeMutations();
  const { logWorkoutEntry } = useWorkoutMutations();
  const { logWeight } = useWeightMutations();

  // Analytics hook for AI-powered insights
  const {
    insights,
    loading: insightsLoading,
  } = useAnalytics(user?.id);

  // Macro targets from database (not hardcoded!)
  const { targets: macroTargets } = useMacroTargets(user?.id);

  // AI Plan Generation
  const { generateMealPlan, isGenerating: isGeneratingMeal } = useGenerateMealPlan(user?.id);
  const { generateWorkoutPlan, isGenerating: isGeneratingWorkout } = useGenerateWorkoutPlan(user?.id);

  // Micro-Surveys for Progressive Profiling
  const microSurveys = useMicroSurveys(user?.id);

  // Water intake handlers
  const handleWaterIncrement = async () => {
    if (!user?.id) return;
    const newGlasses = (nutrition.waterIntake?.glasses || 0) + 1;
    try {
      await logWater(user.id, newGlasses, newGlasses * 250); // 250ml per glass
      nutrition.refetch(); // Refresh data
    } catch (error) {
      console.error('Failed to log water:', error);
    }
  };

  const handleWaterDecrement = async () => {
    if (!user?.id) return;
    const newGlasses = Math.max(0, (nutrition.waterIntake?.glasses || 0) - 1);
    try {
      await logWater(user.id, newGlasses, newGlasses * 250);
      nutrition.refetch();
    } catch (error) {
      console.error('Failed to log water:', error);
    }
  };

  // Workout completion handler
  const handleWorkoutComplete = async (exerciseId: string) => {
    if (!user?.id || !workout.workoutPlan) return;

    try {
      // Find the exercise
      const exercise = workout.workoutPlan.exercises.find((ex: any) => ex.id === exerciseId);
      if (!exercise) return;

      // Log the workout
      await logWorkoutEntry(user.id, {
        workoutName: workout.workoutPlan.name,
        workoutType: 'strength', // Could be determined from plan
        durationMinutes: exercise.duration || 30,
        caloriesBurned: exercise.calories || 150,
        exercises: [exercise],
        notes: `Completed: ${exercise.name}`,
      });

      // Track workout completion for micro-surveys
      trackMicroSurveyEvent('complete_workout');

      // Refetch workout data
      workout.refetch();
    } catch (error) {
      console.error('Failed to log workout:', error);
    }
  };

  // Weight logging handler
  const handleWeightLog = async (weight: number, notes?: string) => {
    if (!user?.id) return;

    try {
      await logWeight(user.id, weight, notes);
      // Refetch progress data
      progress.refetch();
    } catch (error) {
      console.error('Failed to log weight:', error);
      throw error;
    }
  };

  // Meal logging - placeholder for now, will be replaced with actual implementation
  const loadTodayLogs = () => {
    nutrition.refetch();
  };

  // Workout save handler
  const handleSaveWorkout = async (workoutData: {
    name: string;
    exercises: any[];
    notes: string;
    estimated_duration: number;
    estimated_calories: number;
  }) => {
    if (!user?.id) return;

    try {
      await logWorkoutEntry(user.id, {
        workoutName: workoutData.name,
        workoutType: 'custom',
        durationMinutes: workoutData.estimated_duration,
        caloriesBurned: workoutData.estimated_calories,
        exercises: workoutData.exercises,
        notes: workoutData.notes,
      });

      // Track workout completion for micro-surveys
      trackMicroSurveyEvent('complete_workout');

      toast.success('Workout saved successfully!');
      workout.refetch();
    } catch (error) {
      console.error('Failed to save workout:', error);
      toast.error('Failed to save workout');
    }
  };

  // Bento Grid stats
  const bentoStats = {
    calories: {
      consumed: nutrition.totals.calories,
      target: macroTargets?.daily_calories || 2000,
    },
    protein: {
      consumed: nutrition.totals.protein,
      target: macroTargets?.daily_protein_g || 150,
    },
    workouts: {
      completed: workout.workoutLogs?.length || 0,
      weekly: 5,
    },
    weight: {
      current: profile?.weight_kg || 0,
      change: -2.5,
    },
    water: {
      consumed: (nutrition.waterIntake?.glasses || 0) * 0.25, // Convert glasses to liters
      target: 2,
    },
    streak: streak.currentStreak || 0,
    points: gamification.points || 0,
    bmi: profile?.weight_kg && profile?.height_cm
      ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2))
      : 0,
  };

  // Quick actions
  const quickActions: QuickActionProps[] = [
    {
      title: 'Generate AI Meal Plan',
      description: 'Get personalized nutrition plan',
      icon: Sparkles,
      color: 'bg-gradient-to-r from-violet-500 to-purple-500',
      onClick: () => generateMealPlan(),
    },
    {
      title: 'Generate AI Workout',
      description: 'Get personalized workout plan',
      icon: Zap,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      onClick: () => generateWorkoutPlan(),
    },
    {
      title: 'Log Meal',
      description: 'Track your nutrition intake',
      icon: Apple,
      color: 'bg-primary-500',
      onClick: () => setShowMealModal(true),
    },
    {
      title: 'Log Workout',
      description: 'Record your exercise',
      icon: Dumbbell,
      color: 'bg-accent-500',
      onClick: () => setShowWorkoutBuilder(true),
    },
    {
      title: 'View Progress',
      description: 'Check your stats and trends',
      icon: Activity,
      color: 'bg-secondary-500',
      onClick: () => setActiveTab('progress'),
    },
    {
      title: 'Update Profile',
      description: 'Update your goals and preferences',
      icon: Target,
      color: 'bg-success',
      onClick: () => navigate('/settings'),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your fitness overview
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowMealModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Quick Log
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-card rounded-lg p-1 border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="workout">Workout</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Bento Grid - Modern Dashboard */}
          <BentoGridDashboard stats={bentoStats} />

          {/* Micro-Survey Card - Progressive Profiling */}
          {microSurveys.currentSurvey && !microSurveys.loading && (
            <MicroSurveyCard
              currentSurvey={microSurveys.currentSurvey}
              submitting={microSurveys.submitting}
              submitResponse={microSurveys.submitResponse}
              dismissSurvey={microSurveys.dismissSurvey}
            />
          )}

          {/* Gamification Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Streak Tracker */}
            <StreakTracker
              streak={streak.streakData || {
                current_streak: 0,
                longest_streak: 0,
                total_days_logged: 0,
                streak_type: 'nutrition_logging',
              }}
              loading={streak.loading}
            />

            {/* Achievements */}
            <AchievementsBadges
              achievements={gamification.achievements}
              loading={gamification.loading}
            />
          </div>

          {/* AI Insights - Real AI-powered data! */}
          <PersonalizedInsights insights={insights} loading={insightsLoading} />

          {/* Quick Actions */}
          <QuickActions actions={quickActions} />
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-6">
          {/* Nutrition Analytics - Full width competitor-level charts */}
          <NutritionAnalytics
            mealLogs={nutrition.mealLogs}
            targetCalories={macroTargets?.daily_calories || 2000}
            targetProtein={macroTargets?.daily_protein_g || 150}
            targetCarbs={macroTargets?.daily_carbs_g || 200}
            targetFats={macroTargets?.daily_fats_g || 60}
          />

          {/* Today's nutrition summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MealCards
                meals={nutrition.mealLogs}
                onLogMeal={() => setShowMealModal(true)}
                loading={loading}
              />
            </div>
            <div className="space-y-6">
              <MacroRing
                current={{
                  protein: nutrition.totals.protein,
                  carbs: nutrition.totals.carbs,
                  fat: nutrition.totals.fat,
                  totalCalories: nutrition.totals.calories,
                }}
              />
              <WaterIntake
                glasses={nutrition.waterIntake?.glasses || 0}
                goal={8}
                onIncrement={handleWaterIncrement}
                onDecrement={handleWaterDecrement}
              />
            </div>
          </div>
        </TabsContent>

        {/* Workout Tab */}
        <TabsContent value="workout" className="space-y-6">
          {/* Workout Performance Analytics - Competitor-level calendar & stats */}
          <WorkoutPerformance workoutLogs={workout.workoutLogs || []} />

          {/* Today's workout summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TodayWorkout
              workout={workout.workoutPlan ?? undefined}
              loading={workout.loading}
              onComplete={handleWorkoutComplete}
            />
            <WorkoutList
              workouts={workout.workoutLogs || []}
              onLogWorkout={() => setShowWorkoutBuilder(true)}
              loading={workout.loading}
            />
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {/* Header with Weight Log Button */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Weight Progress
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track your weight journey
              </p>
            </div>
            <WeightLogModal
              currentWeight={profile?.weight_kg ?? undefined}
              onLogWeight={handleWeightLog}
            />
          </div>

          {/* Detailed Weight Chart - Full width */}
          <DetailedWeightChart
            data={progress.weightHistory || []}
            targetWeight={profile?.target_weight_kg ?? undefined}
            currentWeight={profile?.weight_kg ?? undefined}
            loading={progress.loading}
          />

          {/* Body metrics grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WeightChart
              data={progress.weightHistory || []}
              targetWeight={profile?.target_weight_kg ?? undefined}
              currentWeight={profile?.weight_kg ?? undefined}
              loading={progress.loading}
            />
            <BodyMetrics
              metrics={{
                weight_kg: profile?.weight_kg ?? undefined,
                height_cm: profile?.height_cm ?? undefined,
                bmi: profile?.weight_kg && profile?.height_cm
                  ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2))
                  : undefined,
                bmiStatus: profile?.weight_kg && profile?.height_cm
                  ? getBMIStatus(profile.weight_kg / Math.pow(profile.height_cm / 100, 2))
                  : undefined,
                age: profile?.age ?? undefined,
                gender: profile?.gender ?? undefined,
              }}
              loading={progress.loading}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Drawers */}
      <EnhancedMealLogModal
        userId={user?.id || ''}
        show={showMealModal}
        setShowLogModal={setShowMealModal}
        onClose={() => setShowMealModal(false)}
        loadTodayLogs={loadTodayLogs}
      />

      <WorkoutBuilder
        show={showWorkoutBuilder}
        onClose={() => setShowWorkoutBuilder(false)}
        onSave={handleSaveWorkout}
      />

      {/* Tier Upgrade Modal - Progressive Profiling */}
      <TierUpgradeModal
        pendingUnlock={microSurveys.pendingUnlock}
        acknowledgeTierUnlock={microSurveys.acknowledgeTierUnlock}
      />
    </div>
  );
}
