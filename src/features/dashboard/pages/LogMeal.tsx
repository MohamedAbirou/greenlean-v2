/**
 * Log Meal Page
 * Comprehensive meal logging with multiple input methods
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { useAuth } from '@/features/auth';
import { useActiveMealPlan } from '../hooks/useDashboardData';
import { useCreateMealItem } from '../hooks/useDashboardMutations';

type LogMethod = 'manual' | 'voice' | 'barcode' | 'photo' | 'aiPlan' | 'template';

const getToday = () => new Date().toISOString().split('T')[0];

export function LogMeal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logMethod, setLogMethod] = useState<LogMethod>('manual');
  const [logDate, setLogDate] = useState(getToday());
  const [mealType, setMealType] = useState<string>('breakfast');

  const { data: mealPlanData } = useActiveMealPlan();
  const [createMealItem, { loading: creating }] = useCreateMealItem();

  const activeMealPlan = (mealPlanData as any)?.ai_meal_plansCollection?.edges?.[0]?.node;

  // Manual logging state
  const [foodName, setFoodName] = useState('');
  const [brandName, setBrandName] = useState('');
  const [servingQty, setServingQty] = useState('1');
  const [servingUnit, setServingUnit] = useState('serving');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');

  const handleManualLog = async () => {
    if (!user?.id || !foodName || !calories) return;

    await createMealItem({
      variables: {
        input: {
          user_id: user.id,
          food_name: foodName,
          brand_name: brandName || null,
          serving_qty: parseFloat(servingQty),
          serving_unit: servingUnit,
          calories: parseFloat(calories),
          protein: parseFloat(protein) || 0,
          carbs: parseFloat(carbs) || 0,
          fats: parseFloat(fats) || 0,
          meal_type: mealType,
          logged_at: new Date().toISOString(),
          source: 'manual',
        },
      },
    });

    navigate('/dashboard?tab=nutrition');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button onClick={() => navigate('/dashboard')} variant="ghost" className="mb-4">
          ← Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">Log Meal</h1>
        <p className="text-muted-foreground mt-2">
          Choose your preferred logging method
        </p>
      </div>

      {/* Date and Meal Type */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Meal Type</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background"
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logging Methods */}
      <Tabs value={logMethod} onValueChange={(v) => setLogMethod(v as LogMethod)}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="manual">✏️ Manual</TabsTrigger>
          <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
          <TabsTrigger value="barcode">📷 Barcode</TabsTrigger>
          <TabsTrigger value="photo">📸 Photo</TabsTrigger>
          <TabsTrigger value="aiPlan">🤖 AI Plan</TabsTrigger>
          <TabsTrigger value="template">📋 Template</TabsTrigger>
        </TabsList>

        {/* Manual Logging */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Food Name *</label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="Chicken Breast"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Brand (Optional)</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Brand Name"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Serving Quantity *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={servingQty}
                    onChange={(e) => setServingQty(e.target.value)}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Serving Unit *</label>
                  <input
                    type="text"
                    value={servingUnit}
                    onChange={(e) => setServingUnit(e.target.value)}
                    placeholder="serving, oz, g, etc."
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Calories *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="165"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="31"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="0"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fats (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fats}
                    onChange={(e) => setFats(e.target.value)}
                    placeholder="3.6"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleManualLog}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={creating}
                  disabled={!foodName || !calories}
                >
                  Log Meal
                </Button>
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Logging */}
        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice Logging</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🎤</div>
              <p className="text-muted-foreground mb-6">
                Voice logging feature coming soon. Speak your meals and we'll automatically
                log them.
              </p>
              <Button variant="outline" onClick={() => setLogMethod('manual')}>
                Use Manual Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Barcode Scanner */}
        <TabsContent value="barcode">
          <Card>
            <CardHeader>
              <CardTitle>Barcode Scanner</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-muted-foreground mb-6">
                Scan product barcodes to instantly log foods with complete nutrition info.
              </p>
              <Button variant="outline" onClick={() => setLogMethod('manual')}>
                Use Manual Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Scanning */}
        <TabsContent value="photo">
          <Card>
            <CardHeader>
              <CardTitle>Photo Scanning</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📸</div>
              <p className="text-muted-foreground mb-6">
                Take a photo of your meal and get estimated nutrition values using AI.
              </p>
              <Button variant="outline" onClick={() => setLogMethod('manual')}>
                Use Manual Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Meal Plan */}
        <TabsContent value="aiPlan">
          <Card>
            <CardHeader>
              <CardTitle>AI Meal Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {activeMealPlan ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select a meal from your active AI meal plan:
                  </p>
                  {/* AI meal plan meals would be listed here */}
                  <p className="text-center py-8 text-muted-foreground">
                    Meal plan integration coming soon
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No active meal plan found.
                  </p>
                  <Button variant="outline" onClick={() => navigate('/plans')}>
                    Generate Meal Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="template">
          <Card>
            <CardHeader>
              <CardTitle>Meal Templates</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-muted-foreground mb-6">
                Save and reuse your favorite meal combinations.
              </p>
              <Button variant="outline" onClick={() => setLogMethod('manual')}>
                Use Manual Entry
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
