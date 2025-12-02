/**
 * Rewards Catalog Page
 * Production-grade rewards redemption system
 */

import { motion } from 'framer-motion';
import { Gift, Palette, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import { useState } from 'react';
import { useRewards } from '../hooks/useRewards';
import { RedemptionModal } from './RedemptionModal';
import { RewardCard } from './RewardCard';
import { UserPointsDisplay } from './UserPointsDisplay';

const REWARD_CATEGORIES = [
  { id: 'all', label: 'All Rewards', icon: Gift },
  { id: 'discount', label: 'Discounts', icon: Zap },
  { id: 'theme', label: 'Themes', icon: Palette },
  { id: 'avatar', label: 'Avatars', icon: Star },
  { id: 'feature_unlock', label: 'Features', icon: Sparkles },
  { id: 'physical_item', label: 'Physical', icon: Trophy },
];

export function RewardsCatalogPage() {
  const {
    rewards,
    userRewards,
    catalogLoading,
    userRewardsLoading,
    isRedeeming,
    selectedReward,
    isRedemptionModalOpen,
    setIsRedemptionModalOpen,
    setSelectedReward,
    handleRedeemReward,
    canAffordReward,
  } = useRewards();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRewards = rewards.filter((reward) => {
    const matchesCategory = selectedCategory === 'all' || reward.type === selectedCategory;
    const matchesSearch = reward.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reward.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleRewardClick = (reward: any) => {
    setSelectedReward(reward);
    setIsRedemptionModalOpen(true);
  };

  if (catalogLoading || userRewardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Trophy className="w-12 h-12 text-primary-600" />
          </motion.div>
          <p className="text-muted-foreground">Loading rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/20 dark:to-primary-950/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Rewards Catalog
              </h1>
              <p className="text-muted-foreground mt-2">
                Redeem your points for exclusive rewards and perks
              </p>
            </div>
            <UserPointsDisplay
              points={userRewards?.points || 0}
              lifetimePoints={userRewards?.lifetime_points || 0}
            />
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide"
        >
          {REWARD_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-card hover:bg-accent text-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </motion.div>

        {/* Rewards Grid */}
        {filteredRewards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Gift className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No rewards found</h3>
            <p className="text-muted-foreground">
              Try a different category or search term
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RewardCard
                  reward={reward}
                  userPoints={userRewards?.points || 0}
                  canAfford={canAffordReward(reward)}
                  onRedeem={() => handleRewardClick(reward)}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Redemption Modal */}
        <RedemptionModal
          reward={selectedReward}
          isOpen={isRedemptionModalOpen}
          onClose={() => setIsRedemptionModalOpen(false)}
          onConfirm={() => selectedReward && handleRedeemReward(selectedReward)}
          userPoints={userRewards?.points || 0}
          isRedeeming={isRedeeming}
        />
      </div>
    </div>
  );
}
