/**
 * Rewards GraphQL Queries and Mutations
 * Generated queries will be available after running `npm run codegen`
 * These are temporary placeholder queries
 */

import { gql } from '@apollo/client';

export const GET_REWARDS_CATALOG = gql`
  query GetRewardsCatalog {
    rewards_catalogCollection(
      filter: { is_active: { eq: true } }
      orderBy: [{ points_cost: AscNullsLast }]
    ) {
      edges {
        node {
          id
          name
          description
          type
          points_cost
          tier_requirement
          stock_quantity
          image_url
          metadata
          created_at
        }
      }
    }
  }
`;


export const GET_USER_REWARDS = gql`
  query GetUserRewards($userId: UUID!) {
    user_rewardsCollection(filter: { user_id: { eq: $userId } }) {
      edges {
        node {
          user_id
          points
          lifetime_points
          updated_at
        }
      }
    }
  }
`;

export const GET_USER_REDEMPTIONS = gql`
  query GetUserRedemptions($userId: UUID!) {
    user_redeemed_rewardsCollection(
      filter: { user_id: { eq: $userId } }
      orderBy: [{ redeemed_at: DescNullsLast }]
    ) {
      edges {
        node {
          id
          reward_id
          type
          reward_value
          points_spent
          redeemed_at
          used
          used_at
        }
      }
    }
  }
`;

export const REDEEM_REWARD = gql`
  mutation RedeemReward($userId: UUID!, $rewardId: UUID!, $pointsSpent: Int!, $rewardType: String!, $rewardValue: String!) {
    insertIntouser_redeemed_rewardsCollection(
      objects: [{
        user_id: $userId
        reward_id: $rewardId
        points_spent: $pointsSpent
        type: $rewardType
        reward_value: $rewardValue
      }]
    ) {
      affectedCount
      records {
        id
        redeemed_at
      }
    }
  }
`;

export const UPDATE_USER_POINTS = gql`
  mutation UpdateUserPoints($userId: UUID!, $newPoints: Int!) {
    updateuser_rewardsCollection(
      filter: { user_id: { eq: $userId } }
      set: { points: $newPoints }
    ) {
      affectedCount
      records {
        points
        lifetime_points
      }
    }
  }
`;
