/**
 * Application Providers - GraphQL Only
 * Apollo Client (GraphQL) for all data fetching
 */

import { ScrollToTop } from "@/shared/components/ScrollToTop";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Cookies from "js-cookie";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "../../features/auth";
import { MicroSurveyProvider } from "../../features/onboarding/components/MicroSurveyDialog";
import CookieConsent from "../../shared/components/CookieConsent";
import { ErrorBoundary } from "../../shared/components/feedback";
import { ThemeProvider } from "./ThemeProvider";
import { ApolloProvider } from "./ApolloProvider";
import { PlanProviderGraphQL, usePlan } from "./PlanProviderGraphQL";

interface AppProvidersProps {
  children: ReactNode;
}

// Re-export usePlan for backward compatibility
export { usePlan };

export function AppProviders({ children }: AppProvidersProps) {
  const hasConsent = Cookies.get("cookie-consent") === "accepted";

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ApolloProvider>
          <AuthProvider>
            <PlanProviderGraphQL>
              <MicroSurveyProvider>
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
              </MicroSurveyProvider>
            </PlanProviderGraphQL>
          </AuthProvider>
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;