/**
 * Rewards Catalog Page
 * Browse and redeem rewards with earned points
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { motion } from 'framer-motion';
import {
  Trophy,
  Sparkles,
  Gift,
  Lock,
  CheckCircle2,
  Coins,
  Loader2,
  ShoppingBag,
  Palette,
  Crown,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Progress } from '@/shared/components/ui/card';
import { useThemeStore } from '@/store/themeStore';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost_points: number;
  reward_type: 'discount' | 'theme' | 'feature' | 'badge' | 'physical';
  value: string; // e.g., "20% off", "premium_theme_1", "lifetime_premium"
  icon: string;
  image_url?: string;
  stock_limit?: number;
  remaining_stock?: number;
  requirements?: string; // JSON string with requirements
  is_active: boolean;
}

interface UserRewards {
  points: number;
  lifetime_points: number;
  redeemed_rewards: string[]; // Array of reward IDs
}

export default function RewardsCatalog() {
  const { user } = useAuth();
  const { unlockTheme } = useThemeStore();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserRewards | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch rewards catalog
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('rewards_catalog')
        .select('*')
        .eq('is_active', true)
        .order('cost_points', { ascending: true });

      if (rewardsError) throw rewardsError;

      // Fetch user rewards and redeemed items
      const { data: userRewardsData, error: userRewardsError } = await supabase
        .from('user_rewards')
        .select('points, lifetime_points')
        .eq('user_id', user.id)
        .single();

      if (userRewardsError && userRewardsError.code !== 'PGRST116') {
        throw userRewardsError;
      }

      // Fetch redeemed rewards
      const { data: redeemedData, error: redeemedError } = await supabase
        .from('user_redeemed_rewards')
        .select('reward_id')
        .eq('user_id', user.id);

      if (redeemedError && redeemedError.code !== 'PGRST116') {
        throw redeemedError;
      }

      setRewards(rewardsData || []);
      setUserRewards({
        points: userRewardsData?.points || 0,
        lifetime_points: userRewardsData?.lifetime_points || 0,
        redeemed_rewards: redeemedData?.map(r => r.reward_id) || [],
      });
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast.error('Failed to load rewards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedReward || !user || !userRewards) return;

    // Check if user has enough points
    if (userRewards.points < selectedReward.cost_points) {
      toast.error('Not enough points!');
      return;
    }

    // Check if already redeemed
    if (userRewards.redeemed_rewards.includes(selectedReward.id)) {
      toast.error('You already redeemed this reward!');
      return;
    }

    setIsRedeeming(true);

    try {
      // Deduct points
      const newPoints = userRewards.points - selectedReward.cost_points;

      const { error: updateError } = await supabase
        .from('user_rewards')
        .update({ points: newPoints })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record redemption
      const { error: redeemError } = await supabase
        .from('user_redeemed_rewards')
        .insert({
          user_id: user.id,
          reward_id: selectedReward.id,
          reward_type: selectedReward.reward_type,
          reward_value: selectedReward.value,
          points_spent: selectedReward.cost_points,
        });

      if (redeemError) throw redeemError;

      // Create notification
      await supabase.from('notifications').insert({
        recipient_id: user.id,
        type: 'reward',
        entity_type: 'reward',
        entity_id: selectedReward.id,
        message: `You redeemed ${selectedReward.name}! 🎉`,
      });

      // If it's a theme reward, unlock it in the theme store
      if (selectedReward.reward_type === 'theme') {
        unlockTheme(selectedReward.value);
        toast.success(`🎨 Theme unlocked! Visit your profile to apply it.`);
      }

      // Confetti!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.success(`🎉 Successfully redeemed ${selectedReward.name}!`);

      // Refresh data
      fetchData();
      setSelectedReward(null);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error('Failed to redeem reward');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getRewardIcon = (type: string, icon: string) => {
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
    return userRewards?.redeemed_rewards.includes(rewardId);
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
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                          affordable
                            ? 'from-primary-500 to-secondary-500'
                            : 'from-gray-400 to-gray-500'
                        } flex items-center justify-center text-2xl`}
                      >
                        {getRewardIcon(reward.reward_type, reward.icon)}
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
                              width: `${
                                ((reward.remaining_stock || 0) /
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
                    {getRewardIcon(selectedReward.reward_type, selectedReward.icon)}
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
