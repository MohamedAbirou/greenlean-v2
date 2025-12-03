/**
 * GraphQL Hooks for Rewards Catalog & Redemptions
 * Handles rewards browsing, redemption, and user redeemed rewards
 */

import {
  useGetRewardsCatalogQuery,
  useGetUserRedeemedRewardsQuery,
  useRedeemRewardMutation,
  type GetRewardsCatalogQuery,
  type GetUserRedeemedRewardsQuery,
} from "@/generated/graphql";

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface Reward {
  id: string;
  name: string;
  description: string;
  points_cost: number;
  type: "discount" | "theme" | "feature" | "badge" | "physical";
  tier_requirement?: string | null;
  stock_quantity?: number | null;
  is_active: boolean;
  image_url?: string | null;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface RedeemedReward {
  id: string;
  user_id: string;
  reward_id: string;
  type: string;
  reward_value: string;
  points_spent: number;
  redeemed_at: string;
  used: boolean;
  used_at?: string | null;
  created_at: string;
}

// =============================================
// TYPE TRANSFORMERS
// =============================================

function transformGraphQLToRewards(data: GetRewardsCatalogQuery | undefined): Reward[] {
  if (!data?.rewards_catalogCollection?.edges) {
    return [];
  }

  return data.rewards_catalogCollection.edges.map((edge) => ({
    id: edge.node.id,
    name: edge.node.name!,
    description: edge.node.description!,
    points_cost: edge.node.points_cost!,
    type: edge.node.type as any,
    value: edge.node.value!,
    tier_requirement: edge.node.tier_requirement,
    stock_quantity: edge.node.stock_quantity,
    is_active: edge.node.is_active!,
    image_url: edge.node.image_url,
    metadata: JSON.parse(edge.node.metadata),
    created_at: edge.node.created_at!,
    updated_at: edge.node.updated_at!,
  }));
}

function transformGraphQLToRedeemedRewards(
  data: GetUserRedeemedRewardsQuery | undefined
): RedeemedReward[] {
  if (!data?.user_redeemed_rewardsCollection?.edges) {
    return [];
  }

  return data.user_redeemed_rewardsCollection.edges.map((edge) => ({
    id: edge.node.id,
    user_id: edge.node.user_id,
    reward_id: edge.node.reward_id,
    type: edge.node.type!,
    reward_value: edge.node.reward_value!,
    points_spent: edge.node.points_spent!,
    redeemed_at: edge.node.redeemed_at!,
    used: edge.node.used!,
    used_at: edge.node.used_at,
    created_at: edge.node.created_at!,
  }));
}

// =============================================
// HOOKS
// =============================================

/**
 * Fetch rewards catalog
 * @param filter - Optional filter (e.g., by type, is_active, tier_requirement)
 */
export function useRewardsCatalogGraphQL(filter?: {
  type?: string;
  is_active?: boolean;
  tier_requirement?: string;
}) {
  const { data, loading, error, refetch } = useGetRewardsCatalogQuery({
    variables: {
      filter: filter
        ? {
            type: filter.type ? { eq: filter.type } : undefined,
            is_active: filter.is_active !== undefined ? { eq: filter.is_active } : undefined,
            tier_requirement: filter.tier_requirement ? { eq: filter.tier_requirement } : undefined,
          }
        : undefined,
    },
    fetchPolicy: "cache-and-network",
  });

  return {
    rewards: transformGraphQLToRewards(data),
    isLoading: loading,
    error,
    refetch,
  };
}

/**
 * Fetch user's redeemed rewards
 */
export function useUserRedeemedRewardsGraphQL(userId?: string | null) {
  const { data, loading, error, refetch } = useGetUserRedeemedRewardsQuery({
    variables: { userId: userId! },
    skip: !userId,
    fetchPolicy: "cache-and-network",
  });

  return {
    redeemedRewards: transformGraphQLToRedeemedRewards(data),
    isLoading: loading,
    error,
    refetch,
  };
}

/**
 * Redeem a reward
 */
export function useRedeemRewardGraphQL(onSuccess?: (reward: RedeemedReward) => void) {
  const [redeemRewardMutation, { loading, error }] = useRedeemRewardMutation({
    refetchQueries: ["GetUserRewards", "GetUserRedeemedRewards", "GetRewardsCatalog"],
    awaitRefetchQueries: true,
    onCompleted: (data) => {
      const redeemed = data?.insertIntouser_redeemed_rewardsCollection?.records?.[0];
      if (redeemed && onSuccess) {
        onSuccess({
          id: redeemed.id,
          user_id: redeemed.user_id,
          reward_id: redeemed.reward_id,
          type: redeemed.type!,
          reward_value: redeemed.reward_value!,
          points_spent: redeemed.points_spent!,
          redeemed_at: redeemed.redeemed_at!,
          used: redeemed.used!,
          used_at: redeemed.used_at,
          created_at: redeemed.created_at!,
        });
      }
    },
  });

  const redeem = async (userId: string, reward: Reward) => {
    if (!userId) throw new Error("User ID is required");

    return redeemRewardMutation({
      variables: {
        userId,
        rewardId: reward.id,
        rewardType: reward.type,
        rewardValue: reward.name,
        pointsSpent: reward.points_cost,
      },
    });
  };

  return {
    redeem,
    isRedeeming: loading,
    error,
  };
}
