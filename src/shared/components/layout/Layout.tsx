import { motion } from "framer-motion";
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { TierUnlockNotification } from "@/shared/components/notifications/TierUnlockNotification";
import { useTierUnlock } from "@/shared/hooks/useTierUnlock";

const Layout: React.FC = () => {
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { tierUnlockData, onRegenerate, onDismiss } = useTierUnlock();

  // Theme is now managed by ThemeProvider, no need to manage it here

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onCommandPaletteOpen={() => setIsCommandPaletteOpen(true)} />

      <main className="flex-grow">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />

      {/* Tier Unlock Notification */}
      <TierUnlockNotification
        data={tierUnlockData}
        onRegenerate={onRegenerate}
        onDismiss={onDismiss}
      />
    </div>
  );
};

export default Layout;