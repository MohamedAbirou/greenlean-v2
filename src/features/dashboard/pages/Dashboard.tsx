/**
 * ULTIMATE Dashboard - Production Ready
 * MyFitnessPal/CalAI-level UX with ALL features
 */

import { useAuth } from '@/features/auth';
import { mealTrackingService } from '@/features/nutrition';
import { waterTrackingService } from '@/features/nutrition/api/waterTrackingService';
import { workoutTrackingService } from '@/features/workout';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import {
  Activity,
  Apple,
  BarChart3,
  Dumbbell,
  Scale,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ActivityCalendar } from '../components/ActivityCalendar';
import { BodyMeasurementModal } from '../components/BodyMeasurementModal';
import { DailyNotes } from '../components/DailyNotes';
import { DateRangeSelector } from '../components/DateRangeSelector';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { MacroBreakdown } from '../components/MacroBreakdown';
import { MealList } from '../components/MealList';
import { NutritionGoals } from '../components/NutritionGoals';
import { ProgressCharts } from '../components/ProgressCharts';
import { QuickMealLog } from '../components/QuickMealLog';
import { QuickWorkoutLog } from '../components/QuickWorkoutLog';
import { RecentAchievements } from '../components/RecentAchievements';
import { StreakTracker } from '../components/StreakTracker';
import { WaterTracker } from '../components/WaterTracker';
import { WeeklyComparison } from '../components/WeeklyComparison';
import { WorkoutList } from '../components/WorkoutList';

export function Dashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [chartDateRange, setChartDateRange] = useState(30); // days
  const [showMeasurementModal, setShowMeasurementModal] = useState(false);

  // Dashboard data
  const [todayStats, setTodayStats] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    workouts: 0,
    water: 0,
  });

  // Nutrition goals (default values, should come from user settings)
  const nutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fats: 65,
  };

  // Load today's data
  useEffect(() => {
    if (!user?.id) return;

    const loadTodayData = async () => {
      setIsLoading(true);

      try {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];

        // Load meals (returns array directly)
        const meals = await mealTrackingService.getDailyLogs(
          user.id,
          dateStr,
          dateStr,
          100,
          0
        );

        // Calculate nutrition totals (use correct field names with _g suffix)
        const nutritionTotals = (meals || []).reduce(
          (acc, meal) => ({
            calories: acc.calories + (meal.total_calories || 0),
            protein: acc.protein + (meal.total_protein || 0),
            carbs: acc.carbs + (meal.total_carbs || 0),
            fats: acc.fats + (meal.total_fats || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fats: 0 }
        );

        // Load workouts (returns {success, data} format)
        const workoutsResult = await workoutTrackingService.getWorkoutHistory(
          user.id,
          dateStr,
          dateStr,
          100,
          0
        );
        const workouts = workoutsResult.data || [];

        // Load water intake
        const waterResult = await waterTrackingService.getDailyTotal(user.id, dateStr);
        const waterMl = waterResult.data || 0;

        setTodayStats({
          ...nutritionTotals,
          workouts: workouts.length,
          water: Math.round((waterMl / 1000) * 10) / 10,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayData();
  }, [user?.id, selectedDate]);

  const handleDataRefresh = () => {
    // Trigger data reload
    setSelectedDate(new Date(selectedDate));
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome back, {profile?.full_name || 'User'}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Track your fitness journey
              </p>
            </div>

            {/* Date Selector */}
            <DateRangeSelector
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              showQuickNav
            />
          </div>

          {/* Quick Stats */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card variant="elevated" padding="md" className="hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Apple className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Calories</p>
                    <p className="text-2xl font-bold">{todayStats.calories}</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md" className="hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Protein</p>
                    <p className="text-2xl font-bold">{Math.round(todayStats.protein)}g</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md" className="hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Dumbbell className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Workouts</p>
                    <p className="text-2xl font-bold">{todayStats.workouts}</p>
                  </div>
                </div>
              </Card>

              <Card variant="elevated" padding="md" className="hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Activity className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Water</p>
                    <p className="text-2xl font-bold">{todayStats.water}L</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger value="workout" className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              Workout
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Row 1: Streaks and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StreakTracker userId={user.id} />

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => {
                      // Trigger QuickMealLog by simulating click
                      const mealButton = document.querySelector('[data-quick-meal-log]') as HTMLElement;
                      if (mealButton) mealButton.click();
                    }}
                  >
                    <Apple className="h-6 w-6 mb-1" />
                    <span className="text-sm">Log Meal</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => {
                      // Trigger QuickWorkoutLog
                      const workoutButton = document.querySelector('[data-quick-workout-log]') as HTMLElement;
                      if (workoutButton) workoutButton.click();
                    }}
                  >
                    <Dumbbell className="h-6 w-6 mb-1" />
                    <span className="text-sm">Log Workout</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setShowMeasurementModal(true)}
                  >
                    <Scale className="h-6 w-6 mb-1" />
                    <span className="text-sm">Log Weight</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => setActiveTab('progress')}
                  >
                    <TrendingUp className="h-6 w-6 mb-1" />
                    <span className="text-sm">View Progress</span>
                  </Button>
                </div>
              </Card>
            </div>

            {/* Row 2: Nutrition Goals and Macro Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NutritionGoals
                current={todayStats}
                goals={nutritionGoals}
              />
              <MacroBreakdown
                protein={todayStats.protein}
                carbs={todayStats.carbs}
                fats={todayStats.fats}
              />
            </div>

            {/* Row 3: Water Tracker and Recent Achievements */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WaterTracker
                userId={user.id}
                selectedDate={selectedDate}
                onUpdate={handleDataRefresh}
              />
              <RecentAchievements userId={user.id} />
            </div>

            {/* Row 4: Weekly Comparison */}
            <WeeklyComparison userId={user.id} />

            {/* Row 5: Activity Calendar */}
            <ActivityCalendar userId={user.id} />

            {/* Row 6: Daily Notes */}
            <DailyNotes userId={user.id} selectedDate={selectedDate} />
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <MealList userId={user.id} selectedDate={selectedDate} />
          </TabsContent>

          {/* Workout Tab */}
          <TabsContent value="workout" className="space-y-6">
            <WorkoutList userId={user.id} selectedDate={selectedDate} />
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            {/* Date Range Selector for Charts */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Time Period</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setChartDateRange(7)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${chartDateRange === 7
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                      }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setChartDateRange(30)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${chartDateRange === 30
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                      }`}
                  >
                    30 Days
                  </button>
                  <button
                    onClick={() => setChartDateRange(90)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${chartDateRange === 90
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                      }`}
                  >
                    90 Days
                  </button>
                  <button
                    onClick={() => setChartDateRange(365)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${chartDateRange === 365
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                      }`}
                  >
                    1 Year
                  </button>
                </div>
              </div>
            </Card>

            {/* Progress Charts */}
            <ProgressCharts
              userId={user.id}
              startDate={
                new Date(
                  new Date().setDate(new Date().getDate() - chartDateRange)
                )
              }
              endDate={new Date()}
            />

            {/* Journey Timeline */}
            <Card variant="elevated" padding="lg">
              <h2 className="text-xl font-semibold mb-6">Your Fitness Journey</h2>
              <JourneyTimeline userId={user.id} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Action FABs */}
      {user && (
        <>
          <div data-quick-meal-log onClick={() => {/* meal log will handle */}}>
            <QuickMealLog userId={user.id} onSuccess={handleDataRefresh} />
          </div>
          <div data-quick-workout-log onClick={() => {/* workout log will handle */}}>
            <QuickWorkoutLog userId={user.id} onSuccess={handleDataRefresh} />
          </div>
        </>
      )}

      {/* Body Measurement Modal */}
      {user && (
        <BodyMeasurementModal
          userId={user.id}
          isOpen={showMeasurementModal}
          onClose={() => setShowMeasurementModal(false)}
          onSuccess={handleDataRefresh}
        />
      )}
    </div>
  );
}
