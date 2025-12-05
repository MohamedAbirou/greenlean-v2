-- =============================================
-- GreenLean Production-Ready Implementation
-- Complete fixes for micro surveys, plan regeneration, and subscription model
-- Date: 2025-12-05
-- =============================================

-- =============================================
-- 1. FEEDBACK TRACKING (for context-based micro survey triggers)
-- =============================================

-- Meal feedback tracking (for "don't like this meal" micro survey trigger)
CREATE TABLE IF NOT EXISTS meal_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    meal_plan_id UUID REFERENCES ai_meal_plans(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL,

    rating INTEGER CHECK (rating BETWEEN 1 AND 5), -- 1-5 stars
    liked BOOLEAN,
    feedback_type TEXT CHECK (feedback_type IN ('too_complex', 'dont_like_ingredients', 'too_expensive', 'not_filling', 'loved_it', 'allergic_reaction')),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meal_feedback_user_id ON meal_feedback(user_id);
CREATE INDEX idx_meal_feedback_liked ON meal_feedback(liked);
CREATE INDEX idx_meal_feedback_created_at ON meal_feedback(created_at DESC);

-- Workout skip tracking (for "skipped workouts" micro survey trigger)
CREATE TABLE IF NOT EXISTS workout_skips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    workout_plan_id UUID REFERENCES ai_workout_plans(id) ON DELETE CASCADE,
    workout_name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,

    skip_reason TEXT CHECK (skip_reason IN ('too_tired', 'no_time', 'injured', 'not_motivated', 'too_difficult', 'equipment_unavailable', 'other')),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_workout_skips_user_id ON workout_skips(user_id);
CREATE INDEX idx_workout_skips_date ON workout_skips(scheduled_date);
CREATE INDEX idx_workout_skips_created_at ON workout_skips(created_at DESC);

-- Energy level tracking (for "low energy" micro survey trigger)
CREATE TABLE IF NOT EXISTS daily_energy_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10), -- 1=very low, 10=excellent
    sleep_hours FLOAT,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, log_date)
);

CREATE INDEX idx_energy_logs_user_id ON daily_energy_logs(user_id);
CREATE INDEX idx_energy_logs_date ON daily_energy_logs(log_date DESC);

-- =============================================
-- 2. PLAN REGENERATION TRACKING
-- =============================================

-- Add regeneration count and timestamp to meal plans
ALTER TABLE ai_meal_plans
    ADD COLUMN IF NOT EXISTS regeneration_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_regenerated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS regeneration_reason TEXT CHECK (regeneration_reason IN ('tier_upgrade', 'manual_request', 'critical_field_update', 'initial_generation'));

-- Add regeneration count and timestamp to workout plans
ALTER TABLE ai_workout_plans
    ADD COLUMN IF NOT EXISTS regeneration_count INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_regenerated_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS regeneration_reason TEXT CHECK (regeneration_reason IN ('tier_upgrade', 'manual_request', 'critical_field_update', 'initial_generation'));

-- Track monthly regeneration usage
CREATE TABLE IF NOT EXISTS plan_regeneration_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    meal_plan_regenerations INTEGER DEFAULT 0,
    workout_plan_regenerations INTEGER DEFAULT 0,
    total_regenerations INTEGER GENERATED ALWAYS AS (meal_plan_regenerations + workout_plan_regenerations) STORED,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, period_start)
);

CREATE INDEX idx_regen_usage_user_id ON plan_regeneration_usage(user_id);
CREATE INDEX idx_regen_usage_period ON plan_regeneration_usage(period_start, period_end);

-- =============================================
-- 3. SUBSCRIPTION TIER UPDATES
-- =============================================

-- Update free tier: 1 initial generation + tier unlock regens + 1 manual/month
UPDATE subscription_tiers SET
    ai_generations_per_month = 1, -- Manual regenerations per month
    meal_plans_storage_limit = 1,
    workout_plans_storage_limit = 1,
    can_access_barcode_scanner = FALSE,
    can_access_social_features = FALSE,
    can_unlock_themes = FALSE,
    priority_support = FALSE,
    features = '["Initial plan generation", "Automatic tier unlock regenerations", "1 manual regeneration per month", "Basic tracking", "Community challenges (view only)"]'::jsonb
WHERE tier = 'free';

-- Update pro tier: Unlimited manual regenerations + all tier unlocks
UPDATE subscription_tiers SET
    ai_generations_per_month = 999999, -- Effectively unlimited
    meal_plans_storage_limit = 5,
    workout_plans_storage_limit = 5,
    can_access_barcode_scanner = TRUE,
    can_access_social_features = TRUE,
    can_unlock_themes = TRUE,
    priority_support = FALSE,
    price_monthly_cents = 499, -- $4.99/month
    price_yearly_cents = 3999, -- $39.99/year
    features = '["Unlimited plan regenerations", "Standard tier personalization (15+ fields)", "Custom macro targets", "Barcode scanner", "Meal prep guides", "Progressive overload tracking", "Ad-free experience", "Up to 5 saved plans", "Priority email support"]'::jsonb
WHERE tier = 'pro';

-- Update premium tier: Everything in Pro + advanced features
UPDATE subscription_tiers SET
    ai_generations_per_month = 999999, -- Effectively unlimited
    meal_plans_storage_limit = NULL, -- Unlimited
    workout_plans_storage_limit = NULL, -- Unlimited
    can_access_barcode_scanner = TRUE,
    can_access_social_features = TRUE,
    can_unlock_themes = TRUE,
    priority_support = TRUE,
    price_monthly_cents = 999, -- $9.99/month
    price_yearly_cents = 7999, -- $79.99/year
    features = '["Everything in Pro", "Premium tier personalization (25+ fields)", "Unlimited plan storage", "Advanced analytics", "Recipe import", "AI nutrition consultation", "Exclusive challenges", "Premium themes & avatars", "Social features", "Early access to new features", "White-glove support"]'::jsonb
WHERE tier = 'premium';

-- =============================================
-- 4. FUNCTIONS FOR REGENERATION LOGIC
-- =============================================

-- Function to check if user can regenerate plans
CREATE OR REPLACE FUNCTION can_regenerate_plan(
    p_user_id UUID,
    p_plan_type TEXT, -- 'meal' or 'workout'
    p_regeneration_type TEXT DEFAULT 'manual' -- 'manual', 'tier_upgrade', or 'critical_field'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier TEXT;
    v_monthly_limit INTEGER;
    v_period_start TIMESTAMPTZ;
    v_current_usage INTEGER;
BEGIN
    -- Get user tier
    SELECT tier INTO v_tier
    FROM subscriptions
    WHERE user_id = p_user_id AND status = 'active';

    v_tier := COALESCE(v_tier, 'free');

    -- Tier upgrades are ALWAYS allowed (encourage profile completion)
    IF p_regeneration_type = 'tier_upgrade' THEN
        RETURN TRUE;
    END IF;

    -- Critical field updates are ALWAYS allowed (safety + UX)
    IF p_regeneration_type = 'critical_field' THEN
        RETURN TRUE;
    END IF;

    -- For manual regenerations, check limits based on tier
    IF v_tier IN ('pro', 'premium') THEN
        -- Pro/Premium: unlimited manual regenerations
        RETURN TRUE;
    END IF;

    -- Free tier: 1 manual regeneration per month
    IF v_tier = 'free' THEN
        v_period_start := DATE_TRUNC('month', NOW());

        -- Get current usage for this month
        SELECT COALESCE(
            CASE
                WHEN p_plan_type = 'meal' THEN meal_plan_regenerations
                WHEN p_plan_type = 'workout' THEN workout_plan_regenerations
                ELSE 0
            END,
            0
        ) INTO v_current_usage
        FROM plan_regeneration_usage
        WHERE user_id = p_user_id
          AND period_start = v_period_start;

        -- Get monthly limit (1 for free tier)
        SELECT ai_generations_per_month INTO v_monthly_limit
        FROM subscription_tiers
        WHERE tier = v_tier;

        RETURN COALESCE(v_current_usage, 0) < v_monthly_limit;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to track regeneration usage
CREATE OR REPLACE FUNCTION track_regeneration(
    p_user_id UUID,
    p_plan_type TEXT, -- 'meal' or 'workout'
    p_regeneration_type TEXT DEFAULT 'manual'
)
RETURNS VOID AS $$
DECLARE
    v_period_start TIMESTAMPTZ;
    v_period_end TIMESTAMPTZ;
BEGIN
    -- Only track manual regenerations (tier_upgrade and critical_field don't count against limits)
    IF p_regeneration_type != 'manual' THEN
        RETURN;
    END IF;

    -- Get current monthly period
    v_period_start := DATE_TRUNC('month', NOW());
    v_period_end := v_period_start + INTERVAL '1 month';

    -- Insert or update usage
    IF p_plan_type = 'meal' THEN
        INSERT INTO plan_regeneration_usage (user_id, period_start, period_end, meal_plan_regenerations)
        VALUES (p_user_id, v_period_start, v_period_end, 1)
        ON CONFLICT (user_id, period_start)
        DO UPDATE SET
            meal_plan_regenerations = plan_regeneration_usage.meal_plan_regenerations + 1,
            updated_at = NOW();
    ELSIF p_plan_type = 'workout' THEN
        INSERT INTO plan_regeneration_usage (user_id, period_start, period_end, workout_plan_regenerations)
        VALUES (p_user_id, v_period_start, v_period_end, 1)
        ON CONFLICT (user_id, period_start)
        DO UPDATE SET
            workout_plan_regenerations = plan_regeneration_usage.workout_plan_regenerations + 1,
            updated_at = NOW();
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 5. RLS POLICIES FOR NEW TABLES
-- =============================================

-- Meal feedback
ALTER TABLE meal_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own meal feedback" ON meal_feedback
    FOR ALL USING (auth.uid() = user_id);

-- Workout skips
ALTER TABLE workout_skips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own workout skips" ON workout_skips
    FOR ALL USING (auth.uid() = user_id);

-- Energy logs
ALTER TABLE daily_energy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own energy logs" ON daily_energy_logs
    FOR ALL USING (auth.uid() = user_id);

-- Regeneration usage (read-only for users, service_role can manage)
ALTER TABLE plan_regeneration_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own regeneration usage" ON plan_regeneration_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage regeneration usage" ON plan_regeneration_usage
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 6. UPDATED TIMESTAMP TRIGGERS
-- =============================================

CREATE TRIGGER update_plan_regeneration_usage_timestamp
    BEFORE UPDATE ON plan_regeneration_usage
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON TABLE meal_feedback IS 'Tracks user feedback on meal plans for context-based micro survey triggers';
COMMENT ON TABLE workout_skips IS 'Tracks skipped workouts for context-based micro survey triggers';
COMMENT ON TABLE daily_energy_logs IS 'Tracks daily energy levels for context-based micro survey triggers';
COMMENT ON TABLE plan_regeneration_usage IS 'Tracks monthly plan regeneration usage for feature gating';

COMMENT ON FUNCTION can_regenerate_plan IS 'Checks if user can regenerate a plan based on tier and usage limits. Tier upgrades and critical fields are always allowed.';
COMMENT ON FUNCTION track_regeneration IS 'Tracks manual plan regenerations against monthly limits. Does not count tier upgrades or critical field updates.';
