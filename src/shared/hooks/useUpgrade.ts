import { useState } from "react";

/**
 * Simple hook to trigger upgrade modal
 */
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
