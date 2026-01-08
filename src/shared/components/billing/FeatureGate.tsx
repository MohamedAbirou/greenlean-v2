/**
 * FeatureGate Component
 * Controls access to features based on subscription tier
 */

import { cn } from '@/lib/utils';
import { useFeatureAccess, useSubscription } from '@/services/stripe';
import { useUpgradeModal } from '@/shared/hooks/useUpgrade';
import { motion } from 'framer-motion';
import { Crown, Lock, Sparkles, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { PaywallModal } from '../modals/PaywallModal';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface FeatureGateProps {
  /**
   * Feature identifier (matches database feature names)
   * e.g., 'ai_meal_plan', 'barcode_scanner', 'social_features'
   */
  feature: string;

  /**
   * Content to show when access is granted
   */
  children: ReactNode;

  /**
   * Fallback content to show when access is denied (optional)
   * If not provided, shows default upgrade prompt
   */
  fallback?: ReactNode;

  /**
   * Visual mode
   * - 'block': Completely hides content and shows upgrade prompt
   * - 'overlay': Shows blurred content with overlay
   * - 'inline': Shows minimal upgrade badge
   */
  mode?: 'block' | 'overlay' | 'inline';

  /**
   * Custom title for upgrade prompt
   */
  upgradeTitle?: string;

  /**
   * Custom description for upgrade prompt
   */
  upgradeDescription?: string;

  /**
   * className for container
   */
  className?: string;
}

export function FeatureGate({
  feature,
  children,
  fallback,
  mode = 'block',
  upgradeTitle,
  upgradeDescription,
  className,
}: FeatureGateProps) {
  const { canAccess, isLoading, reason } = useFeatureAccess(feature);
  const { tier } = useSubscription();
  const upgradeModal = useUpgradeModal();

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('animate-pulse bg-muted rounded-lg h-32', className)} />
    );
  }

  // Has access - show content
  if (canAccess) {
    return <>{children}</>;
  }

  // No access - show upgrade prompt based on mode
  const defaultTitle = getDefaultTitle(feature);
  const defaultDescription = getDefaultDescription(feature, tier, reason);

  if (mode === 'inline') {
    return (
      <div className={cn('relative', className)}>
        <div className="absolute top-2 right-2 z-10">
          <Badge
            variant="default"
            className="bg-gradient-to-r from-accent-600 to-accent-500 cursor-pointer"
            onClick={upgradeModal.open}
          >
            <Crown className="w-3 h-3 mr-1" />
            Pro
          </Badge>
        </div>
        <div className="pointer-events-none opacity-50">{children}</div>
        <PaywallModal
          isOpen={upgradeModal.isOpen}
          onClose={upgradeModal.close}
          feature={feature}
          title={upgradeTitle || defaultTitle}
          description={upgradeDescription || defaultDescription}
        />
      </div>
    );
  }

  if (mode === 'overlay') {
    return (
      <div className={cn('relative', className)}>
        {/* Blurred Content */}
        <div className="blur-sm pointer-events-none select-none">{children}</div>

        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <Card className="max-w-md p-6 text-center shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {upgradeTitle || defaultTitle}
            </h3>
            <p className="text-muted-foreground mb-6">
              {upgradeDescription || defaultDescription}
            </p>
            <Button
              size="lg"
              className="w-full"
              onClick={upgradeModal.open}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </Card>
        </motion.div>

        <PaywallModal
          isOpen={upgradeModal.isOpen}
          onClose={upgradeModal.close}
          feature={feature}
          title={upgradeTitle || defaultTitle}
          description={upgradeDescription || defaultDescription}
        />
      </div>
    );
  }

  // Block mode (default)
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={className}>
      <Card className="p-8 text-center border-2 border-dashed border-muted">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
            {getFeatureIcon(feature)}
          </div>

          <h3 className="text-2xl font-bold mb-2">
            {upgradeTitle || defaultTitle}
          </h3>

          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {upgradeDescription || defaultDescription}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={upgradeModal.open}
              className="min-w-[200px]"
            >
              <Crown className="w-4 h-4 mr-2" />
              {tier === 'free' ? 'Upgrade to Pro' : 'Upgrade to Premium'}
            </Button>
            <Button onClick={() => window.location.href = '/pricing'} size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Benefits Preview */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="flex items-start gap-2">
              <Zap className="w-5 h-5 text-accent-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Unlimited AI Plans</p>
                <p className="text-xs text-muted-foreground">
                  Generate as many as you need
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-accent-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Premium Features</p>
                <p className="text-xs text-muted-foreground">
                  Access all pro tools
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Crown className="w-5 h-5 text-accent-500 mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Priority Support</p>
                <p className="text-xs text-muted-foreground">
                  Get help when you need it
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </Card>

      <PaywallModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.close}
        feature={feature}
        title={upgradeTitle || defaultTitle}
        description={upgradeDescription || defaultDescription}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

function getDefaultTitle(feature: string): string {
  const titles: Record<string, string> = {
    ai_meal_plan: 'Generate Unlimited Meal Plans',
    ai_workout_plan: 'Generate Unlimited Workout Plans',
    barcode_scanner: 'Unlock Barcode Scanner',
    social_features: 'Join Social Challenges',
    premium_themes: 'Unlock Premium Themes',
    advanced_analytics: 'Access Advanced Analytics',
  };

  return titles[feature] || `Unlock ${feature}`;
}

function getDefaultDescription(
  feature: string,
  tier: string,
  reason?: string
): string {
  if (reason?.includes('limit')) {
    return `You've reached your ${tier} tier limit. Upgrade for unlimited access!`;
  }

  const descriptions: Record<string, string> = {
    ai_meal_plan:
      'Get personalized meal plans tailored to your goals, diet preferences, and lifestyle.',
    ai_workout_plan:
      'Access workout programs designed specifically for your fitness level and equipment.',
    barcode_scanner:
      'Scan food barcodes to instantly log nutrition information.',
    social_features:
      'Connect with friends, join challenges, and share your progress.',
    premium_themes:
      'Customize your experience with exclusive themes and avatars.',
    advanced_analytics:
      'Track detailed insights about your nutrition, workouts, and progress.',
  };

  return (
    descriptions[feature] ||
    'Upgrade your plan to access this premium feature.'
  );
}

function getFeatureIcon(feature: string): ReactNode {
  const icons: Record<string, ReactNode> = {
    ai_meal_plan: <Sparkles className="w-10 h-10 text-white" />,
    ai_workout_plan: <Zap className="w-10 h-10 text-white" />,
    barcode_scanner: <Sparkles className="w-10 h-10 text-white" />,
    social_features: <Crown className="w-10 h-10 text-white" />,
    premium_themes: <Crown className="w-10 h-10 text-white" />,
    advanced_analytics: <Zap className="w-10 h-10 text-white" />,
  };

  return icons[feature] || <Lock className="w-10 h-10 text-white" />;
}
