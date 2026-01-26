/**
 * Application Providers - GraphQL Only
 * Apollo Client (GraphQL) for all data fetching
 */

import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Cookies from "js-cookie";
import type { ReactNode } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "../../features/auth";
import CookieConsent from "../../shared/components/CookieConsent";
import { ErrorBoundary } from "../../shared/components/feedback";
import PlanProvider from "./PlanProvider";
import { ThemeProvider } from "./ThemeProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const hasConsent = Cookies.get("cookie-consent") === "accepted";
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PlanProvider>
              <Router
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                <ScrollToTop />
                {children}

                {hasConsent && <Analytics />}
                <Toaster
                  position="top-right"
                  expand={false}
                  richColors
                  closeButton
                  duration={4000}
                />
                <SpeedInsights />
                <CookieConsent />
              </Router>
            </PlanProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;