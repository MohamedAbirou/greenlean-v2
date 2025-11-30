import type { UserRewards } from "@/shared/types/challenge";
import { motion } from "framer-motion";
import { Trophy, Zap, Sparkles, Gift, Award } from "lucide-react";
import { IconMap } from "../utils/progress";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

export default function ChallengeHeader({ userRewards }: { userRewards: UserRewards }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm rounded-3xl border border-border/50 shadow-2xl p-8 overflow-hidden"
    >
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none" />

      {/* Animated Background Blobs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-400/20 to-purple-400/20 rounded-full blur-3xl"
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-400/20 to-pink-400/20 rounded-full blur-3xl"
      />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Title Section */}
        <div className="flex items-center gap-5">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-60" />
            <div className="relative bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 shadow-xl">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 dark:from-purple-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Workout Challenges
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Complete challenges, earn points, unlock epic rewards
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Points Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-400/30 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm min-w-[200px]">
              <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide mb-1">
                Total Points
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-3xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
                  {userRewards?.points.toLocaleString() || 0}
                </p>
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </div>
              <Link to="/dashboard/rewards">
                <Button
                  size="sm"
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-none shadow-md"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  View Rewards
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Badges Card */}
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ duration: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
            <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-400/30 rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm min-w-[240px]">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-wide mb-2">
                Badges Earned
              </p>
              {(!userRewards?.badges || userRewards.badges.length === 0) ? (
                <div className="flex items-center justify-center h-12 text-muted-foreground text-sm">
                  No badges yet
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userRewards.badges.map((badge, index) => {
                    const IconComponent = IconMap[badge.icon] || Award;

                    return (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.1, rotate: 3 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm cursor-pointer"
                        style={{
                          backgroundColor: `${badge.color}15`,
                          borderColor: badge.color,
                          color: badge.color,
                        }}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span className="max-w-[90px] truncate">{badge.name}</span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
