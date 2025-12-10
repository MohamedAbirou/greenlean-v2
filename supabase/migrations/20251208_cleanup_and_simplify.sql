-- =============================================
-- Cleanup: Remove Social Features & Simplify
-- Date: 2025-12-08
-- =============================================

-- =============================================
-- 1. REMOVE SOCIAL FEATURES
-- =============================================

-- Drop social-related columns from recipes
ALTER TABLE recipe_database DROP COLUMN IF EXISTS visibility;
ALTER TABLE recipe_database DROP COLUMN IF EXISTS likes_count;
ALTER TABLE recipe_database DROP COLUMN IF EXISTS uses_count;

-- Drop social tables
DROP TABLE IF EXISTS recipe_likes CASCADE;
DROP TABLE IF EXISTS recipe_usage CASCADE;
DROP TABLE IF EXISTS user_friends CASCADE;
DROP TABLE IF EXISTS social_challenges CASCADE;

-- Update progress_photos to remove visibility
ALTER TABLE progress_photos DROP COLUMN IF EXISTS visibility;

-- =============================================
-- 2. SIMPLIFY BODY MEASUREMENTS
-- =============================================

-- Drop the complex body_measurements table
DROP TABLE IF EXISTS body_measurements CASCADE;

-- Create simplified version (only essential metrics)
CREATE TABLE IF NOT EXISTS body_measurements_simple (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Essential measurements only
  weight_kg FLOAT NOT NULL,
  body_fat_percentage FLOAT,
  waist_cm FLOAT,
  hips_cm FLOAT,

  -- Calculated metrics
  waist_to_hip_ratio FLOAT GENERATED ALWAYS AS (
    CASE WHEN hips_cm > 0 AND waist_cm > 0 THEN waist_cm / hips_cm ELSE NULL END
  ) STORED,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, measurement_date)
);

CREATE INDEX idx_body_measurements_simple_user_date ON body_measurements_simple(user_id, measurement_date DESC);

-- Enable RLS
ALTER TABLE body_measurements_simple ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own body measurements" ON body_measurements_simple
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 3. ADD MEAL PHOTO SCANNING
-- =============================================

-- Meal photo recognition logs
CREATE TABLE IF NOT EXISTS meal_photo_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  photo_url TEXT NOT NULL,
  photo_storage_path TEXT, -- Storage path in bucket

  -- AI Analysis Results
  detected_foods JSONB DEFAULT '[]'::jsonb, -- AI detected foods with confidence
  estimated_calories INTEGER,
  estimated_protein FLOAT,
  estimated_carbs FLOAT,
  estimated_fats FLOAT,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  ai_model_used TEXT, -- Which AI service was used
  confidence_score FLOAT, -- Overall confidence (0-1)

  -- User verification/editing
  user_verified BOOLEAN DEFAULT FALSE,
  user_edited BOOLEAN DEFAULT FALSE,
  final_calories INTEGER, -- After user edits
  final_protein FLOAT,
  final_carbs FLOAT,
  final_fats FLOAT,

  -- Linked to actual meal log
  nutrition_log_id UUID REFERENCES daily_nutrition_logs(id) ON DELETE SET NULL,

  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meal_photo_logs_user ON meal_photo_logs(user_id, created_at DESC);
CREATE INDEX idx_meal_photo_logs_status ON meal_photo_logs(status);

ALTER TABLE meal_photo_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal photo logs" ON meal_photo_logs
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 4. ADD VOICE LOGGING
-- =============================================

-- Voice meal logs (transcription + parsing)
CREATE TABLE IF NOT EXISTS voice_meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Audio
  audio_url TEXT,
  audio_storage_path TEXT,
  audio_duration_seconds INTEGER,

  -- Transcription
  transcription TEXT,
  transcription_service TEXT, -- Which service was used

  -- Parsed meal data
  parsed_foods JSONB DEFAULT '[]'::jsonb, -- AI parsed food items
  parsed_meal_type TEXT,
  confidence_score FLOAT,

  -- Processing status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'transcribing', 'parsing', 'completed', 'failed')),

  -- User verification
  user_verified BOOLEAN DEFAULT FALSE,
  user_edited BOOLEAN DEFAULT FALSE,

  -- Linked to actual meal log
  nutrition_log_id UUID REFERENCES daily_nutrition_logs(id) ON DELETE SET NULL,

  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_meal_logs_user ON voice_meal_logs(user_id, created_at DESC);
CREATE INDEX idx_voice_meal_logs_status ON voice_meal_logs(status);

ALTER TABLE voice_meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own voice meal logs" ON voice_meal_logs
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 5. UPDATE MEAL ITEMS FOR PHOTO/VOICE SOURCE
-- =============================================

-- Add references to photo/voice logs
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS photo_log_id UUID REFERENCES meal_photo_logs(id) ON DELETE SET NULL;
ALTER TABLE meal_items ADD COLUMN IF NOT EXISTS voice_log_id UUID REFERENCES voice_meal_logs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_meal_items_photo_log ON meal_items(photo_log_id);
CREATE INDEX IF NOT EXISTS idx_meal_items_voice_log ON meal_items(voice_log_id);

-- =============================================
-- 6. CLEANUP UNUSED FUNCTIONS
-- =============================================

-- Drop social-related functions
DROP FUNCTION IF EXISTS update_recipe_likes_count() CASCADE;
DROP FUNCTION IF EXISTS update_recipe_usage_count() CASCADE;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON TABLE meal_photo_logs IS 'AI-powered meal photo recognition with macro estimation';
COMMENT ON TABLE voice_meal_logs IS 'Voice-to-text meal logging with AI parsing';
COMMENT ON TABLE body_measurements_simple IS 'Simplified body measurements (weight, body fat, waist/hip only)';
