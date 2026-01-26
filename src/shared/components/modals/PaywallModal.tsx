/**
 * Paywall Modal
 * Feature gating modal shown when users hit subscription limits
 * Promotes upgrade with pricing comparison and benefits
 */

import { useAuth } from "@/features/auth";
import type { SubscriptionTier } from "@/features/rewards";
import { cn } from '@/lib/utils';
import {
  calculateSavings,
  formatPrice,
  startCheckoutFlow,
  useSubscription,
} from "@/services/stripe";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Check,
  Crown,
  Infinity as InfinityIcon,
  Loader2,
  Sparkles,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string; // e.g., "Plan Regeneration", "Advanced Features"
  title?: string;
  description?: string;
  defaultBillingCycle?: "monthly" | "yearly";
}

const PRICING_TIERS = [
  {
    tier: "free",
    name: "Free",
    price: {
      monthly: 0,
      yearly: 0,
    },
    stripePriceIds: {
      monthly: "", // No Stripe price for free tier
      yearly: "",
    },
    icon: Sparkles,
    color: "from-gray-400 to-gray-600",
    features: [
      "1 initial plan generation",
      "1 manual regeneration/month",
      "Automatic tier unlock regenerations",
      "Basic personalization (0-40%)",
      "Standard tier personalization (40-70%)",
    ],
    limitations: ["Limited manual regenerations", "No premium features"],
  },
  {
    tier: "pro",
    name: "Pro",
    price: {
      monthly: 999, // $9.99
      yearly: 9990, // $99.90 (save 17%)
    },
    stripePriceIds: {
      monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || "",
      yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID || "",
    },
    icon: Zap,
    color: "from-blue-500 to-cyan-500",
    popular: true,
    features: [
      "Unlimited plan regenerations",
      "Standard tier personalization",
      "Equipment-specific workouts",
      "Customized meal plans",
      "Priority support",
    ],
    highlight: "Most Popular",
  },
  {
    tier: "premium",
    name: "Premium",
    price: {
      monthly: 1999, // $19.99
      yearly: 19990, // $199.90 (save 17%)
    },
    stripePriceIds: {
      monthly: import.meta.env.VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID || "",
      yearly: import.meta.env.VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID || "",
    },
    icon: Crown,
    color: "from-purple-500 via-pink-500 to-yellow-500",
    features: [
      "Everything in Pro",
      "Maximum personalization (70-100%)",
      "Health condition adaptations",
      "Lifestyle-optimized plans",
      "Family & schedule integration",
      "Advanced nutrition tracking",
      "Early access to new features",
    ],
    highlight: "Best Value",
  },
];

export function PaywallModal({
  isOpen,
  onClose,
  feature,
  title = "Upgrade Your Plan",
  description = "Choose the perfect plan for your fitness journey",
  defaultBillingCycle = "monthly",
}: PaywallModalProps) {
  const { user } = useAuth();
  const { tier: currentTier } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(defaultBillingCycle);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<"free" | "pro" | "premium">("pro");

  const handleUpgrade = async (tier: SubscriptionTier, priceId: string) => {
    if (!user) {
      toast.error("Please sign in to upgrade");
      return;
    }

    if (tier === currentTier) {
      toast.info("You already have this plan");
      return;
    }

    setIsLoading(tier);

    try {
      await startCheckoutFlow(user.id, priceId, tier);
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error(error.message || "Failed to start checkout");
      setIsLoading(null);
    }
  };

  let isCurrentTier;
  let priceId: any;

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
            transition={{ type: "spring", duration: 0.5 }}
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
                  transition={{ delay: 0.2, type: "spring", duration: 0.8 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 mb-4"
                >
                  <TrendingUp className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
                <p className="text-muted-foreground text-lg">
                  {description || `Upgrade your plan to unlock ${feature} feature.`}
                </p>
              </div>

              {/* Billing Cycle Toggle */}
              <div className="my-6 flex justify-center">
                <Tabs
                  value={billingCycle}
                  onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}
                >
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="monthly" className="data-[state=active]:text-foreground">
                      Monthly
                    </TabsTrigger>
                    <TabsTrigger value="yearly" className="data-[state=active]:text-foreground">
                      Yearly
                      <Badge variant="success" className="ml-2">
                        Save{" "}
                        {calculateSavings(
                          PRICING_TIERS[2].price.monthly,
                          PRICING_TIERS[2].price.yearly
                        )}
                        %
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Pricing Cards */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {PRICING_TIERS.map((tier, index) => {
                    const Icon = tier.icon;
                    isCurrentTier = tier.tier === currentTier;
                    const isSelected = tier.tier === selectedTier;
                    const isSelectable = !isCurrentTier;

                    const price =
                      billingCycle === "monthly" ? tier.price.monthly : tier.price.yearly;
                    priceId = billingCycle === "monthly" ? "monthly" : "yearly";
                    const monthlyEquivalent = billingCycle === "yearly" ? price / 12 : price;

                    return (
                      <motion.div
                        key={tier.tier}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <button
                          onClick={() =>
                            isSelectable && setSelectedTier(tier.tier as "pro" | "premium")
                          }
                          disabled={!isSelectable}
                          className={cn(
                            "relative w-full p-6 rounded-2xl border-2 text-left transition-all duration-300",
                            isCurrentTier && "opacity-60 cursor-not-allowed",
                            !isCurrentTier && !isSelectable && "cursor-default",
                            isSelected && isSelectable && "border-primary-500 shadow-lg scale-105",
                            !isSelected && "border-border hover:border-primary-300",
                            tier.popular && "ring-2 ring-primary-500 ring-offset-2"
                          )}
                        >
                          {/* Popular Badge */}
                          {tier.highlight && (
                            <Badge
                              className={cn(
                                "absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r text-white border-0 z-50",
                                tier.color
                              )}
                            >
                              {tier.highlight}
                            </Badge>
                          )}

                          {/* Current Tier Badge */}
                          {isCurrentTier && (
                            <Badge
                              variant="outline"
                              className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-background"
                            >
                              Current Plan
                            </Badge>
                          )}

                          {/* Icon */}
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br mb-4",
                              tier.color
                            )}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>

                          {/* Name & Price */}
                          <h3 className="text-2xl font-bold text-foreground mb-1">{tier.name}</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">
                              {formatPrice(monthlyEquivalent)}
                            </span>
                            <span className="text-muted-foreground">/month</span>
                          </div>
                          {billingCycle === "yearly" && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Billed annually at {formatPrice(price)}
                            </p>
                          )}

                          {/* Features */}
                          <ul className="space-y-3 my-6">
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
                              className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-2xl pointer-events-none"
                              transition={{ type: "spring", duration: 0.5 }}
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
                  className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary-500/50 to-secondary-500/50 border border-primary-500"
                >
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                        <InfinityIcon className="w-5 h-5 text-primary-600" />
                        Why Upgrade?
                      </h4>
                      <p className="text-sm text-foreground">
                        Get unlimited plan regenerations, advanced personalization, and access to
                        all features. Your investment in health pays for itself in saved gym
                        memberships and meal planning time.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-foreground">
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
                  <Button onClick={onClose} variant="outline" size="lg" className="sm:w-auto">
                    Maybe Later
                  </Button>
                  <Button
                    disabled={isCurrentTier || isLoading === selectedTier}
                    onClick={() => handleUpgrade(selectedTier, priceId)}
                    size="lg"
                    className={cn(
                      "bg-gradient-to-r text-white border-0",
                      PRICING_TIERS.find((t) => t.tier === selectedTier)?.color
                    )}
                  >
                    {isLoading === selectedTier ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : selectedTier === "free" ? (
                      `Downgrade to ${selectedTier}`
                    ) : isCurrentTier ? (
                      "Current Plan"
                    ) : (
                      `Upgrade to ${selectedTier}`
                    )}
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
