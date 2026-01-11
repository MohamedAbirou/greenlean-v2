/**
 * ThemeSelector Component - FIXED
 * Properly applies theme colors globally using CSS variables
 */

import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AVAILABLE_THEMES } from '@/store/themeStore';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { motion } from 'framer-motion';
import { Check, Crown, ExternalLink, Lock, Palette, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const GET_USER_THEME_REDEMPTIONS = gql`
  query GetUserThemeRedemptions($userId: UUID!) {
    user_redeemed_rewardsCollection(
      filter: { 
        user_id: { eq: $userId }
        type: { eq: "theme" }
      }
    ) {
      edges {
        node {
          id
          reward_value
          redeemed_at
        }
      }
    }
  }
`;

type RedeemedRewardNode = {
  id: string;
  reward_value: string;
  redeemed_at: string;
};

type RedeemedRewardsCollection = {
  edges: { node: RedeemedRewardNode }[];
};

type GetUserRedeemedRewardsData = {
  user_redeemed_rewardsCollection: RedeemedRewardsCollection;
};

type GetUserRedeemedRewardsVars = {
  userId?: string;
};

// FIXED: Helper function to apply theme colors to CSS variables
function applyThemeColors(themeColors: Record<string, string>) {
  const root = document.documentElement;

  Object.entries(themeColors).forEach(([key, value]) => {
    // Convert key to CSS variable format (camelCase to kebab-case)
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVar, value);
  });
}

export function ThemeSelector() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState<string>('default');
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(['default']);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch redeemed themes from database
  const { data, loading } = useQuery<
    GetUserRedeemedRewardsData,
    GetUserRedeemedRewardsVars
  >(GET_USER_THEME_REDEMPTIONS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  // Load saved theme and unlocked themes on mount
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadThemeSettings = async () => {
      try {
        // Load saved theme from profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('selected_theme')
          .eq('id', user.id)
          .single();

        if (profileData?.selected_theme) {
          setActiveTheme(profileData.selected_theme);

          // FIXED: Apply theme immediately on load
          const theme = AVAILABLE_THEMES[profileData.selected_theme];
          if (theme) {
            applyThemeColors(theme.colors);
          }
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeSettings();
  }, [user]);

  // Process redeemed themes
  useEffect(() => {
    if (!data?.user_redeemed_rewardsCollection?.edges) return;

    const redeemedThemeValues = data.user_redeemed_rewardsCollection.edges.map(
      (edge: any) => edge.node.reward_value
    );

    // Unlock themes based on redemptions
    const unlockedThemeNames = ['default']; // Default is always unlocked

    Object.values(AVAILABLE_THEMES).forEach((theme) => {
      if (theme.rewardValue && redeemedThemeValues.includes(theme.rewardValue)) {
        unlockedThemeNames.push(theme.name);
      }
    });

    setUnlockedThemes(unlockedThemeNames);
  }, [data]);

  const handleThemeSelect = async (themeName: string) => {
    const theme = AVAILABLE_THEMES[themeName];
    if (!theme) {
      toast.error('Theme not found');
      return;
    }

    // Check if theme is locked
    if (!unlockedThemes.includes(themeName)) {
      toast.error('This theme is locked! Redeem it from the Rewards Store first.');
      return;
    }

    try {
      // FIXED: Apply theme colors immediately
      applyThemeColors(theme.colors);

      // Save to localStorage
      localStorage.setItem('greenlean_theme', themeName);

      // Save to database
      if (user) {
        await supabase
          .from('profiles')
          .update({ selected_theme: themeName })
          .eq('id', user.id);
      }

      setActiveTheme(themeName);
      toast.success(`${theme.displayName} theme applied!`);
    } catch (error) {
      console.error('Failed to apply theme:', error);
      toast.error('Failed to apply theme');
    }
  };

  const handleViewRewardsStore = () => {
    navigate('/rewards');
  };

  const isThemeLocked = (themeName: string): boolean => {
    return !unlockedThemes.includes(themeName);
  };

  if (loading || isLoading) {
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
      <Card className="p-4 bg-gradient-to-r from-primary-500/50 to-secondary-500/50 border-2 border-primary-500">
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
                className={`relative overflow-hidden cursor-pointer transition-all hover:shadow-lg ${isActive ? 'ring-2 ring-primary-500 shadow-lg' : ''
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