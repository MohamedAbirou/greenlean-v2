-- =============================================
-- Progress & Journey Tracking System
-- Comprehensive historical tracking and milestones
-- Date: 2025-12-08
-- =============================================

-- =============================================
-- 1. BODY MEASUREMENTS (Detailed Body Metrics Over Time)
-- =============================================

CREATE TABLE IF NOT EXISTS body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  measurement_time TIME,

  -- Weight
  weight_kg FLOAT NOT NULL,

  -- Body composition
  body_fat_percentage FLOAT,
  muscle_mass_kg FLOAT,
  bone_mass_kg FLOAT,
  water_percentage FLOAT,
  visceral_fat INTEGER, -- Visceral fat rating (1-59)

  -- Circumference measurements (in cm)
  neck_cm FLOAT,
  chest_cm FLOAT,
  waist_cm FLOAT,
  hips_cm FLOAT,
  thigh_left_cm FLOAT,
  thigh_right_cm FLOAT,
  calf_left_cm FLOAT,
  calf_right_cm FLOAT,
  bicep_left_cm FLOAT,
  bicep_right_cm FLOAT,
  forearm_left_cm FLOAT,
  forearm_right_cm FLOAT,

  -- Calculated metrics
  bmi FLOAT GENERATED ALWAYS AS (
    CASE WHEN weight_kg > 0 THEN
      weight_kg / POWER((SELECT height FROM profiles WHERE id = user_id) / 100.0, 2)
    ELSE NULL END
  ) STORED,

  waist_to_hip_ratio FLOAT GENERATED ALWAYS AS (
    CASE WHEN hips_cm > 0 AND waist_cm > 0 THEN waist_cm / hips_cm ELSE NULL END
  ) STORED,

  -- Context
  measurement_source TEXT DEFAULT 'manual' CHECK (measurement_source IN ('manual', 'smart_scale', 'body_scan', 'caliper')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, measurement_date)
);

-- =============================================
-- 2. PROGRESS MILESTONES (Achievements & Milestones)
-- =============================================

CREATE TABLE IF NOT EXISTS progress_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Milestone info
  milestone_type TEXT NOT NULL CHECK (milestone_type IN (
    'weight_loss', 'weight_gain', 'muscle_gain', 'fat_loss',
    'strength_pr', 'endurance_milestone', 'consistency_streak',
    'nutrition_goal', 'custom'
  )),
  milestone_name TEXT NOT NULL,
  description TEXT,

  -- Values
  target_value FLOAT,
  achieved_value FLOAT,
  unit TEXT, -- kg, lbs, reps, days, etc.

  -- Status
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved', 'missed', 'canceled')),

  -- Dates
  target_date DATE,
  achieved_date DATE,

  -- Reward/Recognition
  badge_earned UUID REFERENCES badges(id) ON DELETE SET NULL,
  points_awarded INTEGER DEFAULT 0,
  celebration_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. PROGRESS PHOTOS (Enhanced with AI Analysis)
-- =============================================

-- Enhanced progress_photos table (extends existing)
CREATE TABLE IF NOT EXISTS progress_photos_metadata (
  photo_id UUID PRIMARY KEY REFERENCES progress_photos(id) ON DELETE CASCADE,

  -- Photo details
  photo_type TEXT CHECK (photo_type IN ('front', 'back', 'side_left', 'side_right', 'custom')),
  lighting_conditions TEXT,
  time_of_day TEXT,

  -- AI analysis (future feature)
  ai_analysis JSONB DEFAULT '{}'::jsonb, -- {muscle_definition, body_fat_estimate, posture_score, etc.}
  ai_processed BOOLEAN DEFAULT FALSE,

  -- Comparison metrics
  compared_with_photo_id UUID REFERENCES progress_photos(id) ON DELETE SET NULL,
  comparison_notes TEXT,

  tags TEXT[] DEFAULT ARRAY[]::TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. USER JOURNEY TIMELINE (Comprehensive Timeline)
-- =============================================

CREATE TABLE IF NOT EXISTS user_journey_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'onboarding_completed',
    'profile_updated',
    'goal_changed',
    'plan_generated',
    'plan_regenerated',
    'milestone_achieved',
    'pr_achieved',
    'streak_milestone',
    'weight_logged',
    'measurement_logged',
    'photo_uploaded',
    'challenge_completed',
    'subscription_upgraded',
    'subscription_downgraded',
    'tier_unlocked',
    'custom_event'
  )),

  title TEXT NOT NULL,
  description TEXT,

  -- Related entities
  related_entity_type TEXT, -- 'meal_plan', 'workout_plan', 'milestone', etc.
  related_entity_id UUID,

  -- Event data (flexible JSONB for any event-specific data)
  event_data JSONB DEFAULT '{}'::jsonb,

  -- Visibility
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'friends', 'public')),

  -- User engagement
  is_highlighted BOOLEAN DEFAULT FALSE, -- Pin important events
  user_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. PROGRESS SUMMARIES (Auto-Generated Summaries)
-- =============================================

-- Monthly progress summaries
CREATE TABLE IF NOT EXISTS monthly_progress_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  summary_month DATE NOT NULL, -- First day of month

  -- Weight & Body
  starting_weight_kg FLOAT,
  ending_weight_kg FLOAT,
  weight_change_kg FLOAT,
  avg_body_fat_percentage FLOAT,

  -- Nutrition
  total_meals_logged INTEGER DEFAULT 0,
  avg_daily_calories INTEGER,
  avg_daily_protein FLOAT,
  avg_daily_carbs FLOAT,
  avg_daily_fats FLOAT,
  nutrition_logging_days INTEGER DEFAULT 0,
  nutrition_adherence_percentage FLOAT,

  -- Workouts
  total_workouts INTEGER DEFAULT 0,
  total_workout_minutes INTEGER DEFAULT 0,
  total_volume_kg FLOAT DEFAULT 0,
  workout_adherence_percentage FLOAT,
  new_prs_count INTEGER DEFAULT 0,

  -- Streaks
  longest_nutrition_streak INTEGER DEFAULT 0,
  longest_workout_streak INTEGER DEFAULT 0,

  -- Achievements
  milestones_achieved INTEGER DEFAULT 0,
  challenges_completed INTEGER DEFAULT 0,
  badges_earned INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,

  -- AI insights
  ai_insights JSONB DEFAULT '[]'::jsonb,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,

  generated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, summary_month)
);

-- =============================================
-- 6. WEEKLY PROGRESS SUMMARIES (Enhanced Version)
-- =============================================

-- Enhance existing weekly_summaries or create new detailed version
CREATE TABLE IF NOT EXISTS weekly_progress_detailed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,

  -- Weight & Body
  starting_weight_kg FLOAT,
  ending_weight_kg FLOAT,
  weight_change_kg FLOAT,
  avg_body_fat_percentage FLOAT,

  -- Daily breakdown (7 days)
  daily_calories JSONB DEFAULT '[]'::jsonb, -- [mon, tue, wed, thu, fri, sat, sun]
  daily_protein JSONB DEFAULT '[]'::jsonb,
  daily_workouts JSONB DEFAULT '[]'::jsonb,

  -- Nutrition
  total_meals_logged INTEGER DEFAULT 0,
  avg_daily_calories INTEGER,
  avg_daily_protein FLOAT,
  nutrition_adherence_percentage FLOAT,
  perfect_logging_days INTEGER DEFAULT 0, -- Days with all meals logged

  -- Workouts
  total_workouts INTEGER DEFAULT 0,
  total_workout_minutes INTEGER DEFAULT 0,
  total_volume_kg FLOAT DEFAULT 0,
  total_calories_burned INTEGER DEFAULT 0,
  workout_adherence_percentage FLOAT,

  -- Performance
  new_prs_this_week INTEGER DEFAULT 0,
  total_distance_meters FLOAT DEFAULT 0, -- For cardio

  -- Consistency scores (1-100)
  nutrition_consistency_score INTEGER,
  workout_consistency_score INTEGER,
  overall_consistency_score INTEGER,

  -- Week rating (user-submitted)
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_notes TEXT,

  -- AI analysis
  top_achievements JSONB DEFAULT '[]'::jsonb,
  areas_for_improvement JSONB DEFAULT '[]'::jsonb,
  ai_insights JSONB DEFAULT '[]'::jsonb,

  generated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, week_start_date)
);

-- =============================================
-- 7. DATA COMPARISON SNAPSHOTS (Before/After)
-- =============================================

CREATE TABLE IF NOT EXISTS comparison_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  snapshot_name TEXT NOT NULL, -- e.g., "3 Month Transformation", "Before Summer"
  snapshot_type TEXT DEFAULT 'manual' CHECK (snapshot_type IN ('manual', 'monthly', 'quarterly', 'yearly')),

  -- Time range
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Metrics
  starting_weight_kg FLOAT,
  ending_weight_kg FLOAT,
  weight_change_kg FLOAT,
  weight_change_percentage FLOAT,

  starting_body_fat FLOAT,
  ending_body_fat FLOAT,
  body_fat_change FLOAT,

  starting_muscle_mass FLOAT,
  ending_muscle_mass FLOAT,
  muscle_mass_change FLOAT,

  -- Progress photos
  before_photo_id UUID REFERENCES progress_photos(id) ON DELETE SET NULL,
  after_photo_id UUID REFERENCES progress_photos(id) ON DELETE SET NULL,

  -- Measurements comparison
  measurements_comparison JSONB DEFAULT '{}'::jsonb,

  -- Achievements during period
  workouts_completed INTEGER DEFAULT 0,
  meals_logged INTEGER DEFAULT 0,
  prs_achieved INTEGER DEFAULT 0,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_body_measurements_user_date ON body_measurements(user_id, measurement_date DESC);
CREATE INDEX idx_body_measurements_date ON body_measurements(measurement_date DESC);

CREATE INDEX idx_progress_milestones_user_id ON progress_milestones(user_id);
CREATE INDEX idx_progress_milestones_status ON progress_milestones(status);
CREATE INDEX idx_progress_milestones_type ON progress_milestones(milestone_type);

CREATE INDEX idx_progress_photos_metadata_photo_type ON progress_photos_metadata(photo_type);

CREATE INDEX idx_user_journey_timeline_user_date ON user_journey_timeline(user_id, event_date DESC);
CREATE INDEX idx_user_journey_timeline_type ON user_journey_timeline(event_type);
CREATE INDEX idx_user_journey_timeline_highlighted ON user_journey_timeline(user_id, is_highlighted) WHERE is_highlighted = TRUE;

CREATE INDEX idx_monthly_summaries_user_month ON monthly_progress_summaries(user_id, summary_month DESC);

CREATE INDEX idx_weekly_detailed_user_week ON weekly_progress_detailed(user_id, week_start_date DESC);

CREATE INDEX idx_comparison_snapshots_user_id ON comparison_snapshots(user_id, created_at DESC);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-create journey timeline event when milestone achieved
CREATE OR REPLACE FUNCTION create_milestone_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'achieved' AND (OLD.status IS NULL OR OLD.status != 'achieved') THEN
    INSERT INTO user_journey_timeline (
      user_id,
      event_type,
      title,
      description,
      related_entity_type,
      related_entity_id,
      event_data,
      is_highlighted
    )
    VALUES (
      NEW.user_id,
      'milestone_achieved',
      format('Milestone Achieved: %s', NEW.milestone_name),
      NEW.description,
      'milestone',
      NEW.id,
      jsonb_build_object(
        'milestone_type', NEW.milestone_type,
        'achieved_value', NEW.achieved_value,
        'unit', NEW.unit,
        'points_awarded', NEW.points_awarded
      ),
      TRUE -- Highlight milestone achievements
    );

    -- Award points
    IF NEW.points_awarded > 0 THEN
      PERFORM award_points(NEW.user_id, NEW.points_awarded, NEW.milestone_name);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_milestone_timeline_event ON progress_milestones;
CREATE TRIGGER trigger_milestone_timeline_event
  AFTER INSERT OR UPDATE ON progress_milestones
  FOR EACH ROW EXECUTE FUNCTION create_milestone_timeline_event();

-- Auto-create journey event for weight logging
CREATE OR REPLACE FUNCTION create_weight_log_timeline_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create timeline event every 7 days or for significant changes (>2kg)
  IF NOT EXISTS (
    SELECT 1 FROM user_journey_timeline
    WHERE user_id = NEW.user_id
      AND event_type = 'weight_logged'
      AND event_date > NOW() - INTERVAL '7 days'
  ) OR ABS(NEW.weight_kg - (
    SELECT weight FROM profiles WHERE id = NEW.user_id
  )) > 2 THEN
    INSERT INTO user_journey_timeline (
      user_id,
      event_type,
      title,
      description,
      event_data
    )
    VALUES (
      NEW.user_id,
      'weight_logged',
      format('Weight Update: %.1f kg', NEW.weight_kg),
      NEW.notes,
      jsonb_build_object(
        'weight_kg', NEW.weight_kg,
        'measurement_date', NEW.measurement_date
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_weight_log_timeline ON body_measurements;
CREATE TRIGGER trigger_weight_log_timeline
  AFTER INSERT ON body_measurements
  FOR EACH ROW EXECUTE FUNCTION create_weight_log_timeline_event();

-- Update timestamp triggers
CREATE TRIGGER update_progress_milestones_timestamp
  BEFORE UPDATE ON progress_milestones
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_progress_photos_metadata_timestamp
  BEFORE UPDATE ON progress_photos_metadata
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_comparison_snapshots_timestamp
  BEFORE UPDATE ON comparison_snapshots
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_photos_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_journey_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_progress_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_progress_detailed ENABLE ROW LEVEL SECURITY;
ALTER TABLE comparison_snapshots ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own body measurements" ON body_measurements
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress milestones" ON progress_milestones
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progress photos metadata" ON progress_photos_metadata
  FOR ALL USING (auth.uid() = (SELECT user_id FROM progress_photos WHERE id = photo_id));

CREATE POLICY "Users can manage own journey timeline" ON user_journey_timeline
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own monthly summaries" ON monthly_progress_summaries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage monthly summaries" ON monthly_progress_summaries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own weekly summaries" ON weekly_progress_detailed
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can rate their week" ON weekly_progress_detailed
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage weekly summaries" ON weekly_progress_detailed
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own comparison snapshots" ON comparison_snapshots
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get user progress summary for date range
CREATE OR REPLACE FUNCTION get_progress_summary(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  weight_change_kg FLOAT,
  total_workouts INTEGER,
  total_meals_logged INTEGER,
  prs_achieved INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT ending_weight_kg - starting_weight_kg
     FROM (
       SELECT
         (SELECT weight_kg FROM body_measurements WHERE user_id = p_user_id AND measurement_date >= p_start_date ORDER BY measurement_date ASC LIMIT 1) AS starting_weight_kg,
         (SELECT weight_kg FROM body_measurements WHERE user_id = p_user_id AND measurement_date <= p_end_date ORDER BY measurement_date DESC LIMIT 1) AS ending_weight_kg
     ) AS weights
    ),
    (SELECT COUNT(*)::INTEGER FROM workout_sessions WHERE user_id = p_user_id AND session_date BETWEEN p_start_date AND p_end_date AND status = 'completed'),
    (SELECT COUNT(DISTINCT log_date)::INTEGER FROM daily_nutrition_logs WHERE user_id = p_user_id AND log_date BETWEEN p_start_date AND p_end_date),
    (SELECT COUNT(*)::INTEGER FROM exercise_sets WHERE user_id = p_user_id AND created_at::DATE BETWEEN p_start_date AND p_end_date AND (is_pr_weight OR is_pr_reps OR is_pr_volume));
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON TABLE body_measurements IS 'Detailed body metrics tracking over time with multiple measurement points';
COMMENT ON TABLE progress_milestones IS 'User-defined and system-generated progress milestones';
COMMENT ON TABLE user_journey_timeline IS 'Comprehensive timeline of user journey and achievements';
COMMENT ON TABLE monthly_progress_summaries IS 'Auto-generated monthly progress reports';
COMMENT ON TABLE weekly_progress_detailed IS 'Detailed weekly summaries with AI insights';
COMMENT ON TABLE comparison_snapshots IS 'Before/after comparison snapshots for progress visualization';
