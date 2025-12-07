-- =============================================
-- Fix Profile Completeness for Optional Fields
-- Date: 2025-12-07
--
-- Make optional fields (medications, health_conditions, etc.) truly optional
-- Users can reach 100% without filling arrays that don't apply to them
-- =============================================

DROP FUNCTION IF EXISTS calculate_profile_completeness(UUID);

CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_user_id UUID)
RETURNS FLOAT AS $$
DECLARE
    v_completeness FLOAT;
    v_required_fields INTEGER := 0;
    v_filled_required_fields INTEGER := 0;
    v_optional_fields INTEGER := 0;
    v_filled_optional_fields INTEGER := 0;
    v_quiz_answers JSONB;
BEGIN
    -- Get quiz answers (stored as JSONB)
    SELECT answers INTO v_quiz_answers
    FROM quiz_results
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    -- =============================================
    -- REQUIRED FIELDS (needed for 100% completion)
    -- =============================================

    -- Core profile fields (9 required)
    v_required_fields := 9;

    SELECT
        (-- From profiles table
         CASE WHEN weight_kg IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN target_weight_kg IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN age IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN gender IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN height_cm IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN activity_level IS NOT NULL THEN 1 ELSE 0 END +
         -- From quiz_results.answers (JSONB fields)
         CASE WHEN v_quiz_answers->>'mainGoal' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN v_quiz_answers->>'dietaryStyle' IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN v_quiz_answers->>'exerciseFrequency' IS NOT NULL THEN 1 ELSE 0 END)
    INTO v_filled_required_fields
    FROM profiles
    WHERE id = p_user_id;

    -- Essential lifestyle fields from user_profile_extended (4 required)
    v_required_fields := v_required_fields + 4;

    SELECT
        COALESCE(v_filled_required_fields, 0) +
        (CASE WHEN cooking_skill IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN cooking_time IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN meals_per_day IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN sleep_quality IS NOT NULL THEN 1 ELSE 0 END)
    INTO v_filled_required_fields
    FROM user_profile_extended
    WHERE user_id = p_user_id;

    -- =============================================
    -- OPTIONAL FIELDS (bonus, not required for 100%)
    -- These are arrays or conditional fields
    -- =============================================

    v_optional_fields := 9;

    SELECT
        (CASE WHEN grocery_budget IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN meal_prep_preference IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN stress_level IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN energy_level IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN gym_access IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN workout_location_preference IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN fitness_experience IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN work_schedule IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN family_size IS NOT NULL THEN 1 ELSE 0 END)
    INTO v_filled_optional_fields
    FROM user_profile_extended
    WHERE user_id = p_user_id;

    -- Handle case where user_profile_extended doesn't exist yet
    v_filled_required_fields := COALESCE(v_filled_required_fields, 0);
    v_filled_optional_fields := COALESCE(v_filled_optional_fields, 0);

    -- Calculate completeness: required fields = 100%, optional fields = bonus
    -- Formula: (required_filled / required_total) * 100
    -- Optional fields don't affect the base percentage
    v_completeness := (v_filled_required_fields::FLOAT / v_required_fields) * 100;

    RETURN ROUND(v_completeness, 2);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON FUNCTION calculate_profile_completeness IS 'Calculates profile completeness with required (13 fields) and optional fields. Users can reach 100% without filling optional arrays like medications, health_conditions, allergies.';
