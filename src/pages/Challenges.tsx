import { useAuth } from "@/features/auth";
import {
  canUpdateProgress,
  ChallengeCard,
  ChallengeFilters,
  ChallengeHeader,
  useChallenges,
  useJoinChallenge,
  useQuitChallenge,
  useUpdateChallengeProgress,
  useUserRewards
} from "@/features/challenges";
import { FeatureGate } from "@/shared/components/billing/FeatureGate";
import type { Challenge } from "@/shared/types/challenge";
import confetti from "canvas-confetti";
import { AnimatePresence, domAnimation, LazyMotion } from "framer-motion";
import { Loader } from "lucide-react";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";

const Challenges: React.FC = () => {
  const { user } = useAuth();
  // UI filter state
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  // In-progress UI
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [quittingId, setQuittingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Data hooks (GraphQL - migrated from React Query)
  const { data: challenges, isLoading } = useChallenges(user?.id);
  const { data: userRewards } = useUserRewards(user?.id);
  const joinChallenge = useJoinChallenge(user?.id, () => toast.success("Joined challenge!"));
  const quitChallenge = useQuitChallenge(user?.id, () => toast("Quit challenge!"));
  const updateProgress = useUpdateChallengeProgress(user?.id, ({ isCompleting }) => {
    if (isCompleting) {
      toast.success("🎉 Challenge completed!");
      triggerConfetti();
    } else {
      toast.success("Progress logged");
    }
  });

  function triggerConfetti() {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
    }, 200);
  }

  // Handlers for cards (updated for GraphQL mutations)
  const handleJoin = async (challenge: Challenge) => {
    setJoiningId(challenge.id);
    try {
      await joinChallenge.mutate(challenge);
    } catch (e: any) {
      toast.error("Error joining: " + (e?.message || e));
    } finally {
      setJoiningId(null);
    }
  };

  const handleQuit = async (challenge: Challenge) => {
    setQuittingId(challenge.id);
    try {
      await quitChallenge.mutate(challenge.id);
    } catch (e: any) {
      toast.error("Error quitting: " + (e?.message || e));
    } finally {
      setQuittingId(null);
    }
  };

  const handleUpdateProgress = async (challenge: Challenge, newProgress: number) => {
    setUpdatingId(challenge.id);
    const lastProgress = (challenge.user_progress as any)?.last_progress_date;
    if (lastProgress !== undefined && !canUpdateProgress(challenge.type, lastProgress)) {
      setUpdatingId(null);
      toast.error("🚫 You already logged progress for this period!");
      return;
    }
    try {
      await updateProgress.mutate({ challenge, newProgress });
    } catch (e: any) {
      toast.error("Error updating: " + (e?.message || e));
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtering (stable)
  const filteredChallenges = useMemo(() => {
    return (challenges || [])
      .filter((challenge: Challenge) => {
        const matchesType = activeFilter === "all" || challenge.type === activeFilter;
        const matchesDifficulty =
          difficultyFilter === "all" || challenge.difficulty === difficultyFilter;
        const participant = challenge.participants?.find((p: any) => p.user_id === user?.id);
        const isCompleted = participant?.completed;
        const isJoined = !!participant;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "completed" && isCompleted) ||
          (statusFilter === "in_progress" && isJoined && !isCompleted) ||
          (statusFilter === "not_joined" && !isJoined);
        const matchesSearch = searchQuery === "" ||
          challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesDifficulty && matchesStatus && matchesSearch;
      })
      .sort((a: Challenge, b: Challenge) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case "oldest":
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case "points_high":
            return b.points - a.points;
          case "points_low":
            return a.points - b.points;
          case "easy_first":
            return (
              ["easy", "medium", "hard"].indexOf(a.difficulty) -
              ["easy", "medium", "hard"].indexOf(b.difficulty)
            );
          case "hard_first":
            return (
              ["easy", "medium", "hard"].indexOf(b.difficulty) -
              ["easy", "medium", "hard"].indexOf(a.difficulty)
            );
          default:
            return 0;
        }
      });
  }, [activeFilter, challenges, difficultyFilter, sortBy, statusFilter, searchQuery, user?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary-50/10 dark:to-primary-950/10 py-8">
        <div className="container mx-auto px-4 space-y-8">
          <FeatureGate
            feature="social_features"
            mode="block"
            upgradeTitle="Join Social Challenges"
            upgradeDescription="Connect with friends, participate in fitness challenges, and track your progress together. Upgrade to Pro or Premium to unlock social features!"
          >
            <ChallengeHeader userRewards={userRewards} />
            <ChallengeFilters
              activeFilter={activeFilter}
              difficultyFilter={difficultyFilter}
              statusFilter={statusFilter}
              sortBy={sortBy}
              searchQuery={searchQuery}
              setActiveFilter={setActiveFilter}
              setDifficultyFilter={setDifficultyFilter}
              setStatusFilter={setStatusFilter}
              setSortBy={setSortBy}
              setSearchQuery={setSearchQuery}
            />

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredChallenges.length}</span> challenge{filteredChallenges.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Challenges Grid */}
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredChallenges.map((challenge: Challenge, index: number) => (
                  <ChallengeCard
                    key={challenge.id}
                    index={index}
                    challenge={challenge}
                    isJoining={joiningId === challenge.id}
                    isQuitting={quittingId === challenge.id}
                    updatingProgress={updatingId === challenge.id}
                    updateProgress={(_id: string, newProgress: number) =>
                      handleUpdateProgress(challenge, newProgress)
                    }
                    quitChallenge={() => handleQuit(challenge)}
                    joinChallenge={() => handleJoin(challenge)}
                  />
                ))}
              </div>
            </AnimatePresence>

            {/* Empty State */}
            {filteredChallenges.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No challenges found matching your filters.</p>
                <p className="text-muted-foreground text-sm mt-2">Try adjusting your search or filters.</p>
              </div>
            )}
          </FeatureGate>
        </div>
      </div>
    </LazyMotion>
  );
};

export default Challenges;
