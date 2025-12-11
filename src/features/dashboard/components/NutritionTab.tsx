/**
 * Nutrition Tab
 * View and manage daily nutrition with quick logging
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { Badge } from '@/shared/components/ui/badge';
import { DateScroller } from './DateScroller';
import { MacroRing } from './MacroRing';
import {
  useMealItemsByDate,
  useCurrentMacroTargets,
  calculateDailyTotals,
} from '../hooks/useDashboardData';
import { useDeleteMealItem } from '../hooks/useDashboardMutations';

const getToday = () => new Date().toISOString().split('T')[0];

export function NutritionTab() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(getToday());

  const { data: mealData, loading, refetch } = useMealItemsByDate(selectedDate);
  const { data: targetsData } = useCurrentMacroTargets();
  const [deleteMealItem] = useDeleteMealItem();

  const nutritionLogs = (mealData as any)?.daily_nutrition_logsCollection?.edges?.map((e: any) => e.node) || [];
  const dailyTotals = calculateDailyTotals(nutritionLogs);

  const targets = (targetsData as any)?.user_macro_targetsCollection?.edges?.[0]?.node;
  const goals = {
    calories: targets?.daily_calories || 2000,
    protein: targets?.daily_protein_g || 150,
    carbs: targets?.daily_carbs_g || 200,
    fats: targets?.daily_fats_g || 60,
  };

  const handleDeleteMeal = async (id: string) => {
    if (confirm('Delete this nutrition log?')) {
      await deleteMealItem({ variables: { id } });
      refetch();
    }
  };

  // Group meals by meal_type
  const mealsByType = nutritionLogs.reduce((acc: any, log: any) => {
    const type = log.meal_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(log);
    return acc;
  }, {} as Record<string, any[]>);

  const caloriesPercentage = (dailyTotals.calories / goals.calories) * 100;
  const proteinPercentage = (dailyTotals.protein / goals.protein) * 100;
  const carbsPercentage = (dailyTotals.carbs / goals.carbs) * 100;
  const fatsPercentage = (dailyTotals.fats / goals.fats) * 100;

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Date Scroller */}
      <DateScroller selectedDate={selectedDate} onDateChange={setSelectedDate} />

      {/* Calorie Summary Card - MyFitnessPal Style */}
      <Card variant="elevated" className="overflow-hidden">
        <div className="bg-gradient-to-br from-primary-500/10 via-secondary-500/10 to-accent-500/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-foreground">Daily Nutrition</h3>
              <p className="text-sm text-muted-foreground">
                {selectedDate === getToday() ? 'Today' : new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}
              </p>
            </div>
            <Badge variant={caloriesPercentage > 100 ? 'error' : caloriesPercentage > 85 ? 'success' : 'primary'} className="text-lg px-4 py-2">
              {Math.round(caloriesPercentage)}%
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600 dark:text-primary-400">{Math.round(dailyTotals.calories)}</p>
              <p className="text-xs text-muted-foreground mt-1">Consumed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-foreground">{Math.round(goals.calories)}</p>
              <p className="text-xs text-muted-foreground mt-1">Goal</p>
            </div>
            <div className="text-center">
              <p className={`text-4xl font-bold ${goals.calories - dailyTotals.calories >= 0 ? 'text-success' : 'text-error'}`}>
                {Math.abs(Math.round(goals.calories - dailyTotals.calories))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{goals.calories - dailyTotals.calories >= 0 ? 'Remaining' : 'Over'}</p>
            </div>
          </div>

          <Progress value={Math.min(caloriesPercentage, 100)} className="h-3" />
        </div>
      </Card>

      {/* Macro Rings - CalAI Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Macronutrients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center">
              <MacroRing current={dailyTotals.protein} goal={goals.protein} color="#8b5cf6" size={120} />
              <p className="text-sm font-semibold mt-3">Protein</p>
              <p className="text-xs text-muted-foreground">{Math.round(dailyTotals.protein)}g / {goals.protein}g</p>
              <Progress value={Math.min(proteinPercentage, 100)} className="w-full h-2 mt-2" />
            </div>
            <div className="flex flex-col items-center">
              <MacroRing current={dailyTotals.carbs} goal={goals.carbs} color="#22c55e" size={120} />
              <p className="text-sm font-semibold mt-3">Carbs</p>
              <p className="text-xs text-muted-foreground">{Math.round(dailyTotals.carbs)}g / {goals.carbs}g</p>
              <Progress value={Math.min(carbsPercentage, 100)} className="w-full h-2 mt-2" />
            </div>
            <div className="flex flex-col items-center">
              <MacroRing current={dailyTotals.fats} goal={goals.fats} color="#f59e0b" size={120} />
              <p className="text-sm font-semibold mt-3">Fats</p>
              <p className="text-xs text-muted-foreground">{Math.round(dailyTotals.fats)}g / {goals.fats}g</p>
              <Progress value={Math.min(fatsPercentage, 100)} className="w-full h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions - Production Grade */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => navigate('/dashboard/log-meal')} variant="primary" size="lg" fullWidth className="h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">➕</span>
            <span className="font-semibold">Log Meal</span>
          </div>
        </Button>
        <Button onClick={() => navigate('/dashboard/log-meal?quick=true')} variant="secondary" size="lg" fullWidth className="h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="font-semibold">Quick Add</span>
          </div>
        </Button>
      </div>

      {/* Meals by Type - Enhanced Production Grade */}
      {Object.keys(mealsByType).length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Today's Meals</h3>
            <p className="text-sm text-muted-foreground">{nutritionLogs.length} meal{nutritionLogs.length !== 1 ? 's' : ''}</p>
          </div>
          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
            const logs = mealsByType[mealType];
            if (!logs) return null;

            const mealIcons: Record<string, string> = {
              breakfast: '🌅',
              lunch: '🌞',
              dinner: '🌙',
              snack: '🍎',
            };

            const mealTotals = logs.reduce((acc: any, log: any) => ({
              calories: acc.calories + (log.total_calories || 0),
              protein: acc.protein + (log.total_protein || 0),
              carbs: acc.carbs + (log.total_carbs || 0),
              fats: acc.fats + (log.total_fats || 0),
            }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

            return (
              <Card key={mealType} className="overflow-hidden">
                <div className="bg-gradient-to-r from-muted/50 to-transparent p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{mealIcons[mealType]}</span>
                      <div>
                        <h4 className="text-lg font-semibold capitalize">{mealType}</h4>
                        <p className="text-xs text-muted-foreground">{logs.length} log{logs.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{Math.round(mealTotals.calories)}</p>
                      <p className="text-xs text-muted-foreground">kcal</p>
                    </div>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{Math.round(mealTotals.protein)}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{Math.round(mealTotals.carbs)}g</p>
                      <p className="text-xs text-muted-foreground">Carbs</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{Math.round(mealTotals.fats)}g</p>
                      <p className="text-xs text-muted-foreground">Fats</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {(logs as any[]).map((log: any, idx: number) => (
                      <div key={log.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                #{idx + 1}
                              </Badge>
                              <p className="font-medium">{log.food_items?.length || 0} food item{log.food_items?.length !== 1 ? 's' : ''}</p>
                            </div>
                            {log.notes && (
                              <p className="text-sm text-muted-foreground mt-1">📝 {log.notes}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Logged at {new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/log-meal?edit=${log.id}`)}>
                              ✏️
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/log-meal?copy=${log.id}`)}>
                              📋
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMeal(log.id)}>
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => navigate(`/dashboard/log-meal?type=${mealType}`)}
                    variant="outline"
                    size="sm"
                    fullWidth
                    className="mt-3"
                  >
                    + Add to {mealType}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold mb-2">No Meals Logged Yet</h3>
            <p className="text-muted-foreground mb-6">Start tracking your nutrition to reach your goals!</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate('/dashboard/log-meal')} variant="primary" size="lg">
                Log Your First Meal
              </Button>
              <Button onClick={() => navigate('/dashboard/log-meal?quick=true')} variant="outline" size="lg">
                Quick Add
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
