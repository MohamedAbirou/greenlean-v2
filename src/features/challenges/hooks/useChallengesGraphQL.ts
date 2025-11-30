/**
 * GraphQL Hooks for Challenges & Gamification
 * Replaces React Query hooks with Apollo Client
 */

import { useQuery, useMutation, type ApolloError } from '@apollo/client';
import {
  useGetChallengesQuery,
  useGetUserRewardsQuery,
  useJoinChallengeMutation,
  useQuitChallengeMutation,
  useUpdateChallengeProgressMutation,
  type GetChallengesQuery,
  type GetUserRewardsQuery,
} from '@/generated/graphql';
import type { Challenge } from '@/shared/types/challenge';

// =============================================
// TYPE TRANSFORMERS
// =============================================

/**
 * Transform GraphQL data to Challenge type
 */
function transformGraphQLToChallenges(
  data: GetChallengesQuery | undefined,
  userId?: string | null
): Challenge[] {
  if (!data?.challengesCollection?.edges || !data?.challenge_participantsCollection?.edges) {
    return [];
  }

  const challenges = data.challengesCollection.edges.map((edge) => edge.node);
  const participants = data.challenge_participantsCollection.edges.map((edge) => edge.node);

  return challenges.map((challenge) => {
    const userParticipation = participants.find((p) => p.challenge_id === challenge.id);

    return {
      id: challenge.id,
      title: challenge.title!,
      description: challenge.description!,
      type: challenge.type as "daily" | "weekly" | "streak" | "goal",
      difficulty: challenge.difficulty as "beginner" | "intermediate" | "advanced",
      points: challenge.points!,
      badge_id: challenge.badge_id || undefined,
      requirements: challenge.requirements as any,
      start_date: challenge.start_date!,
      end_date: challenge.end_date!,
      is_active: challenge.is_active!,
      created_at: challenge.created_at!,
      participants: [], // Will be populated by separate query if needed
      participants_count: 0,
      completion_rate: 0,
      user_progress: userParticipation
        ? {
            progress: userParticipation.progress as any,
            completed: userParticipation.completed!,
            streak_count: userParticipation.streak_count!,
            streak_expires_at: userParticipation.streak_expires_at!,
          }
        : null as any,
    };
  });
}

/**
 * Transform GraphQL data to UserRewards type
 */
function transformGraphQLToUserRewards(data: GetUserRewardsQuery | undefined) {
  const rewards = data?.user_rewardsCollection?.edges?.[0]?.node;
  if (!rewards) {
    return {
      points: 0,
      badges: [],
    };
  }

  return {
    points: rewards.points!,
    lifetime_points: rewards.lifetime_points,
    badges: (rewards.badges as any) || [],
  };
}

// =============================================
// HOOKS
// =============================================

/**
 * Fetch all challenges with user participation data
 */
export function useChallengesGraphQL(userId?: string | null) {
  const { data, loading, error, refetch } = useGetChallengesQuery({
    variables: { userId: userId || undefined },
    skip: !userId,
    pollInterval: 30000, // Refresh every 30 seconds
    fetchPolicy: 'cache-and-network',
  });

  return {
    data: transformGraphQLToChallenges(data, userId),
    isLoading: loading,
    error,
    refetch,
  };
}

/**
 * Fetch user rewards (points and badges)
 */
export function useUserRewardsGraphQL(userId?: string | null) {
  const { data, loading, error, refetch } = useGetUserRewardsQuery({
    variables: { userId: userId! },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  return {
    data: transformGraphQLToUserRewards(data),
    isLoading: loading,
    error,
    refetch,
  };
}

/**
 * Join a challenge
 */
export function useJoinChallengeGraphQL(userId?: string | null, onSuccess?: () => void) {
  const [joinChallengeMutation, { loading, error }] = useJoinChallengeMutation({
    refetchQueries: ['GetChallenges', 'GetUserRewards'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      onSuccess?.();
    },
  });

  const mutate = async (challenge: Challenge) => {
    if (!userId) throw new Error('User ID is required');

    return joinChallengeMutation({
      variables: {
        challengeId: challenge.id,
        userId,
      },
    });
  };

  return {
    mutate,
    isLoading: loading,
    error,
  };
}

/**
 * Quit a challenge
 */
export function useQuitChallengeGraphQL(userId?: string | null, onSuccess?: () => void) {
  const [quitChallengeMutation, { loading, error }] = useQuitChallengeMutation({
    refetchQueries: ['GetChallenges', 'GetUserRewards'],
    awaitRefetchQueries: true,
    onCompleted: () => {
      onSuccess?.();
    },
  });

  const mutate = async (challengeId: string) => {
    if (!userId) throw new Error('User ID is required');

    return quitChallengeMutation({
      variables: {
        challengeId,
        userId,
      },
    });
  };

  return {
    mutate,
    isLoading: loading,
    error,
  };
}

/**
 * Update challenge progress
 */
export function useUpdateChallengeProgressGraphQL(
  userId?: string | null,
  onSuccess?: (opts: { isCompleting: boolean }) => void
) {
  const [updateProgressMutation, { loading, error }] = useUpdateChallengeProgressMutation({
    refetchQueries: ['GetChallenges', 'GetUserRewards'],
    awaitRefetchQueries: true,
  });

  const mutate = async ({
    challenge,
    newProgress,
  }: {
    challenge: Challenge;
    newProgress: number;
  }) => {
    if (!userId) throw new Error('User ID is required');

    const isCompleting = newProgress >= challenge.requirements.target;
    const now = new Date().toISOString();

    // Calculate next expiration based on challenge type
    const getNextExpiration = (type: string): string | null => {
      const nowDate = new Date();
      if (type === "daily") return new Date(nowDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
      if (type === "weekly") return new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return null;
    };

    const result = await updateProgressMutation({
      variables: {
        challengeId: challenge.id,
        userId,
        progress: { current: newProgress },
        completed: isCompleting,
        completionDate: isCompleting ? now : null,
        streakCount: newProgress,
        lastProgressDate: now,
        streakExpiresAt: isCompleting ? null : getNextExpiration(challenge.type),
      },
    });

    onSuccess?.({ isCompleting });
    return result;
  };

  return {
    mutate,
    isLoading: loading,
    error,
  };
}
