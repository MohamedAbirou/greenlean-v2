/**
 * Rewards Catalog Page - GraphQL Version
 * Browse and redeem rewards with earned points
 */

import { useAuth } from '@/features/auth';
import { useUserRewardsGraphQL } from '@/features/challenges';
import { useRedeemRewardGraphQL, useRewardsCatalogGraphQL, useUserRedeemedRewardsGraphQL, type Reward } from '@/features/rewards';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useThemeStore } from '@/store/themeStore';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Coins,
  Crown,
  Gift,
  Loader2,
  Lock,
  Palette,
  ShoppingBag,
  Sparkles,
  Ticket,
  Trophy
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function RewardsCatalog() {
  const { user } = useAuth();
  const { unlockTheme } = useThemeStore();

  // GraphQL hooks
  const { rewards, isLoading: loadingRewards } = useRewardsCatalogGraphQL({ is_active: true });
  const { data: userRewards, isLoading: loadingUserRewards } = useUserRewardsGraphQL(user?.id);
  const { redeemedRewards } = useUserRedeemedRewardsGraphQL(user?.id);
  const { redeem, isRedeeming } = useRedeemRewardGraphQL((redeemed) => {
    // On successful redemption
    if (selectedReward?.reward_type === 'theme') {
      unlockTheme(selectedReward.value);
      toast.success(`🎨 Theme unlocked! Visit your profile to apply it.`);
    }

    // Create notification
    supabase.from('notifications').insert({
      recipient_id: user?.id,
      type: 'reward',
      entity_type: 'reward',
      entity_id: selectedReward?.id,
      message: `You redeemed ${selectedReward?.name}! 🎉`,
    });

    // Confetti!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast.success(`🎉 Successfully redeemed ${selectedReward?.name}!`);
    setSelectedReward(null);
  });

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const isLoading = loadingRewards || loadingUserRewards;

  const handleRedeem = async () => {
    if (!selectedReward || !user || !userRewards) return;

    // Check if user has enough points
    if (userRewards.points < selectedReward.cost_points) {
      toast.error('Not enough points!');
      return;
    }

    // Check if already redeemed
    const alreadyRedeemed = redeemedRewards.some(r => r.reward_id === selectedReward.id);
    if (alreadyRedeemed) {
      toast.error('You already redeemed this reward!');
      return;
    }

    try {
      await redeem(user.id, selectedReward);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    }
  };

  const getRewardIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      discount: Ticket,
      theme: Palette,
      feature: Crown,
      badge: Trophy,
      physical: Gift,
    };

    const IconComponent = iconMap[type] || Sparkles;
    return <IconComponent className="w-6 h-6" />;
  };

  const canAfford = (cost: number) => {
    return userRewards && userRewards.points >= cost;
  };

  const isRedeemed = (rewardId: string) => {
    return redeemedRewards.some(r => r.reward_id === rewardId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Rewards Store</h1>
              <p className="text-muted-foreground">
                Redeem your points for exclusive rewards
              </p>
            </div>

            <Card className="p-4 min-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Points</p>
                  <p className="text-2xl font-bold text-primary">
                    {userRewards?.points || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {userRewards?.lifetime_points || 0} lifetime
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, index) => {
            const affordable = canAfford(reward.cost_points);
            const redeemed = isRedeemed(reward.id);

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${affordable
                            ? 'from-primary-500 to-secondary-500'
                            : 'from-gray-400 to-gray-500'
                          } flex items-center justify-center text-2xl`}
                      >
                        {getRewardIcon(reward.reward_type)}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={redeemed ? 'default' : 'outline'}
                          className="font-semibold"
                        >
                          {redeemed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Redeemed
                            </>
                          ) : (
                            <>
                              <Coins className="w-3 h-3 mr-1" />
                              {reward.cost_points} pts
                            </>
                          )}
                        </Badge>

                        <Badge variant="secondary">
                          {reward.reward_type}
                        </Badge>
                      </div>
                    </div>

                    <CardTitle className="mt-4">{reward.name}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    {reward.remaining_stock !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Stock</span>
                          <span>
                            {reward.remaining_stock} / {reward.stock_limit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{
                              width: `${((reward.remaining_stock || 0) /
                                  (reward.stock_limit || 1)) *
                                100
                                }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      disabled={!affordable || redeemed}
                      onClick={() => setSelectedReward(reward)}
                      variant={affordable ? 'default' : 'outline'}
                    >
                      {redeemed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Redeemed
                        </>
                      ) : !affordable ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Need {reward.cost_points - (userRewards?.points || 0)}{' '}
                          more points
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Redeem Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {rewards.length === 0 && (
          <Card className="p-12 text-center">
            <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Rewards Available</h3>
            <p className="text-muted-foreground">
              Check back later for new rewards!
            </p>
          </Card>
        )}

        {/* Redeem Confirmation Dialog */}
        <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Redemption</DialogTitle>
              <DialogDescription>
                Are you sure you want to redeem this reward?
              </DialogDescription>
            </DialogHeader>

            {selectedReward && (
              <div className="py-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    {getRewardIcon(selectedReward.reward_type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{selectedReward.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedReward.description}
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost</span>
                    <span className="font-semibold">
                      {selectedReward.cost_points} points
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Balance</span>
                    <span className="font-semibold">{userRewards?.points} points</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-muted-foreground">After Redemption</span>
                    <span className="font-bold text-primary">
                      {(userRewards?.points || 0) - selectedReward.cost_points} points
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedReward(null)}
                disabled={isRedeeming}
              >
                Cancel
              </Button>
              <Button onClick={handleRedeem} disabled={isRedeeming}>
                {isRedeeming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirm Redemption
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}