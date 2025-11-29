/**
 * AchievementsBadges Component
 * Badge collection with unlock animations
 * Gamification at its finest!
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Lock, Unlock, Trophy, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/design-system';
import { useState } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number; // 0-100
  requirement: string;
}

interface AchievementsBadgesProps {
  achievements?: Achievement[];
  loading?: boolean;
  onViewAll?: () => void;
}

export function AchievementsBadges({
  achievements,
  loading,
  onViewAll,
}: AchievementsBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);

  // Default achievements
  const defaultAchievements: Achievement[] = [
    {
      id: '1',
      name: 'First Step',
      description: 'Log your first meal',
      icon: '🌱',
      color: 'green',
      unlocked: false,
      progress: 0,
      requirement: '1 meal logged',
    },
    {
      id: '2',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      color: 'orange',
      unlocked: false,
      progress: 0,
      requirement: '7-day streak',
    },
    {
      id: '3',
      name: 'Workout Newbie',
      description: 'Complete 10 workouts',
      icon: '🏃',
      color: 'purple',
      unlocked: false,
      progress: 0,
      requirement: '10 workouts',
    },
    {
      id: '4',
      name: 'Month Master',
      description: 'Maintain a 30-day streak',
      icon: '💪',
      color: 'blue',
      unlocked: false,
      progress: 0,
      requirement: '30-day streak',
    },
    {
      id: '5',
      name: '5kg Down',
      description: 'Lose 5kg',
      icon: '⬇️',
      color: 'green',
      unlocked: false,
      progress: 0,
      requirement: '5kg weight loss',
    },
    {
      id: '6',
      name: 'Gym Regular',
      description: 'Complete 50 workouts',
      icon: '💪',
      color: 'blue',
      unlocked: false,
      progress: 0,
      requirement: '50 workouts',
    },
  ];

  const displayAchievements = achievements || defaultAchievements;
  const unlockedCount = displayAchievements.filter((a) => a.unlocked).length;
  const totalCount = displayAchievements.length;

  // Show only first 6 for preview
  const previewAchievements = displayAchievements.slice(0, 6);

  if (loading) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading achievements...
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Collection Progress</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {Math.round((unlockedCount / totalCount) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500"
            />
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-3 gap-3">
          {previewAchievements.map((achievement, index) => (
            <motion.button
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedBadge(achievement)}
              className={cn(
                'relative p-4 rounded-lg transition-all text-center',
                achievement.unlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800'
                  : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
              )}
            >
              {/* Badge Icon */}
              <div className="relative inline-block">
                <motion.div
                  className={cn(
                    'text-4xl mb-2',
                    !achievement.unlocked && 'grayscale opacity-40'
                  )}
                  animate={
                    achievement.unlocked
                      ? {
                          rotate: [0, -10, 10, -10, 0],
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  {achievement.icon}
                </motion.div>

                {/* Lock Icon */}
                {!achievement.unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Lock className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                  </div>
                )}

                {/* Sparkle effect for unlocked */}
                {achievement.unlocked && (
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    ✨
                  </motion.div>
                )}
              </div>

              {/* Badge Name */}
              <div
                className={cn(
                  'text-xs font-semibold',
                  achievement.unlocked
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400'
                )}
              >
                {achievement.name}
              </div>

              {/* Progress Bar (if not unlocked) */}
              {!achievement.unlocked && achievement.progress !== undefined && achievement.progress > 0 && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${achievement.progress}%` }}
                    className="h-full bg-primary-500"
                  />
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Next Achievement to Unlock */}
        {(() => {
          const nextAchievement = displayAchievements.find(
            (a) => !a.unlocked && (a.progress || 0) > 0
          );

          if (!nextAchievement) return null;

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-4 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{nextAchievement.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {nextAchievement.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {nextAchievement.description}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${nextAchievement.progress}%` }}
                        className="h-full bg-primary-500"
                      />
                    </div>
                    <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                      {nextAchievement.progress}%
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Modal for badge details */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedBadge(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedBadge.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {selectedBadge.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {selectedBadge.description}
                  </p>
                  {selectedBadge.unlocked ? (
                    <div>
                      <Badge variant="success" size="lg">
                        <Unlock className="w-4 h-4 mr-1" />
                        Unlocked
                      </Badge>
                      {selectedBadge.unlockedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          Earned on{' '}
                          {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Badge variant="gray" size="lg">
                        <Lock className="w-4 h-4 mr-1" />
                        Locked
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Requirement: {selectedBadge.requirement}
                      </p>
                      {selectedBadge.progress !== undefined && selectedBadge.progress > 0 && (
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="h-full bg-primary-500 rounded-full"
                              style={{ width: `${selectedBadge.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {selectedBadge.progress}% complete
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setSelectedBadge(null)}
                >
                  Close
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
}
