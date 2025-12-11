/**
 * Dashboard Page
 * Main dashboard with tabs for Overview, Nutrition, Workout, Progress
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { OverviewTab } from '../components/OverviewTab';
import { NutritionTab } from '../components/NutritionTab';
import { WorkoutTab } from '../components/WorkoutTab';
import { ProgressTab } from '../components/ProgressTab';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your fitness journey with smart logging and insights
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview">
            <span className="mr-2">📊</span>
            Overview
          </TabsTrigger>
          <TabsTrigger value="nutrition">
            <span className="mr-2">🍎</span>
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="workout">
            <span className="mr-2">💪</span>
            Workout
          </TabsTrigger>
          <TabsTrigger value="progress">
            <span className="mr-2">📈</span>
            Progress
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="nutrition">
          <NutritionTab />
        </TabsContent>

        <TabsContent value="workout">
          <WorkoutTab />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
