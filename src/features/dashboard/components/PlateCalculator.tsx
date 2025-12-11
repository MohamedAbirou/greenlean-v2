/**
 * Plate Calculator Component
 * Calculates plates needed to load a barbell for a specific weight
 * Supports standard and Olympic plates
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

interface PlateSet {
  weight: number;
  count: number;
  color?: string;
}

interface PlateCalculatorProps {
  targetWeight?: number;
  onClose?: () => void;
}

export function PlateCalculator({ targetWeight = 0, onClose }: PlateCalculatorProps) {
  const [weight, setWeight] = useState(targetWeight || 100);
  const [barWeight, setBarWeight] = useState(20); // Standard Olympic bar
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [plateSystem, setPlateSystem] = useState<'olympic' | 'standard'>('olympic');

  // Olympic plates (kg): Red 25, Blue 20, Yellow 15, Green 10, White 5, Black 2.5, Chrome 1.25, Small 0.5
  const olympicPlatesKg = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5];
  const olympicPlatesLbs = [45, 35, 25, 10, 5, 2.5];

  // Standard plates
  const standardPlatesKg = [20, 15, 10, 5, 2.5, 1.25];
  const standardPlatesLbs = [45, 35, 25, 10, 5, 2.5];

  const availablePlates =
    unit === 'kg'
      ? plateSystem === 'olympic'
        ? olympicPlatesKg
        : standardPlatesKg
      : plateSystem === 'olympic'
        ? olympicPlatesLbs
        : standardPlatesLbs;

  // Plate colors (Olympic standard)
  const getPlateColor = (plateWeight: number): string => {
    if (unit === 'kg') {
      switch (plateWeight) {
        case 25:
          return 'bg-red-500';
        case 20:
          return 'bg-blue-500';
        case 15:
          return 'bg-yellow-500';
        case 10:
          return 'bg-green-500';
        case 5:
          return 'bg-white border-2 border-gray-300';
        case 2.5:
          return 'bg-gray-800';
        case 1.25:
          return 'bg-gray-400';
        case 0.5:
          return 'bg-gray-300';
        default:
          return 'bg-gray-500';
      }
    } else {
      // lbs colors
      switch (plateWeight) {
        case 45:
          return 'bg-red-500';
        case 35:
          return 'bg-blue-500';
        case 25:
          return 'bg-yellow-500';
        case 10:
          return 'bg-green-500';
        case 5:
          return 'bg-white border-2 border-gray-300';
        case 2.5:
          return 'bg-gray-400';
        default:
          return 'bg-gray-500';
      }
    }
  };

  // Calculate plates needed
  const calculatePlates = (): PlateSet[] => {
    let remainingWeight = weight - barWeight;

    if (remainingWeight <= 0) {
      return [];
    }

    // Weight per side
    let weightPerSide = remainingWeight / 2;
    const plates: PlateSet[] = [];

    for (const plate of availablePlates) {
      const count = Math.floor(weightPerSide / plate);
      if (count > 0) {
        plates.push({
          weight: plate,
          count,
          color: getPlateColor(plate),
        });
        weightPerSide -= count * plate;
      }
    }

    return plates;
  };

  const plates = calculatePlates();
  const totalPlateWeight = plates.reduce((sum, p) => sum + p.weight * p.count, 0) * 2;
  const actualWeight = barWeight + totalPlateWeight;
  const difference = weight - actualWeight;

  // Quick weight presets
  const presets = unit === 'kg' ? [60, 80, 100, 120, 140, 160, 180, 200] : [135, 185, 225, 275, 315, 365, 405, 495];

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Plate Calculator</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Calculate plates needed to load your barbell
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target Weight */}
          <div>
            <label className="text-sm font-medium mb-2 block">Target Weight</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
                step={unit === 'kg' ? 2.5 : 5}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-lg font-semibold text-center"
              />
              <span className="flex items-center text-muted-foreground font-medium">
                {unit}
              </span>
            </div>
          </div>

          {/* Bar Weight */}
          <div>
            <label className="text-sm font-medium mb-2 block">Bar Weight</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={barWeight}
                onChange={(e) => setBarWeight(parseFloat(e.target.value) || 20)}
                step={5}
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-center"
              />
              <span className="flex items-center text-muted-foreground">{unit}</span>
            </div>
          </div>

          {/* Unit Toggle */}
          <div>
            <label className="text-sm font-medium mb-2 block">Unit</label>
            <div className="flex gap-2">
              <button
                onClick={() => setUnit('kg')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                  unit === 'kg'
                    ? 'bg-primary-500 text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                kg
              </button>
              <button
                onClick={() => setUnit('lbs')}
                className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                  unit === 'lbs'
                    ? 'bg-primary-500 text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                lbs
              </button>
            </div>
          </div>
        </div>

        {/* Plate System */}
        <div>
          <label className="text-sm font-medium mb-2 block">Plate System</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPlateSystem('olympic')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                plateSystem === 'olympic'
                  ? 'bg-primary-500 text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              🏋️ Olympic
            </button>
            <button
              onClick={() => setPlateSystem('standard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                plateSystem === 'standard'
                  ? 'bg-primary-500 text-white'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Standard
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div>
          <label className="text-sm font-medium mb-2 block">Quick Weights</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setWeight(preset)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  weight === preset
                    ? 'bg-primary-500 text-white'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {preset}
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="p-6 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Plates Per Side</h3>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {actualWeight}
                {unit}
              </p>
              <p className="text-xs text-muted-foreground">
                {difference !== 0 && (
                  <Badge variant={difference > 0 ? 'warning' : 'success'} className="text-xs">
                    {difference > 0 ? '+' : ''}
                    {difference.toFixed(1)}
                    {unit} {difference > 0 ? 'short' : 'over'}
                  </Badge>
                )}
              </p>
            </div>
          </div>

          {plates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-4xl mb-2">🏋️</p>
              <p>Just the bar! No plates needed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {plates.map((plate, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 bg-background/50 rounded-lg"
                >
                  {/* Plate Visual */}
                  <div className="flex gap-1">
                    {Array.from({ length: plate.count }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-12 h-16 rounded ${plate.color} flex items-center justify-center text-white font-bold text-xs shadow-md`}
                      >
                        {plate.weight}
                      </div>
                    ))}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {plate.count}x {plate.weight}
                      {unit} plates
                    </p>
                    <p className="text-sm text-muted-foreground">
                      = {(plate.count * plate.weight).toFixed(1)}
                      {unit} per side
                    </p>
                  </div>

                  {/* Total for both sides */}
                  <div className="text-right">
                    <Badge variant="outline">
                      {(plate.count * plate.weight * 2).toFixed(1)}
                      {unit} total
                    </Badge>
                  </div>
                </div>
              ))}

              {/* Summary */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Bar ({barWeight}
                    {unit}) + Plates ({totalPlateWeight}
                    {unit})
                  </span>
                  <span className="font-semibold">
                    = {actualWeight}
                    {unit}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading Order Tip */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">💡 Pro Tip: Loading Order</h4>
          <p className="text-xs text-muted-foreground">
            Always load plates from heaviest to lightest, and secure with collars. Load both
            sides evenly to maintain balance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
