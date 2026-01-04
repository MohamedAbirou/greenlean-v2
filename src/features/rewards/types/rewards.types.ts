/**
 * Rewards System Types
 * Matching database schema from supabase/migrations
 */

export type RewardType = 'discount' | 'theme' | 'avatar' | 'feature_unlock' | 'physical_item';
export type RedemptionStatus = 'pending' | 'fulfilled' | 'expired' | 'refunded';
export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  points_cost: number;
  value: string;
  tier_requirement: SubscriptionTier | null;
  stock_quantity: number | null;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRewards {
  user_id: string;
  points: number;
  lifetime_points: number;
  badges: string[];
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  points_spent: number;
  status: RedemptionStatus;
  redemption_data: Record<string, any>;
  redeemed_at: string;
  fulfilled_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  userTier: SubscriptionTier;
  onRedeem: (rewardId: string) => void;
  isRedeeming?: boolean;
}

export interface RewardFilterOptions {
  type?: RewardType;
  maxPoints?: number;
  tierRequirement?: SubscriptionTier;
}
