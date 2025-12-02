/**
 * AvatarCustomizer Component
 * Allows users to customize their avatar with unlocked frames
 * Integrates with rewards system for frame unlocks
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { motion } from 'framer-motion';
import { Check, Crown, Frame, Lock, Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  borderColor: string;
  borderWidth: string;
  borderStyle: string;
  shadowColor: string;
  glowEffect?: string;
  isLocked: boolean;
  rewardValue?: string; // Matches reward.value from rewards_catalog
  preview: string; // CSS for preview
}

export const AVATAR_FRAMES: Record<string, AvatarFrame> = {
  default: {
    id: 'default',
    name: 'Default',
    description: 'Classic simple border',
    borderColor: '#e5e7eb', // gray-200
    borderWidth: '2px',
    borderStyle: 'solid',
    shadowColor: 'rgba(0,0,0,0.1)',
    isLocked: false,
    preview: 'border-2 border-gray-200 shadow-sm',
  },
  gold_elite: {
    id: 'gold_elite',
    name: 'Gold Elite',
    description: 'Luxurious gold frame for champions',
    borderColor: '#fbbf24', // amber-400
    borderWidth: '4px',
    borderStyle: 'solid',
    shadowColor: '#eab308',
    glowEffect: '0 0 20px rgba(251, 191, 36, 0.6)',
    isLocked: true,
    rewardValue: 'avatar_frames',
    preview: 'border-4 border-amber-400 shadow-lg shadow-yellow-500/50',
  },
  diamond_pro: {
    id: 'diamond_pro',
    name: 'Diamond Pro',
    description: 'Sparkling diamond frame',
    borderColor: '#60a5fa', // blue-400
    borderWidth: '4px',
    borderStyle: 'double',
    shadowColor: '#3b82f6',
    glowEffect: '0 0 20px rgba(96, 165, 250, 0.6)',
    isLocked: true,
    rewardValue: 'avatar_frames',
    preview: 'border-4 border-blue-400 shadow-lg shadow-blue-500/50 border-double',
  },
  emerald_legend: {
    id: 'emerald_legend',
    name: 'Emerald Legend',
    description: 'Legendary emerald frame',
    borderColor: '#10b981', // emerald-500
    borderWidth: '4px',
    borderStyle: 'solid',
    shadowColor: '#059669',
    glowEffect: '0 0 20px rgba(16, 185, 129, 0.6)',
    isLocked: true,
    rewardValue: 'avatar_frames',
    preview: 'border-4 border-emerald-500 shadow-lg shadow-emerald-500/50',
  },
  rainbow_master: {
    id: 'rainbow_master',
    name: 'Rainbow Master',
    description: 'Ultimate rainbow animated frame',
    borderColor: 'transparent',
    borderWidth: '4px',
    borderStyle: 'solid',
    shadowColor: 'transparent',
    glowEffect: '0 0 30px rgba(147, 51, 234, 0.8)',
    isLocked: true,
    rewardValue: 'avatar_frames',
    preview: 'border-4 border-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-padding shadow-2xl shadow-purple-500/50',
  },
};

export function AvatarCustomizer() {
  const { user, profile } = useAuth();
  const [activeFrame, setActiveFrame] = useState('default');
  const [unlockedFrames, setUnlockedFrames] = useState<string[]>(['default']);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserFrameSettings();
    }
  }, [user]);

  const loadUserFrameSettings = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Load current avatar frame from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_frame')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      if (profileData?.avatar_frame) {
        setActiveFrame(profileData.avatar_frame);
      }

      // Load unlocked frame rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from('user_redeemed_rewards')
        .select('reward_value')
        .eq('user_id', user.id)
        .eq('type', 'feature')
        .eq('reward_value', 'avatar_frames');

      if (rewardsError && rewardsError.code !== 'PGRST116') throw rewardsError;

      // If user has redeemed avatar_frames reward, unlock all premium frames
      if (rewardsData && rewardsData.length > 0) {
        const allFrameIds = Object.keys(AVATAR_FRAMES);
        setUnlockedFrames(allFrameIds);
      }
    } catch (error) {
      console.error('Error loading avatar settings:', error);
      toast.error('Failed to load avatar settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFrameSelect = async (frameId: string) => {
    if (!user) return;

    const frame = AVATAR_FRAMES[frameId];
    if (!frame) return;

    // Check if frame is locked
    if (frame.isLocked && !unlockedFrames.includes(frameId)) {
      toast.error('This frame is locked! Redeem "Custom Avatar Frames" from the Rewards Store.');
      return;
    }

    setIsSaving(true);
    try {
      // Update profile with new avatar frame
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_frame: frameId })
        .eq('id', user.id);

      if (error) throw error;

      setActiveFrame(frameId);
      toast.success(`Avatar frame changed to ${frame.name}! 🎨`);
    } catch (error) {
      console.error('Error updating avatar frame:', error);
      toast.error('Failed to update avatar frame');
    } finally {
      setIsSaving(false);
    }
  };

  const isFrameLocked = (frameId: string): boolean => {
    const frame = AVATAR_FRAMES[frameId];
    return frame.isLocked && !unlockedFrames.includes(frameId);
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading avatar settings...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
          <Frame className="w-5 h-5 text-primary-600" />
          Avatar Frames
        </h3>
        <p className="text-sm text-muted-foreground">
          Customize your profile with exclusive avatar frames
        </p>
      </div>

      {/* Current Avatar Preview */}
      <Card className="p-6 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              className={`w-24 h-24 ${AVATAR_FRAMES[activeFrame]?.preview}`}
              style={{
                boxShadow: AVATAR_FRAMES[activeFrame]?.glowEffect || AVATAR_FRAMES[activeFrame]?.shadowColor
                  ? `0 4px 6px ${AVATAR_FRAMES[activeFrame]?.shadowColor}, ${AVATAR_FRAMES[activeFrame]?.glowEffect || ''}`
                  : undefined,
              }}
            >
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'User'} />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Currently Active</p>
            <p className="font-bold text-lg">{AVATAR_FRAMES[activeFrame]?.name}</p>
            <p className="text-sm text-muted-foreground">{AVATAR_FRAMES[activeFrame]?.description}</p>
          </div>
        </div>
      </Card>

      {/* Frame Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.values(AVATAR_FRAMES).map((frame, index) => {
          const isLocked = isFrameLocked(frame.id);
          const isActive = activeFrame === frame.id;

          return (
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative p-4 cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-primary-500 shadow-lg' : ''
                } ${isLocked ? 'opacity-60' : ''}`}
                onClick={() => !isLocked && !isSaving && handleFrameSelect(frame.id)}
              >
                {/* Preview Avatar */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <Avatar
                      className={`w-20 h-20 ${frame.preview}`}
                      style={{
                        boxShadow: frame.glowEffect || frame.shadowColor
                          ? `0 4px 6px ${frame.shadowColor}, ${frame.glowEffect || ''}`
                          : undefined,
                      }}
                    >
                      <AvatarImage src={profile?.avatar_url || ''} alt="Preview" />
                      <AvatarFallback>
                        <User className="w-10 h-10" />
                      </AvatarFallback>
                    </Avatar>

                    {isLocked && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                    )}

                    {isActive && !isLocked && (
                      <div className="absolute -bottom-1 -right-1 bg-success text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Frame Info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{frame.name}</h4>
                    {frame.id !== 'default' && (
                      <Badge variant={isLocked ? 'outline' : 'default'} className="text-xs">
                        {isLocked ? 'Locked' : 'Unlocked'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {frame.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Unlock Info */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>
              {unlockedFrames.length} / {Object.keys(AVATAR_FRAMES).length} frames unlocked
            </span>
          </div>
          {unlockedFrames.length === 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Crown className="w-3 h-3" />
              <span>Redeem "Custom Avatar Frames" reward to unlock all frames</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
