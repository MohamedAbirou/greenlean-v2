/**
 * useRewards Hook
 * Manages rewards catalog and redemption logic
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import type { Reward, UserRewards, RewardRedemption, SubscriptionTier } from '../types/rewards.types';
import {
  GET_REWARDS_CATALOG,
  GET_USER_REWARDS,
  GET_USER_REDEMPTIONS,
  REDEEM_REWARD,
  UPDATE_USER_POINTS
} from '../graphql/rewardsQueries';

export function useRewards() {
  const { user } = useAuth();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);

  // Fetch rewards catalog
  const { data: catalogData, loading: catalogLoading, refetch: refetchCatalog } = useQuery(
    GET_REWARDS_CATALOG
  );

  // Fetch user's rewards points
  const { data: userRewardsData, loading: userRewardsLoading, refetch: refetchUserRewards } = useQuery(
    GET_USER_REWARDS,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
    }
  );

  // Fetch user's redemption history
  const { data: redemptionsData, loading: redemptionsLoading, refetch: refetchRedemptions } = useQuery(
    GET_USER_REDEMPTIONS,
    {
      variables: { userId: user?.id },
      skip: !user?.id,
    }
  );

  // Redeem reward mutation
  const [redeemRewardMutation, { loading: isRedeeming }] = useMutation(REDEEM_REWARD, {
    onCompleted: () => {
      toast.success('Reward redeemed successfully! 🎉');
      refetchUserRewards();
      refetchRedemptions();
      setIsRedemptionModalOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to redeem reward: ${error.message}`);
    },
  });

  // Update user points mutation
  const [updatePointsMutation] = useMutation(UPDATE_USER_POINTS);

  const rewards: Reward[] = catalogData?.rewards_catalogCollection?.edges?.map((edge: any) => edge.node) || [];
  const userRewards: UserRewards | null = userRewardsData?.user_rewardsCollection?.edges?.[0]?.node || null;
  const redemptions: RewardRedemption[] = redemptionsData?.user_reward_redemptionsCollection?.edges?.map((edge: any) => edge.node) || [];

  const canAffordReward = useCallback((reward: Reward) => {
    if (!userRewards) return false;
    return userRewards.points >= reward.points_cost;
  }, [userRewards]);

  const meetsTierRequirement = useCallback((reward: Reward, userTier: SubscriptionTier) => {
    if (!reward.tier_requirement) return true;

    const tierHierarchy = { free: 0, pro: 1, premium: 2 };
    return tierHierarchy[userTier] >= tierHierarchy[reward.tier_requirement];
  }, []);

  const handleRedeemReward = useCallback(async (reward: Reward) => {
    if (!user || !userRewards) {
      toast.error('Please sign in to redeem rewards');
      return;
    }

    if (!canAffordReward(reward)) {
      toast.error(`Not enough points! You need ${reward.points_cost - userRewards.points} more points.`);
      return;
    }

    try {
      // Deduct points
      const newPoints = userRewards.points - reward.points_cost;

      await updatePointsMutation({
        variables: {
          userId: user.id,
          newPoints,
        },
      });

      // Create redemption record
      await redeemRewardMutation({
        variables: {
          userId: user.id,
          rewardId: reward.id,
          pointsSpent: reward.points_cost,
        },
      });
    } catch (error) {
      console.error('Error redeeming reward:', error);
    }
  }, [user, userRewards, canAffordReward, redeemRewardMutation, updatePointsMutation]);

  const filterRewardsByType = useCallback((type: string) => {
    return rewards.filter(reward => reward.type === type);
  }, [rewards]);

  const getAffordableRewards = useCallback(() => {
    if (!userRewards) return [];
    return rewards.filter(reward => canAffordReward(reward));
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
    meetsTierRequirement,
    filterRewardsByType,
    getAffordableRewards,

    // Refetch
    refetchCatalog,
    refetchUserRewards,
    refetchRedemptions,
  };
}
