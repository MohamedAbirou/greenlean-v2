-- =============================================
-- Fix calculate_profile_completeness Function
-- Date: 2025-12-07
--
-- CRITICAL FIX: The function was referencing main_goal, dietary_preference,
-- and exercise_frequency columns that don't exist in the profiles table.
-- These fields are stored in quiz_results.answers as JSONB.
-- =============================================

-- Drop the old function
DROP FUNCTION IF EXISTS calculate_profile_completeness(UUID);

-- Create the corrected function
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_user_id UUID)
RETURNS FLOAT AS $$
DECLARE
    v_completeness FLOAT;
    v_total_fields INTEGER := 22; -- From MealPlanPromptBuilder._calculate_completeness
    v_filled_fields INTEGER := 0;
    v_quiz_answers JSONB;
BEGIN
    -- Get quiz answers (stored as JSONB)
    SELECT answers INTO v_quiz_answers
    FROM quiz_results
    WHERE user_id = p_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    -- Count filled fields from profiles table + quiz_results
    SELECT
        (-- From profiles table (only fields that exist!)
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
    INTO v_filled_fields
    FROM profiles
    WHERE id = p_user_id;

    -- Count filled fields from user_profile_extended
    SELECT
        v_filled_fields +
        (CASE WHEN cooking_skill IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN cooking_time IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN grocery_budget IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN meals_per_day IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN array_length(food_allergies, 1) > 0 THEN 1 ELSE 0 END +
         CASE WHEN array_length(disliked_foods, 1) > 0 THEN 1 ELSE 0 END +
         CASE WHEN meal_prep_preference IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN array_length(health_conditions, 1) > 0 THEN 1 ELSE 0 END +
         CASE WHEN array_length(medications, 1) > 0 THEN 1 ELSE 0 END +
         CASE WHEN sleep_quality IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN stress_level IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN gym_access IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN workout_location_preference IS NOT NULL THEN 1 ELSE 0 END)
    INTO v_filled_fields
    FROM user_profile_extended
    WHERE user_id = p_user_id;

    -- Handle case where user_profile_extended doesn't exist yet
    v_filled_fields := COALESCE(v_filled_fields, 0);

    v_completeness := (v_filled_fields::FLOAT / v_total_fields) * 100;

    RETURN ROUND(v_completeness, 2);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON FUNCTION calculate_profile_completeness IS 'Calculates profile completeness from profiles table, quiz_results.answers (JSONB), and user_profile_extended. Fixed to reference correct schema.';
