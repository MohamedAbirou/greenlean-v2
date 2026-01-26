/**
 * useThemes Hook
 * Manages theme unlocking and application
 */

import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AVAILABLE_THEMES, getThemeById } from "../constants/themeDefinitions";

async function fetchUnlockedThemeValues(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_redeemed_rewards")
    .select("reward_value")
    .eq("user_id", userId)
    .eq("type", "theme");

  if (error) throw error;
  return data?.map((r) => r.reward_value) ?? [];
}

export function useThemes() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentTheme, setCurrentTheme] = useState<string>("default");
  const [isApplying, setIsApplying] = useState(false);

  const { data: unlockedThemeValues = [], isLoading } = useQuery({
    queryKey: ["unlocked-theme-values", user?.id],
    queryFn: () => fetchUnlockedThemeValues(user!.id),
    enabled: !!user?.id,
  });

  // Get unlocked theme definitions
  const unlockedThemes = AVAILABLE_THEMES.filter(
    (theme) => !theme.isUnlockable || unlockedThemeValues.includes(theme.rewardValue ?? "")
  );

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("greenlean_theme");
    if (saved && getThemeById(saved)) {
      setCurrentTheme(saved);
      applyThemeColors(saved);
    }
  }, []);

  const applyThemeColors = useCallback((themeId: string) => {
    const theme = getThemeById(themeId);
    if (!theme) return;

    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, []);

  const applyTheme = useCallback(
    async (themeId: string) => {
      const theme = getThemeById(themeId);
      if (!theme) {
        toast.error("Theme not found");
        return;
      }

      if (theme.isUnlockable && !unlockedThemeValues.includes(theme.rewardValue ?? "")) {
        toast.error("This theme is locked! Redeem it from the Rewards Catalog first.");
        return;
      }

      setIsApplying(true);
      try {
        applyThemeColors(themeId);
        localStorage.setItem("greenlean_theme", themeId);

        if (user) {
          await supabase.from("profiles").update({ selected_theme: themeId }).eq("id", user.id);
        }

        setCurrentTheme(themeId);
        toast.success(`${theme.name} theme applied! ${theme.icon ?? ""}`);

        // Optional: invalidate if you want fresh redemptions
        // queryClient.invalidateQueries({ queryKey: ['unlocked-theme-values'] });
      } catch (err) {
        console.error("Failed to apply theme:", err);
        toast.error("Failed to apply theme");
      } finally {
        setIsApplying(false);
      }
    },
    [user, unlockedThemeValues, applyThemeColors]
  );

  const isThemeUnlocked = useCallback(
    (themeId: string) => {
      const theme = getThemeById(themeId);
      if (!theme) return false;
      if (!theme.isUnlockable) return true;
      return unlockedThemeValues.includes(theme.rewardValue ?? "");
    },
    [unlockedThemeValues]
  );

  return {
    availableThemes: AVAILABLE_THEMES,
    unlockedThemes,
    currentTheme,
    currentThemeDefinition: getThemeById(currentTheme),

    loading: isLoading,
    isApplying,

    applyTheme,
    isThemeUnlocked,

    // If needed elsewhere
    refetch: () => queryClient.invalidateQueries({ queryKey: ["unlocked-theme-values"] }),
  };
}
