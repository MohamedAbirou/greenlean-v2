-- =============================================
-- Add Country Field for Unit System Detection
-- Date: 2025-12-07
--
-- Add country field to profiles table to properly determine
-- unit system (imperial vs metric) instead of using locale detection
-- =============================================

-- Add country column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS country VARCHAR(2); -- ISO 3166-1 alpha-2 country code

-- Add index for country lookups
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);

-- Update existing records to have a default country (US) if they have imperial unit system
UPDATE profiles
SET country = 'US'
WHERE unit_system = 'imperial' AND country IS NULL;

-- Update existing records to have a default country (based on common metric countries) if they have metric unit system
UPDATE profiles
SET country = 'GB' -- Default to UK for English-speaking metric users
WHERE unit_system = 'metric' AND country IS NULL;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON COLUMN profiles.country IS 'ISO 3166-1 alpha-2 country code (e.g., US, GB, CA) used to determine unit system preference';
