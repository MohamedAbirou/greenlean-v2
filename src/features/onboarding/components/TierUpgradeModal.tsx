/**
 * TierUpgradeModal Component
 * Celebration modal when user unlocks a new tier
 */

import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Check, Trophy, Zap, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface TierUpgradeModalProps {
  pendingUnlock: {
    id: string;
    old_tier: string;
    new_tier: string;
    completeness_percentage: number;
  } | null;
  acknowledgeTierUnlock: (
    unlockEventId: string,
    action: 'accept' | 'dismiss',
    regenerateDiet?: boolean,
    regenerateWorkout?: boolean
  ) => Promise<any>;
}

export function TierUpgradeModal({
  pendingUnlock,
  acknowledgeTierUnlock,
}: TierUpgradeModalProps) {
  const [regenerateDiet, setRegenerateDiet] = useState(true);
  const [regenerateWorkout, setRegenerateWorkout] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trigger confetti when modal opens
  useEffect(() => {
    if (pendingUnlock) {
      triggerConfetti();
    }
  }, [pendingUnlock]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleAccept = async () => {
    if (!pendingUnlock) return;

    setIsSubmitting(true);
    await acknowledgeTierUnlock(
      pendingUnlock.id,
      'accept',
      regenerateDiet,
      regenerateWorkout
    );
    setIsSubmitting(false);
  };

  const handleDismiss = async () => {
    if (!pendingUnlock) return;

    setIsSubmitting(true);
    await acknowledgeTierUnlock(pendingUnlock.id, 'dismiss');
    setIsSubmitting(false);
  };

  if (!pendingUnlock) return null;

  const tierFeatures = {
    STANDARD: [
      'Meal prep strategies',
      'More personalized tips (4-6)',
      'Progression tracking for workouts',
      'Better plan customization',
    ],
    PREMIUM: [
      'Advanced meal prep (batch cooking)',
      'Periodization workout plans',
      'Injury prevention guides',
      'Nutrition timing strategies',
      'Lifestyle integration tips',
      'Full personalization (6-8 tips)',
    ],
  };

  const features = tierFeatures[pendingUnlock.new_tier as keyof typeof tierFeatures] || [];

  return (
    <Dialog open={!!pendingUnlock} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <div className="text-center">
          {/* Animated Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 mx-auto mb-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-lg opacity-50" />
            <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-2xl">
              {pendingUnlock.new_tier === 'PREMIUM' ? (
                <Trophy className="w-12 h-12 text-white" />
              ) : (
                <Sparkles className="w-12 h-12 text-white" />
              )}
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-2 -right-2"
            >
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              🎉 Congratulations!
            </h2>
            <p className="text-lg mb-1">
              You've unlocked <strong>{pendingUnlock.new_tier}</strong> tier!
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Your profile is now{' '}
              <strong className="text-primary">
                {Math.round(pendingUnlock.completeness_percentage)}%
              </strong>{' '}
              complete
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6"
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              style={{ width: `${pendingUnlock.completeness_percentage}%` }}
            />
          </motion.div>

          {/* Features Unlocked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-muted/50 to-accent/10 p-5 rounded-xl mb-6 border border-border"
          >
            <h3 className="font-semibold mb-4 flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              New Features Unlocked
            </h3>
            <ul className="space-y-2.5">
              {features.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-2 text-sm text-left"
                >
                  <Check className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Regeneration Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6 p-4 bg-accent/10 rounded-lg border border-border"
          >
            <p className="text-sm font-medium mb-3">What would you like to update?</p>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded hover:bg-accent/20 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={regenerateDiet}
                  onChange={(e) => setRegenerateDiet(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Meal Plans</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded hover:bg-accent/20 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={regenerateWorkout}
                  onChange={(e) => setRegenerateWorkout(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Workout Plans</span>
              </label>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-3"
          >
            <Button
              onClick={handleAccept}
              disabled={isSubmitting || (!regenerateDiet && !regenerateWorkout)}
              className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? (
                'Regenerating...'
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate Selected Plans
                </>
              )}
            </Button>

            <button
              onClick={handleDismiss}
              disabled={isSubmitting}
              className="w-full px-6 py-3 border-2 border-border rounded-lg hover:bg-accent transition-colors text-sm font-medium"
            >
              Keep Current Plans
            </button>
          </motion.div>

          <p className="text-xs text-muted-foreground mt-4">
            You can always regenerate later from the Plans page
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
