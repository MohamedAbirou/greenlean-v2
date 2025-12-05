/**
 * Tier Unlock Notification
 * Celebration modal shown when user unlocks a new personalization tier
 * Offers plan regeneration with new tier benefits
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Award, Zap, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/design-system';

export interface TierUnlockData {
  previousTier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  newTier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  completenessPercentage: number;
  shouldRegenerateMeal?: boolean;
  shouldRegenerateWorkout?: boolean;
}

interface TierUnlockNotificationProps {
  data: TierUnlockData | null;
  onRegenerate: () => void;
  onDismiss: () => void;
}

const TIER_CONFIG = {
  BASIC: {
    label: 'Basic',
    color: 'from-gray-400 to-gray-600',
    icon: '🌱',
    benefits: [
      'Essential personalization',
      'Basic meal plans',
      'Simple workout routines',
    ],
  },
  STANDARD: {
    label: 'Standard',
    color: 'from-blue-400 to-blue-600',
    icon: '⚡',
    benefits: [
      'Advanced personalization',
      'Customized meal plans',
      'Tailored workout programs',
      'Equipment-specific exercises',
    ],
  },
  PREMIUM: {
    label: 'Premium',
    color: 'from-purple-500 via-pink-500 to-yellow-500',
    icon: '✨',
    benefits: [
      'Maximum personalization',
      'Health condition adaptations',
      'Lifestyle-optimized plans',
      'Family & schedule integration',
      'Advanced nutrition tracking',
    ],
  },
};

export function TierUnlockNotification({ data, onRegenerate, onDismiss }: TierUnlockNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (data) {
      setShow(true);

      // Trigger confetti celebration
      const colors = data.newTier === 'PREMIUM'
        ? ['#a855f7', '#ec4899', '#eab308']
        : data.newTier === 'STANDARD'
        ? ['#3b82f6', '#60a5fa', '#93c5fd']
        : ['#6b7280', '#9ca3af'];

      confetti({
        particleCount: 150,
        spread: 120,
        origin: { y: 0.6 },
        colors,
      });

      // Extra confetti for PREMIUM
      if (data.newTier === 'PREMIUM') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
          });
          confetti({
            particleCount: 100,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
          });
        }, 300);
      }
    }
  }, [data]);

  if (!data) return null;

  const tierConfig = TIER_CONFIG[data.newTier];
  const shouldRegenerateAny = data.shouldRegenerateMeal || data.shouldRegenerateWorkout;

  const handleRegenerate = () => {
    setShow(false);
    setTimeout(() => onRegenerate(), 300);
  };

  const handleDismiss = () => {
    setShow(false);
    setTimeout(() => onDismiss(), 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 50, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="relative overflow-hidden p-0">
              {/* Close Button */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Gradient Background */}
              <div className={cn(
                'absolute inset-0 opacity-10 bg-gradient-to-br',
                tierConfig.color
              )} />

              <div className="relative p-8">
                {/* Icon & Header */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
                  className="text-center mb-6"
                >
                  <div className={cn(
                    'inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br mb-4',
                    tierConfig.color
                  )}>
                    <span className="text-5xl">{tierConfig.icon}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Tier Unlocked!
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="text-muted-foreground">
                      {TIER_CONFIG[data.previousTier].label}
                    </Badge>
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <Badge className={cn(
                      'bg-gradient-to-r text-white border-0',
                      tierConfig.color
                    )}>
                      {tierConfig.label}
                    </Badge>
                  </div>
                </motion.div>

                {/* Completeness Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      Profile Completeness
                    </span>
                    <span className="text-sm font-bold text-primary-600">
                      {Math.round(data.completenessPercentage)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.completenessPercentage}%` }}
                      transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                      className={cn(
                        'h-full bg-gradient-to-r',
                        tierConfig.color
                      )}
                    />
                  </div>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mb-6"
                >
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    New Benefits Unlocked
                  </h3>
                  <ul className="space-y-2">
                    {tierConfig.benefits.map((benefit, index) => (
                      <motion.li
                        key={benefit}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span>{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Regeneration Offer */}
                {shouldRegenerateAny && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="p-4 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 border border-primary-200 dark:border-primary-800 mb-6"
                  >
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-foreground mb-1">
                          Ready to level up your plans?
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {data.shouldRegenerateMeal && data.shouldRegenerateWorkout
                            ? 'Regenerate both your meal and workout plans with enhanced personalization.'
                            : data.shouldRegenerateMeal
                            ? 'Regenerate your meal plan with enhanced personalization.'
                            : 'Regenerate your workout plan with enhanced personalization.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {shouldRegenerateAny ? (
                    <>
                      <Button
                        onClick={handleRegenerate}
                        className={cn(
                          'flex-1 bg-gradient-to-r text-white border-0',
                          tierConfig.color
                        )}
                        size="lg"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Regenerate Now
                      </Button>
                      <Button
                        onClick={handleDismiss}
                        variant="outline"
                        size="lg"
                        className="sm:w-auto"
                      >
                        Later
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleDismiss}
                      className={cn(
                        'w-full bg-gradient-to-r text-white border-0',
                        tierConfig.color
                      )}
                      size="lg"
                    >
                      Awesome!
                    </Button>
                  )}
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
