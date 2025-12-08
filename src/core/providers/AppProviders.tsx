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
import CookieConsent from "../../shared/components/CookieConsent";
import { ErrorBoundary } from "../../shared/components/feedback";
import { ThemeProvider } from "./ThemeProvider";
import { ApolloProvider } from "./ApolloProvider";
import { PlanProviderGraphQL } from "./PlanProviderGraphQL";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const hasConsent = Cookies.get("cookie-consent") === "accepted";

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <ApolloProvider>
          <AuthProvider>
            <PlanProviderGraphQL>
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
            </PlanProviderGraphQL>
          </AuthProvider>
        </ApolloProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;