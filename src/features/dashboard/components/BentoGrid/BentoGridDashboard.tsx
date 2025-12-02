/**
 * Bento Grid Dashboard
 * Modern, Apple-inspired grid layout with varying card sizes
 */

import { Card } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Activity,
  Apple,
  Droplets,
  Dumbbell,
  Flame,
  Heart,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';
import type { ReactNode } from 'react';

interface BentoCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  gradient: string;
  size: 'small' | 'medium' | 'large' | 'wide' | 'tall';
  trend?: {
    value: number;
    label: string;
  };
  progress?: number;
  children?: ReactNode;
}

const sizeClasses = {
  small: 'col-span-1 row-span-1',
  medium: 'col-span-1 row-span-2',
  large: 'col-span-2 row-span-2',
  wide: 'col-span-2 row-span-1',
  tall: 'col-span-1 row-span-3',
};

function BentoCard({ title, value, subtitle, icon, gradient, size, trend, progress, children }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`${sizeClasses[size]}`}
    >
      <Card className={`relative h-full overflow-hidden bg-gradient-to-br ${gradient} border-0 shadow-lg hover:shadow-xl transition-all`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />

        <div className="relative p-6 h-full flex flex-col">
          {/* Icon */}
          <div className="mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              {icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white/80 mb-1">{title}</h3>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}

            {progress !== undefined && (
              <div className="mt-4">
                <Progress value={progress} className="h-2 bg-white/20" />
                <p className="text-xs text-white/70 mt-1">{progress}% complete</p>
              </div>
            )}

            {trend && (
              <div className="mt-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white/80" />
                <span className="text-sm font-medium text-white/90">
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-white/70">{trend.label}</span>
              </div>
            )}

            {children}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface BentoGridDashboardProps {
  stats: {
    calories: { consumed: number; target: number };
    protein: { consumed: number; target: number };
    workouts: { completed: number; weekly: number };
    weight: { current: number; change: number };
    water: { consumed: number; target: number };
    streak: number;
    points: number;
    bmi: number;
  };
}

export function BentoGridDashboard({ stats }: BentoGridDashboardProps) {
  const calorieProgress = (stats.calories.consumed / stats.calories.target) * 100;
  const proteinProgress = (stats.protein.consumed / stats.protein.target) * 100;
  const waterProgress = (stats.water.consumed / stats.water.target) * 100;
  const workoutProgress = (stats.workouts.completed / stats.workouts.weekly) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[180px]">
      {/* Calories - Large featured card */}
      <BentoCard
        title="Calories Today"
        value={`${stats.calories.consumed}`}
        subtitle={`of ${stats.calories.target} kcal`}
        icon={<Flame className="w-6 h-6" />}
        gradient="from-orange-500 to-red-600"
        size="large"
        progress={Math.min(calorieProgress, 100)}
        trend={{ value: -5, label: 'vs yesterday' }}
      />

      {/* Protein */}
      <BentoCard
        title="Protein"
        value={`${stats.protein.consumed}g`}
        subtitle={`of ${stats.protein.target}g`}
        icon={<Apple className="w-6 h-6" />}
        gradient="from-emerald-500 to-green-600"
        size="medium"
        progress={Math.min(proteinProgress, 100)}
      />

      {/* Workouts */}
      <BentoCard
        title="Workouts This Week"
        value={stats.workouts.completed}
        subtitle={`of ${stats.workouts.weekly} planned`}
        icon={<Dumbbell className="w-6 h-6" />}
        gradient="from-blue-500 to-indigo-600"
        size="medium"
        progress={Math.min(workoutProgress, 100)}
      />

      {/* Streak */}
      <BentoCard
        title="Current Streak"
        value={`${stats.streak} days`}
        subtitle="Keep it going!"
        icon={<Zap className="w-6 h-6" />}
        gradient="from-yellow-500 to-amber-600"
        size="small"
      />

      {/* Points */}
      <BentoCard
        title="Reward Points"
        value={stats.points.toLocaleString()}
        subtitle="Total earned"
        icon={<Trophy className="w-6 h-6" />}
        gradient="from-purple-500 to-pink-600"
        size="small"
      />

      {/* Water */}
      <BentoCard
        title="Water Intake"
        value={`${stats.water.consumed}L`}
        subtitle={`of ${stats.water.target}L`}
        icon={<Droplets className="w-6 h-6" />}
        gradient="from-cyan-500 to-blue-600"
        size="wide"
        progress={Math.min(waterProgress, 100)}
      />

      {/* Weight & BMI */}
      <BentoCard
        title="Current Weight"
        value={`${stats.weight.current} kg`}
        icon={<Activity className="w-6 h-6" />}
        gradient="from-violet-500 to-purple-600"
        size="small"
        trend={{
          value: stats.weight.change,
          label: 'this week'
        }}
      >
        <div className="mt-2">
          <p className="text-xs text-white/70">BMI: {stats.bmi.toFixed(1)}</p>
        </div>
      </BentoCard>

      {/* Health Score */}
      <BentoCard
        title="Health Score"
        value="87"
        subtitle="Excellent!"
        icon={<Heart className="w-6 h-6" />}
        gradient="from-rose-500 to-red-600"
        size="small"
        progress={87}
      />
    </div>
  );
}
