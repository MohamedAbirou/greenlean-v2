/**
 * Pricing Page - Subscription Tier Comparison
 * Displays all subscription plans with features and pricing
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, ArrowRight, Sparkles } from 'lucide-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { useAuth } from '@/features/auth';
import { useSubscription } from '@/services/stripe';
import { stripeService } from '@/services/stripe/stripeService';
import { PRICING_PLANS, formatPrice, calculateSavings } from '@/services/stripe/config';
import { toast } from 'sonner';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier: currentTier, isLoading: subscriptionLoading } = useSubscription();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSelectPlan = async (tier: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (tier === 'free') {
      toast.info('You are already on the free plan');
      return;
    }

    if (tier === currentTier) {
      toast.info('You are already subscribed to this plan');
      return;
    }

    setLoadingTier(tier);
    try {
      await stripeService.createCheckoutSession(
        user.id,
        tier as 'pro' | 'premium',
        isYearly ? 'yearly' : 'monthly'
      );
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process');
    } finally {
      setLoadingTier(null);
    }
  };

  const getButtonText = (tier: string) => {
    if (!user) return 'Get Started';
    if (tier === currentTier) return 'Current Plan';
    if (tier === 'free') return 'Downgrade';
    return 'Upgrade Now';
  };

  const getButtonVariant = (tier: string) => {
    if (tier === currentTier) return 'outline' as const;
    if (tier === 'free') return 'outline' as const;
    return 'default' as const;
  };

  const getTierIcon = (tier: string) => {
    if (tier === 'premium') return Crown;
    if (tier === 'pro') return Zap;
    return Sparkles;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Fitness Journey
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get personalized meal plans and workout routines powered by AI. No commitments, cancel
            anytime.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Label htmlFor="billing-toggle" className={!isYearly ? 'font-semibold' : ''}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="billing-toggle" className={isYearly ? 'font-semibold' : ''}>
              Yearly
            </Label>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            All paid plans include a 7-day free trial
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PRICING_PLANS.map((plan, index) => {
            const Icon = getTierIcon(plan.tier);
            const price = isYearly ? plan.price.yearly : plan.price.monthly;
            const isCurrentPlan = plan.tier === currentTier;
            const savings =
              isYearly && plan.price.monthly > 0
                ? calculateSavings(plan.price.monthly, plan.price.yearly)
                : 0;

            return (
              <motion.div
                key={plan.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="relative"
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary text-primary-foreground">
                      {plan.badge}
                    </Badge>
                  </div>
                )}

                <Card
                  className={`p-8 h-full flex flex-col ${
                    plan.popular
                      ? 'border-primary border-2 shadow-lg scale-105'
                      : 'border-border'
                  } ${isCurrentPlan ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {/* Tier Icon & Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        plan.tier === 'premium'
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-600'
                          : plan.tier === 'pro'
                          ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          : 'bg-gray-500'
                      }`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      {isCurrentPlan && (
                        <Badge variant="outline" className="text-xs">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6">{plan.description}</p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{formatPrice(price)}</span>
                      {price > 0 && (
                        <span className="text-muted-foreground">
                          /{isYearly ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {isYearly && price > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatPrice(Math.floor(price / 12))}/month billed annually (save {savings}
                        %)
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.tier)}
                    variant={getButtonVariant(plan.tier)}
                    disabled={
                      loadingTier === plan.tier ||
                      subscriptionLoading ||
                      (isCurrentPlan && plan.tier !== 'free')
                    }
                    className="w-full mb-6"
                    size="lg"
                  >
                    {loadingTier === plan.tier ? (
                      'Processing...'
                    ) : (
                      <>
                        {getButtonText(plan.tier)}
                        {!isCurrentPlan && plan.tier !== 'free' && (
                          <ArrowRight className="w-4 h-4 ml-2" />
                        )}
                      </>
                    )}
                  </Button>

                  {/* Features List */}
                  <div className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected
                in your next billing cycle.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">What happens when I cancel?</h3>
              <p className="text-sm text-muted-foreground">
                You'll retain access to your paid features until the end of your current billing
                period. After that, you'll be moved to the free plan.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied,
                contact us within 7 days for a full refund.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">How does the AI generation work?</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your profile data (goals, preferences, restrictions) to create
                personalized meal and workout plans. The more complete your profile, the better the
                personalization!
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-2">Is my payment information secure?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! We use Stripe for payment processing, which is PCI-DSS compliant and
                trusted by millions of businesses worldwide. We never store your card details on our
                servers.
              </p>
            </Card>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <Card className="p-8 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-950 dark:to-primary-900">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-muted-foreground mb-6">
              Our team is here to help you choose the right plan for your fitness goals.
            </p>
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Contact Support
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
