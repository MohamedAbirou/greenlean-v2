/**
 * UserPointsDisplay Component
 * Shows user's current points and lifetime points
 */

import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';

interface UserPointsDisplayProps {
  points: number;
  lifetimePoints: number;
}

export function UserPointsDisplay({ points, lifetimePoints }: UserPointsDisplayProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl p-6 text-white shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white/80 text-sm font-medium">Your Points</p>
          <motion.div
            key={points}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-4xl font-bold mt-1"
          >
            {points.toLocaleString()}
          </motion.div>
        </div>
        <Trophy className="w-10 h-10 text-white/80" />
      </div>

      <div className="flex items-center gap-2 text-white/80 text-sm">
        <TrendingUp className="w-4 h-4" />
        <span>{lifetimePoints.toLocaleString()} lifetime points</span>
      </div>
    </motion.div>
  );
}
