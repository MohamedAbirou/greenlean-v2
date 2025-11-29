-- =============================================
-- GreenLean Production Database Schema
-- Complete SaaS Transformation - Final Migration
-- Date: 2025-11-23
-- =============================================

-- This is a clean-slate migration for a fresh Supabase project
-- Combines the best of the old schema with new SaaS features

-- =============================================
-- EXTENSIONS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CORE TABLES
-- =============================================

-- =============================================
-- 1. USERS & AUTHENTICATION
-- =============================================

-- Profiles table (core user data)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  username TEXT UNIQUE,
  avatar_url TEXT,

  -- Basic Info
  age INTEGER,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),

  -- Physical Measurements
  height_cm FLOAT,
  weight_kg FLOAT,
  target_weight_kg FLOAT,

  -- Preferences
  unit_system TEXT DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  occupation_activity TEXT,

  -- Onboarding
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. SUBSCRIPTIONS & BILLING (Stripe)
-- =============================================

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Subscription Details
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'premium')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired', 'unpaid')),

  -- Stripe IDs
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Billing Periods
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage limits per tier (for feature gating)
CREATE TABLE subscription_tiers (
  tier TEXT PRIMARY KEY CHECK (tier IN ('free', 'pro', 'premium')),
  name TEXT NOT NULL,
  price_monthly_cents INTEGER,
  price_yearly_cents INTEGER,

  -- Limits
  ai_generations_per_month INTEGER NOT NULL,
  meal_plans_storage_limit INTEGER, -- NULL = unlimited
  workout_plans_storage_limit INTEGER, -- NULL = unlimited
  can_access_barcode_scanner BOOLEAN DEFAULT FALSE,
  can_access_social_features BOOLEAN DEFAULT FALSE,
  can_unlock_themes BOOLEAN DEFAULT FALSE,
  priority_support BOOLEAN DEFAULT FALSE,

  -- Features
  features JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (for analytics and feature gating)
CREATE TABLE usage_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  feature TEXT NOT NULL, -- e.g., 'ai_meal_plan', 'ai_workout_plan', 'barcode_scan'
  usage_count INTEGER DEFAULT 0,

  -- Period (monthly reset)
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,

  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, feature, period_start)
);

-- =============================================
-- 3. ONBOARDING & PROFILE COMPLETION
-- =============================================

-- Quiz results (historical health assessment data)
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  answers JSONB NOT NULL, -- All quiz answers
  calculations JSONB, -- BMI, BMR, TDEE, macros, etc.

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Micro-surveys for progressive profiling
CREATE TABLE user_micro_surveys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  survey_id TEXT NOT NULL, -- e.g., 'dietary_restrictions', 'cooking_time'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,

  category TEXT NOT NULL CHECK (category IN ('nutrition', 'fitness', 'lifestyle', 'health')),
  priority INTEGER DEFAULT 5, -- Higher = ask sooner
  source TEXT DEFAULT 'micro_survey' CHECK (source IN ('micro_survey', 'inferred', 'explicit')),
  confidence FLOAT DEFAULT 1.0, -- 0.0 to 1.0 for ML-inferred answers

  answered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile completeness tracking
CREATE TABLE user_profile_completeness (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  total_fields INTEGER DEFAULT 25,
  completed_fields INTEGER DEFAULT 0,
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

-- =============================================
-- 4. AI-GENERATED PLANS
-- =============================================

-- AI Meal Plans
CREATE TABLE ai_meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_result_id UUID REFERENCES quiz_results(id) ON DELETE SET NULL,

  plan_data JSONB NOT NULL, -- Full meal plan JSON

  -- Nutrition targets
  daily_calories INTEGER,
  daily_protein FLOAT,
  daily_carbs FLOAT,
  daily_fats FLOAT,

  preferences TEXT,
  restrictions TEXT,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('generating', 'active', 'completed', 'archived', 'failed')),
  is_active BOOLEAN DEFAULT TRUE, -- Only one active plan per user
  error_message TEXT,

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Workout Plans
CREATE TABLE ai_workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  quiz_result_id UUID REFERENCES quiz_results(id) ON DELETE SET NULL,

  plan_data JSONB NOT NULL, -- Full workout plan JSON

  workout_type TEXT NOT NULL,
  duration_per_session TEXT,
  frequency_per_week INTEGER,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('generating', 'active', 'completed', 'archived', 'failed')),
  is_active BOOLEAN DEFAULT TRUE,
  error_message TEXT,

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. NUTRITION TRACKING
-- =============================================

-- Food database (cache from Nutritionix API)
CREATE TABLE food_database (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- External IDs
  external_id TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('nutritionix', 'usda', 'custom', 'user_created')),

  -- Basic Info
  food_name TEXT NOT NULL,
  brand_name TEXT,

  -- Serving
  serving_qty FLOAT,
  serving_unit TEXT,

  -- Macros
  calories FLOAT,
  protein FLOAT,
  carbs FLOAT,
  fats FLOAT,
  fiber FLOAT,
  sugar FLOAT,
  sodium FLOAT,

  -- Full nutrients from API
  full_nutrients JSONB DEFAULT '{}'::jsonb,

  -- Media
  barcode TEXT,
  photo_url TEXT,
  thumbnail_url TEXT,

  verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily nutrition logs
CREATE TABLE daily_nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),

  food_items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {food_id, qty, unit}

  -- Totals (denormalized for performance)
  total_calories FLOAT DEFAULT 0,
  total_protein FLOAT DEFAULT 0,
  total_carbs FLOAT DEFAULT 0,
  total_fats FLOAT DEFAULT 0,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User recent foods (for quick logging)
CREATE TABLE user_recent_foods (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES food_database(id) ON DELETE CASCADE NOT NULL,

  last_logged TIMESTAMPTZ DEFAULT NOW(),
  frequency_count INTEGER DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, food_id)
);

-- Meal templates (user-created combos)
CREATE TABLE meal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),

  foods JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{food_id, qty, unit}, ...]

  -- Totals
  total_calories FLOAT,
  total_protein FLOAT,
  total_carbs FLOAT,
  total_fats FLOAT,

  is_favorite BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water intake tracking
CREATE TABLE daily_water_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  glasses INTEGER DEFAULT 0,
  total_ml INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, log_date)
);

-- =============================================
-- 6. WORKOUT TRACKING
-- =============================================

-- Exercise library
CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  description TEXT,

  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'sports', 'other')),
  muscle_groups TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['chest', 'triceps', 'shoulders']
  equipment TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['barbell', 'bench']
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),

  -- Media
  video_url TEXT,
  thumbnail_url TEXT,

  -- Instructions
  instructions JSONB DEFAULT '[]'::jsonb, -- ["Step 1", "Step 2", ...]
  tips JSONB DEFAULT '[]'::jsonb,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  alternatives JSONB DEFAULT '[]'::jsonb, -- Alternative exercise IDs

  verified BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout logs
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_type TEXT NOT NULL,

  exercises JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{exercise_id, sets: [{weight, reps}]}]

  duration_minutes INTEGER,
  calories_burned INTEGER,
  notes TEXT,
  completed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User exercise progress (for progressive overload tracking)
CREATE TABLE user_exercise_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercise_library(id) ON DELETE CASCADE NOT NULL,

  workout_date DATE NOT NULL,
  sets JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{weight: 100, reps: 10, rpe: 8}, ...]

  -- Auto-calculated PRs
  max_weight FLOAT,
  max_reps INTEGER,
  max_volume FLOAT, -- weight * reps * sets

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, exercise_id, workout_date)
);

-- =============================================
-- 7. GAMIFICATION & REWARDS
-- =============================================

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,

  -- Requirements to unlock
  requirement_type TEXT CHECK (requirement_type IN ('streak', 'total_workouts', 'total_meals', 'weight_loss', 'challenge_completion')),
  requirement_value INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout', 'nutrition', 'hybrid', 'social')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),

  points INTEGER NOT NULL, -- Points awarded on completion
  badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,

  requirements JSONB NOT NULL, -- {type: 'log_meals', target: 7, unit: 'days'}

  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge participation
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  progress JSONB DEFAULT '{"current": 0, "target": 0}'::jsonb,
  completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMPTZ,

  -- Streaks
  streak_count INTEGER DEFAULT 0,
  last_progress_date TIMESTAMPTZ,
  streak_expires_at TIMESTAMPTZ,
  streak_warning_sent BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(challenge_id, user_id)
);

-- User rewards
CREATE TABLE user_rewards (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0, -- Never decreases
  badges JSONB DEFAULT '[]'::jsonb, -- Array of badge IDs

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards catalog
CREATE TABLE rewards_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('discount', 'theme', 'avatar', 'feature_unlock', 'physical_item')),

  points_cost INTEGER NOT NULL,
  tier_requirement TEXT CHECK (tier_requirement IN ('free', 'pro', 'premium')),

  stock_quantity INTEGER, -- NULL = unlimited
  is_active BOOLEAN DEFAULT TRUE,

  image_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- {discount_code, feature_flag, etc.}

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reward redemptions
CREATE TABLE user_reward_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards_catalog(id) ON DELETE CASCADE NOT NULL,

  points_spent INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired', 'refunded')),

  redemption_data JSONB DEFAULT '{}'::jsonb, -- Coupon code, tracking number, etc.

  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User unlocked themes
CREATE TABLE user_themes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  theme_id TEXT NOT NULL, -- 'ocean', 'dark_pro', 'forest', etc.

  unlocked_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (user_id, theme_id)
);

-- =============================================
-- 8. SOCIAL FEATURES
-- =============================================

-- Friend connections
CREATE TABLE user_friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked', 'declined')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,

  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Social challenges (between friends)
CREATE TABLE social_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  participants UUID[] NOT NULL, -- Array of user IDs

  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,

  prize_pool INTEGER DEFAULT 0, -- Points to winner(s)
  winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'completed', 'canceled')),
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress photos
CREATE TABLE progress_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  photo_url TEXT NOT NULL,

  weight_kg FLOAT,
  body_fat_percentage FLOAT,
  notes TEXT,

  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),

  taken_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 9. NOTIFICATIONS & REMINDERS
-- =============================================

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  type TEXT NOT NULL CHECK (type IN ('success', 'info', 'warning', 'error', 'achievement', 'reminder', 'social')),
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

-- Meal reminders
CREATE TABLE meal_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

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

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Usage metrics
CREATE INDEX idx_usage_metrics_user_id ON usage_metrics(user_id);
CREATE INDEX idx_usage_metrics_feature ON usage_metrics(feature);
CREATE INDEX idx_usage_metrics_period ON usage_metrics(period_start, period_end);

-- Quiz results
CREATE INDEX idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX idx_quiz_results_created_at ON quiz_results(created_at DESC);

-- Micro-surveys
CREATE INDEX idx_user_micro_surveys_user_id ON user_micro_surveys(user_id);
CREATE INDEX idx_user_micro_surveys_category ON user_micro_surveys(category);

-- AI Plans
CREATE INDEX idx_ai_meal_plans_user_id ON ai_meal_plans(user_id);
CREATE INDEX idx_ai_meal_plans_is_active ON ai_meal_plans(is_active);
CREATE INDEX idx_ai_meal_plans_status ON ai_meal_plans(status);

CREATE INDEX idx_ai_workout_plans_user_id ON ai_workout_plans(user_id);
CREATE INDEX idx_ai_workout_plans_is_active ON ai_workout_plans(is_active);
CREATE INDEX idx_ai_workout_plans_status ON ai_workout_plans(status);

-- Food database
CREATE INDEX idx_food_database_external_id ON food_database(external_id);
CREATE INDEX idx_food_database_barcode ON food_database(barcode);
CREATE INDEX idx_food_database_food_name ON food_database USING gin(to_tsvector('english', food_name));

-- Nutrition logs
CREATE INDEX idx_daily_nutrition_logs_user_id ON daily_nutrition_logs(user_id);
CREATE INDEX idx_daily_nutrition_logs_date ON daily_nutrition_logs(log_date DESC);

CREATE INDEX idx_user_recent_foods_user_id ON user_recent_foods(user_id);
CREATE INDEX idx_user_recent_foods_last_logged ON user_recent_foods(last_logged DESC);

CREATE INDEX idx_meal_templates_user_id ON meal_templates(user_id);

CREATE INDEX idx_daily_water_intake_user_id ON daily_water_intake(user_id);
CREATE INDEX idx_daily_water_intake_date ON daily_water_intake(log_date DESC);

-- Exercise
CREATE INDEX idx_exercise_library_category ON exercise_library(category);
CREATE INDEX idx_exercise_library_difficulty ON exercise_library(difficulty);

CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(workout_date DESC);

CREATE INDEX idx_user_exercise_progress_user_id ON user_exercise_progress(user_id);
CREATE INDEX idx_user_exercise_progress_exercise_id ON user_exercise_progress(exercise_id);

-- Gamification
CREATE INDEX idx_challenges_is_active ON challenges(is_active);
CREATE INDEX idx_challenges_type ON challenges(type);

CREATE INDEX idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_completed ON challenge_participants(completed);

CREATE INDEX idx_rewards_catalog_type ON rewards_catalog(type);
CREATE INDEX idx_rewards_catalog_is_active ON rewards_catalog(is_active);

CREATE INDEX idx_user_reward_redemptions_user_id ON user_reward_redemptions(user_id);
CREATE INDEX idx_user_reward_redemptions_status ON user_reward_redemptions(status);

-- Social
CREATE INDEX idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX idx_user_friends_status ON user_friends(status);

CREATE INDEX idx_social_challenges_created_by ON social_challenges(created_by);
CREATE INDEX idx_social_challenges_status ON social_challenges(status);

CREATE INDEX idx_progress_photos_user_id ON progress_photos(user_id);
CREATE INDEX idx_progress_photos_taken_at ON progress_photos(taken_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_meal_reminders_user_id ON meal_reminders(user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_completed INT := 0;
BEGIN
  -- Count non-null basic profile fields
  SELECT
    CASE WHEN age IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN gender IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN height_cm IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN weight_kg IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN target_weight_kg IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN country IS NOT NULL THEN 1 ELSE 0 END +
    CASE WHEN occupation_activity IS NOT NULL THEN 1 ELSE 0 END
  INTO v_completed
  FROM profiles
  WHERE id = p_user_id;

  -- Add answered micro-surveys
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

-- Track usage
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

-- Check if user can use feature (feature gating)
CREATE OR REPLACE FUNCTION can_use_feature(
  p_user_id UUID,
  p_feature TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_usage INTEGER;
  v_period_start TIMESTAMPTZ;
BEGIN
  -- Get user tier
  SELECT tier INTO v_tier
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- If no subscription, assume free
  v_tier := COALESCE(v_tier, 'free');

  -- Get feature limit for tier
  CASE p_feature
    WHEN 'ai_meal_plan', 'ai_workout_plan' THEN
      SELECT ai_generations_per_month INTO v_limit
      FROM subscription_tiers
      WHERE tier = v_tier;
    WHEN 'barcode_scanner' THEN
      SELECT can_access_barcode_scanner INTO v_limit
      FROM subscription_tiers
      WHERE tier = v_tier;
      RETURN v_limit::BOOLEAN;
    WHEN 'social_features' THEN
      SELECT can_access_social_features INTO v_limit
      FROM subscription_tiers
      WHERE tier = v_tier;
      RETURN v_limit::BOOLEAN;
    ELSE
      RETURN TRUE; -- Unknown features are allowed by default
  END CASE;

  -- Get current usage
  v_period_start := DATE_TRUNC('month', NOW());

  SELECT COALESCE(usage_count, 0) INTO v_usage
  FROM usage_metrics
  WHERE user_id = p_user_id
    AND feature = p_feature
    AND period_start = v_period_start;

  RETURN v_usage < v_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Deactivate old meal plans when new one is created
CREATE OR REPLACE FUNCTION deactivate_old_meal_plans()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    UPDATE ai_meal_plans
    SET is_active = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Deactivate old workout plans when new one is created
CREATE OR REPLACE FUNCTION deactivate_old_workout_plans()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    UPDATE ai_workout_plans
    SET is_active = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Initialize user rewards on profile creation
CREATE OR REPLACE FUNCTION initialize_user_rewards()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_rewards (user_id, points, lifetime_points, badges)
  VALUES (NEW.id, 0, 0, '[]'::jsonb)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award points and update rewards
CREATE OR REPLACE FUNCTION award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE user_rewards
  SET
    points = points + p_points,
    lifetime_points = lifetime_points + p_points,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (
    p_user_id,
    'achievement',
    'Points Earned!',
    format('You earned %s points%s', p_points, COALESCE(' for ' || p_reason, '!'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps
CREATE TRIGGER update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_subscriptions_timestamp
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_ai_meal_plans_timestamp
  BEFORE UPDATE ON ai_meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_ai_workout_plans_timestamp
  BEFORE UPDATE ON ai_workout_plans
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_food_database_timestamp
  BEFORE UPDATE ON food_database
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_meal_templates_timestamp
  BEFORE UPDATE ON meal_templates
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_daily_water_intake_timestamp
  BEFORE UPDATE ON daily_water_intake
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_exercise_library_timestamp
  BEFORE UPDATE ON exercise_library
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_challenges_timestamp
  BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_rewards_catalog_timestamp
  BEFORE UPDATE ON rewards_catalog
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_user_rewards_timestamp
  BEFORE UPDATE ON user_rewards
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_meal_reminders_timestamp
  BEFORE UPDATE ON meal_reminders
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Deactivate old plans
CREATE TRIGGER trigger_deactivate_old_meal_plans
  BEFORE INSERT OR UPDATE ON ai_meal_plans
  FOR EACH ROW EXECUTE FUNCTION deactivate_old_meal_plans();

CREATE TRIGGER trigger_deactivate_old_workout_plans
  BEFORE INSERT OR UPDATE ON ai_workout_plans
  FOR EACH ROW EXECUTE FUNCTION deactivate_old_workout_plans();

-- Initialize rewards on profile creation
CREATE TRIGGER trigger_initialize_user_rewards
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION initialize_user_rewards();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_micro_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_completeness ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recent_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_water_intake ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_reminders ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can create profile on signup" ON profiles
  FOR INSERT WITH CHECK (true);

-- Subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Subscription tiers (public read)
CREATE POLICY "Anyone can view subscription tiers" ON subscription_tiers
  FOR SELECT USING (true);

-- Usage metrics
CREATE POLICY "Users can view own usage" ON usage_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access" ON usage_metrics
  FOR ALL USING (auth.role() = 'service_role');

-- Quiz results
CREATE POLICY "Users can manage own quiz results" ON quiz_results
  FOR ALL USING (auth.uid() = user_id);

-- Micro-surveys
CREATE POLICY "Users can manage own surveys" ON user_micro_surveys
  FOR ALL USING (auth.uid() = user_id);

-- Profile completeness
CREATE POLICY "Users can view own completeness" ON user_profile_completeness
  FOR SELECT USING (auth.uid() = user_id);

-- AI Plans
CREATE POLICY "Users can manage own meal plans" ON ai_meal_plans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout plans" ON ai_workout_plans
  FOR ALL USING (auth.uid() = user_id);

-- Food database (public read, service role write)
CREATE POLICY "Anyone can view food database" ON food_database
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage food database" ON food_database
  FOR ALL USING (auth.role() = 'service_role');

-- Nutrition tracking
CREATE POLICY "Users can manage own nutrition logs" ON daily_nutrition_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recent foods" ON user_recent_foods
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own meal templates" ON meal_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own water intake" ON daily_water_intake
  FOR ALL USING (auth.uid() = user_id);

-- Exercise library (public read)
CREATE POLICY "Anyone can view exercise library" ON exercise_library
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage exercise library" ON exercise_library
  FOR ALL USING (auth.role() = 'service_role');

-- Workout tracking
CREATE POLICY "Users can manage own workout logs" ON workout_logs
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercise progress" ON user_exercise_progress
  FOR ALL USING (auth.uid() = user_id);

-- Gamification (public read for discovery)
CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view active challenges" ON challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can manage own challenge participation" ON challenge_participants
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rewards" ON user_rewards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rewards" ON user_rewards
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can view active rewards" ON rewards_catalog
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own redemptions" ON user_reward_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create redemptions" ON user_reward_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own themes" ON user_themes
  FOR ALL USING (auth.uid() = user_id);

-- Social features
CREATE POLICY "Users can manage own friendships" ON user_friends
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Participants can view social challenges" ON social_challenges
  FOR SELECT USING (auth.uid() = created_by OR auth.uid() = ANY(participants));

CREATE POLICY "Creator can manage social challenges" ON social_challenges
  FOR ALL USING (auth.uid() = created_by);

CREATE POLICY "Users can manage own progress photos" ON progress_photos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public photos are visible" ON progress_photos
  FOR SELECT USING (
    visibility = 'public' OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM user_friends
      WHERE (user_id = auth.uid() AND friend_id = progress_photos.user_id AND status = 'accepted')
         OR (friend_id = auth.uid() AND user_id = progress_photos.user_id AND status = 'accepted')
    ))
  );

-- Notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Meal reminders
CREATE POLICY "Users can manage own meal reminders" ON meal_reminders
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- INITIAL DATA
-- =============================================

-- Subscription tiers
INSERT INTO subscription_tiers (tier, name, price_monthly_cents, price_yearly_cents, ai_generations_per_month, can_access_barcode_scanner, can_access_social_features, can_unlock_themes, priority_support, features) VALUES
  ('free', 'Free', 0, 0, 2, FALSE, FALSE, FALSE, FALSE, '["Basic meal plans", "Basic workout plans", "Progress tracking"]'::jsonb),
  ('pro', 'Pro', 999, 9990, 50, TRUE, TRUE, TRUE, FALSE, '["Unlimited meal plans", "Unlimited workout plans", "Barcode scanner", "Social features", "Unlockable themes", "Advanced analytics"]'::jsonb),
  ('premium', 'Premium', 1999, 19990, 200, TRUE, TRUE, TRUE, TRUE, '["Everything in Pro", "Priority AI generation", "Priority support", "Exclusive challenges", "Premium themes", "Early access to features"]'::jsonb)
ON CONFLICT (tier) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly_cents = EXCLUDED.price_monthly_cents,
  price_yearly_cents = EXCLUDED.price_yearly_cents,
  ai_generations_per_month = EXCLUDED.ai_generations_per_month,
  features = EXCLUDED.features;

-- Basic badges
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value) VALUES
  ('First Steps', 'Complete your first workout', '🏃', '#10B981', 'total_workouts', 1),
  ('Nutrition Pro', 'Log meals for 7 consecutive days', '🥗', '#F97316', 'streak', 7),
  ('Challenge Champion', 'Complete 5 challenges', '🏆', '#EF4444', 'challenge_completion', 5),
  ('Water Warrior', 'Meet water goals for 14 days', '💧', '#3B82F6', 'streak', 14),
  ('Consistency King', 'Complete 30 workouts', '👑', '#F59E0B', 'total_workouts', 30)
ON CONFLICT DO NOTHING;

-- Sample exercises
INSERT INTO exercise_library (name, description, category, muscle_groups, equipment, difficulty, instructions, tips) VALUES
  ('Push-ups', 'Classic bodyweight chest exercise', 'strength', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['bodyweight'], 'beginner', '["Start in plank position with hands shoulder-width apart", "Lower your body until chest nearly touches floor", "Push back up to starting position", "Keep core engaged throughout"]'::jsonb, '["Keep elbows at 45-degree angle", "Don''t let hips sag", "Breathe in on the way down, out on the way up"]'::jsonb),
  ('Squats', 'Fundamental lower body exercise', 'strength', ARRAY['quads', 'glutes', 'hamstrings'], ARRAY['bodyweight'], 'beginner', '["Stand with feet shoulder-width apart", "Lower hips back and down as if sitting in a chair", "Keep chest up and knees tracking over toes", "Return to standing by driving through heels"]'::jsonb, '["Keep weight in heels", "Don''t let knees cave inward", "Go as low as comfortable with good form"]'::jsonb),
  ('Running', 'Cardiovascular endurance exercise', 'cardio', ARRAY['legs', 'core'], ARRAY['none'], 'beginner', '["Start at a comfortable pace", "Maintain steady breathing rhythm", "Land midfoot, not on heels", "Cool down with 5-minute walk"]'::jsonb, '["Build distance gradually", "Invest in proper running shoes", "Stay hydrated"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Sample challenges
INSERT INTO challenges (title, description, type, difficulty, points, requirements) VALUES
  ('7-Day Meal Log', 'Log all your meals for 7 consecutive days', 'nutrition', 'easy', 100, '{"type": "log_meals", "target": 7, "unit": "days"}'::jsonb),
  ('Workout Warrior', 'Complete 10 workouts this month', 'workout', 'medium', 250, '{"type": "complete_workouts", "target": 10, "unit": "workouts"}'::jsonb),
  ('Hydration Hero', 'Drink 8 glasses of water daily for 14 days', 'nutrition', 'medium', 200, '{"type": "water_intake", "target": 8, "unit": "glasses", "duration": 14}'::jsonb)
ON CONFLICT DO NOTHING;

-- Sample rewards
INSERT INTO rewards_catalog (name, description, type, points_cost, tier_requirement, metadata) VALUES
  ('Ocean Theme', 'Beautiful ocean-inspired color theme', 'theme', 250, 'free', '{"theme_id": "ocean"}'::jsonb),
  ('Forest Theme', 'Calming forest green theme', 'theme', 250, 'free', '{"theme_id": "forest"}'::jsonb),
  ('10% Discount', 'Get 10% off your next subscription upgrade', 'discount', 500, 'free', '{"discount_percent": 10, "valid_days": 30}'::jsonb),
  ('Premium Avatar Frames', 'Exclusive avatar frame collection', 'avatar', 300, 'pro', '{"frames": ["gold", "platinum", "diamond"]}'::jsonb),
  ('AI Nutrition Consultation', '15-minute AI-powered consultation', 'feature_unlock', 1000, 'premium', '{"feature": "ai_consultation"}'::jsonb)
ON CONFLICT DO NOTHING;

-- =============================================
-- VIEWS (for convenience)
-- =============================================

-- User dashboard summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT
  p.id AS user_id,
  p.full_name,
  p.email,
  s.tier AS subscription_tier,
  ur.points,
  ur.lifetime_points,
  (SELECT COUNT(*) FROM ai_meal_plans WHERE user_id = p.id AND is_active = TRUE) AS active_meal_plans,
  (SELECT COUNT(*) FROM ai_workout_plans WHERE user_id = p.id AND is_active = TRUE) AS active_workout_plans,
  (SELECT COUNT(*) FROM challenge_participants WHERE user_id = p.id AND completed = TRUE) AS completed_challenges,
  (SELECT COUNT(*) FROM workout_logs WHERE user_id = p.id AND workout_date >= CURRENT_DATE - INTERVAL '30 days') AS workouts_last_30_days,
  (SELECT COUNT(DISTINCT log_date) FROM daily_nutrition_logs WHERE user_id = p.id AND log_date >= CURRENT_DATE - INTERVAL '30 days') AS meal_logs_last_30_days
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
LEFT JOIN user_rewards ur ON ur.user_id = p.id;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Add a comment to track migration version
COMMENT ON SCHEMA public IS 'GreenLean Production Schema v1.0 - Complete SaaS Transformation';
