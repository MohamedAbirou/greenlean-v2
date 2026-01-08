/**
 * Main Application Component
 * Clean, minimal entry point with lazy-loaded routes
 */

import { Analytics } from "@vercel/analytics/react";
import { AnimatePresence } from "framer-motion";
import { Suspense } from "react";
import { useRoutes } from "react-router-dom";
import { AppProviders } from "./core/providers";
import { routes, suspenseFallback } from "./core/router/routes";
import { DevBanner } from "./shared/components/layout/DevBanner";

function AppRoutes() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={suspenseFallback}>
      <AnimatePresence mode="wait">
        {element}
        <DevBanner
          persistDismissal={true}  // Save to localStorage (default)
          autoHideAfter={10000}     // Auto-hide after 10 seconds
        />
        <Analytics />
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
