-- =============================================
-- Avatar Customization Feature
-- Date: 2025-11-30
-- =============================================

-- Add avatar_frame column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_frame TEXT DEFAULT 'default';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_frame ON profiles(avatar_frame);

-- Comment
COMMENT ON COLUMN profiles.avatar_frame IS 'Selected avatar frame style (default, gold_elite, diamond_pro, etc.)';
