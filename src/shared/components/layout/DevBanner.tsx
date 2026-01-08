/**
 * Development Status Banner
 * Persistent banner to inform users about development status and regional limitations
 * Place this in: src/shared/components/layout/DevBanner.tsx
 */

import { AlertTriangle, Globe, Info, X, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DevBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Check if user has dismissed the banner (persists across sessions)
  useEffect(() => {
    const dismissed = localStorage.getItem('dev-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);

    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
      localStorage.setItem('dev-banner-dismissed', 'true');
    }, 450);
  };

  const handleClose = () => {
    setIsLeaving(true);

    setTimeout(() => {
      setIsVisible(false);
      setIsLeaving(false);
    }, 450); // must match CSS duration
  };


  const handleShow = () => {
    setIsVisible(true);
  };

  // If dismissed, show a small floating badge to re-open
  if (isDismissed && !isVisible) {
    return (
      <button
        onClick={handleShow}
        className="fixed bottom-4 right-4 z-50 p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        title="Development Status Info"
      >
        <Info className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      </button>
    );
  }

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50
    ${isLeaving ? 'animate-dev-banner-out' : 'animate-dev-banner-in slide-in-from-bottom'}
  `}
    >
      {/* Top gradient fade */}
      <div className="h-2 bg-gradient-to-t from-amber-500/20 to-transparent"></div>

      {/* Main Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white shadow-2xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg">🚧 Development Preview</h3>
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                  BETA
                </span>
              </div>

              <p className="text-sm text-white/90 mb-3 leading-relaxed">
                GreenLean is currently under active development. You may encounter incomplete features or occasional bugs.
                Your feedback helps us improve! 🙏
              </p>

              {/* Regional Notice */}
              <div className="flex flex-col sm:flex-row gap-3 text-xs">
                <div className="flex items-start gap-2 bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1">
                  <Globe className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">🌍 Hosted in EU</p>
                    <p className="text-white/80 leading-relaxed">
                      Frontend: Frankfurt, Germany (eu-central-1)<br />
                      AI Services: Amsterdam, Netherlands (EU West)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/10 rounded-lg p-3 backdrop-blur-sm flex-1">
                  <Zap className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">⚠️ Outside EU?</p>
                    <p className="text-white/80 leading-relaxed">
                      Users in US, Canada, Asia may experience slower load times or limited AI features due to free-tier regional restrictions.
                    </p>
                  </div>
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center justify-between text-xs mt-3">
                <a
                  href="/contact"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-colors"
                >
                  🐛 Report Bug
                </a>

                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg font-semibold transition-colors flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Hide Banner
                </button>
              </div>

            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Dismiss (you can reopen anytime)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}