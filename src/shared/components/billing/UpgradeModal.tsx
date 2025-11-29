/**
 * UpgradeModal Component
 * Modal for upgrading subscription with pricing comparison
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Crown, Zap, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { useSubscription, PRICING_PLANS, formatPrice, calculateSavings, startCheckoutFlow } from '@/services/stripe';
import type { SubscriptionTier } from '@/services/stripe';
import { cn } from '@/lib/utils';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  title?: string;
  description?: string;
  defaultBillingCycle?: 'monthly' | 'yearly';
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  title = 'Upgrade Your Plan',
  description = 'Choose the perfect plan for your fitness journey',
  defaultBillingCycle = 'monthly',
}: UpgradeModalProps) {
  const { user } = useAuth();
  const { tier: currentTier } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(defaultBillingCycle);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleUpgrade = async (tier: SubscriptionTier, priceId: string) => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      return;
    }

    if (tier === currentTier) {
      toast.info('You already have this plan');
      return;
    }

    setIsLoading(tier);

    try {
      await startCheckoutFlow(user.id, priceId, tier);
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setIsLoading(null);
    }
  };

  const plans = PRICING_PLANS.filter((p) => p.tier !== 'free'); // Only show paid plans

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
              <DialogDescription className="mt-2">{description}</DialogDescription>
            </div>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 flex justify-center">
            <Tabs value={billingCycle} onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly
                  <Badge variant="success" className="ml-2">
                    Save {calculateSavings(plans[0].price.monthly, plans[0].price.yearly)}%
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </DialogHeader>

        {/* Pricing Cards */}
        <div className="p-6 grid md:grid-cols-2 gap-6">
          {plans.map((plan, index) => {
            const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly;
            const priceId = billingCycle === 'monthly' ? plan.stripePriceIds.monthly : plan.stripePriceIds.yearly;
            const isCurrentPlan = plan.tier === currentTier;
            const isPopular = plan.popular;
            const monthlyEquivalent = billingCycle === 'yearly' ? price / 12 : price;

            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-accent-600 to-accent-500 px-4 py-1">
                      <Zap className="w-3 h-3 mr-1" />
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <Card
                  className={cn(
                    'relative overflow-hidden transition-all hover:shadow-xl',
                    isPopular && 'border-2 border-accent-500',
                    isCurrentPlan && 'opacity-75'
                  )}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-950 dark:to-secondary-950 opacity-50" />

                  <div className="relative p-6">
                    {/* Plan Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      {plan.tier === 'premium' && <Crown className="w-6 h-6 text-accent-500" />}
                    </div>

                    <p className="text-muted-foreground mb-6">{plan.description}</p>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{formatPrice(monthlyEquivalent)}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      {billingCycle === 'yearly' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Billed annually at {formatPrice(price)}
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <Button
                      className="w-full mb-6"
                      size="lg"
                      disabled={isCurrentPlan || isLoading === plan.tier}
                      onClick={() => handleUpgrade(plan.tier, priceId)}
                      variant={isPopular ? 'default' : 'outline'}
                    >
                      {isLoading === plan.tier ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>

                    {/* Features List */}
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        What's Included
                      </p>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 border-t bg-muted/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-4 h-4 text-success-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-4 h-4 text-success-500" />
              <span>Secure payment with Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Check className="w-4 h-4 text-success-500" />
              <span>7-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simple hook to trigger upgrade modal
 */
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
