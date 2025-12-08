-- =============================================
-- Analytics, Insights & Data Export System
-- AI-powered insights and comprehensive data exports
-- Date: 2025-12-08
-- =============================================

-- =============================================
-- 1. NUTRITION ANALYTICS (Trends & Patterns)
-- =============================================

CREATE TABLE IF NOT EXISTS nutrition_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  analysis_period TEXT NOT NULL CHECK (analysis_period IN ('daily', 'weekly', 'monthly')),

  -- Period range
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,

  -- Macro trends
  avg_daily_calories INTEGER,
  calories_std_deviation FLOAT, -- Consistency indicator
  avg_daily_protein FLOAT,
  avg_daily_carbs FLOAT,
  avg_daily_fats FLOAT,

  -- Meal timing patterns
  most_common_meal_times JSONB DEFAULT '{}'::jsonb, -- {breakfast: "08:00", lunch: "13:00", ...}
  meal_frequency FLOAT, -- Average meals per day

  -- Adherence metrics
  days_tracked INTEGER,
  total_possible_days INTEGER,
  tracking_adherence_percentage FLOAT,

  goal_adherence_percentage FLOAT, -- How often hitting calorie/macro goals
  days_over_calories INTEGER,
  days_under_calories INTEGER,
  days_on_target INTEGER,

  -- Patterns
  best_day_of_week TEXT, -- Day with best adherence
  worst_day_of_week TEXT,
  common_skip_meal TEXT, -- Most commonly skipped meal type

  -- Food diversity
  unique_foods_logged INTEGER,
  most_common_foods JSONB DEFAULT '[]'::jsonb, -- Top 10 foods with frequency

  -- AI insights
  insights JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb, -- Nutritional concerns

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, analysis_period, period_start_date)
);

-- =============================================
-- 2. WORKOUT ANALYTICS (Performance Metrics)
-- =============================================

CREATE TABLE IF NOT EXISTS workout_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  analysis_period TEXT NOT NULL CHECK (analysis_period IN ('daily', 'weekly', 'monthly')),

  -- Period range
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,

  -- Volume metrics
  total_workouts INTEGER DEFAULT 0,
  total_workout_minutes INTEGER DEFAULT 0,
  total_volume_kg FLOAT DEFAULT 0,
  total_sets INTEGER DEFAULT 0,
  total_reps INTEGER DEFAULT 0,

  avg_workout_duration INTEGER,
  avg_volume_per_workout FLOAT,
  avg_rest_between_sets INTEGER,

  -- Intensity metrics
  avg_rpe FLOAT, -- Average Rate of Perceived Exertion
  sessions_to_failure INTEGER, -- Sessions with sets to failure
  total_prs_achieved INTEGER,

  -- Workout distribution
  workout_type_distribution JSONB DEFAULT '{}'::jsonb, -- {strength: 10, cardio: 5, ...}
  muscle_group_distribution JSONB DEFAULT '{}'::jsonb, -- {chest: 15, legs: 20, ...}

  -- Consistency
  workout_adherence_percentage FLOAT,
  longest_workout_streak INTEGER,
  current_workout_streak INTEGER,

  -- Performance trends
  strength_trend TEXT CHECK (strength_trend IN ('improving', 'plateaued', 'declining', 'insufficient_data')),
  volume_trend TEXT CHECK (volume_trend IN ('increasing', 'stable', 'decreasing', 'insufficient_data')),

  -- Top performing exercises
  top_exercises_by_volume JSONB DEFAULT '[]'::jsonb,
  exercises_needing_attention JSONB DEFAULT '[]'::jsonb, -- Plateaued or declining

  -- Cardio metrics (if applicable)
  total_distance_meters FLOAT DEFAULT 0,
  total_cardio_minutes INTEGER DEFAULT 0,
  avg_heart_rate INTEGER,

  -- Recovery metrics
  avg_rest_days FLOAT,
  overtraining_risk_score INTEGER CHECK (overtraining_risk_score BETWEEN 0 AND 100),

  -- AI insights
  insights JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, analysis_period, period_start_date)
);

-- =============================================
-- 3. AI INSIGHTS (Generated Insights & Recommendations)
-- =============================================

CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'nutrition_pattern',
    'workout_performance',
    'progress_prediction',
    'goal_recommendation',
    'plateau_alert',
    'overtraining_warning',
    'injury_risk',
    'optimization_tip',
    'celebration',
    'general'
  )),

  category TEXT NOT NULL CHECK (category IN ('nutrition', 'workout', 'progress', 'health', 'motivation')),

  title TEXT NOT NULL,
  message TEXT NOT NULL,
  detailed_analysis TEXT,

  -- Priority/Importance
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  importance_score INTEGER CHECK (importance_score BETWEEN 0 AND 100),

  -- Actionable recommendations
  recommendations JSONB DEFAULT '[]'::jsonb,
  action_items JSONB DEFAULT '[]'::jsonb,

  -- Data context
  supporting_data JSONB DEFAULT '{}'::jsonb,
  data_sources TEXT[] DEFAULT ARRAY[]::TEXT[], -- Which tables/metrics this is based on

  -- User interaction
  viewed BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT FALSE,
  dismissed_at TIMESTAMPTZ,
  user_feedback TEXT CHECK (user_feedback IN ('helpful', 'not_helpful', 'neutral')),

  -- Expiration
  expires_at TIMESTAMPTZ,
  valid_from TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. DATA EXPORTS (Export History & Management)
-- =============================================

CREATE TABLE IF NOT EXISTS data_exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  export_type TEXT NOT NULL CHECK (export_type IN ('full', 'nutrition', 'workouts', 'progress', 'photos', 'custom')),
  export_format TEXT NOT NULL CHECK (export_format IN ('csv', 'json', 'pdf', 'excel')),

  -- Export parameters
  date_range_start DATE,
  date_range_end DATE,
  include_photos BOOLEAN DEFAULT FALSE,
  include_analytics BOOLEAN DEFAULT FALSE,

  -- Export status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
  file_size_bytes BIGINT,
  file_url TEXT, -- S3/Storage URL
  download_count INTEGER DEFAULT 0,

  -- Processing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Expiration (auto-delete after 7 days)
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. NUTRITION TRENDS (Macro/Calorie Trends)
-- =============================================

CREATE TABLE IF NOT EXISTS nutrition_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  trend_date DATE NOT NULL,

  -- Rolling averages (7-day, 30-day)
  avg_calories_7d INTEGER,
  avg_calories_30d INTEGER,
  avg_protein_7d FLOAT,
  avg_protein_30d FLOAT,
  avg_carbs_7d FLOAT,
  avg_carbs_30d FLOAT,
  avg_fats_7d FLOAT,
  avg_fats_30d FLOAT,

  -- Variance/Consistency
  calories_variance_7d FLOAT,
  calories_variance_30d FLOAT,

  -- Macro ratios
  protein_percentage FLOAT,
  carbs_percentage FLOAT,
  fats_percentage FLOAT,

  -- Trend direction
  calories_trend TEXT CHECK (calories_trend IN ('increasing', 'stable', 'decreasing')),
  weight_correlation FLOAT, -- Correlation between calories and weight change

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, trend_date)
);

-- =============================================
-- 6. PERFORMANCE METRICS (Workout Performance Over Time)
-- =============================================

CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES exercise_library(id) ON DELETE CASCADE NOT NULL,

  metric_date DATE NOT NULL,

  -- Performance metrics
  estimated_1rm_kg FLOAT, -- Calculated 1-rep max
  total_volume_kg FLOAT, -- Total volume for this exercise today
  max_weight_lifted_kg FLOAT,
  max_reps INTEGER,

  -- Trends (vs previous week)
  volume_change_percentage FLOAT,
  weight_change_percentage FLOAT,
  reps_change_percentage FLOAT,

  -- Progression status
  progression_status TEXT CHECK (progression_status IN ('improving', 'maintaining', 'regressing')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, exercise_id, metric_date)
);

-- =============================================
-- 7. HABIT TRACKING (Custom Habits)
-- =============================================

CREATE TABLE IF NOT EXISTS custom_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  habit_name TEXT NOT NULL,
  habit_type TEXT NOT NULL CHECK (habit_type IN ('nutrition', 'exercise', 'sleep', 'water', 'meditation', 'other')),
  description TEXT,

  -- Tracking settings
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days_per_week INTEGER, -- For weekly frequency
  target_value FLOAT, -- For quantifiable habits (e.g., 8 glasses of water)
  unit TEXT, -- glasses, minutes, hours, etc.

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES custom_habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN DEFAULT TRUE,
  value FLOAT, -- For quantifiable habits

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(habit_id, log_date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_nutrition_analytics_user_period ON nutrition_analytics(user_id, analysis_period, period_start_date DESC);
CREATE INDEX idx_workout_analytics_user_period ON workout_analytics(user_id, analysis_period, period_start_date DESC);

CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id, created_at DESC);
CREATE INDEX idx_ai_insights_type_category ON ai_insights(insight_type, category);
CREATE INDEX idx_ai_insights_priority ON ai_insights(priority, importance_score DESC) WHERE NOT dismissed;
CREATE INDEX idx_ai_insights_unviewed ON ai_insights(user_id) WHERE NOT viewed AND NOT dismissed;

CREATE INDEX idx_data_exports_user_id ON data_exports(user_id, created_at DESC);
CREATE INDEX idx_data_exports_status ON data_exports(status);
CREATE INDEX idx_data_exports_expires ON data_exports(expires_at) WHERE status = 'completed';

CREATE INDEX idx_nutrition_trends_user_date ON nutrition_trends(user_id, trend_date DESC);
CREATE INDEX idx_performance_metrics_user_exercise ON performance_metrics(user_id, exercise_id, metric_date DESC);

CREATE INDEX idx_custom_habits_user_active ON custom_habits(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_habit_logs_habit_date ON habit_logs(habit_id, log_date DESC);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-mark export as expired
CREATE OR REPLACE FUNCTION check_export_expiration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expires_at < NOW() AND NEW.status = 'completed' THEN
    NEW.status := 'expired';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_export_expiration ON data_exports;
CREATE TRIGGER trigger_check_export_expiration
  BEFORE UPDATE ON data_exports
  FOR EACH ROW EXECUTE FUNCTION check_export_expiration();

-- Calculate nutrition trends (called by cron job)
CREATE OR REPLACE FUNCTION calculate_nutrition_trends(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_avg_calories_7d INTEGER;
  v_avg_calories_30d INTEGER;
  v_avg_protein_7d FLOAT;
  v_avg_protein_30d FLOAT;
  v_avg_carbs_7d FLOAT;
  v_avg_carbs_30d FLOAT;
  v_avg_fats_7d FLOAT;
  v_avg_fats_30d FLOAT;
  v_calories_variance_7d FLOAT;
  v_calories_variance_30d FLOAT;
  v_protein_pct FLOAT;
  v_carbs_pct FLOAT;
  v_fats_pct FLOAT;
  v_total_macros FLOAT;
BEGIN
  -- Calculate 7-day averages
  SELECT
    AVG(total_calories),
    AVG(total_protein),
    AVG(total_carbs),
    AVG(total_fats),
    STDDEV(total_calories)
  INTO
    v_avg_calories_7d,
    v_avg_protein_7d,
    v_avg_carbs_7d,
    v_avg_fats_7d,
    v_calories_variance_7d
  FROM daily_nutrition_logs
  WHERE user_id = p_user_id
    AND log_date BETWEEN p_date - INTERVAL '6 days' AND p_date;

  -- Calculate 30-day averages
  SELECT
    AVG(total_calories),
    AVG(total_protein),
    AVG(total_carbs),
    AVG(total_fats),
    STDDEV(total_calories)
  INTO
    v_avg_calories_30d,
    v_avg_protein_30d,
    v_avg_carbs_30d,
    v_avg_fats_30d,
    v_calories_variance_30d
  FROM daily_nutrition_logs
  WHERE user_id = p_user_id
    AND log_date BETWEEN p_date - INTERVAL '29 days' AND p_date;

  -- Calculate macro percentages (from 7-day average)
  v_total_macros := (v_avg_protein_7d * 4) + (v_avg_carbs_7d * 4) + (v_avg_fats_7d * 9);

  IF v_total_macros > 0 THEN
    v_protein_pct := (v_avg_protein_7d * 4 / v_total_macros) * 100;
    v_carbs_pct := (v_avg_carbs_7d * 4 / v_total_macros) * 100;
    v_fats_pct := (v_avg_fats_7d * 9 / v_total_macros) * 100;
  END IF;

  -- Insert or update trend
  INSERT INTO nutrition_trends (
    user_id,
    trend_date,
    avg_calories_7d,
    avg_calories_30d,
    avg_protein_7d,
    avg_protein_30d,
    avg_carbs_7d,
    avg_carbs_30d,
    avg_fats_7d,
    avg_fats_30d,
    calories_variance_7d,
    calories_variance_30d,
    protein_percentage,
    carbs_percentage,
    fats_percentage
  )
  VALUES (
    p_user_id,
    p_date,
    v_avg_calories_7d,
    v_avg_calories_30d,
    v_avg_protein_7d,
    v_avg_protein_30d,
    v_avg_carbs_7d,
    v_avg_carbs_30d,
    v_avg_fats_7d,
    v_avg_fats_30d,
    v_calories_variance_7d,
    v_calories_variance_30d,
    v_protein_pct,
    v_carbs_pct,
    v_fats_pct
  )
  ON CONFLICT (user_id, trend_date)
  DO UPDATE SET
    avg_calories_7d = v_avg_calories_7d,
    avg_calories_30d = v_avg_calories_30d,
    avg_protein_7d = v_avg_protein_7d,
    avg_protein_30d = v_avg_protein_30d,
    avg_carbs_7d = v_avg_carbs_7d,
    avg_carbs_30d = v_avg_carbs_30d,
    avg_fats_7d = v_avg_fats_7d,
    avg_fats_30d = v_avg_fats_30d,
    calories_variance_7d = v_calories_variance_7d,
    calories_variance_30d = v_calories_variance_30d,
    protein_percentage = v_protein_pct,
    carbs_percentage = v_carbs_pct,
    fats_percentage = v_fats_pct;
END;
$$ LANGUAGE plpgsql;

-- Update timestamp triggers
CREATE TRIGGER update_data_exports_timestamp
  BEFORE UPDATE ON data_exports
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_custom_habits_timestamp
  BEFORE UPDATE ON custom_habits
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE nutrition_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own nutrition analytics" ON nutrition_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage nutrition analytics" ON nutrition_analytics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own workout analytics" ON workout_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage workout analytics" ON workout_analytics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own ai insights" ON ai_insights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own data exports" ON data_exports
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own nutrition trends" ON nutrition_trends
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage nutrition trends" ON nutrition_trends
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own performance metrics" ON performance_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage performance metrics" ON performance_metrics
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own custom habits" ON custom_habits
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own habit logs" ON habit_logs
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Generate AI insight
CREATE OR REPLACE FUNCTION generate_ai_insight(
  p_user_id UUID,
  p_insight_type TEXT,
  p_category TEXT,
  p_title TEXT,
  p_message TEXT,
  p_priority TEXT DEFAULT 'normal',
  p_recommendations JSONB DEFAULT '[]'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_insight_id UUID;
BEGIN
  INSERT INTO ai_insights (
    user_id,
    insight_type,
    category,
    title,
    message,
    priority,
    recommendations,
    importance_score,
    expires_at
  )
  VALUES (
    p_user_id,
    p_insight_type,
    p_category,
    p_title,
    p_message,
    p_priority,
    p_recommendations,
    CASE p_priority
      WHEN 'urgent' THEN 90
      WHEN 'high' THEN 70
      WHEN 'normal' THEN 50
      ELSE 30
    END,
    CASE p_priority
      WHEN 'urgent' THEN NOW() + INTERVAL '3 days'
      WHEN 'high' THEN NOW() + INTERVAL '7 days'
      ELSE NOW() + INTERVAL '14 days'
    END
  )
  RETURNING id INTO v_insight_id;

  -- Create notification
  INSERT INTO notifications (user_id, type, title, message, action_url)
  VALUES (
    p_user_id,
    'info',
    'New Insight Available',
    p_title,
    '/dashboard?tab=insights'
  );

  RETURN v_insight_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON TABLE nutrition_analytics IS 'Comprehensive nutrition analytics with trends and patterns';
COMMENT ON TABLE workout_analytics IS 'Detailed workout performance analytics and trends';
COMMENT ON TABLE ai_insights IS 'AI-generated insights and recommendations for users';
COMMENT ON TABLE data_exports IS 'User data export requests and file management';
COMMENT ON TABLE nutrition_trends IS 'Rolling averages and trends for nutrition metrics';
COMMENT ON TABLE performance_metrics IS 'Exercise-specific performance tracking over time';
COMMENT ON TABLE custom_habits IS 'User-defined custom habit tracking';
