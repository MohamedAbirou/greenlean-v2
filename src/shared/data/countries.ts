/**
 * Countries Data
 * ISO 3166-1 alpha-2 country codes with unit system mapping
 */

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  unitSystem: 'metric' | 'imperial';
  flag: string; // Unicode flag emoji
}

// Imperial countries: US, Liberia (LR), Myanmar (MM)
// All others use metric
export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', unitSystem: 'imperial', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', unitSystem: 'metric', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', unitSystem: 'metric', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', unitSystem: 'metric', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', unitSystem: 'metric', flag: '🇩🇪' },
  { code: 'FR', name: 'France', unitSystem: 'metric', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', unitSystem: 'metric', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', unitSystem: 'metric', flag: '🇪🇸' },
  { code: 'MX', name: 'Mexico', unitSystem: 'metric', flag: '🇲🇽' },
  { code: 'BR', name: 'Brazil', unitSystem: 'metric', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', unitSystem: 'metric', flag: '🇦🇷' },
  { code: 'IN', name: 'India', unitSystem: 'metric', flag: '🇮🇳' },
  { code: 'CN', name: 'China', unitSystem: 'metric', flag: '🇨🇳' },
  { code: 'JP', name: 'Japan', unitSystem: 'metric', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', unitSystem: 'metric', flag: '🇰🇷' },
  { code: 'RU', name: 'Russia', unitSystem: 'metric', flag: '🇷🇺' },
  { code: 'ZA', name: 'South Africa', unitSystem: 'metric', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', unitSystem: 'metric', flag: '🇳🇬' },
  { code: 'EG', name: 'Egypt', unitSystem: 'metric', flag: '🇪🇬' },
  { code: 'SA', name: 'Saudi Arabia', unitSystem: 'metric', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', unitSystem: 'metric', flag: '🇦🇪' },
  { code: 'SG', name: 'Singapore', unitSystem: 'metric', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', unitSystem: 'metric', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', unitSystem: 'metric', flag: '🇹🇭' },
  { code: 'ID', name: 'Indonesia', unitSystem: 'metric', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', unitSystem: 'metric', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', unitSystem: 'metric', flag: '🇻🇳' },
  { code: 'NZ', name: 'New Zealand', unitSystem: 'metric', flag: '🇳🇿' },
  { code: 'NL', name: 'Netherlands', unitSystem: 'metric', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', unitSystem: 'metric', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', unitSystem: 'metric', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', unitSystem: 'metric', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', unitSystem: 'metric', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', unitSystem: 'metric', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', unitSystem: 'metric', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', unitSystem: 'metric', flag: '🇫🇮' },
  { code: 'PL', name: 'Poland', unitSystem: 'metric', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', unitSystem: 'metric', flag: '🇨🇿' },
  { code: 'PT', name: 'Portugal', unitSystem: 'metric', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', unitSystem: 'metric', flag: '🇬🇷' },
  { code: 'TR', name: 'Turkey', unitSystem: 'metric', flag: '🇹🇷' },
  { code: 'IL', name: 'Israel', unitSystem: 'metric', flag: '🇮🇱' },
  { code: 'IE', name: 'Ireland', unitSystem: 'metric', flag: '🇮🇪' },
  { code: 'LR', name: 'Liberia', unitSystem: 'imperial', flag: '🇱🇷' },
  { code: 'MM', name: 'Myanmar', unitSystem: 'imperial', flag: '🇲🇲' },
  { code: 'CL', name: 'Chile', unitSystem: 'metric', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', unitSystem: 'metric', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', unitSystem: 'metric', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', unitSystem: 'metric', flag: '🇻🇪' },
  { code: 'EC', name: 'Ecuador', unitSystem: 'metric', flag: '🇪🇨' },
];

// Helper function to get country by code
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

// Helper function to get unit system from country code
export function getUnitSystemFromCountry(countryCode: string): 'metric' | 'imperial' {
  const country = getCountryByCode(countryCode);
  return country?.unitSystem || 'metric'; // Default to metric
}

// Detect country from browser locale (fallback only)
export function detectCountryFromLocale(): string {
  try {
    const locale = navigator.language || 'en-US';
    const countryCode = locale.split('-')[1]?.toUpperCase();

    // Verify it's a valid country code in our list
    if (countryCode && COUNTRIES.some(c => c.code === countryCode)) {
      return countryCode;
    }

    // Default to US if can't detect
    return 'US';
  } catch {
    return 'US';
  }
}
