/**
 * Protected Route Component
 * Simple authentication check - redirects to login if not authenticated
 */

import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { FullPageLoader } from "../../../shared/components/feedback";
import { useAuth } from "../hooks";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageLoader text="Verifying authentication..." />;
  }

  if (!user) {
    // Redirect to login, save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
