/**
 * AvatarFrameSelector Component
 * Select and apply avatar frames
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Lock, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { AVATAR_FRAMES, getFrameById } from '../constants/avatarFrames';
import { FramedAvatar } from './FramedAvatar';
import type { AvatarFrame } from '../constants/avatarFrames';

interface AvatarFrameSelectorProps {
  currentFrameId?: string;
  avatarSrc?: string;
  onFrameChange?: (frameId: string) => void;
}

export function AvatarFrameSelector({
  currentFrameId = 'default',
  avatarSrc,
  onFrameChange,
}: AvatarFrameSelectorProps) {
  const { user } = useAuth();
  const [selectedFrame, setSelectedFrame] = useState(currentFrameId);
  const [isApplying, setIsApplying] = useState(false);

  // TODO: Fetch unlocked frames from database
  // For now, assume all are unlocked for demo
  const unlockedFrameIds = ['default', 'gold_elite', 'diamond_pro']; // Placeholder

  const handleFrameSelect = async (frame: AvatarFrame) => {
    if (frame.isUnlockable && !unlockedFrameIds.includes(frame.id)) {
      toast.error('This frame is locked! Unlock it from the Rewards Catalog.');
      return;
    }

    setSelectedFrame(frame.id);

    // Apply frame
    setIsApplying(true);
    try {
      if (user) {
        await supabase
          .from('profiles')
          .update({ avatar_frame: frame.id })
          .eq('id', user.id);
      }

      onFrameChange?.(frame.id);
      toast.success(`${frame.name} frame applied! ✨`);
    } catch (error) {
      console.error('Failed to apply frame:', error);
      toast.error('Failed to apply frame');
    } finally {
      setIsApplying(false);
    }
  };

  const isFrameUnlocked = (frameId: string) => {
    const frame = getFrameById(frameId);
    if (!frame?.isUnlockable) return true;
    return unlockedFrameIds.includes(frameId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary-600" />
          Avatar Frames
        </h3>
        <p className="text-muted-foreground mt-1">
          Customize your avatar with unlockable frames
        </p>
      </div>

      {/* Preview */}
      <div className="flex justify-center p-8 bg-muted/30 rounded-lg">
        <FramedAvatar
          src={avatarSrc}
          frameId={selectedFrame}
          size="xl"
        />
      </div>

      {/* Frame Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {AVATAR_FRAMES.map((frame, index) => {
          const isActive = selectedFrame === frame.id;
          const isUnlocked = isFrameUnlocked(frame.id);

          return (
            <motion.button
              key={frame.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleFrameSelect(frame)}
              disabled={!isUnlocked || isApplying}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${isActive
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-950'
                  : 'border-border hover:border-primary-300 bg-card'
                }
                ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isUnlocked && !isApplying ? 'hover:scale-105' : ''}
              `}
            >
              {/* Frame Preview */}
              <div className="flex justify-center mb-3">
                <FramedAvatar
                  frameId={frame.id}
                  size="md"
                />
              </div>

              {/* Frame Name */}
              <div className="text-center">
                <h4 className="font-semibold text-sm mb-1">{frame.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {frame.description}
                </p>
              </div>

              {/* Lock Overlay */}
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              )}

              {/* Active Indicator */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Apply Button */}
      {selectedFrame !== currentFrameId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={() => handleFrameSelect(getFrameById(selectedFrame)!)}
            disabled={isApplying}
            className="w-full"
            size="lg"
          >
            {isApplying ? 'Applying...' : 'Apply Frame'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
