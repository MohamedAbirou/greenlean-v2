/**
 * WeightChart Component
 * Visual weight progress over time
 * Uses design system colors
 */

import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/design-system';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { WeightDisplay } from '@/shared/components/display/WeightDisplay';
import { useUnitSystem } from '@/shared/hooks/useUnitSystem';
import { formatWeight } from '@/services/unitConversion';

export interface WeightDataPoint {
  log_date: string;
  weight_kg: number;
}

interface WeightChartProps {
  data: WeightDataPoint[];
  targetWeight?: number;
  currentWeight?: number;
  loading?: boolean;
}

export function WeightChart({
  data = [],
  targetWeight,
  currentWeight,
  loading,
}: WeightChartProps) {
  const unitSystem = useUnitSystem();

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12 text-muted-foreground">
          Loading weight data...
        </div>
      </Card>
    );
  }

  // Calculate progress
  const startWeight = data[0]?.weight_kg;
  const weightChange = currentWeight && startWeight ? currentWeight - startWeight : 0;
  const isLosing = weightChange < 0;

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Weight Progress
        </h3>
        <p className="text-sm text-muted-foreground">
          Track your weight journey
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 rounded-lg bg-muted">
          <div className="text-2xl font-bold text-foreground">
            <WeightDisplay valueKg={currentWeight} showUnit={false} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Current (<WeightDisplay valueKg={currentWeight} showUnit={true} />)
          </div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted">
          <div className="text-2xl font-bold text-foreground">
            <WeightDisplay valueKg={targetWeight} showUnit={false} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Target
          </div>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted">
          <div
            className={cn(
              'text-2xl font-bold flex items-center justify-center gap-1',
              isLosing ? 'text-success' : 'text-error'
            )}
          >
            {isLosing ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            <WeightDisplay valueKg={Math.abs(weightChange)} showUnit={false} />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Change ({unitSystem === 'imperial' ? 'lbs' : 'kg'})
          </div>
        </div>
      </div>

      {/* Simple Chart Placeholder */}
      {data.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No weight data logged yet</p>
          <p className="text-xs mt-2">Start tracking to see your progress</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground mb-2">
            Recent entries:
          </div>
          {data.slice(-5).reverse().map((point, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted"
            >
              <span className="text-sm text-muted-foreground">
                {new Date(point.log_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
              <span className="font-semibold text-foreground">
                <WeightDisplay valueKg={point.weight_kg} />
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
