/**
 * Onboarding Guard Component
 * Ensures user has completed onboarding before accessing main app features
 * Redirects to /onboarding if not completed
 */

import { useGetUserOnboardingStatusQuery } from "@/generated/graphql";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { FullPageLoader } from "../../../shared/components/feedback";
import { useAuth } from "../hooks";

interface OnboardingGuardProps {
  children: ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

  const { data, loading } = useGetUserOnboardingStatusQuery({
    variables: { userId: user?.id || "" },
    skip: !user,
  });

  if (loading) {
    return <FullPageLoader text="Checking onboarding status..." />;
  }

  const profile = data?.profilesCollection?.edges?.[0]?.node;

  // Allow access to onboarding page itself
  if (location.pathname === "/onboarding") {
    return <>{children}</>;
  }

  // Redirect to onboarding if not completed
  if (user && (!profile?.onboarding_completed)) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}
