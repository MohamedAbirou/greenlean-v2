/**
 * Dashboard Page - 2026 Modern UI/UX
 * Engaging, beautiful, premium experience for fitness tracking
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Activity, Apple, BarChart3, Dumbbell } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { NutritionTab } from '../components/NutritionTab';
import { OverviewTab } from '../components/OverviewTab';
import { ProgressTabNew } from '../components/ProgressTab';
import { WorkoutTab } from '../components/WorkoutTab';

export function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const tabs = [
    {
      value: 'overview',
      label: 'Overview',
      icon: Activity,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
    },
    {
      value: 'nutrition',
      label: 'Nutrition',
      icon: Apple,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      value: 'workout',
      label: 'Workout',
      icon: Dumbbell,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
    },
    {
      value: 'progress',
      label: 'Progress',
      icon: BarChart3,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Hero Section with Floating Elements */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500/5 via-purple-500/5 to-pink-500/5 dark:from-primary-500/10 dark:via-purple-500/10 dark:to-pink-500/10 border-b border-border/50">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 mb-6 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary-500 to-purple-500 animate-pulse" />
              <span className="text-xs font-medium bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400 bg-clip-text text-transparent">
                Your Fitness Command Center
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
              Welcome Back, Champion! 🏆
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Track your journey, smash your goals, and transform your life with AI-powered insights
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-20 pb-12">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Modern Floating Tab Navigation */}
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 gap-2 p-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary-500/10 rounded-2xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;

                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className={`relative px-6 py-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-br ${tab.bgGradient} border-2 border-transparent shadow-lg scale-105`
                        : 'hover:bg-muted/50 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform duration-300`}>
                        <Icon className={`h-5 w-5 ${
                          isActive
                            ? `bg-gradient-to-br ${tab.gradient} bg-clip-text text-transparent`
                            : 'text-muted-foreground'
                        }`} />
                        {isActive && (
                          <div className={`absolute inset-0 bg-gradient-to-br ${tab.gradient} opacity-20 blur-xl rounded-full`} />
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${
                        isActive
                          ? `bg-gradient-to-br ${tab.gradient} bg-clip-text text-transparent`
                          : 'text-foreground'
                      }`}>
                        {tab.label}
                      </span>
                    </div>

                    {/* Active Indicator */}
                    {isActive && (
                      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r ${tab.gradient} rounded-full`} />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content with Smooth Transitions */}
          <div className="animate-in fade-in duration-500">
            <TabsContent value="overview" className="mt-0">
              <OverviewTab />
            </TabsContent>

            <TabsContent value="nutrition" className="mt-0">
              <NutritionTab />
            </TabsContent>

            <TabsContent value="workout" className="mt-0">
              <WorkoutTab />
            </TabsContent>

            <TabsContent value="progress" className="mt-0">
              <ProgressTabNew />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
