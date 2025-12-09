import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Activity,
  Apple,
  Dumbbell,
  Award,
  Star,
} from 'lucide-react';
import { progressTrackingService } from '@/features/progress/api/progressTrackingService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';

interface JourneyTimelineProps {
  userId: string;
}

interface TimelineEvent {
  id: string;
  event_type: 'milestone' | 'achievement' | 'measurement' | 'workout_pr' | 'nutrition_goal' | 'other';
  event_date: string;
  title: string;
  description: string;
  metadata: any;
  created_at: string;
}

const eventTypeConfig: Record<
  string,
  { icon: React.ReactNode; color: string; bgColor: string }
> = {
  milestone: {
    icon: <Trophy className="h-5 w-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-950',
  },
  achievement: {
    icon: <Award className="h-5 w-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
  },
  measurement: {
    icon: <Activity className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
  },
  workout_pr: {
    icon: <Dumbbell className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950',
  },
  nutrition_goal: {
    icon: <Apple className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-950',
  },
  other: {
    icon: <Star className="h-5 w-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-950',
  },
};

export function JourneyTimeline({ userId }: JourneyTimelineProps) {
  const {
    items: events,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    sentryRef,
  } = useInfiniteScroll<TimelineEvent>({
    fetchFunction: async (limit, offset) => {
      const result = await progressTrackingService.getJourneyTimeline(
        userId,
        limit,
        offset
      );
      return result.data || [];
    },
    initialLimit: 20,
    pageSize: 20,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderMetadata = (event: TimelineEvent) => {
    const metadata = event.metadata;
    if (!metadata) return null;

    switch (event.event_type) {
      case 'measurement':
        return (
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            {metadata.weight_kg && (
              <div>
                <span className="text-muted-foreground">Weight:</span>{' '}
                <span className="font-semibold">{metadata.weight_kg} kg</span>
              </div>
            )}
            {metadata.body_fat_percentage && (
              <div>
                <span className="text-muted-foreground">Body Fat:</span>{' '}
                <span className="font-semibold">{metadata.body_fat_percentage}%</span>
              </div>
            )}
            {metadata.change && (
              <div className="col-span-2 flex items-center">
                {metadata.change > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={metadata.change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(metadata.change).toFixed(1)} kg
                </span>
              </div>
            )}
          </div>
        );
      case 'workout_pr':
        return (
          <div className="mt-3 text-sm">
            <div className="font-semibold">{metadata.exercise_name}</div>
            <div className="text-muted-foreground">
              {metadata.reps} reps × {metadata.weight_kg} kg
            </div>
          </div>
        );
      case 'nutrition_goal':
        return (
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Calories</div>
              <div className="font-semibold">{metadata.calories}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Protein</div>
              <div className="font-semibold">{metadata.protein}g</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Adherence</div>
              <div className="font-semibold">{metadata.adherence}%</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (error) {
    return (
      <Card className="p-6 border-destructive">
        <p className="text-destructive">Failed to load journey timeline: {error.message}</p>
        <Button onClick={refresh} className="mt-4">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {loading && events.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-semibold mb-2">Your journey begins now!</p>
          <p className="text-muted-foreground">
            Start tracking your fitness journey and watch your progress unfold
          </p>
        </Card>
      ) : (
        <>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

            {/* Events */}
            <div className="space-y-6">
              <AnimatePresence>
                {events.map((event, index) => {
                  const config = eventTypeConfig[event.event_type] || eventTypeConfig.other;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="relative pl-20"
                    >
                      {/* Icon */}
                      <div
                        className={`absolute left-4 -translate-x-1/2 w-12 h-12 rounded-full ${config.bgColor} ${config.color} flex items-center justify-center border-4 border-background shadow-lg z-10`}
                      >
                        {config.icon}
                      </div>

                      {/* Card */}
                      <Card className="p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {event.event_type.replace('_', ' ')}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(event.event_date)}
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFullDate(event.event_date)}
                          </div>
                        </div>

                        <p className="text-muted-foreground mt-3">{event.description}</p>

                        {renderMetadata(event)}
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Loading More Indicator */}
          {hasMore && (
            <div ref={sentryRef} className="relative pl-20 py-4">
              <div className="absolute left-8 -translate-x-1/2 w-8 h-8 rounded-full bg-muted animate-pulse" />
              <Card className="p-4">
                <Skeleton className="h-16 w-full" />
              </Card>
            </div>
          )}

          {!hasMore && events.length > 0 && (
            <div className="relative pl-20 py-4">
              <div className="absolute left-4 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center border-4 border-background shadow-lg">
                <Star className="h-5 w-5 text-white" />
              </div>
              <Card className="p-6 text-center bg-gradient-to-r from-primary/10 to-purple-600/10">
                <p className="font-semibold">The Beginning</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This is where your fitness journey started
                </p>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
