/**
 * Dashboard Page
 * Main dashboard with tabs for Overview, Nutrition, Workout, Progress
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

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

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dashboard overview with key metrics coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Nutrition tracking coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Workout tracking coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Progress charts coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
