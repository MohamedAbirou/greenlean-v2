/**
 * Auth State Hook
 * Manages authentication state with Supabase
 */

import { supabase } from "@/lib/supabase";
import type { Profile } from "@/shared/types/user";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { AuthService } from "../api/authService";
import type { AuthState } from "../types";

export function useAuthState(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await AuthService.fetchProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        fetchProfile(authUser.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        fetchProfile(authUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Realtime subscription for profile updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Profile update received:", payload); // Debug: Check console for updates
          const updatedProfile = payload.new as Profile;
          setProfile(updatedProfile); // Update state directly with new profile data
        }
      )
      .subscribe((status) => {
        console.log("Profile subscription status:", status); // Debug: Should log 'SUBSCRIBED'
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
  };
}
