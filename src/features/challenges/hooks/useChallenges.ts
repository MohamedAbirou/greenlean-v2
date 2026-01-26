/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Supabase Hooks for Challenges & Gamification
 * Realtime for INSERT/UPDATE; for DELETE (quit), pass refetch to onSuccess
 */

import { supabase } from "@/lib/supabase";
import type { Challenge } from "@/shared/types/challenge";
import { useEffect, useState } from "react";

// =============================================
// TYPE TRANSFORMERS (unchanged)
// =============================================

function transformToChallenges(challengesData: any[], participantsData: any[]): Challenge[] {
  if (!challengesData || !participantsData) {
    return [];
  }

  return challengesData.map((challenge) => {
    const userParticipation = participantsData.find((p) => p.challenge_id === challenge.id);

    const challengeParticipants = participantsData
      .filter((p) => p.challenge_id === challenge.id)
      .map((p) => ({
        ...p,
        completed: p.completed ?? false,
      }));

    return {
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      type: challenge.type as "daily" | "weekly" | "streak" | "goal",
      difficulty: challenge.difficulty as "easy" | "medium" | "hard",
      points: challenge.points,
      requirements: challenge.requirements,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      is_active: challenge.is_active,
      created_at: challenge.created_at,
      participants: challengeParticipants,
      participants_count: challengeParticipants.length,
      completion_rate: 0,
      user_progress: userParticipation
        ? {
            progress: userParticipation.progress ? userParticipation.progress : { current: 0 },
            completed: userParticipation.completed ?? false,
            streak_count: userParticipation.streak_count,
            streak_expires_at: userParticipation.streak_expires_at,
          }
        : (null as any),
    };
  });
}

function transformToUserRewards(data: any) {
  if (!data) {
    return { points: 0 };
  }
  return {
    points: data.points,
    lifetime_points: data.lifetime_points,
  };
}

// =============================================
// HOOKS
// =============================================

/**
 * Fetch all challenges with user participation data
 */
export function useChallenges(userId?: string | null) {
  const [data, setData] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    if (!userId) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: challengesData, error: challengesError } = await supabase
        .from("challenges")
        .select("*");

      if (challengesError) throw challengesError;

      const { data: participantsData, error: participantsError } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("user_id", userId);

      if (participantsError) throw participantsError;

      setData(transformToChallenges(challengesData || [], participantsData || []));
    } catch (err) {
      setError(err);
      console.error("Error fetching challenges:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch + Realtime subscriptions
  useEffect(() => {
    fetchData();

    if (!userId) return;

    // Subscribe to user's own participation changes (join/update only; for quit use onSuccess)
    const participantsChannel = supabase
      .channel(`challenge_participants:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "challenge_participants",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Challenge participant INSERT → refetching", payload);
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "challenge_participants",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Challenge participant UPDATE → refetching", payload);
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "challenge_participants",
        },
        (payload) => {
          console.log("Challenge participant DELETE → refetching", payload);
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log("Participants subscription status:", status);
      });

    // Subscribe to global challenge changes (new challenges, etc.)
    const challengesChannel = supabase
      .channel("challenges")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "challenges",
        },
        (payload) => {
          console.log("Challenge list changed → refetching", payload);
          fetchData();
        }
      )
      .subscribe((status) => {
        console.log("Challenges subscription status:", status);
      });

    // Cleanup
    return () => {
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(challengesChannel);
    };
  }, [userId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Fetch user rewards
 */
export function useUserRewards(userId?: string | null) {
  const [data, setData] = useState<any>({ points: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("user_rewards")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (rewardsError) throw rewardsError;

      setData(transformToUserRewards(rewardsData));
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

/**
 * Join a challenge
 */
export function useJoinChallenge(userId?: string | null, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (challenge: Challenge) => {
    if (!userId) throw new Error("User ID is required");

    setIsLoading(true);
    setError(null);

    try {
      const { error: joinError } = await supabase.from("challenge_participants").insert({
        challenge_id: challenge.id,
        user_id: userId,
        progress: { current: 0 },
      });

      if (joinError) throw joinError;

      onSuccess?.(); // optional - realtime will handle UI update
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

/**
 * Quit a challenge
 * IMPORTANT: To refresh after quit, pass refetch from useChallenges to onSuccess
 * e.g., useQuitChallenge(userId, refetch)
 */
export function useQuitChallenge(userId?: string | null, onSuccess?: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async (challengeId: string) => {
    if (!userId) throw new Error("User ID is required");

    setIsLoading(true);
    setError(null);

    try {
      const { error: quitError } = await supabase
        .from("challenge_participants")
        .delete()
        .eq("challenge_id", challengeId)
        .eq("user_id", userId);

      if (quitError) throw quitError;

      onSuccess?.();
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

/**
 * Update challenge progress
 */
export function useUpdateChallengeProgress(
  userId?: string | null,
  onSuccess?: (opts: { isCompleting: boolean }) => void
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const mutate = async ({
    challenge,
    newProgress,
  }: {
    challenge: Challenge;
    newProgress: number;
  }) => {
    if (!userId) throw new Error("User ID is required");

    setIsLoading(true);
    setError(null);

    try {
      const isCompleting = newProgress >= challenge.requirements.target;
      const now = new Date().toISOString();

      const getNextExpiration = (type: string): string | null => {
        const nowDate = new Date();
        if (type === "daily")
          return new Date(nowDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
        if (type === "weekly")
          return new Date(nowDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        return null;
      };

      const { error: updateError } = await supabase
        .from("challenge_participants")
        .update({
          progress: { current: newProgress },
          completed: isCompleting,
          completion_date: isCompleting ? now : null,
          streak_count: newProgress,
          last_progress_date: now,
          streak_expires_at: isCompleting ? null : getNextExpiration(challenge.type),
        })
        .eq("challenge_id", challenge.id)
        .eq("user_id", userId);

      if (updateError) throw updateError;

      onSuccess?.({ isCompleting }); // optional - realtime will handle UI update
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}
