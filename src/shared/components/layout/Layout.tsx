import { motion } from "framer-motion";
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { FooterV2 } from "./FooterV2";
import { NavbarV2 } from "./NavbarV2";

const Layout: React.FC = () => {
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const { pathname } = useLocation();

  // Theme is now managed by ThemeProvider, no need to manage it here

  return (
    <div className="flex flex-col min-h-screen">
      {pathname !== "/admin" && (
        <NavbarV2 onCommandPaletteOpen={() => setIsCommandPaletteOpen(true)} />
      )}

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

      {pathname !== "/admin" && <FooterV2 />}

      {/* Command Palette */}
      <CommandPalette
        open={isCommandPaletteOpen}
        onOpenChange={setIsCommandPaletteOpen}
      />
    </div>
  );
};

export default Layout;