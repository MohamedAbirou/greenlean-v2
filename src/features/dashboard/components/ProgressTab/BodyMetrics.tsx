/**
 * BodyMetrics Component
 * Display body measurements and BMI
 * Uses design system variants
 */

import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Ruler, User, Activity } from 'lucide-react';

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
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
        Body Metrics
      </h3>

      <div className="space-y-4">
        {/* BMI */}
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                BMI
              </span>
            </div>
            <Badge variant={getBMIColor(metrics.bmiStatus) as any} size="sm">
              {metrics.bmiStatus || 'Unknown'}
            </Badge>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {metrics.bmi ? metrics.bmi.toFixed(1) : '--'}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Body Mass Index
          </div>
        </div>

        {/* Height & Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Height
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.height_cm || '--'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">cm</div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Weight
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.weight_kg || '--'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">kg</div>
          </div>
        </div>

        {/* Age & Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Age
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {metrics.age || '--'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">years</div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Gender
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 capitalize">
              {metrics.gender || '--'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
