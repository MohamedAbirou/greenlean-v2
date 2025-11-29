/**
 * Dashboard V2 - Bento Grid Redesign
 * Modern card-based layout with variable-sized widgets
 */

import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Apple,
  Flame,
  Dumbbell,
  Trophy,
  Target,
  Award,
  Plus,
  ArrowRight,
  Sparkles,
  Activity,
  Zap,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/features/dashboard';

// Quick stat card component
interface QuickStatProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down';
}

function QuickStat({ title, value, change, icon: Icon, color, trend }: QuickStatProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change !== undefined && (
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              trend === 'up' ? 'text-success' : 'text-error'
            )}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      </CardContent>
    </Card>
  );
}

// Quick action button component
interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}

function QuickAction({ title, description, icon: Icon, color, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl p-6 text-left transition-all hover:shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700"
    >
      <div className="flex items-start gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-semibold mb-1">{title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
        </div>
        <ArrowRight className="w-5 h-5 ml-auto flex-shrink-0 text-gray-400 group-hover:text-primary-500 transition-colors" />
      </div>
    </button>
  );
}

export default function DashboardV2() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { isLoading } = useDashboardData(user?.id);
  const [activeTimeRange, setActiveTimeRange] = useState<'week' | 'month' | 'year'>('week');

  // Mock data for now - will be replaced with real data
  const mockStats = {
    currentWeight: profile?.weight_kg || 70,
    targetWeight: 65, // Will come from new profiles.target_weight_kg column
    caloriesConsumed: 1456,
    caloriesTarget: 1800,
    workoutsThisWeek: 4,
    workoutsTarget: 5,
    currentStreak: 7,
    badges: 12,
  };

  const quickActions = [
    {
      title: 'Log Meal',
      description: 'Add food to your diary',
      icon: Apple,
      color: 'bg-gradient-to-br from-primary-500 to-primary-600',
      onClick: () => navigate('/dashboard?action=log-meal'),
    },
    {
      title: 'Log Workout',
      description: 'Record your exercise',
      icon: Dumbbell,
      color: 'bg-gradient-to-br from-accent-500 to-accent-600',
      onClick: () => navigate('/dashboard?action=log-workout'),
    },
    {
      title: 'Generate Meal Plan',
      description: 'Create a new AI plan',
      icon: Sparkles,
      color: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
      onClick: () => navigate('/quiz?action=generate-meal-plan'),
    },
    {
      title: 'View Progress',
      description: 'See your journey',
      icon: Activity,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      onClick: () => navigate('/dashboard?tab=progress'),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Here's your health overview for today
              </p>
            </div>
            <Badge className="bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900 dark:text-primary-300">
              <Flame className="w-4 h-4 mr-2 inline" />
              {mockStats.currentStreak} day streak
            </Badge>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto">
          {/* Quick Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <QuickStat
              title="Current Weight"
              value={`${mockStats.currentWeight}kg`}
              change={-2.5}
              trend="down"
              icon={TrendingDown}
              color="bg-gradient-to-br from-primary-500 to-primary-600"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <QuickStat
              title="Calories Today"
              value={`${mockStats.caloriesConsumed}/${mockStats.caloriesTarget}`}
              change={undefined}
              icon={Flame}
              color="bg-gradient-to-br from-accent-500 to-accent-600"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <QuickStat
              title="Workouts"
              value={`${mockStats.workoutsThisWeek}/${mockStats.workoutsTarget}`}
              change={25}
              trend="up"
              icon={Dumbbell}
              color="bg-gradient-to-br from-secondary-500 to-secondary-600"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <QuickStat
              title="Badges Earned"
              value={mockStats.badges}
              change={undefined}
              icon={Trophy}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
            />
          </motion.div>

          {/* Progress Card - Spans 2 columns */}
          <motion.div
            className="md:col-span-2 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary-500" />
                    Weight Progress
                  </CardTitle>
                  <div className="flex gap-2">
                    {(['week', 'month', 'year'] as const).map((range) => (
                      <Button
                        key={range}
                        variant={activeTimeRange === range ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveTimeRange(range)}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Progress to Goal</span>
                      <span className="text-sm font-semibold">
                        {((Math.abs(mockStats.currentWeight - mockStats.targetWeight) / 10) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all"
                        style={{
                          width: `${((Math.abs(mockStats.currentWeight - mockStats.targetWeight) / 10) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Weight Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Starting</div>
                      <div className="text-lg font-bold">{mockStats.currentWeight + 5}kg</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Current</div>
                      <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {mockStats.currentWeight}kg
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Goal</div>
                      <div className="text-lg font-bold">{mockStats.targetWeight}kg</div>
                    </div>
                  </div>

                  {/* Chart Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-400">
                      <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Weight chart coming soon</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Meal Plan - Spans 2 columns on large screens */}
          <motion.div
            className="md:col-span-2 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-primary-500" />
                    Today's Meals
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Meal
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((meal, index) => (
                    <div
                      key={meal}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900 dark:to-accent-900 flex items-center justify-center">
                          <span className="text-sm font-semibold">{meal.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{meal}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {index === 0 ? '350 cal' : 'Not logged'}
                          </div>
                        </div>
                      </div>
                      {index === 0 ? (
                        <Badge variant="outline" className="bg-success-light text-success">
                          Logged
                        </Badge>
                      ) : (
                        <Button size="sm" variant="ghost">
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions - Full width */}
          <motion.div
            className="md:col-span-2 lg:col-span-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                    >
                      <QuickAction {...action} />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Achievements Section */}
          <motion.div
            className="md:col-span-2 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-500" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: '7-Day Streak', description: 'Logged meals for 7 days straight', icon: '🔥' },
                    { name: 'First Workout', description: 'Completed your first workout', icon: '💪' },
                    { name: 'Calorie Goal', description: 'Met your calorie goal 5 times', icon: '🎯' },
                  ].map((achievement) => (
                    <div
                      key={achievement.name}
                      className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 border border-primary-200 dark:border-primary-800"
                    >
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-semibold">{achievement.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {achievement.description}
                        </div>
                      </div>
                      <Badge>New</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Today's Workout */}
          <motion.div
            className="md:col-span-2 lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary-500" />
                    Today's Workout
                  </CardTitle>
                  <Button size="sm" variant="outline">
                    View Full Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-accent-50 to-primary-50 dark:from-accent-950 dark:to-primary-950 border border-accent-200 dark:border-accent-800">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-lg">Upper Body Strength</h4>
                      <Badge className="bg-accent-500">30 min</Badge>
                    </div>
                    <div className="space-y-2">
                      {['Push-ups', 'Dumbbell Rows', 'Shoulder Press', 'Tricep Dips'].map((exercise) => (
                        <div key={exercise} className="flex items-center justify-between text-sm">
                          <span>{exercise}</span>
                          <span className="text-gray-600 dark:text-gray-400">3 sets × 12 reps</span>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full mt-4" size="lg">
                      Start Workout
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
