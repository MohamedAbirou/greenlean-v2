/**
 * Billing Tab - Subscription Management
 */

import { useAuth } from '@/features/auth';
import {
  openCustomerPortal,
  useSubscription
} from '@/services/stripe';
import { UpgradeModal, useUpgradeModal } from '@/shared/components/billing/UpgradeModal';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { Calendar, CheckCircle2, CreditCard, Crown, ExternalLink, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function BillingTab() {
  const { user } = useAuth();
  const { subscription, tier, isPro, isPremium, isLoading, plan } = useSubscription();
  const upgradeModal = useUpgradeModal();
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  const handleManageBilling = async () => {
    if (!user) return;

    setIsOpeningPortal(true);
    try {
      await openCustomerPortal(user.id);
    } catch (error: any) {
      console.error('Failed to open portal:', error);
      toast.error('Failed to open billing portal');
      setIsOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-500" />
        <p className="text-muted-foreground">Loading subscription...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Current Plan</h3>
            <p className="text-sm text-muted-foreground">
              Manage your subscription and billing
            </p>
          </div>
          {(isPro || isPremium) && (
            <Crown className="w-8 h-8 text-accent-500" />
          )}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-2xl font-bold">{plan?.name || 'Free'}</h4>
              <Badge
                variant={
                  tier === 'premium'
                    ? 'default'
                    : tier === 'pro'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {tier.toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">{plan?.description}</p>
          </div>
        </div>

        {subscription && subscription.status === 'active' && (
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Status</p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-500" />
                <span className="font-semibold text-success-600">Active</span>
              </div>
            </div>
            {subscription.current_period_end && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Renews on</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {subscription?.cancel_at_period_end && (
          <div className="p-4 bg-warning-50 dark:bg-warning-950 border border-warning-200 dark:border-warning-800 rounded-lg mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-warning-600 mt-0.5" />
              <div>
                <p className="font-semibold text-warning-900 dark:text-warning-100">
                  Subscription Canceling
                </p>
                <p className="text-sm text-warning-700 dark:text-warning-300">
                  Your subscription will end on{' '}
                  {subscription.current_period_end &&
                    format(new Date(subscription.current_period_end), 'MMM dd, yyyy')}
                  . You'll still have access until then.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {tier === 'free' ? (
            <Button onClick={upgradeModal.open} className="flex-1">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          ) : (
            <>
              <Button
                onClick={handleManageBilling}
                disabled={isOpeningPortal}
                variant="outline"
                className="flex-1"
              >
                {isOpeningPortal ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Opening...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Billing
                  </>
                )}
              </Button>
              {tier === 'pro' && (
                <Button onClick={upgradeModal.open} className="flex-1">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
            </>
          )}
        </div>
      </Card>

      {/* Plan Features */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Plan Features</h3>
        <div className="space-y-3">
          {plan?.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Usage & Limits */}
      {plan?.limits && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Usage & Limits</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">AI Generations</span>
                <span className="text-sm text-muted-foreground">
                  {plan.limits.aiGenerationsPerMonth === null
                    ? 'Unlimited'
                    : `${plan.limits.aiGenerationsPerMonth} per month`}
                </span>
              </div>
              {plan.limits.aiGenerationsPerMonth !== null && (
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 w-1/3" />
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Need Different Plan? */}
      {tier !== 'free' && (
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Need a different plan?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            You can upgrade, downgrade, or cancel your subscription at any time through the
            billing portal.
          </p>
          <Button variant="outline" size="sm" onClick={handleManageBilling}>
            View All Options
          </Button>
        </Card>
      )}

      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.close}
      />
    </div>
  );
}
