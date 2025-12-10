import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Activity, Apple, Dumbbell } from 'lucide-react';
import { progressTrackingService } from '@/features/progress/api/progressTrackingService';
import { mealTrackingService } from '@/features/nutrition/api/mealTrackingService';
import { workoutTrackingService } from '@/features/workout/api/workoutTrackingService';

interface ProgressChartsProps {
  userId: string;
  startDate: Date;
  endDate: Date;
}

interface WeightDataPoint {
  date: string;
  weight: number;
  bodyFat?: number;
}

interface NutritionDataPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface WorkoutDataPoint {
  date: string;
  sessions: number;
  totalVolume: number;
  totalCalories: number;
}

export function ProgressCharts({ userId, startDate, endDate }: ProgressChartsProps) {
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([]);
  const [nutritionData, setNutritionData] = useState<NutritionDataPoint[]>([]);
  const [workoutData, setWorkoutData] = useState<WorkoutDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight');

  useEffect(() => {
    loadAllData();
  }, [userId, startDate, endDate]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadWeightData(), loadNutritionData(), loadWorkoutData()]);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeightData = async () => {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const result = await progressTrackingService.getWeightHistory(
      userId,
      startDateStr,
      endDateStr
    );

    if (result.success && result.data) {
      const formattedData = result.data.map((item: any) => ({
        date: new Date(item.measurement_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        weight: item.weight_kg,
        bodyFat: item.body_fat_percentage,
      }));
      setWeightData(formattedData);
    }
  };

  const loadNutritionData = async () => {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const result = await mealTrackingService.getDailyLogs(
      userId,
      startDateStr,
      endDateStr,
      100,
      0
    );

    if (result.success && result.data) {
      const formattedData = result.data.map((item: any) => ({
        date: new Date(item.log_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        calories: item.total_calories || 0,
        protein: item.total_protein_g || 0,
        carbs: item.total_carbs_g || 0,
        fats: item.total_fats_g || 0,
      }));
      setNutritionData(formattedData);
    }
  };

  const loadWorkoutData = async () => {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const result = await workoutTrackingService.getWorkoutHistory(
      userId,
      startDateStr,
      endDateStr,
      100,
      0
    );

    if (result.success && result.data) {
      // Group by date
      const grouped: Record<string, any> = {};
      result.data.forEach((session: any) => {
        const date = new Date(session.workout_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        if (!grouped[date]) {
          grouped[date] = {
            date,
            sessions: 0,
            totalVolume: 0,
            totalCalories: 0,
          };
        }
        grouped[date].sessions += 1;
        grouped[date].totalVolume += session.total_volume_kg || 0;
        grouped[date].totalCalories += session.total_calories_burned || 0;
      });

      setWorkoutData(Object.values(grouped));
    }
  };

  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return 0;
    const firstValue = data[0][key];
    const lastValue = data[data.length - 1][key];
    return ((lastValue - firstValue) / firstValue) * 100;
  };

  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) return null;
    const isPositive = value > 0;
    return (
      <div
        className={`flex items-center text-sm ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
        {Math.abs(value).toFixed(1)}%
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weight" className="flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Weight
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center">
            <Apple className="h-4 w-4 mr-2" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="workout" className="flex items-center">
            <Dumbbell className="h-4 w-4 mr-2" />
            Workouts
          </TabsTrigger>
        </TabsList>

        {/* Weight Chart */}
        <TabsContent value="weight">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Weight Progress</h3>
              {weightData.length > 0 && (
                <TrendIndicator value={calculateTrend(weightData, 'weight')} />
              )}
            </div>

            {weightData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No weight data available for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Body Fat (%)', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Weight (kg)"
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  {weightData.some((d) => d.bodyFat) && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="bodyFat"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      name="Body Fat (%)"
                      dot={{ fill: '#f59e0b', r: 4 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </TabsContent>

        {/* Nutrition Chart */}
        <TabsContent value="nutrition">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Nutrition Trends</h3>
              {nutritionData.length > 0 && (
                <TrendIndicator value={calculateTrend(nutritionData, 'calories')} />
              )}
            </div>

            {nutritionData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No nutrition data available for this period
              </div>
            ) : (
              <div className="space-y-6">
                {/* Calories */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Daily Calories</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={nutritionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="calories"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        name="Calories"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Macros */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Macronutrients</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={nutritionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis label={{ value: 'Grams', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="protein" fill="#ef4444" name="Protein (g)" />
                      <Bar dataKey="carbs" fill="#3b82f6" name="Carbs (g)" />
                      <Bar dataKey="fats" fill="#f59e0b" name="Fats (g)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Workout Chart */}
        <TabsContent value="workout">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Workout Performance</h3>
              {workoutData.length > 0 && (
                <TrendIndicator value={calculateTrend(workoutData, 'totalVolume')} />
              )}
            </div>

            {workoutData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No workout data available for this period
              </div>
            ) : (
              <div className="space-y-6">
                {/* Volume */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Total Volume (kg)</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalVolume" fill="#3b82f6" name="Volume (kg)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Sessions & Calories */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Sessions & Calories Burned</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={workoutData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sessions"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        name="Sessions"
                        dot={{ fill: '#8b5cf6', r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="totalCalories"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Calories Burned"
                        dot={{ fill: '#ef4444', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
