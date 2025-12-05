/**
 * Paywall Modal
 * Feature gating modal shown when users hit subscription limits
 * Promotes upgrade with pricing comparison and benefits
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Check,
  Zap,
  Crown,
  TrendingUp,
  Calendar,
  Infinity
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/design-system';

export interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string; // e.g., "Plan Regeneration", "Advanced Features"
  currentTier: 'free' | 'pro' | 'premium';
  limitMessage?: string; // e.g., "You've used all your free regenerations this month"
  onUpgrade?: (tier: 'pro' | 'premium') => void;
}

const PRICING_TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    icon: Sparkles,
    color: 'from-gray-400 to-gray-600',
    features: [
      '1 initial plan generation',
      '1 manual regeneration/month',
      'Automatic tier unlock regenerations',
      'Basic personalization (0-40%)',
      'Standard tier personalization (40-70%)',
    ],
    limitations: [
      'Limited manual regenerations',
      'No premium features',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 39.99,
    period: 'year',
    icon: Zap,
    color: 'from-blue-500 to-cyan-500',
    popular: true,
    features: [
      'Unlimited plan regenerations',
      'Standard tier personalization',
      'Equipment-specific workouts',
      'Customized meal plans',
      'Priority support',
    ],
    highlight: 'Most Popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 79.99,
    period: 'year',
    icon: Crown,
    color: 'from-purple-500 via-pink-500 to-yellow-500',
    features: [
      'Everything in Pro',
      'Maximum personalization (70-100%)',
      'Health condition adaptations',
      'Lifestyle-optimized plans',
      'Family & schedule integration',
      'Advanced nutrition tracking',
      'Early access to new features',
    ],
    highlight: 'Best Value',
  },
];

export function PaywallModal({
  isOpen,
  onClose,
  featureName,
  currentTier,
  limitMessage,
  onUpgrade,
}: PaywallModalProps) {
  const [selectedTier, setSelectedTier] = useState<'pro' | 'premium'>('pro');

  const handleUpgrade = () => {
    onUpgrade?.(selectedTier);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl max-h-[90vh] overflow-y-auto"
          >
            <Card className="relative p-0">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="p-8 pb-6 text-center border-b border-border">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 mb-4"
                >
                  <TrendingUp className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {limitMessage || `Upgrade to access ${featureName}`}
                </h2>
                <p className="text-muted-foreground text-lg">
                  Choose a plan that fits your fitness journey
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PRICING_TIERS.map((tier, index) => {
                    const Icon = tier.icon;
                    const isCurrentTier = tier.id === currentTier;
                    const isSelected = tier.id === selectedTier;
                    const isSelectable = tier.id !== 'free' && !isCurrentTier;

                    return (
                      <motion.div
                        key={tier.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <button
                          onClick={() => isSelectable && setSelectedTier(tier.id as 'pro' | 'premium')}
                          disabled={!isSelectable}
                          className={cn(
                            'relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-300',
                            isCurrentTier && 'opacity-60 cursor-not-allowed',
                            !isCurrentTier && !isSelectable && 'cursor-default',
                            isSelected && isSelectable && 'border-primary-500 shadow-lg scale-105',
                            !isSelected && 'border-border hover:border-primary-300',
                            tier.popular && 'ring-2 ring-primary-500 ring-offset-2'
                          )}
                        >
                          {/* Popular Badge */}
                          {tier.highlight && (
                            <Badge className={cn(
                              'absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r text-white border-0',
                              tier.color
                            )}>
                              {tier.highlight}
                            </Badge>
                          )}

                          {/* Current Tier Badge */}
                          {isCurrentTier && (
                            <Badge variant="outline" className="absolute -top-3 right-4 bg-background">
                              Current Plan
                            </Badge>
                          )}

                          {/* Icon */}
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br mb-4',
                            tier.color
                          )}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Name & Price */}
                          <h3 className="text-2xl font-bold text-foreground mb-1">
                            {tier.name}
                          </h3>
                          <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-3xl font-bold text-foreground">
                              ${tier.price}
                            </span>
                            {tier.price > 0 && (
                              <span className="text-sm text-muted-foreground">
                                per {tier.period}
                              </span>
                            )}
                          </div>

                          {/* Features */}
                          <ul className="space-y-3 mb-6">
                            {tier.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                                <span className="text-foreground">{feature}</span>
                              </li>
                            ))}
                            {tier.limitations?.map((limitation) => (
                              <li key={limitation} className="flex items-start gap-2 text-sm">
                                <X className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <span className="text-muted-foreground">{limitation}</span>
                              </li>
                            ))}
                          </ul>

                          {/* Selection Indicator */}
                          {isSelected && isSelectable && (
                            <motion.div
                              layoutId="selected-tier"
                              className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-secondary-100/20 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl pointer-events-none"
                              transition={{ type: 'spring', duration: 0.5 }}
                            />
                          )}
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Benefits Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 border border-primary-200 dark:border-primary-800"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Infinity className="w-5 h-5 text-primary-600" />
                        Why Upgrade?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Get unlimited plan regenerations, advanced personalization, and access to all features.
                        Your investment in health pays for itself in saved gym memberships and meal planning time.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Billed annually</span>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 flex flex-col sm:flex-row gap-3 justify-end"
                >
                  <Button
                    onClick={onClose}
                    variant="outline"
                    size="lg"
                    className="sm:w-auto"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    onClick={handleUpgrade}
                    size="lg"
                    className={cn(
                      'bg-gradient-to-r text-white border-0',
                      PRICING_TIERS.find(t => t.id === selectedTier)?.color
                    )}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade to {selectedTier === 'pro' ? 'Pro' : 'Premium'}
                  </Button>
                </motion.div>

                {/* Money Back Guarantee */}
                <p className="text-center text-sm text-muted-foreground mt-4">
                  30-day money-back guarantee • Cancel anytime • Secure payment
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
