/**
 * useThemes Hook
 * Manages theme unlocking and application
 */

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@apollo/client/react';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth';
import { supabase } from '@/lib/supabase';
import { AVAILABLE_THEMES, getThemeById } from '../constants/themeDefinitions';
import type { ThemeDefinition } from '../constants/themeDefinitions';
import { gql } from '@apollo/client/react';

const GET_USER_THEMES = gql`
  query GetUserThemes($userId: UUID!) {
    user_redeemed_rewardsCollection(
      filter: {
        user_id: { eq: $userId }
        reward_type: { eq: "theme" }
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

export function useThemes() {
  const { user } = useAuth();
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  const [isApplying, setIsApplying] = useState(false);

  // Fetch unlocked themes from database
  const { data, loading, refetch } = useQuery(GET_USER_THEMES, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  const unlockedThemeValues = data?.user_redeemed_rewardsCollection?.edges?.map(
    (edge: any) => edge.node.reward_value
  ) || [];

  // Get unlocked theme definitions
  const unlockedThemes = AVAILABLE_THEMES.filter(theme =>
    !theme.isUnlockable || unlockedThemeValues.includes(theme.rewardValue)
  );

  // Load current theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('greenlean_theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyThemeColors(savedTheme);
    }
  }, []);

  const applyThemeColors = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    if (!theme) return;

    // Apply CSS variables
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);

  const applyTheme = useCallback(async (themeId: string) => {
    const theme = getThemeById(themeId);
    if (!theme) {
      toast.error('Theme not found');
      return;
    }

    // Check if theme is locked
    if (theme.isUnlockable && !unlockedThemeValues.includes(theme.rewardValue)) {
      toast.error('This theme is locked! Redeem it from the Rewards Catalog first.');
      return;
    }

    setIsApplying(true);

    try {
      // Apply theme colors
      applyThemeColors(themeId);

      // Save to localStorage
      localStorage.setItem('greenlean_theme', themeId);

      // Save to user profile in database
      if (user) {
        await supabase
          .from('profiles')
          .update({ selected_theme: themeId })
          .eq('id', user.id);
      }

      setCurrentTheme(themeId);
      toast.success(`${theme.name} theme applied! ${theme.icon}`);
    } catch (error) {
      console.error('Failed to apply theme:', error);
      toast.error('Failed to apply theme');
    } finally {
      setIsApplying(false);
    }
  }, [user, unlockedThemeValues, applyThemeColors]);

  const isThemeUnlocked = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    if (!theme) return false;
    if (!theme.isUnlockable) return true;
    return unlockedThemeValues.includes(theme.rewardValue);
  }, [unlockedThemeValues]);

  return {
    // Data
    availableThemes: AVAILABLE_THEMES,
    unlockedThemes,
    currentTheme,
    currentThemeDefinition: getThemeById(currentTheme),

    // Loading
    loading,
    isApplying,

    // Actions
    applyTheme,
    isThemeUnlocked,

    // Refetch
    refetch,
  };
}
