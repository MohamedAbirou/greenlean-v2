/**
 * MacroRing Component
 * Visual macro nutrient distribution ring chart
 * Uses design system colors
 */

import { Card } from '@/shared/components/ui/card';
import { motion } from 'framer-motion';

export interface MacroData {
  protein: number;
  carbs: number;
  fat: number;
  totalCalories: number;
}

interface MacroRingProps {
  current: MacroData;
  target?: MacroData;
}

export function MacroRing({ current, target }: MacroRingProps) {
  // Calculate percentages
  const proteinCal = current.protein * 4;
  const carbsCal = current.carbs * 4;
  const fatCal = current.fat * 9;
  const total = proteinCal + carbsCal + fatCal;

  const proteinPct = total > 0 ? (proteinCal / total) * 100 : 0;
  const carbsPct = total > 0 ? (carbsCal / total) * 100 : 0;
  const fatPct = total > 0 ? (fatCal / total) * 100 : 0;

  // Progress towards target
  const calorieProgress = target
    ? Math.min((current.totalCalories / target.totalCalories) * 100, 100)
    : 0;

  return (
    <Card variant="elevated" padding="lg">
      <h3 className="text-lg font-semibold mb-6 text-foreground">
        Macro Breakdown
      </h3>

      <div className="flex flex-col items-center">
        {/* Ring Chart */}
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="16"
              className="text-muted-foreground"
            />
            {/* Protein arc - Green */}
            <motion.circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#10B981"
              strokeWidth="16"
              strokeDasharray={`${(proteinPct / 100) * 502} 502`}
              strokeDashoffset="0"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 502' }}
              animate={{ strokeDasharray: `${(proteinPct / 100) * 502} 502` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            {/* Carbs arc - Blue */}
            <motion.circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="16"
              strokeDasharray={`${(carbsPct / 100) * 502} 502`}
              strokeDashoffset={`-${(proteinPct / 100) * 502}`}
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 502' }}
              animate={{ strokeDasharray: `${(carbsPct / 100) * 502} 502` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            />
            {/* Fat arc - Orange */}
            <motion.circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#F97316"
              strokeWidth="16"
              strokeDasharray={`${(fatPct / 100) * 502} 502`}
              strokeDashoffset={`-${((proteinPct + carbsPct) / 100) * 502}`}
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 502' }}
              animate={{ strokeDasharray: `${(fatPct / 100) * 502} 502` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold text-foreground">
              {current.totalCalories}
            </div>
            <div className="text-sm text-muted-foreground">calories</div>
            {target && (
              <div className="text-xs text-muted-foreground mt-1">
                {calorieProgress.toFixed(0)}% of goal
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">
                Protein
              </span>
            </div>
            <div className="font-semibold text-foreground">
              {current.protein}g
            </div>
            <div className="text-xs text-muted-foreground">
              {proteinPct.toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-secondary-500" />
              <span className="text-xs text-muted-foreground">Carbs</span>
            </div>
            <div className="font-semibold text-foreground">
              {current.carbs}g
            </div>
            <div className="text-xs text-muted-foreground">
              {carbsPct.toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-accent-500" />
              <span className="text-xs text-muted-foreground">Fat</span>
            </div>
            <div className="font-semibold text-foreground">
              {current.fat}g
            </div>
            <div className="text-xs text-muted-foreground">
              {fatPct.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
