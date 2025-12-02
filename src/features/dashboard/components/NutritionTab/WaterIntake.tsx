/**
 * WaterIntake Component
 * Track daily water consumption
 * Uses design system variants
 */

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/design-system';
import { motion } from 'framer-motion';
import { Droplet, Minus, Plus } from 'lucide-react';

interface WaterIntakeProps {
  glasses: number;
  goal?: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function WaterIntake({
  glasses,
  goal = 8,
  onIncrement,
  onDecrement,
}: WaterIntakeProps) {
  const progress = Math.min((glasses / goal) * 100, 100);

  return (
    <Card variant="elevated" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-secondary-500/20 flex items-center justify-center">
            <Droplet className="w-5 h-5 text-secondary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              Water Intake
            </h3>
            <p className="text-sm text-muted-foreground">
              {glasses} / {goal} glasses
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-secondary-400 to-secondary-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1 text-center">
          {progress.toFixed(0)}% of daily goal
        </div>
      </div>

      {/* Glass Icons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {Array.from({ length: goal }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'aspect-square rounded-lg flex items-center justify-center',
              i < glasses
                ? 'bg-secondary-100 dark:bg-secondary-900/30'
                : 'bg-muted'
            )}
          >
            <Droplet
              className={cn(
                'w-4 h-4',
                i < glasses
                  ? 'text-secondary-600 dark:text-secondary-400 fill-current'
                  : 'text-muted-foreground'
              )}
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onDecrement}
          disabled={glasses === 0}
          className="flex-1"
        >
          <Minus className="w-4 h-4 mr-1" />
          Remove
        </Button>
        <Button variant="primary" size="sm" onClick={onIncrement} className="flex-1">
          <Plus className="w-4 h-4 mr-1" />
          Add Glass
        </Button>
      </div>
    </Card>
  );
}
