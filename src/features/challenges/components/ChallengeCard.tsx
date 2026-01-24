import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import type { Challenge } from "@/shared/types/challenge";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { CheckCircle2, Clock, Flame, Info, Loader2, LogOut, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import Countdown from "./Countdown";

interface ChallengeCardProps {
  challenge: Challenge;
  isJoining: boolean;
  updatingProgress: boolean;
  isQuitting: boolean;
  index: number;
  updateProgress: (challengeId: string, newProgress: number) => void;
  quitChallenge: (challengeId: string) => void;
  joinChallenge: (challengeId: string) => void;
}

const difficultyColors = {
  easy: { gradient: "from-emerald-400 to-green-500", bg: "bg-emerald-500", border: "border-emerald-400" },
  medium: { gradient: "from-cyan-400 to-blue-500", bg: "bg-cyan-500", border: "border-cyan-400" },
  hard: { gradient: "from-purple-400 to-pink-500", bg: "bg-purple-500", border: "border-purple-400" },
};

const difficultyBadges = {
  easy: "bg-emerald-500/30 text-emerald-500 border-emerald-300",
  medium: "bg-cyan-500/30 text-cyan-500 border-cyan-300",
  hard: "bg-purple-500/30 text-purple-500 border-purple-300",
};

const challengeIcons = {
  daily: LucideIcons.Calendar,
  weekly: LucideIcons.CalendarDays,
  streak: LucideIcons.Flame,
  goal: LucideIcons.Target,
  all: LucideIcons.Award,
};

const ChallengeCard = memo(
  ({
    challenge,
    isJoining,
    isQuitting,
    index,
    updatingProgress,
    updateProgress,
    quitChallenge,
    joinChallenge,
  }: ChallengeCardProps) => {
    const IconComponent = useMemo(
      () => challengeIcons[challenge.type] || LucideIcons.Award,
      [challenge.type]
    );

    const difficultyColor = useMemo(
      () => difficultyColors[challenge.difficulty] || difficultyColors.easy,
      [challenge.difficulty]
    );

    const difficultyBadge = useMemo(
      () =>
        difficultyBadges[challenge.difficulty] ||
        "bg-gray-50 dark:bg-gray-900/30 text-foreground/90 border-gray-400",
      [challenge.difficulty]
    );

    const progress = useMemo(
      () =>
        challenge.user_progress
          ? (challenge.user_progress.progress.current / challenge.requirements.target) * 100
          : 0,
      [challenge.user_progress, challenge.requirements.target]
    );

    const isCompleted = challenge.user_progress?.completed;
    const isJoined = !!challenge.user_progress;

    // OPTIMIZED: useCallback for event handlers
    const handleUpdateProgress = useCallback(() => {
      updateProgress(challenge.id, challenge.user_progress?.progress.current + 1);
    }, [challenge.id, challenge.user_progress?.progress, updateProgress]);

    const handleQuitChallenge = useCallback(() => {
      if (confirm("Are you sure you want to quit this challenge?")) {
        quitChallenge(challenge.id);
      }
    }, [challenge.id, quitChallenge]);

    const handleJoinChallenge = useCallback(() => {
      joinChallenge(challenge.id);
    }, [challenge.id, joinChallenge]);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg hover:shadow-2xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
      >
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none" />

        {/* Animated Gradient Border Top */}
        <div className={`h-1.5 bg-gradient-to-r ${difficultyColor.gradient} relative`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <div className="relative p-5 flex flex-col h-full space-y-4">
          {/* Header */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
              className={`relative p-3.5 rounded-2xl bg-gradient-to-br ${difficultyColor.gradient} shadow-lg`}
            >
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <IconComponent className="relative h-6 w-6 text-white" />
            </motion.div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-lg text-foreground leading-tight line-clamp-2 flex-1">
                  {challenge.title}
                </h3>
                {challenge.user_progress?.streak_expires_at && (
                  <Countdown expiry={challenge.user_progress.streak_expires_at} />
                )}
              </div>

              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${difficultyBadge}`}>
                  {challenge.difficulty}
                </span>

                {challenge.user_progress &&
                  !isCompleted &&
                  challenge.user_progress.streak_count > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-300">
                      <Flame className="h-3 w-3" />
                      {challenge.user_progress.streak_count}
                    </span>
                  )}

                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300">
                  <Sparkles className="h-3 w-3" />
                  {challenge.points}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
            {challenge.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">
                {new Date(challenge.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="font-medium">{challenge.participants_count}</span>
            </div>
            <Popover>
              <PopoverTrigger className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors">
                <Info className="h-4 w-4" />
                <span className="font-medium">Info</span>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-foreground">Challenge Details</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span className="font-medium">Type:</span>
                      <span className="capitalize">{challenge.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Target:</span>
                      <span>{challenge.requirements.target} {challenge.requirements.metric}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ends:</span>
                      <span>{new Date(challenge.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Progress or Join Button */}
          {isJoined ? (
            <div className="space-y-3 pt-4 border-t border-border/50">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-foreground">Progress</span>
                  <span className="font-bold text-foreground">
                    {challenge.user_progress.progress.current} / {challenge.requirements.target}
                  </span>
                </div>
                <div className="relative w-full bg-muted/50 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: Math.min(progress, 100) / 100 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={`absolute inset-0 origin-left bg-gradient-to-r ${difficultyColor.gradient} rounded-full`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />
                </div>
              </div>

              {/* Action Buttons */}
              {!isCompleted ? (
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpdateProgress}
                    disabled={updatingProgress}
                    className={`flex-1 py-2.5 bg-gradient-to-r ${difficultyColor.gradient} text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {updatingProgress ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Zap className="h-5 w-5" />
                    )}
                    {updatingProgress ? "Logging..." : "Log Progress"}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleQuitChallenge}
                    disabled={isQuitting}
                    className="px-4 py-2.5 bg-destructive/90 hover:bg-destructive text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isQuitting ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LogOut className="h-5 w-5" />
                    )}
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center p-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-semibold shadow-lg"
                >
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Challenge Completed!
                </motion.div>
              )}
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleJoinChallenge}
              disabled={isJoining}
              className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trophy className="h-5 w-5" />
              )}
              {isJoining ? "Joining..." : "Join Challenge"}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  },
  // CRITICAL: Custom comparison function for memo
  (prevProps, nextProps) => {
    return (
      prevProps.challenge.id === nextProps.challenge.id &&
      prevProps.challenge.user_progress?.progress.current ===
        nextProps.challenge.user_progress?.progress.current &&
      prevProps.challenge.user_progress?.completed === nextProps.challenge.user_progress?.completed
    );
  }
);

ChallengeCard.displayName = "ChallengeCard";

export default ChallengeCard;
