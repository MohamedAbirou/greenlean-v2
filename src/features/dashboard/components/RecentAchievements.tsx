import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Target, Zap, Award, TrendingUp, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface RecentAchievementsProps {
  userId: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'pr' | 'milestone' | 'streak' | 'goal';
  icon: React.ReactNode;
  color: string;
  date: string;
}

export function RecentAchievements({ userId }: RecentAchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [userId]);

  const loadAchievements = async () => {
    setLoading(true);
    try {
      const recentAchievements: Achievement[] = [];

      // Get recent PRs
      const { data: prs, error: prError } = await supabase
        .from('exercise_personal_records')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false })
        .limit(5);

      if (!prError && prs) {
        prs.forEach((pr) => {
          recentAchievements.push({
            id: pr.id,
            title: `New ${pr.exercise_name} PR!`,
            description: `${pr.reps} reps × ${pr.weight_kg}kg`,
            type: 'pr',
            icon: <Trophy className="h-5 w-5" />,
            color: 'from-amber-500 to-yellow-500',
            date: pr.achieved_at,
          });
        });
      }

      // Get recent milestones
      const { data: milestones, error: milestoneError } = await supabase
        .from('progress_milestones')
        .select('*')
        .eq('user_id', userId)
        .order('achieved_at', { ascending: false })
        .limit(5);

      if (!milestoneError && milestones) {
        milestones.forEach((milestone) => {
          recentAchievements.push({
            id: milestone.id,
            title: milestone.milestone_name,
            description: milestone.description || 'Great achievement!',
            type: 'milestone',
            icon: <Award className="h-5 w-5" />,
            color: 'from-purple-500 to-pink-500',
            date: milestone.achieved_at,
          });
        });
      }

      // Sort by date and take top 6
      recentAchievements.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setAchievements(recentAchievements.slice(0, 6));
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="h-6 w-6 text-amber-500" />
          <h3 className="text-lg font-semibold">Recent Achievements</h3>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No achievements yet</p>
          <p className="text-sm mt-1">Keep working hard and they'll start appearing!</p>
        </div>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Star className="h-6 w-6 text-amber-500" />
        <h3 className="text-lg font-semibold">Recent Achievements</h3>
      </div>

      <div className="space-y-3">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg bg-gradient-to-r ${achievement.color} text-white`}
          >
            <div className="flex items-start space-x-3">
              <div className="mt-0.5">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{achievement.title}</h4>
                  <Badge variant="secondary" className="text-xs bg-white/20 text-white">
                    {formatDate(achievement.date)}
                  </Badge>
                </div>
                <p className="text-sm opacity-90 mt-1">{achievement.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
