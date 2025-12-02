/**
 * ThemeSelector Component
 * Beautiful theme selection UI
 */

import { motion } from 'framer-motion';
import { Check, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useThemes } from '../hooks/useThemes';
import type { ThemeDefinition } from '../constants/themeDefinitions';

interface ThemeSelectorProps {
  showLocked?: boolean;
}

export function ThemeSelector({ showLocked = true }: ThemeSelectorProps) {
  const {
    availableThemes,
    currentTheme,
    isApplying,
    applyTheme,
    isThemeUnlocked,
  } = useThemes();

  const visibleThemes = showLocked
    ? availableThemes
    : availableThemes.filter(theme => isThemeUnlocked(theme.id));

  const handleThemeClick = (theme: ThemeDefinition) => {
    if (isThemeUnlocked(theme.id)) {
      applyTheme(theme.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-600" />
          Themes
        </h2>
        <p className="text-muted-foreground mt-1">
          Customize your experience with unlockable themes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleThemes.map((theme, index) => {
          const isActive = currentTheme === theme.id;
          const isUnlocked = isThemeUnlocked(theme.id);

          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleThemeClick(theme)}
              className={`
                relative rounded-xl overflow-hidden cursor-pointer transition-all
                ${isUnlocked ? 'hover:scale-105 hover:shadow-xl' : 'opacity-60 cursor-not-allowed'}
                ${isActive ? 'ring-4 ring-primary-600 ring-offset-2' : 'border-2 border-transparent'}
              `}
            >
              {/* Preview Gradient */}
              <div
                className="h-32 relative"
                style={{ background: theme.preview.gradient }}
              >
                {/* Lock Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Lock className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm font-medium">Locked</p>
                      <p className="text-xs opacity-80">Unlock in Rewards</p>
                    </div>
                  </div>
                )}

                {/* Active Checkmark */}
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                  </motion.div>
                )}

                {/* Icon */}
                <div className="absolute bottom-2 left-2">
                  <span className="text-4xl drop-shadow-lg">{theme.icon}</span>
                </div>
              </div>

              {/* Theme Info */}
              <div className="p-4 bg-card">
                <h3 className="font-semibold mb-1">{theme.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {theme.description}
                </p>

                {isUnlocked && !isActive && (
                  <Button
                    size="sm"
                    className="w-full mt-3"
                    disabled={isApplying}
                  >
                    Apply Theme
                  </Button>
                )}

                {isActive && (
                  <div className="mt-3 text-center">
                    <span className="text-sm font-medium text-green-600 flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" />
                      Active
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {!showLocked && visibleThemes.length === 1 && (
        <div className="text-center p-6 bg-muted/30 rounded-lg border border-dashed">
          <Lock className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-semibold mb-2">Unlock More Themes!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Redeem themes from the Rewards Catalog to expand your collection
          </p>
          <Button variant="outline">Visit Rewards</Button>
        </div>
      )}
    </div>
  );
}
