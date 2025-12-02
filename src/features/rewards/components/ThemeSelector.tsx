/**
 * ThemeSelector Component
 * Allows users to view, preview, and switch between unlocked themes
 * Integrates with rewards system to show locked vs unlocked themes
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AVAILABLE_THEMES, useThemeStore } from '@/store/themeStore';
import { motion } from 'framer-motion';
import { Check, Crown, ExternalLink, Lock, Palette, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function ThemeSelector() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeTheme, unlockedThemes, setActiveTheme, unlockTheme } = useThemeStore();
  const [isLoading, setIsLoading] = useState(true);
  const [redeemedThemeRewards, setRedeemedThemeRewards] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadUnlockedThemes();
    }
  }, [user]);

  const loadUnlockedThemes = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch all redeemed theme rewards
      const { data, error } = await supabase
        .from('user_redeemed_rewards')
        .select('reward_value')
        .eq('user_id', user.id)
        .eq('type', 'theme');

      if (error) throw error;

      const redeemedThemes = data?.map((r) => r.reward_value) || [];
      setRedeemedThemeRewards(redeemedThemes);

      // Unlock themes in the store
      redeemedThemes.forEach((themeValue) => {
        unlockTheme(themeValue);
      });
    } catch (error) {
      console.error('Error loading unlocked themes:', error);
      toast.error('Failed to load unlocked themes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeSelect = (themeName: string) => {
    const theme = AVAILABLE_THEMES[themeName];

    if (!theme) return;

    // Check if theme is unlocked
    if (!unlockedThemes.includes(themeName)) {
      toast.error('This theme is locked! Redeem it from the Rewards Store first.');
      return;
    }

    setActiveTheme(themeName);
    toast.success(`Switched to ${theme.displayName} theme! 🎨`);
  };

  const handleViewRewardsStore = () => {
    navigate('/rewards');
  };

  const isThemeLocked = (themeName: string): boolean => {
    return !unlockedThemes.includes(themeName);
  };

  if (isLoading) {
    return (
      <Card className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading themes...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary-600" />
            Theme Gallery
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Personalize your GreenLean experience with custom color themes
          </p>
        </div>
        <Button onClick={handleViewRewardsStore} variant="outline" size="sm">
          <ExternalLink className="w-4 h-4 mr-2" />
          Rewards Store
        </Button>
      </div>

      {/* Active Theme Info */}
      <Card className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border-2 border-primary-200 dark:border-primary-700">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg shadow-md"
            style={{ background: AVAILABLE_THEMES[activeTheme]?.preview }}
          />
          <div>
            <p className="text-sm text-muted-foreground">Currently Active</p>
            <p className="font-bold text-lg">{AVAILABLE_THEMES[activeTheme]?.displayName}</p>
          </div>
          <Check className="w-5 h-5 ml-auto text-success" />
        </div>
      </Card>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(AVAILABLE_THEMES).map((theme, index) => {
          const isLocked = isThemeLocked(theme.name);
          const isActive = activeTheme === theme.name;

          return (
            <motion.div
              key={theme.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                  isActive ? 'ring-2 ring-primary-500 shadow-lg' : ''
                } ${isLocked ? 'opacity-60' : ''}`}
                onClick={() => !isLocked && handleThemeSelect(theme.name)}
              >
                {/* Theme Preview */}
                <div
                  className="h-24 w-full relative"
                  style={{ background: theme.preview }}
                >
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  )}
                  {isActive && !isLocked && (
                    <div className="absolute top-2 right-2 bg-success text-white rounded-full p-1">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Theme Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{theme.displayName}</h3>
                    {theme.name !== 'default' && (
                      <Badge variant={isLocked ? 'outline' : 'default'} className="ml-2">
                        {isLocked ? (
                          <>
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 mr-1" />
                            Unlocked
                          </>
                        )}
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {theme.description}
                  </p>

                  {/* Color Swatches */}
                  <div className="flex gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary"
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary"
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent"
                    />
                  </div>

                  {/* Action Button */}
                  {isActive ? (
                    <Button disabled className="w-full" variant="outline">
                      <Check className="w-4 h-4 mr-2" />
                      Active
                    </Button>
                  ) : isLocked ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewRewardsStore();
                      }}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      Unlock in Store
                    </Button>
                  ) : (
                    <Button variant="default" className="w-full">
                      <Palette className="w-4 h-4 mr-2" />
                      Apply Theme
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      <Card className="p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>
              {unlockedThemes.length} / {Object.keys(AVAILABLE_THEMES).length} themes unlocked
            </span>
          </div>
          {unlockedThemes.length < Object.keys(AVAILABLE_THEMES).length && (
            <Button onClick={handleViewRewardsStore} variant="link" size="sm">
              Unlock more themes →
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
