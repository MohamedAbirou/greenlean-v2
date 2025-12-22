/**
 * Stat Card Component
 * Shows a metric with progress bar
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';

interface StatCardProps {
  title: string;
  current: number;
  goal?: number;
  unit: string;
  icon?: React.ReactNode;
  showProgress?: boolean;
}

export function StatCard({
  title,
  current,
  goal,
  unit,
  icon,
  showProgress = true,
}: StatCardProps) {
  const percentage = goal ? Math.min((current / goal) * 100, 100) : 0;
  const remaining = goal ? Math.max(goal - current, 0) : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-2xl">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {Math.round(current)}
          <span className="text-sm text-muted-foreground ml-1">{unit}</span>
        </div>
        {goal && (
          <p className="text-xs text-muted-foreground mt-1">
            / {Math.round(goal)} {unit}
          </p>
        )}
        {showProgress && goal && (
          <div className="mt-3">
            <Progress value={percentage} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {percentage >= 95 && percentage <= 105
                ? '🎯 Perfect!'
                : percentage > 105
                ? `+${Math.round(current - goal)} ${unit} over`
                : `${Math.round(remaining)} ${unit} remaining`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
