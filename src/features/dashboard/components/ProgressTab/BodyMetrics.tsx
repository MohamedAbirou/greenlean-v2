/**
 * BodyMetrics Component
 * Display body measurements and BMI
 * Uses design system variants
 */

import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { Activity, Ruler, User } from 'lucide-react';

export interface BodyMetricsData {
  weight_kg?: number;
  height_cm?: number;
  bmi?: number;
  bmiStatus?: string;
  age?: number;
  gender?: string;
}

interface BodyMetricsProps {
  metrics: BodyMetricsData;
  loading?: boolean;
}

export function BodyMetrics({ metrics, loading }: BodyMetricsProps) {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-12 text-muted-foreground">
          Loading metrics...
        </div>
      </Card>
    );
  }

  const getBMIColor = (bmiStatus?: string) => {
    switch (bmiStatus?.toLowerCase()) {
      case 'underweight':
        return 'info';
      case 'normal':
        return 'success';
      case 'overweight':
        return 'warning';
      case 'obese':
        return 'error';
      default:
        return 'gray';
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-lg font-semibold mb-6 text-foreground">
        Body Metrics
      </h3>

      <div className="space-y-4">
        {/* BMI */}
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="font-medium text-foreground">
                BMI
              </span>
            </div>
            <Badge variant={getBMIColor(metrics.bmiStatus) as any} size="sm">
              {metrics.bmiStatus || 'Unknown'}
            </Badge>
          </div>
          <div className="text-3xl font-bold text-foreground">
            {metrics.bmi ? metrics.bmi.toFixed(1) : '--'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Body Mass Index
          </div>
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Height
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.height_cm || '--'}
            </div>
            <div className="text-xs text-muted-foreground">cm</div>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Weight
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.weight_kg || '--'}
            </div>
            <div className="text-xs text-muted-foreground">kg</div>
          </div>
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Age
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {metrics.age || '--'}
            </div>
            <div className="text-xs text-muted-foreground">years</div>
          </div>

          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Gender
              </span>
            </div>
            <div className="text-2xl font-bold text-foreground capitalize">
              {metrics.gender || '--'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
