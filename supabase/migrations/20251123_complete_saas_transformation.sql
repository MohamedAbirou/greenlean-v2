-- =============================================
-- GreenLean Complete SaaS Transformation
-- Migration: Phase 1 - Foundation
-- Date: 2025-11-23
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- NEW TABLES FOR SAAS TRANSFORMATION
-- =============================================

-- Subscriptions table (Stripe integration)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_price_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Usage metrics table (for feature gating and analytics)
CREATE TABLE IF NOT EXISTS usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, feature, period_start)
);

-- Enhanced notifications table
DROP TABLE IF EXISTS notifications CASCADE;
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('success', 'info', 'warning', 'error', 'achievement', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  icon TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User micro-surveys (for progressive profiling)
CREATE TABLE IF NOT EXISTS user_micro_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  survey_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('nutrition', 'fitness', 'lifestyle', 'health')),
  priority INTEGER DEFAULT 5,
  source TEXT DEFAULT 'micro_survey' CHECK (source IN ('micro_survey', 'inferred', 'explicit')),
  confidence FLOAT DEFAULT 1.0,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profile completeness tracking
CREATE TABLE IF NOT EXISTS user_profile_completeness (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_fields INT DEFAULT 25,
  completed_fields INT DEFAULT 0,
  completeness_percentage FLOAT GENERATED ALWAYS AS (completed_fields::FLOAT / total_fields * 100) STORED,
  personalization_level TEXT GENERATED ALWAYS AS (
    CASE
      WHEN (completed_fields::FLOAT / total_fields * 100) < 30 THEN 'BASIC'
      WHEN (completed_fields::FLOAT / total_fields * 100) < 70 THEN 'STANDARD'
      ELSE 'PREMIUM'
    END
  ) STORED,
  last_triggered_survey TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Food database cache (Nutritionix integration)
CREATE TABLE IF NOT EXISTS food_database (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('nutritionix', 'usda', 'custom')),
  food_name TEXT NOT NULL,
  brand_name TEXT,
  serving_qty FLOAT,
  serving_unit TEXT,
  calories FLOAT,
  protein FLOAT,
  carbs FLOAT,
  fats FLOAT,
  fiber FLOAT,
  sugar FLOAT,
  sodium FLOAT,
  full_nutrients JSONB DEFAULT '{}'::jsonb,
  barcode TEXT,
  photo_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recent foods (for quick logging)
CREATE TABLE IF NOT EXISTS user_recent_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES food_database(id) ON DELETE CASCADE NOT NULL,
  last_logged TIMESTAMPTZ DEFAULT NOW(),
  frequency_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, food_id)
);

-- Meal templates (user-created)
CREATE TABLE IF NOT EXISTS meal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  foods JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_calories FLOAT,
  total_protein FLOAT,
  total_carbs FLOAT,
  total_fats FLOAT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise library (enhanced)
CREATE TABLE IF NOT EXISTS exercise_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'sports')),
  muscle_groups TEXT[] DEFAULT ARRAY[]::TEXT[],
  equipment TEXT[] DEFAULT ARRAY[]::TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  video_url TEXT,
  thumbnail_url TEXT,
  instructions JSONB DEFAULT '[]'::jsonb,
  tips JSONB DEFAULT '[]'::jsonb,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  alternatives JSONB DEFAULT '[]'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User exercise progress (for progressive overload)
CREATE TABLE IF NOT EXISTS user_exercise_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercise_library(id) ON DELETE CASCADE NOT NULL,
  workout_date DATE NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{weight: 100, reps: 10}, ...]
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, exercise_id, workout_date)
);

-- Rewards catalog (real rewards)
CREATE TABLE IF NOT EXISTS rewards_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('discount', 'theme', 'avatar', 'feature', 'physical')),
  points_cost INTEGER NOT NULL,
  tier_requirement TEXT CHECK (tier_requirement IN ('free', 'pro', 'premium')),
  stock_quantity INTEGER, -- NULL = unlimited
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- discount codes, feature flags, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reward redemptions
CREATE TABLE IF NOT EXISTS user_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards_catalog(id) ON DELETE CASCADE NOT NULL,
  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired', 'refunded')),
  redemption_data JSONB DEFAULT '{}'::jsonb, -- coupon code, tracking number, etc.
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User themes (unlockable)
CREATE TABLE IF NOT EXISTS user_themes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  theme_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, theme_id)
);

-- Social features: Friend connections
CREATE TABLE IF NOT EXISTS user_friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Social challenges (between friends)
CREATE TABLE IF NOT EXISTS social_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  participants UUID[] NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  prize_pool INTEGER DEFAULT 0, -- points
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'canceled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress photos (enhanced)
CREATE TABLE IF NOT EXISTS progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  weight_kg FLOAT,
  body_fat_percentage FLOAT,
  notes TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meal reminders
CREATE TABLE IF NOT EXISTS meal_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  reminder_time TIME NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  days_of_week INTEGER[] DEFAULT ARRAY[1,2,3,4,5,6,7], -- 1=Monday, 7=Sunday
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);

-- Usage metrics indexes
CREATE INDEX idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX idx_usage_metrics_feature ON usage_metrics(feature);
CREATE INDEX idx_usage_metrics_period ON usage_metrics(period_start, period_end);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Micro-surveys indexes
CREATE INDEX idx_user_micro_surveys_user_id ON user_micro_surveys(user_id);
CREATE INDEX idx_user_micro_surveys_category ON user_micro_surveys(category);
CREATE INDEX idx_user_micro_surveys_survey_id ON user_micro_surveys(survey_id);

-- Food database indexes
CREATE INDEX idx_food_database_external_id ON food_database(external_id);
CREATE INDEX idx_food_database_barcode ON food_database(barcode);
CREATE INDEX idx_food_database_food_name ON food_database(food_name);
CREATE INDEX idx_food_database_source ON food_database(source);

-- Recent foods indexes
CREATE INDEX idx_user_recent_foods_user_id ON user_recent_foods(user_id);
CREATE INDEX idx_user_recent_foods_last_logged ON user_recent_foods(last_logged DESC);

-- Exercise library indexes
CREATE INDEX idx_exercise_library_category ON exercise_library(category);
CREATE INDEX idx_exercise_library_difficulty ON exercise_library(difficulty);

-- User exercise progress indexes
CREATE INDEX idx_user_exercise_progress_user_id ON user_exercise_progress(user_id);
CREATE INDEX idx_user_exercise_progress_workout_date ON user_exercise_progress(workout_date);

-- Rewards indexes
CREATE INDEX idx_rewards_catalog_type ON rewards_catalog(type);
CREATE INDEX idx_rewards_catalog_is_active ON rewards_catalog(is_active);
CREATE INDEX idx_user_reward_redemptions_user_id ON user_reward_redemptions(user_id);
CREATE INDEX idx_user_reward_redemptions_status ON user_reward_redemptions(status);

-- Social indexes
CREATE INDEX idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX idx_user_friends_status ON user_friends(status);
CREATE INDEX idx_social_challenges_status ON social_challenges(status);

-- Progress photos indexes
CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_taken_at ON progress_photos(taken_at DESC);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_completed INT := 0;
BEGIN
  -- Count non-null important fields in profiles table
  SELECT COUNT(*) INTO v_completed
  FROM (
    SELECT
      CASE WHEN age IS NOT NULL THEN 1 END,
      CASE WHEN gender IS NOT NULL THEN 1 END,
      CASE WHEN height_cm IS NOT NULL THEN 1 END,
      CASE WHEN weight_kg IS NOT NULL THEN 1 END,
      CASE WHEN country IS NOT NULL THEN 1 END,
      CASE WHEN activity_level IS NOT NULL THEN 1 END
    FROM profiles
    WHERE id = p_user_id
  ) AS counts;

  -- Count answered micro-surveys
  v_completed := v_completed + (
    SELECT COUNT(DISTINCT survey_id)
    FROM user_micro_surveys
    WHERE user_id = p_user_id
  );

  -- Update completeness table
  INSERT INTO user_profile_completeness (user_id, completed_fields)
  VALUES (p_user_id, v_completed)
  ON CONFLICT (user_id)
  DO UPDATE SET
    completed_fields = v_completed,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Track usage metrics
CREATE OR REPLACE FUNCTION track_usage(
  p_user_id UUID,
  p_feature TEXT,
  p_increment INT DEFAULT 1
)
RETURNS VOID AS $$
DECLARE
  v_period_start TIMESTAMPTZ;
  v_period_end TIMESTAMPTZ;
BEGIN
  -- Get current monthly period
  v_period_start := DATE_TRUNC('month', NOW());
  v_period_end := v_period_start + INTERVAL '1 month';

  -- Insert or update usage
  INSERT INTO usage_metrics (user_id, feature, period_start, period_end, usage_count)
  VALUES (p_user_id, p_feature, v_period_start, v_period_end, p_increment)
  ON CONFLICT (user_id, feature, period_start)
  DO UPDATE SET
    usage_count = usage_metrics.usage_count + p_increment,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check usage limit
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_feature TEXT,
  p_limit INT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_usage INT;
  v_period_start TIMESTAMPTZ;
BEGIN
  v_period_start := DATE_TRUNC('month', NOW());

  SELECT COALESCE(usage_count, 0) INTO v_usage
  FROM usage_metrics
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND period_start = v_period_start;

  RETURN v_usage < p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps on changes
DROP TRIGGER IF EXISTS update_subscriptions_timestamp ON subscriptions;
CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_usage_metrics_timestamp ON usage_metrics;
CREATE TRIGGER update_usage_metrics_timestamp
  BEFORE UPDATE ON usage_metrics
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_food_database_timestamp ON food_database;
CREATE TRIGGER update_food_database_timestamp
  BEFORE UPDATE ON food_database
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_meal_templates_timestamp ON meal_templates;
CREATE TRIGGER update_meal_templates_timestamp
  BEFORE UPDATE ON meal_templates
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_exercise_library_timestamp ON exercise_library;
CREATE TRIGGER update_exercise_library_timestamp
  BEFORE UPDATE ON exercise_library
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_micro_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_completeness ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recent_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_reminders ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Usage metrics policies
CREATE POLICY "Users can view own usage" ON usage_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to usage_metrics" ON usage_metrics
  FOR ALL USING (auth.role() = 'service_role');

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Micro-surveys policies
CREATE POLICY "Users can manage own surveys" ON user_micro_surveys
  FOR ALL USING (auth.uid() = user_id);

-- Profile completeness policies
CREATE POLICY "Users can view own completeness" ON user_profile_completeness
  FOR SELECT USING (auth.uid() = user_id);

-- Food database policies (public read)
CREATE POLICY "Anyone can view food database" ON food_database
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage food database" ON food_database
  FOR ALL USING (is_admin(auth.uid()));

-- Recent foods policies
CREATE POLICY "Users can manage own recent foods" ON user_recent_foods
  FOR ALL USING (auth.uid() = user_id);

-- Meal templates policies
CREATE POLICY "Users can manage own meal templates" ON meal_templates
  FOR ALL USING (auth.uid() = user_id);

-- Exercise library policies (public read)
CREATE POLICY "Anyone can view exercise library" ON exercise_library
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exercise library" ON exercise_library
  FOR ALL USING (is_admin(auth.uid()));

-- Exercise progress policies
CREATE POLICY "Users can manage own exercise progress" ON user_exercise_progress
  FOR ALL USING (auth.uid() = user_id);

-- Rewards catalog policies (public read)
CREATE POLICY "Anyone can view rewards catalog" ON rewards_catalog
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage rewards catalog" ON rewards_catalog
  FOR ALL USING (is_admin(auth.uid()));

-- Reward redemptions policies
CREATE POLICY "Users can view own redemptions" ON user_reward_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions" ON user_reward_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User themes policies
CREATE POLICY "Users can manage own themes" ON user_themes
  FOR ALL USING (auth.uid() = user_id);

-- Friends policies
CREATE POLICY "Users can manage own friends" ON user_friends
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Social challenges policies
CREATE POLICY "Participants can view social challenges" ON social_challenges
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() = ANY(participants));

CREATE POLICY "Creator can manage social challenges" ON social_challenges
  FOR ALL USING (auth.uid() = created_by);

-- Progress photos policies
CREATE POLICY "Users can manage own progress photos" ON progress_photos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Friends can view friend photos" ON progress_photos
  FOR SELECT USING (
    visibility = 'public' OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM user_friends
      WHERE (user_id = auth.uid() AND friend_id = progress_photos.user_id AND status = 'accepted')
         OR (friend_id = auth.uid() AND user_id = progress_photos.user_id AND status = 'accepted')
    ))
  );

-- Meal reminders policies
CREATE POLICY "Users can manage own meal reminders" ON meal_reminders
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert some basic exercises
INSERT INTO exercise_library (name, description, category, muscle_groups, equipment, difficulty, instructions) VALUES
  ('Push-ups', 'Classic bodyweight chest exercise', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['none'], 'beginner', '["Start in plank position", "Lower body to ground", "Push back up"]'::jsonb),
  ('Squats', 'Fundamental lower body exercise', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['none'], 'beginner', '["Stand with feet shoulder-width apart", "Lower hips back and down", "Return to standing"]'::jsonb),
  ('Running', 'Cardiovascular endurance exercise', 'cardio', ARRAY['legs', 'core'], ARRAY['none'], 'beginner', '["Start at comfortable pace", "Maintain steady breathing", "Cool down with walking"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert basic rewards
INSERT INTO rewards_catalog (name, description, type, points_cost, tier_requirement) VALUES
  ('Dark Mode Theme', 'Unlock premium dark mode theme', 'theme', 100, 'free'),
  ('Ocean Theme', 'Beautiful ocean-inspired theme', 'theme', 250, 'free'),
  ('10% Discount Code', 'Get 10% off your next subscription', 'discount', 500, 'free'),
  ('Custom Avatar Frames', 'Exclusive avatar frame collection', 'avatar', 300, 'pro'),
  ('AI Consultation', '15-minute AI-powered nutrition consultation', 'feature', 1000, 'premium')
ON CONFLICT DO NOTHING;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
