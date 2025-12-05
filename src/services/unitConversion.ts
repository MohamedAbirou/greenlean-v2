/**
 * Unit Conversion Service
 * Handles all unit conversions between metric and imperial systems
 *
 * STORAGE FORMAT (in database):
 * - Weight: ALWAYS in kg
 * - Height: ALWAYS in cm
 *
 * DISPLAY FORMAT (in UI):
 * - Metric: kg, cm
 * - Imperial: lbs, feet/inches
 */

export type UnitSystem = 'metric' | 'imperial';

// Only 3 countries in the world use imperial system
const IMPERIAL_COUNTRIES = ['US', 'LR', 'MM'];

/**
 * Detect user's preferred unit system from browser locale
 * Returns 'metric' or 'imperial'
 */
export function detectUnitSystem(): UnitSystem {
  try {
    const locale = navigator.language || 'en-US';
    const parts = locale.split('-');

    if (parts.length >= 2) {
      const country = parts[1].toUpperCase();
      return IMPERIAL_COUNTRIES.includes(country) ? 'imperial' : 'metric';
    }

    return 'metric'; // Default to metric (used by 95% of world)
  } catch {
    return 'metric';
  }
}

// ============================================
// WEIGHT CONVERSIONS
// ============================================

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10; // Round to 1 decimal
}

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462 * 10) / 10; // Round to 1 decimal
}

/**
 * Format weight for display based on unit system
 * @param valueKg - Weight in kg (internal storage format)
 * @param unitSystem - Target unit system for display
 */
export function formatWeight(
  valueKg: number,
  unitSystem: UnitSystem
): { value: number; unit: string; display: string } {
  if (unitSystem === 'imperial') {
    const lbs = kgToLbs(valueKg);
    return { value: lbs, unit: 'lbs', display: `${lbs} lbs` };
  }
  const kg = Math.round(valueKg * 10) / 10;
  return { value: kg, unit: 'kg', display: `${kg} kg` };
}

/**
 * Parse weight input to kilograms (for storage)
 * @param value - Weight value
 * @param unit - Unit of the input value
 */
export function parseWeight(value: number, unit: string): number {
  const unitLower = unit.toLowerCase().trim();

  if (unitLower.includes('lb') || unitLower.includes('pound')) {
    return lbsToKg(value);
  }

  return value; // Assume kg
}

// ============================================
// HEIGHT CONVERSIONS
// ============================================

/**
 * Convert centimeters to feet and inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);

  // Handle edge case: 5'12" should become 6'0"
  if (inches === 12) {
    return { feet: feet + 1, inches: 0 };
  }

  return { feet, inches };
}

/**
 * Convert feet and inches to centimeters
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = (feet * 12) + inches;
  return Math.round(totalInches * 2.54 * 10) / 10; // Round to 1 decimal
}

/**
 * Format height for display based on unit system
 * @param valueCm - Height in cm (internal storage format)
 * @param unitSystem - Target unit system for display
 */
export function formatHeight(
  valueCm: number,
  unitSystem: UnitSystem
): { value: any; unit: string; display: string } {
  if (unitSystem === 'imperial') {
    const { feet, inches } = cmToFeetInches(valueCm);
    return {
      value: { feet, inches },
      unit: 'ft/in',
      display: `${feet}'${inches}"`
    };
  }
  const cm = Math.round(valueCm * 10) / 10;
  return {
    value: cm,
    unit: 'cm',
    display: `${cm} cm`
  };
}

/**
 * Parse height input to centimeters (for storage)
 * @param value - Height value (can be number or {feet, inches})
 * @param unit - Unit of the input value
 */
export function parseHeight(value: any, unit: string): number {
  const unitLower = unit.toLowerCase().trim();

  // Handle feet/inches format
  if (unitLower === 'ft/in' || unitLower === 'ft') {
    if (typeof value === 'object' && 'feet' in value && 'inches' in value) {
      return feetInchesToCm(value.feet, value.inches);
    }
  }

  // Handle inches only
  if (unitLower === 'in' || unitLower === 'inch' || unitLower === 'inches') {
    return Math.round(value * 2.54 * 10) / 10;
  }

  // Assume cm
  return value;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate weight is within reasonable bounds
 * @param valueKg - Weight in kilograms
 */
export function validateWeight(valueKg: number): boolean {
  return valueKg >= 20 && valueKg <= 300; // 44-661 lbs
}

/**
 * Validate height is within reasonable bounds
 * @param valueCm - Height in centimeters
 */
export function validateHeight(valueCm: number): boolean {
  return valueCm >= 100 && valueCm <= 250; // 3'3" - 8'2"
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get user's country code from browser locale
 */
export function detectUserCountry(): string {
  try {
    const locale = navigator.language || 'en-US';
    const parts = locale.split('-');

    if (parts.length >= 2) {
      return parts[1].toUpperCase();
    }

    return 'US'; // Default
  } catch {
    return 'US';
  }
}

/**
 * Check if a country uses imperial system
 */
export function isImperialCountry(countryCode: string): boolean {
  return IMPERIAL_COUNTRIES.includes(countryCode.toUpperCase());
}
