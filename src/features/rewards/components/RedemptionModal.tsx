/**
 * RedemptionModal Component
 * Confirmation modal for reward redemption
 */

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { AlertCircle, Sparkles } from 'lucide-react';
import type { Reward } from '../types/rewards.types';

interface RedemptionModalProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userPoints: number;
  isRedeeming: boolean;
}

export function RedemptionModal({
  reward,
  isOpen,
  onClose,
  onConfirm,
  userPoints,
  isRedeeming,
}: RedemptionModalProps) {
  if (!reward) return null;

  const canAfford = userPoints >= reward.points_cost;
  const pointsAfterRedemption = userPoints - reward.points_cost;
  const pointsNeeded = reward.points_cost - userPoints;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-2xl">
              {reward.image_url || '🎁'}
            </div>
            <div className="flex-1">
              <DialogTitle>{reward.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {reward.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Points Breakdown */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your current points:</span>
              <span className="font-semibold">{userPoints}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cost:</span>
              <span className="font-semibold text-primary-600">-{reward.points_cost}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold">After redemption:</span>
              <span className={`font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                {canAfford ? pointsAfterRedemption : `Need ${pointsNeeded} more`}
              </span>
            </div>
          </div>

          {/* Warning if low on points */}
          {canAfford && pointsAfterRedemption < 50 && (
            <div className="flex gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You'll have very few points left after this redemption. Make sure this is what you want!
              </p>
            </div>
          )}

          {/* Success message */}
          {canAfford && (
            <div className="flex gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 dark:text-green-200">
                You'll receive this reward immediately after confirmation!
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isRedeeming}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canAfford || isRedeeming}
            className="min-w-[120px]"
          >
            {isRedeeming ? 'Redeeming...' : 'Confirm Redemption'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
