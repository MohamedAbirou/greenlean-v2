/**
 * RewardCard Component
 * Beautiful card for displaying individual rewards
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import type { Reward } from '../types/rewards.types';

interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  canAfford: boolean;
  onRedeem: () => void;
}

export function RewardCard({ reward, userPoints, canAfford, onRedeem }: RewardCardProps) {
  const getRewardTypeColor = (type: string) => {
    const colors = {
      discount: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      theme: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      avatar: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      feature_unlock: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      physical_item: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return colors[type as keyof typeof colors] || colors.discount;
  };

  const pointsNeeded = reward.points_cost - userPoints;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 10px 15px rgba(0,0,0,0.3)' }}
      className="group relative bg-card rounded-xl border border-border overflow-hidden transition-shadow hover:shadow-xl"
    >
      {/* Icon/Badge at top */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{reward.image_url || '🎁'}</div>
          <Badge className={getRewardTypeColor(reward.type)}>
            {reward.type.replace('_', ' ')}
          </Badge>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{reward.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {reward.description}
        </p>

        {/* Points Cost */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-600">
              {reward.points_cost}
            </span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>
          {canAfford ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        {/* Redeem Button */}
        <Button
          onClick={onRedeem}
          disabled={!canAfford}
          className="w-full"
          variant={canAfford ? 'default' : 'secondary'}
        >
          {canAfford ? 'Redeem Now' : `Need ${pointsNeeded} more points`}
        </Button>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </motion.div>
  );
}
