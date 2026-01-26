/**
 * AvatarCustomizer Component - FIXED
 * Uses actual redemptions from database to unlock frames
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { UserAvatar } from '@/shared/components/ui/UserAvatar';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, Crown, Frame, Lock, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AVATAR_FRAMES } from '../constants/avatarFrames';

async function fetchRedeemedAvatarValues(userId: string) {
  const { data, error } = await supabase
    .from('user_redeemed_rewards')
    .select('reward_value')
    .eq('user_id', userId)
    .eq('type', 'avatar');

  if (error) throw error;
  return data?.map((row) => row.reward_value) ?? [];
}


export function AvatarCustomizer() {
  const { user, profile } = useAuth();
  const [activeFrame, setActiveFrame] = useState('default');
  const [unlockedFrames, setUnlockedFrames] = useState<string[]>(['default']);
  const [isSaving, setIsSaving] = useState(false);

  const { data: redeemedValues = [], isLoading: isFetching } = useQuery({
    queryKey: ['redeemed-avatars', user?.id],
    queryFn: () => fetchRedeemedAvatarValues(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_frame')
          .eq('id', user.id)
          .single();

        if (profileData?.avatar_frame) {
          setActiveFrame(profileData.avatar_frame);
        }

        const unlocked = ['default'];
        AVATAR_FRAMES.forEach((frame) => {
          if (
            frame.rewardValue &&
            (redeemedValues.includes(frame.rewardValue) || redeemedValues.includes('avatar_frames'))
          ) {
            unlocked.push(frame.id);
          }
        });
        setUnlockedFrames(unlocked);
      } catch (err) {
        console.error('Error loading avatar settings:', err);
        toast.error('Failed to load avatar settings');
      }
    };

    loadSettings();
  }, [user, redeemedValues]);

  const handleFrameSelect = async (frameId: string) => {
    if (!user) return;

    const frame = AVATAR_FRAMES.find((f) => f.id === frameId);
    if (!frame) return;

    if (frame.isUnlockable && !unlockedFrames.includes(frameId)) {
      toast.error('This frame is locked! Redeem "Avatar Frames" from the Rewards Store.');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_frame: frameId })
        .eq('id', user.id);

      if (error) throw error;

      setActiveFrame(frameId);
      toast.success(`Avatar frame changed to ${frame.name}! 🎨`);
    } catch (err) {
      console.error('Error updating avatar frame:', err);
      toast.error('Failed to update avatar frame');
    } finally {
      setIsSaving(false);
    }
  };

  const isFrameLocked = (id: string) => {
    const frame = AVATAR_FRAMES.find((f) => f.id === id);
    return frame?.isUnlockable && !unlockedFrames.includes(id);
  };

  if (isFetching) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
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
      <Card className="p-6 bg-gradient-to-r from-gray-500/50 to-secondary-500/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar
              src={profile?.avatar_url}
              frameId={activeFrame}
              size="xl"
              showFrame={true}
            />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Currently Active</p>
            <p className="font-bold text-lg">
              {AVATAR_FRAMES.find((f) => f.id === activeFrame)?.name || 'Default'}
            </p>
            <p className="text-sm text-muted-foreground">
              {AVATAR_FRAMES.find((f) => f.id === activeFrame)?.description}
            </p>
          </div>
        </div>
      </Card>

      {/* Frame Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {AVATAR_FRAMES.map((frame, index) => {
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
                className={`relative p-4 cursor-pointer transition-all hover:shadow-md ${isActive ? 'ring-2 ring-primary-500 shadow-lg' : ''
                  } ${isLocked ? 'opacity-60' : ''}`}
                onClick={() => !isLocked && !isSaving && handleFrameSelect(frame.id)}
              >
                {/* Preview Avatar */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <UserAvatar
                      src={profile?.avatar_url}
                      frameId={frame.id}
                      size="lg"
                      showFrame={true}
                    />

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
              {unlockedFrames.length} / {AVATAR_FRAMES.length} frames unlocked
            </span>
          </div>
          {unlockedFrames.length === 1 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Crown className="w-3 h-3" />
              <span>Redeem "Avatar Frames" reward to unlock all frames</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}