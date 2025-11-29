/**
 * StatsGrid Component
 * Quick stats overview cards with trends
 * Uses design system variants
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { cn } from '@/shared/design-system';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color: string;
  trend?: 'up' | 'down';
}

interface StatsGridProps {
  stats: StatCardProps[];
}

function StatCard({ title, value, change, icon: Icon, color, trend }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="elevated"
        hover={true}
        padding="md"
        className="relative overflow-hidden group"
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              color
            )}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium',
                trend === 'up'
                  ? 'text-success dark:text-success-light'
                  : 'text-error dark:text-error-light'
              )}
            >
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-gray-100">
          {value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{title}</div>
      </Card>
    </motion.div>
  );
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={`${stat.title}-${index}`} {...stat} />
      ))}
    </div>
  );
}
