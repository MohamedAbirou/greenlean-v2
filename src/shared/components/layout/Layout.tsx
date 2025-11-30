import { motion } from "framer-motion";
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { CommandPalette } from "./CommandPalette";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

const Layout: React.FC = () => {
  const location = useLocation();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

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
    </div>
  );
};

export default Layout;