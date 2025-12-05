/**
 * Onboarding Guard Component
 * Ensures user has completed onboarding before accessing main app features
 * ALSO prevents completed users from re-running onboarding
 * Redirects to /onboarding if not completed
 * Redirects to /dashboard if already completed and trying to access /onboarding
 */

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { FullPageLoader } from "../../../shared/components/feedback";
import { useAuth } from "../hooks";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface OnboardingGuardProps {
  children: ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        setOnboardingCompleted(profile?.onboarding_completed || false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  if (loading) {
    return <FullPageLoader text="Checking onboarding status..." />;
  }

  // If user is trying to access onboarding page but already completed it
  if (location.pathname === "/onboarding" && onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and trying to access other pages
  if (location.pathname !== "/onboarding" && !onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
