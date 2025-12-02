/**
 * CouponManager Component
 * Display and manage user's discount coupons
 * Auto-generated from reward redemptions
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { differenceInDays, format, isPast } from 'date-fns';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Clock, Copy, Sparkles, Ticket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'amount' | 'free_month';
  discount_value: string;
  reward_name: string;
  used: boolean;
  used_at?: string;
  expires_at?: string;
  created_at: string;
}

export function CouponManager() {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadCoupons();
    }
  }, [user]);

  const loadCoupons = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupon_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCoupons((data as Coupon[]) || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success('Coupon code copied! 🎟️');

      setTimeout(() => {
        setCopiedCode(null);
      }, 2000);
    } catch (error) {
      console.error('Error copying code:', error);
      toast.error('Failed to copy code');
    }
  };

  const getDiscountLabel = (coupon: Coupon): string => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% Off`;
    } else if (coupon.discount_type === 'free_month') {
      return `1 Month Free ${coupon.discount_value.toUpperCase()}`;
    } else {
      return `$${coupon.discount_value} Off`;
    }
  };

  const isExpired = (expiresAt?: string): boolean => {
    if (!expiresAt) return false;
    return isPast(new Date(expiresAt));
  };

  const getDaysUntilExpiry = (expiresAt?: string): number | null => {
    if (!expiresAt) return null;
    return differenceInDays(new Date(expiresAt), new Date());
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading coupons...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Ticket className="w-5 h-5 text-primary-600" />
          My Coupons
        </h3>
        <p className="text-sm text-muted-foreground">
          Discount codes earned from rewards. Use them on your next subscription payment.
        </p>
      </div>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <Card className="p-12 text-center">
          <Ticket className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">No Coupons Yet</h3>
          <p className="text-sm text-muted-foreground">
            Redeem discount rewards from the Rewards Store to get coupon codes!
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {coupons.map((coupon, index) => {
            const expired = isExpired(coupon.expires_at);
            const daysLeft = getDaysUntilExpiry(coupon.expires_at);
            const isUsed = coupon.used;
            const isCopied = copiedCode === coupon.code;

            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`p-5 ${
                    isUsed || expired ? 'opacity-60 bg-gray-50 dark:bg-gray-900' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Coupon Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg">{coupon.reward_name}</h4>
                        <Badge variant={isUsed || expired ? 'outline' : 'default'}>
                          {getDiscountLabel(coupon)}
                        </Badge>
                      </div>

                      {/* Coupon Code */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 font-mono text-2xl font-bold tracking-wider text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg border-2 border-dashed border-primary">
                          {coupon.code}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCode(coupon.code)}
                          disabled={isUsed || expired}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 mr-1 text-success" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Status & Expiry */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {isUsed ? (
                          <div className="flex items-center gap-1text-muted-foreground">
                            <Check className="w-4 h-4" />
                            <span>
                              Used on {format(new Date(coupon.used_at!), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ) : expired ? (
                          <div className="flex items-center gap-1 text-error">
                            <AlertCircle className="w-4 h-4" />
                            <span>
                              Expired on {format(new Date(coupon.expires_at!), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ) : coupon.expires_at ? (
                          <div
                            className={`flex items-center gap-1 ${
                              daysLeft !== null && daysLeft <= 7
                                ? 'text-warning'
                                : 'text-muted-foreground'
                            }`}
                          >
                            <Clock className="w-4 h-4" />
                            <span>
                              {daysLeft !== null && daysLeft <= 7
                                ? `Expires in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}!`
                                : `Valid until ${format(new Date(coupon.expires_at), 'MMM d, yyyy')}`}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-success">
                            <Sparkles className="w-4 h-4" />
                            <span>No expiration</span>
                          </div>
                        )}

                        <span className="text-gray-400">•</span>

                        <span className="text-gray-500">
                          Earned {format(new Date(coupon.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>

                    {/* Right: Status Badge */}
                    <div>
                      {isUsed ? (
                        <Badge variant="outline" className="bg-muted">
                          Used
                        </Badge>
                      ) : expired ? (
                        <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-error border-error">
                          Expired
                        </Badge>
                      ) : (
                        <Badge className="bg-success text-white">Active</Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ticket className="w-4 h-4" />
            <span>{coupons.length} total coupons</span>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-success">
              {coupons.filter((c) => !c.used && !isExpired(c.expires_at)).length} active
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{coupons.filter((c) => c.used).length} used</span>
            <span className="text-gray-400">•</span>
            <span className="text-error">
              {coupons.filter((c) => !c.used && isExpired(c.expires_at)).length} expired
            </span>
          </div>
        </div>
      </Card>

      {/* Usage Instructions */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              How to use your coupons:
            </p>
            <ol className="text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Copy the coupon code using the "Copy" button</li>
              <li>Go to the Subscription tab in your profile settings</li>
              <li>When upgrading or renewing, paste the code in the coupon field</li>
              <li>Your discount will be applied automatically!</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
