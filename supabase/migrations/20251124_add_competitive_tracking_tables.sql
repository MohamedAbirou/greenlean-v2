-- =============================================
-- Competitive Feature Enhancement
-- Add missing tables for MyFitnessPal/MacroFactor parity
-- Date: 2025-11-24
-- =============================================

-- =============================================
-- 1. WEIGHT & BODY TRACKING
-- =============================================

-- Weight history (dedicated table for trends/charts)
CREATE TABLE IF NOT EXISTS weight_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  weight_kg FLOAT NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Context
  measurement_time TIME,
  notes TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'scale_sync', 'photo_import')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, log_date)
);

-- Body measurements (arms, waist, chest, etc.)
CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  log_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Measurements in cm
  neck_cm FLOAT,
  shoulders_cm FLOAT,
  chest_cm FLOAT,
  waist_cm FLOAT,
  hips_cm FLOAT,
  left_arm_cm FLOAT,
  right_arm_cm FLOAT,
  left_thigh_cm FLOAT,
  right_thigh_cm FLOAT,
  left_calf_cm FLOAT,
  right_calf_cm FLOAT,

  -- Body composition
  body_fat_percentage FLOAT,
  muscle_mass_kg FLOAT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, log_date)
);

-- =============================================
-- 2. GAMIFICATION & STREAKS
-- =============================================

-- Streak tracking (logging consistency)
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  streak_type TEXT NOT NULL CHECK (streak_type IN ('nutrition_logging', 'workout_logging', 'daily_weigh_in', 'water_goal')),

  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,

  last_logged_date DATE,
  streak_start_date DATE,

  -- Milestones
  total_days_logged INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, streak_type)
);

-- User badges/achievements (earned)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,

  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress INTEGER DEFAULT 0, -- Progress towards next level

  -- Notification
  notification_sent BOOLEAN DEFAULT FALSE,
  viewed BOOLEAN DEFAULT FALSE,

  UNIQUE(user_id, badge_id)
);

-- Daily activity summary (for analytics)
CREATE TABLE IF NOT EXISTS daily_activity_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Nutrition
  calories_consumed INTEGER DEFAULT 0,
  protein_g FLOAT DEFAULT 0,
  carbs_g FLOAT DEFAULT 0,
  fats_g FLOAT DEFAULT 0,
  water_glasses INTEGER DEFAULT 0,
  meals_logged INTEGER DEFAULT 0,

  -- Workout
  workouts_completed INTEGER DEFAULT 0,
  workout_duration_minutes INTEGER DEFAULT 0,
  calories_burned INTEGER DEFAULT 0,

  -- Engagement
  logged_nutrition BOOLEAN DEFAULT FALSE,
  logged_workout BOOLEAN DEFAULT FALSE,
  logged_weight BOOLEAN DEFAULT FALSE,
  completed_all_goals BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, activity_date)
);

-- =============================================
-- 3. NUTRITION ENHANCEMENTS
-- =============================================

-- Macro targets (can change over time)
CREATE TABLE IF NOT EXISTS user_macro_targets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,

  daily_calories INTEGER NOT NULL,
  daily_protein_g FLOAT NOT NULL,
  daily_carbs_g FLOAT NOT NULL,
  daily_fats_g FLOAT NOT NULL,
  daily_water_ml INTEGER DEFAULT 2000,

  -- Source of targets
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated', 'coach_assigned')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, effective_date)
);

-- =============================================
-- 4. WORKOUT ENHANCEMENTS
-- =============================================

-- Workout plans (scheduled workouts)
CREATE TABLE IF NOT EXISTS scheduled_workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  workout_date DATE NOT NULL,
  workout_name TEXT NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('strength', 'cardio', 'flexibility', 'sports', 'rest')),

  exercises JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{exercise_id, sets, reps, rest}, ...]

  -- Status
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN DEFAULT FALSE,
  skipped_reason TEXT,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. ANALYTICS & INSIGHTS
-- =============================================

-- Weekly summaries (auto-generated)
CREATE TABLE IF NOT EXISTS weekly_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,

  -- Nutrition stats
  avg_daily_calories INTEGER,
  avg_daily_protein FLOAT,
  avg_daily_carbs FLOAT,
  avg_daily_fats FLOAT,
  total_meals_logged INTEGER,

  -- Workout stats
  total_workouts INTEGER,
  total_workout_minutes INTEGER,
  total_calories_burned INTEGER,

  -- Weight progress
  starting_weight_kg FLOAT,
  ending_weight_kg FLOAT,
  weight_change_kg FLOAT,

  -- Streaks
  perfect_logging_days INTEGER, -- Days with all goals met
  workout_consistency_percentage FLOAT,

  -- AI insights
  insights JSONB DEFAULT '[]'::jsonb, -- ["Great week!", "Protein intake low", ...]
  recommendations JSONB DEFAULT '[]'::jsonb,

  generated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, week_start_date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_weight_history_user_date ON weight_history(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON body_measurements(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_type ON user_streaks(user_id, streak_type);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON daily_activity_summary(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_macro_targets_user_date ON user_macro_targets(user_id, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_user_date ON scheduled_workouts(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_summaries_user_date ON weekly_summaries(user_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_macro_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_summaries ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only access their own data
CREATE POLICY "Users can manage own weight history" ON weight_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own body measurements" ON body_measurements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streaks" ON user_streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own badges" ON user_badges
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own activity summary" ON daily_activity_summary
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own macro targets" ON user_macro_targets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scheduled workouts" ON scheduled_workouts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own weekly summaries" ON weekly_summaries
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function: Update streak when activity is logged
CREATE OR REPLACE FUNCTION update_user_streak(
  p_user_id UUID,
  p_streak_type TEXT,
  p_log_date DATE DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_last_logged_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_total_days INTEGER;
BEGIN
  -- Get current streak data
  SELECT last_logged_date, current_streak, longest_streak, total_days_logged
  INTO v_last_logged_date, v_current_streak, v_longest_streak, v_total_days
  FROM user_streaks
  WHERE user_id = p_user_id AND streak_type = p_streak_type;

  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_logged_date, streak_start_date, total_days_logged)
    VALUES (p_user_id, p_streak_type, 1, 1, p_log_date, p_log_date, 1);
    RETURN;
  END IF;

  -- If logging for the same day, don't update
  IF v_last_logged_date = p_log_date THEN
    RETURN;
  END IF;

  -- If logging for consecutive day
  IF v_last_logged_date = p_log_date - INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  -- If streak is broken
  ELSIF v_last_logged_date < p_log_date - INTERVAL '1 day' THEN
    v_current_streak := 1;
  END IF;

  -- Update longest streak if needed
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update streak record
  UPDATE user_streaks
  SET current_streak = v_current_streak,
      longest_streak = v_longest_streak,
      last_logged_date = p_log_date,
      total_days_logged = v_total_days + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND streak_type = p_streak_type;
END;
$$;

-- Trigger: Update streak when nutrition is logged
CREATE OR REPLACE FUNCTION trigger_update_nutrition_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_user_streak(NEW.user_id, 'nutrition_logging', NEW.log_date);
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_nutrition_log_insert
AFTER INSERT ON daily_nutrition_logs
FOR EACH ROW
EXECUTE FUNCTION trigger_update_nutrition_streak();

-- Trigger: Update streak when workout is logged
CREATE OR REPLACE FUNCTION trigger_update_workout_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.completed = TRUE THEN
    PERFORM update_user_streak(NEW.user_id, 'workout_logging', NEW.workout_date);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_workout_log_insert
AFTER INSERT ON workout_logs
FOR EACH ROW
EXECUTE FUNCTION trigger_update_workout_streak();

-- Trigger: Update streak when weight is logged
CREATE OR REPLACE FUNCTION trigger_update_weight_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM update_user_streak(NEW.user_id, 'daily_weigh_in', NEW.log_date);
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_weight_log_insert
AFTER INSERT ON weight_history
FOR EACH ROW
EXECUTE FUNCTION trigger_update_weight_streak();

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default macro targets tier data
INSERT INTO subscription_tiers (tier, name, price_monthly_cents, price_yearly_cents, ai_generations_per_month, priority_support) VALUES
  ('free', 'Free', 0, 0, 5, FALSE),
  ('pro', 'Pro', 999, 9900, 50, TRUE),
  ('premium', 'Premium', 1999, 19900, -1, TRUE) -- -1 = unlimited
ON CONFLICT (tier) DO NOTHING;

-- Insert default badges (achievement templates)
INSERT INTO badges (name, description, icon, color, requirement_type, requirement_value) VALUES
  ('First Step', 'Log your first meal', '🌱', 'green', 'total_meals', 1),
  ('Week Warrior', '7-day logging streak', '🔥', 'orange', 'streak', 7),
  ('Month Master', '30-day logging streak', '💪', 'blue', 'streak', 30),
  ('Century Club', '100-day logging streak', '👑', 'gold', 'streak', 100),
  ('Workout Newbie', 'Complete 10 workouts', '🏃', 'purple', 'total_workouts', 10),
  ('Gym Regular', 'Complete 50 workouts', '💪', 'blue', 'total_workouts', 50),
  ('Fitness Beast', 'Complete 100 workouts', '🦍', 'red', 'total_workouts', 100),
  ('5kg Down', 'Lose 5kg', '⬇️', 'green', 'weight_loss', 5),
  ('10kg Down', 'Lose 10kg', '📉', 'blue', 'weight_loss', 10),
  ('20kg Down', 'Lose 20kg', '🎯', 'gold', 'weight_loss', 20)
ON CONFLICT (id) DO NOTHING;
