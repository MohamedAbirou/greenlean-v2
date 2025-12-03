/**
 * Application Routes Configuration
 * Lazy-loaded routes for optimal performance
 */

import { Dashboard } from "@/features/dashboard/pages/Dashboard";
import { QuickOnboarding } from "@/features/onboarding";
import AuthCallback from "@/pages/AuthCallback";
import Challenges from "@/pages/Challenges";
import Contact from "@/pages/Contact";
import DietPlanDetails from "@/pages/DietPlanDetails";
import DietPlans from "@/pages/DietPlans";
import ExerciseDetails from "@/pages/ExerciseDetails";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Notifications from "@/pages/Notifications";
import Pricing from "@/pages/Pricing";
import Profile from "@/pages/Profile";
import Quiz from "@/pages/Quiz";
import QuizHistory from "@/pages/QuizHistory";
import QuizResult from "@/pages/QuizResult";
import Register from "@/pages/Register";
import Settings from "@/pages/Settings";
import WeightLoss from "@/pages/WeightLoss";
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { OnboardingGuard, ProtectedRoute } from "../../features/auth";
import { FullPageLoader } from "../../shared/components/feedback";
import Layout from "../../shared/components/layout/Layout";
import { RewardsCatalog } from "@/features/rewards";

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
        path: "diet-plans",
        element: <DietPlans />,
      },
      {
        path: "diet-plans/:id",
        element: <DietPlanDetails />,
      },
      {
        path: "workouts",
        element: <WeightLoss />,
      },
      {
        path: "workouts/:id",
        element: <ExerciseDetails />,
      },
      {
        path: "quiz",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <Quiz />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
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
        path: "quiz-history",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <QuizHistory />
            </OnboardingGuard>
          </ProtectedRoute>
        ),
      },
      {
        path: "quiz-result/:id",
        element: (
          <ProtectedRoute>
            <OnboardingGuard>
              <QuizResult />
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
