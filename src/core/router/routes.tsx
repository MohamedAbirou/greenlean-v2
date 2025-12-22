/**
 * Application Routes Configuration
 * Lazy-loaded routes for optimal performance
 */

import { Dashboard, LogMeal, LogWorkout, PlateCalculatorPage } from "@/features/dashboard";
import { QuickOnboarding } from "@/features/onboarding";
import { Plans } from "@/features/plans/pages/Plans";
import { RewardsCatalog } from "@/features/rewards";
import { CompleteProfile } from "@/features/settings/pages/CompleteProfile";
import AuthCallback from "@/pages/AuthCallback";
import Challenges from "@/pages/Challenges";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Notifications from "@/pages/Notifications";
import Pricing from "@/pages/Pricing";
import Profile from "@/pages/Profile";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { OnboardingGuard, ProtectedRoute } from "../../features/auth";
import { FullPageLoader } from "../../shared/components/feedback";
import Layout from "../../shared/components/layout/Layout";

const About = lazy(() => import("@/pages/About"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));

export const routes: RouteObject[] = [
  {
    path: "/auth/callback",
    element: <AuthCallback />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "faq",
        element: <FAQ />,
      },
      {
        path: "privacy",
        element: <PrivacyPolicy />,
      },
      {
        path: "terms",
        element: <TermsOfService />,
      },
      {
        path: "pricing",
        element: <Pricing />,
      },
      {
        path: "onboarding",
        element: (
          <ProtectedRoute>
            <QuickOnboarding />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <Settings />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "settings/complete-profile",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <CompleteProfile />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "plans",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <Plans />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <Profile />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <Notifications />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <Dashboard />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/log-meal",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <LogMeal />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/log-workout",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <LogWorkout />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard/plate-calculator",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <PlateCalculatorPage />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "challenges",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <Challenges />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "rewards",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <RewardsCatalog />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export const suspenseFallback = <FullPageLoader text="Loading page..." />;
