/**
 * Unit System Hook
 * Provides user's unit system preference based on their country
 * CRITICAL: This hook MUST be used everywhere metric fields are displayed
 */

import { useAuth } from '@/features/auth';
import { getUnitSystemForCountry } from '@/services/unitConversion';
import type { UnitSystem } from '@/services/unitConversion';
import { useMemo } from 'react';

export function useUnitSystem(): UnitSystem {
  const { profile } = useAuth();

  return useMemo(() => {
    // Use explicit unit_system from profile if available
    if (profile?.unit_system) {
      return profile.unit_system as UnitSystem;
    }

    // Fallback to country-based detection
    if (profile?.country) {
      return getUnitSystemForCountry(profile.country);
    }

    // Default to metric
    return 'metric';
  }, [profile?.unit_system, profile?.country]);
}
