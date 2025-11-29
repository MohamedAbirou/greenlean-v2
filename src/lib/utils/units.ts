/**
 * Unit System Detection and Conversion Utilities
 * Automatically detects user's preferred unit system based on locale
 */

/**
 * Detects the user's preferred unit system based on their locale
 * Returns 'imperial' for US, 'metric' for rest of world
 */
export function detectUnitSystem(): 'metric' | 'imperial' {
  try {
    // Try to get user's locale from browser
    const locale = navigator.language || (navigator as any).userLanguage || 'en-US';

    // Countries that use imperial system
    const imperialCountries = ['US', 'LR', 'MM']; // USA, Liberia, Myanmar

    // Extract country code from locale (e.g., 'en-US' -> 'US')
    const countryCode = locale.split('-')[1]?.toUpperCase();

    // Check if user is in an imperial country
    if (countryCode && imperialCountries.includes(countryCode)) {
      return 'imperial';
    }

    return 'metric';
  } catch (error) {
    console.warn('Error detecting unit system, defaulting to metric:', error);
    return 'metric';
  }
}

/**
 * Convert kg to lbs
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

/**
 * Convert lbs to kg
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10;
}

/**
 * Convert cm to inches
 */
export function cmToInches(cm: number): number {
  return Math.round(cm / 2.54 * 10) / 10;
}

/**
 * Convert inches to cm
 */
export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

/**
 * Convert cm to feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Convert feet and inches to cm
 */
export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}

/**
 * Format weight with unit
 */
export function formatWeight(kg: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'imperial') {
    return `${kgToLbs(kg)} lbs`;
  }
  return `${kg} kg`;
}

/**
 * Format height with unit
 */
export function formatHeight(cm: number, unitSystem: 'metric' | 'imperial'): string {
  if (unitSystem === 'imperial') {
    const { feet, inches } = cmToFeetInches(cm);
    return `${feet}'${inches}"`;
  }
  return `${cm} cm`;
}
