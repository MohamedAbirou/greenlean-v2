/**
 * useRewards Hook - FIXED VERSION
 * Properly handles reward redemption with point deduction and duplicate prevention
 */

import { useAuth } from "@/features/auth";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  GET_REWARDS_CATALOG,
  GET_USER_REDEMPTIONS,
  GET_USER_REWARDS,
  REDEEM_REWARD,
  UPDATE_USER_POINTS,
} from "../graphql/rewardsQueries";
import type { Reward, RewardRedemption, SubscriptionTier } from "../types/rewards.types";

type RewardNode = {
  id: string;
  name: string;
  description: string;
  type: string;
  points_cost: number;
  tier_requirement?: number | null;
  stock_quantity?: number | null;
  image_url?: string | null;
  created_at: string;
  value: string;
};

type RewardsCatalogCollection = {
  edges: { node: RewardNode }[];
};

type GetRewardsCatalogData = {
  rewards_catalogCollection: RewardsCatalogCollection;
};

type UserRewardNode = {
  user_id: string;
  points: number;
  lifetime_points: number;
  updated_at: string;
};

type UserRewardsCollection = {
  edges: { node: UserRewardNode }[];
};

type GetUserRewardsData = {
  user_rewardsCollection: UserRewardsCollection;
};
type GetUserRewardsVars = { userId?: string };

type RewardRedemptionNode = {
  id: string;
  reward_id: string;
  type: string;
  reward_value: string;
  points_spent: number;
  redeemed_at: string;
  used: boolean;
  used_at?: string | null;
};

type UserRedemptionsCollection = {
  edges: { node: RewardRedemptionNode }[];
};

type GetUserRedemptionsData = {
  user_redeemed_rewardsCollection: UserRedemptionsCollection;
};

type GetUserRedemptionsVars = { userId?: string };

type UpdateUserPointsResult = {
  updateuser_rewardsCollection: {
    affectedCount: number;
    records: {
      points: number;
      lifetime_points: number;
    }[];
  };
};

type UpdateUserPointsVars = {
  userId: string;
  newPoints: number;
};

export function useRewards() {
  const { user } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);

  // Fetch rewards catalog
  const {
    data: catalogData,
    loading: catalogLoading,
    refetch: refetchCatalog,
  } = useQuery<GetRewardsCatalogData>(GET_REWARDS_CATALOG);

  // Fetch user's rewards points
  const {
    data: userRewardsData,
    loading: userRewardsLoading,
    refetch: refetchUserRewards,
  } = useQuery<GetUserRewardsData, GetUserRewardsVars>(GET_USER_REWARDS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  // Fetch user's redemption history
  const {
    data: redemptionsData,
    loading: redemptionsLoading,
    refetch: refetchRedemptions,
  } = useQuery<GetUserRedemptionsData, GetUserRedemptionsVars>(GET_USER_REDEMPTIONS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  // Update user points mutation
  const [updatePointsMutation] = useMutation<UpdateUserPointsResult, UpdateUserPointsVars>(
    UPDATE_USER_POINTS
  );

  // Redeem reward mutation
  const [redeemRewardMutation, { loading: isRedeeming }] = useMutation(REDEEM_REWARD, {
    onError: (error) => {
      console.error("Redemption error:", error);
      toast.error(`Failed to redeem reward: ${error.message}`);
    },
  });

  const rewards: Reward[] =
    catalogData?.rewards_catalogCollection?.edges?.map((edge: any) => edge.node) || [];
  const userRewards: UserRewardNode | null =
    userRewardsData?.user_rewardsCollection?.edges?.[0]?.node || null;
  const redemptions: RewardRedemption[] =
    redemptionsData?.user_redeemed_rewardsCollection?.edges?.map((edge: any) => edge.node) || [];

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
        const updateResult = await updatePointsMutation({
          variables: {
            userId: user.id,
            newPoints,
          },
        });

        console.log("Points update result:", updateResult);

        // FIXED: Check if update succeeded
        if (updateResult.data?.updateuser_rewardsCollection?.affectedCount === 0) {
          throw new Error("Failed to update points - user_rewards record not found");
        }

        // 3. Create redemption record
        const redeemResult = await redeemRewardMutation({
          variables: {
            userId: user.id,
            rewardId: reward.id,
            pointsSpent: reward.points_cost,
            rewardType: reward.type,
            rewardValue: reward.value,
          },
        });

        console.log("Redemption result:", redeemResult);

        // 4. Refetch everything to update UI
        await Promise.all([refetchUserRewards(), refetchRedemptions(), refetchCatalog()]);

        toast.success(`🎉 ${reward.name} redeemed successfully!`);
        setIsRedemptionModalOpen(false);
      } catch (error: any) {
        console.error("Error redeeming reward:", error);
        toast.error(error.message || "Failed to redeem reward. Please try again.");
      }
    },
    [
      user,
      userRewards,
      canAffordReward,
      hasRedeemedReward,
      redeemRewardMutation,
      updatePointsMutation,
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
