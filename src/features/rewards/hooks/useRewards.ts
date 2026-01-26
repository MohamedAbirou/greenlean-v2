/**
 * useRewards Hook
 * Properly handles reward redemption with point deduction and duplicate prevention
 */

import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase"; // Adjust based on your Supabase client setup
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Reward, RewardRedemption, SubscriptionTier } from "../types/rewards.types";

type UserRewardNode = {
  user_id: string;
  points: number;
  lifetime_points: number;
  updated_at: string;
};

export function useRewards() {
  const { user } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  // States for data
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<UserRewardNode | null>(null);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);

  // Loading states
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [userRewardsLoading, setUserRewardsLoading] = useState(true);
  const [redemptionsLoading, setRedemptionsLoading] = useState(true);

  // Fetch rewards catalog
  const refetchCatalog = useCallback(async () => {
    setCatalogLoading(true);
    const { data, error } = await supabase.from("rewards_catalog").select("*");
    if (error) {
      console.error("Error fetching catalog:", error);
      setRewards([]);
    } else {
      setRewards((data as Reward[]) || []);
    }
    setCatalogLoading(false);
  }, []);

  useEffect(() => {
    refetchCatalog();
  }, [refetchCatalog]);

  // Fetch user's rewards points
  const refetchUserRewards = useCallback(async () => {
    if (!user?.id) return;
    setUserRewardsLoading(true);
    const { data, error } = await supabase
      .from("user_rewards")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (error) {
      console.error("Error fetching user rewards:", error);
      setUserRewards(null);
    } else {
      setUserRewards(data as UserRewardNode);
    }
    setUserRewardsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refetchUserRewards();
  }, [refetchUserRewards, user?.id]);

  // Fetch user's redemption history
  const refetchRedemptions = useCallback(async () => {
    if (!user?.id) return;
    setRedemptionsLoading(true);
    const { data, error } = await supabase
      .from("user_redeemed_rewards")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      console.error("Error fetching redemptions:", error);
      setRedemptions([]);
    } else {
      setRedemptions((data as RewardRedemption[]) || []);
    }
    setRedemptionsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    refetchRedemptions();
  }, [refetchRedemptions, user?.id]);

  const canAffordReward = useCallback(
    (reward: Reward) => {
      if (!userRewards) return false;
      return userRewards.points >= reward.points_cost;
    },
    [userRewards]
  );

  const meetsTierRequirement = useCallback((reward: Reward, userTier: SubscriptionTier) => {
    if (!reward.tier_requirement) return true;

    const tierHierarchy = { free: 0, pro: 1, premium: 2 };
    return tierHierarchy[userTier] >= tierHierarchy[reward.tier_requirement];
  }, []);

  // Check if reward has already been redeemed (for single-use rewards like themes/avatars)
  const hasRedeemedReward = useCallback(
    (rewardId: string) => {
      return redemptions.some((r) => r.reward_id === rewardId);
    },
    [redemptions]
  );

  const handleRedeemReward = useCallback(
    async (reward: Reward) => {
      if (!user || !userRewards) {
        toast.error("Please sign in to redeem rewards");
        return;
      }

      if (!canAffordReward(reward)) {
        toast.error(
          `Not enough points! You need ${reward.points_cost - userRewards.points} more points.`
        );
        return;
      }

      // FIXED: Check if already redeemed (for themes/avatars that are one-time unlocks)
      if (["theme", "avatar", "discount"].includes(reward.type) && hasRedeemedReward(reward.id)) {
        toast.error("You've already redeemed this reward!");
        return;
      }

      setIsRedeeming(true);

      try {
        // 1. FIXED: Calculate new points BEFORE mutation
        const newPoints = userRewards.points - reward.points_cost;
        console.log("Deducting points:", {
          userId: user.id,
          currentPoints: userRewards.points,
          cost: reward.points_cost,
          newPoints,
        });

        // 2. Deduct points FIRST
        const {
          data: updateData,
          error: updateError,
          count,
        } = await supabase
          .from("user_rewards")
          .update({ points: newPoints })
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        console.log("Points update result:", { updateData, count });

        // FIXED: Check if update succeeded
        if (count === 0) {
          throw new Error("Failed to update points - user_rewards record not found");
        }

        // 3. Create redemption record
        const now = new Date().toISOString();
        const { data: redeemData, error: redeemError } = await supabase
          .from("user_redeemed_rewards")
          .insert({
            user_id: user.id,
            reward_id: reward.id,
            points_spent: reward.points_cost,
            type: reward.type,
            reward_value: reward.value,
            redeemed_at: now,
            used: false,
          });

        if (redeemError) throw redeemError;

        console.log("Redemption result:", redeemData);

        // 4. Refetch everything to update UI
        await Promise.all([refetchUserRewards(), refetchRedemptions(), refetchCatalog()]);

        toast.success(`🎉 ${reward.name} redeemed successfully!`);
        setIsRedemptionModalOpen(false);
      } catch (error: any) {
        console.error("Error redeeming reward:", error);
        toast.error(error.message || "Failed to redeem reward. Please try again.");
      } finally {
        setIsRedeeming(false);
      }
    },
    [
      user,
      userRewards,
      canAffordReward,
      hasRedeemedReward,
      refetchUserRewards,
      refetchRedemptions,
      refetchCatalog,
    ]
  );

  const filterRewardsByType = useCallback(
    (type: string) => {
      return rewards.filter((reward) => reward.type === type);
    },
    [rewards]
  );

  const getAffordableRewards = useCallback(() => {
    if (!userRewards) return [];
    return rewards.filter((reward) => canAffordReward(reward));
  }, [rewards, userRewards, canAffordReward]);

  return {
    // Data
    rewards,
    userRewards,
    redemptions,
    selectedReward,

    // Loading states
    catalogLoading,
    userRewardsLoading,
    redemptionsLoading,
    isRedeeming,

    // Modal state
    isRedemptionModalOpen,
    setIsRedemptionModalOpen,
    setSelectedReward,

    // Actions
    handleRedeemReward,
    canAffordReward,
    hasRedeemedReward,
    meetsTierRequirement,
    filterRewardsByType,
    getAffordableRewards,

    // Refetch
    refetchCatalog,
    refetchUserRewards,
    refetchRedemptions,
  };
}
