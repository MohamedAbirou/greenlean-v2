-- =============================================
-- Enhanced Workout Tracking & Logging System
-- Progressive Overload + Comprehensive Analytics
-- Date: 2025-12-08
-- =============================================

-- =============================================
-- 1. WORKOUT SESSIONS (Detailed Session Tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Session info
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  session_start_time TIMESTAMPTZ,
  session_end_time TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE WHEN session_end_time IS NOT NULL AND session_start_time IS NOT NULL
    THEN EXTRACT(EPOCH FROM (session_end_time - session_start_time))::INTEGER / 60
    ELSE NULL END
  ) STORED,

  -- Workout details
  workout_name TEXT NOT NULL,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('strength', 'cardio', 'flexibility', 'sports', 'hybrid', 'other')),
  workout_plan_id UUID REFERENCES ai_workout_plans(id) ON DELETE SET NULL,
  from_ai_plan BOOLEAN DEFAULT FALSE,
  plan_day_name TEXT, -- e.g., "Day 1: Push", "Monday Upper Body"

  -- Performance metrics
  total_exercises INTEGER DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,
  total_volume_kg FLOAT DEFAULT 0, -- Sum of (weight * reps) for all sets
  calories_burned INTEGER,

  -- Environment
  location TEXT CHECK (location IN ('gym', 'home', 'outdoor', 'other')),
  weather TEXT, -- For outdoor workouts

  -- Subjective metrics
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10), -- 1=Too easy, 10=Too hard
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5), -- 1=Exhausted, 5=Energized
  mood_after TEXT CHECK (mood_after IN ('great', 'good', 'neutral', 'tired', 'frustrated')),

  -- Status
  status TEXT DEFAULT 'completed' CHECK (status IN ('planned', 'in_progress', 'completed', 'skipped', 'failed')),
  skip_reason TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. EXERCISE SETS (Set-Level Progressive Overload Tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS exercise_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercise_library(id) ON DELETE SET NULL,

  -- Exercise info
  exercise_name TEXT NOT NULL,
  exercise_category TEXT,

  -- Set details
  set_number INTEGER NOT NULL, -- 1, 2, 3, etc.
  reps INTEGER,
  weight_kg FLOAT,
  duration_seconds INTEGER, -- For cardio/timed exercises
  distance_meters FLOAT, -- For running, rowing, etc.

  -- Advanced metrics
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10), -- Rate of Perceived Exertion
  rest_seconds INTEGER,
  tempo TEXT, -- e.g., "3-0-1-0" (eccentric-pause-concentric-pause)
  is_warmup BOOLEAN DEFAULT FALSE,
  is_dropset BOOLEAN DEFAULT FALSE,
  is_failure BOOLEAN DEFAULT FALSE, -- Went to failure?

  -- Personal records flags (auto-calculated by triggers)
  is_pr_weight BOOLEAN DEFAULT FALSE,
  is_pr_reps BOOLEAN DEFAULT FALSE,
  is_pr_volume BOOLEAN DEFAULT FALSE,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. WORKOUT PLAN ADHERENCE
-- =============================================

CREATE TABLE IF NOT EXISTS workout_plan_adherence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workout_plan_id UUID REFERENCES ai_workout_plans(id) ON DELETE CASCADE NOT NULL,

  tracking_week_start DATE NOT NULL, -- Week start date (Monday)

  -- Planned vs Actual
  planned_workouts INTEGER NOT NULL DEFAULT 0, -- From plan
  completed_workouts INTEGER DEFAULT 0,
  skipped_workouts INTEGER DEFAULT 0,

  adherence_percentage FLOAT GENERATED ALWAYS AS (
    CASE WHEN planned_workouts > 0
    THEN (completed_workouts::FLOAT / planned_workouts * 100)
    ELSE 0 END
  ) STORED,

  -- Volume metrics
  total_volume_kg FLOAT DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, workout_plan_id, tracking_week_start)
);

-- =============================================
-- 4. EXERCISE PERSONAL RECORDS (PRs)
-- =============================================

CREATE TABLE IF NOT EXISTS exercise_personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercise_library(id) ON DELETE CASCADE NOT NULL,

  -- PR types
  max_weight_kg FLOAT,
  max_weight_date DATE,
  max_weight_set_id UUID REFERENCES exercise_sets(id) ON DELETE SET NULL,

  max_reps INTEGER,
  max_reps_date DATE,
  max_reps_set_id UUID REFERENCES exercise_sets(id) ON DELETE SET NULL,

  max_volume_kg FLOAT, -- weight * reps (for single set)
  max_volume_date DATE,
  max_volume_set_id UUID REFERENCES exercise_sets(id) ON DELETE SET NULL,

  best_1rm_kg FLOAT, -- Estimated 1-rep max
  best_1rm_date DATE,

  -- Distance PRs (for cardio)
  max_distance_meters FLOAT,
  max_distance_date DATE,

  -- Time PRs
  best_time_seconds INTEGER, -- For timed exercises (plank, etc.)
  best_time_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, exercise_id)
);

-- =============================================
-- 5. PROGRESSIVE OVERLOAD TRACKING
-- =============================================

CREATE TABLE IF NOT EXISTS progressive_overload_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercise_library(id) ON DELETE CASCADE NOT NULL,

  log_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Progression metrics
  previous_best_weight FLOAT,
  current_weight FLOAT,
  weight_increase FLOAT,
  weight_increase_percentage FLOAT,

  previous_best_reps INTEGER,
  current_reps INTEGER,
  reps_increase INTEGER,

  previous_best_volume FLOAT,
  current_volume FLOAT,
  volume_increase FLOAT,
  volume_increase_percentage FLOAT,

  -- AI suggestions
  suggested_next_weight FLOAT,
  suggested_next_reps INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, exercise_id, log_date)
);

-- =============================================
-- 6. WORKOUT TEMPLATES (User-Created Workouts)
-- =============================================

CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  name TEXT NOT NULL,
  description TEXT,
  workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'flexibility', 'sports', 'hybrid', 'other')),

  -- Exercises in template
  exercises JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{exercise_id, name, sets, reps, weight, rest}, ...]

  -- Metadata
  estimated_duration_minutes INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),

  is_favorite BOOLEAN DEFAULT FALSE,
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 7. CARDIO SESSIONS (Detailed Cardio Tracking)
-- =============================================

CREATE TABLE IF NOT EXISTS cardio_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  session_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Activity type
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'running', 'cycling', 'swimming', 'rowing', 'walking', 'hiking',
    'elliptical', 'stair_climber', 'jump_rope', 'other'
  )),

  -- Metrics
  duration_minutes INTEGER,
  distance_meters FLOAT,
  calories_burned INTEGER,

  -- Intensity
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  avg_pace_per_km TEXT, -- e.g., "5:30"
  avg_speed_kmh FLOAT,

  -- Zones (time spent in each HR zone)
  zone1_minutes INTEGER DEFAULT 0, -- Recovery (<60% max HR)
  zone2_minutes INTEGER DEFAULT 0, -- Easy (60-70% max HR)
  zone3_minutes INTEGER DEFAULT 0, -- Moderate (70-80% max HR)
  zone4_minutes INTEGER DEFAULT 0, -- Hard (80-90% max HR)
  zone5_minutes INTEGER DEFAULT 0, -- Max (>90% max HR)

  -- Environment
  route_name TEXT,
  elevation_gain_meters FLOAT,
  weather_conditions TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_workout_sessions_user_date ON workout_sessions(user_id, session_date DESC);
CREATE INDEX idx_workout_sessions_plan_id ON workout_sessions(workout_plan_id);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX idx_workout_sessions_from_ai_plan ON workout_sessions(user_id, from_ai_plan, session_date DESC);

CREATE INDEX idx_exercise_sets_session_id ON exercise_sets(workout_session_id);
CREATE INDEX idx_exercise_sets_user_exercise ON exercise_sets(user_id, exercise_id, created_at DESC);
CREATE INDEX idx_exercise_sets_is_pr ON exercise_sets(user_id) WHERE is_pr_weight OR is_pr_reps OR is_pr_volume;

CREATE INDEX idx_workout_plan_adherence_user_week ON workout_plan_adherence(user_id, tracking_week_start DESC);
CREATE INDEX idx_workout_plan_adherence_plan_id ON workout_plan_adherence(workout_plan_id);

CREATE INDEX idx_exercise_prs_user_exercise ON exercise_personal_records(user_id, exercise_id);

CREATE INDEX idx_progressive_overload_user_exercise ON progressive_overload_log(user_id, exercise_id, log_date DESC);

CREATE INDEX idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX idx_workout_templates_favorite ON workout_templates(user_id, is_favorite) WHERE is_favorite = TRUE;

CREATE INDEX idx_cardio_sessions_user_date ON cardio_sessions(user_id, session_date DESC);
CREATE INDEX idx_cardio_sessions_activity_type ON cardio_sessions(user_id, activity_type, session_date DESC);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Calculate workout session totals from exercise sets
CREATE OR REPLACE FUNCTION update_workout_session_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_session_id UUID;
  v_total_exercises INTEGER;
  v_total_sets INTEGER;
  v_total_reps INTEGER;
  v_total_volume FLOAT;
BEGIN
  v_session_id := COALESCE(NEW.workout_session_id, OLD.workout_session_id);

  IF v_session_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate totals
  SELECT
    COUNT(DISTINCT exercise_id),
    COUNT(*),
    COALESCE(SUM(reps), 0),
    COALESCE(SUM(weight_kg * reps), 0)
  INTO
    v_total_exercises,
    v_total_sets,
    v_total_reps,
    v_total_volume
  FROM exercise_sets
  WHERE workout_session_id = v_session_id
    AND is_warmup = FALSE; -- Don't count warmup sets

  -- Update session
  UPDATE workout_sessions
  SET
    total_exercises = v_total_exercises,
    total_sets = v_total_sets,
    total_reps = v_total_reps,
    total_volume_kg = v_total_volume,
    updated_at = NOW()
  WHERE id = v_session_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_workout_session_totals_insert ON exercise_sets;
CREATE TRIGGER trigger_update_workout_session_totals_insert
  AFTER INSERT ON exercise_sets
  FOR EACH ROW EXECUTE FUNCTION update_workout_session_totals();

DROP TRIGGER IF EXISTS trigger_update_workout_session_totals_update ON exercise_sets;
CREATE TRIGGER trigger_update_workout_session_totals_update
  AFTER UPDATE ON exercise_sets
  FOR EACH ROW EXECUTE FUNCTION update_workout_session_totals();

DROP TRIGGER IF EXISTS trigger_update_workout_session_totals_delete ON exercise_sets;
CREATE TRIGGER trigger_update_workout_session_totals_delete
  AFTER DELETE ON exercise_sets
  FOR EACH ROW EXECUTE FUNCTION update_workout_session_totals();

-- Check and update personal records
CREATE OR REPLACE FUNCTION check_and_update_personal_records()
RETURNS TRIGGER AS $$
DECLARE
  v_current_pr RECORD;
  v_is_pr_weight BOOLEAN := FALSE;
  v_is_pr_reps BOOLEAN := FALSE;
  v_is_pr_volume BOOLEAN := FALSE;
  v_current_volume FLOAT;
BEGIN
  -- Skip warmup sets and null values
  IF NEW.is_warmup OR NEW.exercise_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate volume for this set
  v_current_volume := COALESCE(NEW.weight_kg, 0) * COALESCE(NEW.reps, 0);

  -- Get current PRs
  SELECT * INTO v_current_pr
  FROM exercise_personal_records
  WHERE user_id = NEW.user_id
    AND exercise_id = NEW.exercise_id;

  -- Check for weight PR
  IF NEW.weight_kg IS NOT NULL AND
     (v_current_pr IS NULL OR NEW.weight_kg > COALESCE(v_current_pr.max_weight_kg, 0))
  THEN
    v_is_pr_weight := TRUE;
  END IF;

  -- Check for reps PR (at same or higher weight)
  IF NEW.reps IS NOT NULL AND
     (v_current_pr IS NULL OR NEW.reps > COALESCE(v_current_pr.max_reps, 0))
  THEN
    v_is_pr_reps := TRUE;
  END IF;

  -- Check for volume PR
  IF v_current_volume > 0 AND
     (v_current_pr IS NULL OR v_current_volume > COALESCE(v_current_pr.max_volume_kg, 0))
  THEN
    v_is_pr_volume := TRUE;
  END IF;

  -- Update PR flags in the set
  NEW.is_pr_weight := v_is_pr_weight;
  NEW.is_pr_reps := v_is_pr_reps;
  NEW.is_pr_volume := v_is_pr_volume;

  -- Update or insert PR record
  IF v_is_pr_weight OR v_is_pr_reps OR v_is_pr_volume THEN
    INSERT INTO exercise_personal_records (
      user_id,
      exercise_id,
      max_weight_kg,
      max_weight_date,
      max_weight_set_id,
      max_reps,
      max_reps_date,
      max_reps_set_id,
      max_volume_kg,
      max_volume_date,
      max_volume_set_id
    )
    VALUES (
      NEW.user_id,
      NEW.exercise_id,
      CASE WHEN v_is_pr_weight THEN NEW.weight_kg ELSE NULL END,
      CASE WHEN v_is_pr_weight THEN CURRENT_DATE ELSE NULL END,
      CASE WHEN v_is_pr_weight THEN NEW.id ELSE NULL END,
      CASE WHEN v_is_pr_reps THEN NEW.reps ELSE NULL END,
      CASE WHEN v_is_pr_reps THEN CURRENT_DATE ELSE NULL END,
      CASE WHEN v_is_pr_reps THEN NEW.id ELSE NULL END,
      CASE WHEN v_is_pr_volume THEN v_current_volume ELSE NULL END,
      CASE WHEN v_is_pr_volume THEN CURRENT_DATE ELSE NULL END,
      CASE WHEN v_is_pr_volume THEN NEW.id ELSE NULL END
    )
    ON CONFLICT (user_id, exercise_id)
    DO UPDATE SET
      max_weight_kg = CASE WHEN v_is_pr_weight THEN NEW.weight_kg ELSE exercise_personal_records.max_weight_kg END,
      max_weight_date = CASE WHEN v_is_pr_weight THEN CURRENT_DATE ELSE exercise_personal_records.max_weight_date END,
      max_weight_set_id = CASE WHEN v_is_pr_weight THEN NEW.id ELSE exercise_personal_records.max_weight_set_id END,
      max_reps = CASE WHEN v_is_pr_reps THEN NEW.reps ELSE exercise_personal_records.max_reps END,
      max_reps_date = CASE WHEN v_is_pr_reps THEN CURRENT_DATE ELSE exercise_personal_records.max_reps_date END,
      max_reps_set_id = CASE WHEN v_is_pr_reps THEN NEW.id ELSE exercise_personal_records.max_reps_set_id END,
      max_volume_kg = CASE WHEN v_is_pr_volume THEN v_current_volume ELSE exercise_personal_records.max_volume_kg END,
      max_volume_date = CASE WHEN v_is_pr_volume THEN CURRENT_DATE ELSE exercise_personal_records.max_volume_date END,
      max_volume_set_id = CASE WHEN v_is_pr_volume THEN NEW.id ELSE exercise_personal_records.max_volume_set_id END,
      updated_at = NOW();

    -- Send notification for PR
    IF v_is_pr_weight OR v_is_pr_reps OR v_is_pr_volume THEN
      INSERT INTO notifications (user_id, type, title, message, icon)
      VALUES (
        NEW.user_id,
        'achievement',
        'New Personal Record! 🎉',
        format('Congrats! You set a new PR on %s: %s',
          NEW.exercise_name,
          CASE
            WHEN v_is_pr_weight THEN format('%s kg', NEW.weight_kg)
            WHEN v_is_pr_reps THEN format('%s reps', NEW.reps)
            WHEN v_is_pr_volume THEN format('%s kg total volume', v_current_volume)
          END
        ),
        '🏆'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_personal_records ON exercise_sets;
CREATE TRIGGER trigger_check_personal_records
  BEFORE INSERT ON exercise_sets
  FOR EACH ROW EXECUTE FUNCTION check_and_update_personal_records();

-- Update timestamp triggers
CREATE TRIGGER update_workout_sessions_timestamp
  BEFORE UPDATE ON workout_sessions
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_workout_plan_adherence_timestamp
  BEFORE UPDATE ON workout_plan_adherence
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_exercise_prs_timestamp
  BEFORE UPDATE ON exercise_personal_records
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_workout_templates_timestamp
  BEFORE UPDATE ON workout_templates
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE progressive_overload_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cardio_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own workout sessions" ON workout_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own exercise sets" ON exercise_sets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout plan adherence" ON workout_plan_adherence
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own personal records" ON exercise_personal_records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own progressive overload log" ON progressive_overload_log
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own workout templates" ON workout_templates
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cardio sessions" ON cardio_sessions
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get workout plan adherence for current week
CREATE OR REPLACE FUNCTION get_current_week_adherence(p_user_id UUID, p_plan_id UUID)
RETURNS TABLE (
  planned_workouts INTEGER,
  completed_workouts INTEGER,
  adherence_percentage FLOAT
) AS $$
DECLARE
  v_week_start DATE := DATE_TRUNC('week', CURRENT_DATE)::DATE;
BEGIN
  RETURN QUERY
  SELECT
    wpa.planned_workouts,
    wpa.completed_workouts,
    wpa.adherence_percentage
  FROM workout_plan_adherence wpa
  WHERE wpa.user_id = p_user_id
    AND wpa.workout_plan_id = p_plan_id
    AND wpa.tracking_week_start = v_week_start;
END;
$$ LANGUAGE plpgsql STABLE;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON TABLE workout_sessions IS 'Comprehensive workout session tracking with performance metrics';
COMMENT ON TABLE exercise_sets IS 'Set-level tracking for progressive overload and PR detection';
COMMENT ON TABLE workout_plan_adherence IS 'Track adherence to AI-generated workout plans';
COMMENT ON TABLE exercise_personal_records IS 'Personal records (PRs) for each exercise';
COMMENT ON TABLE progressive_overload_log IS 'Track progressive overload over time';
COMMENT ON TABLE cardio_sessions IS 'Detailed cardio activity tracking with heart rate zones';
