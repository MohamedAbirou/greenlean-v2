-- Micro-Survey System Database Schema
-- Progressive Profiling: Threshold-Based Approach

-- Table: micro_survey_questions
-- Stores all available micro-survey questions with metadata
CREATE TABLE IF NOT EXISTS micro_survey_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Question details
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- 'single_choice', 'multi_choice', 'text', 'numeric', 'scale'
    field_name VARCHAR(100) NOT NULL, -- UserProfileData field to update (e.g., 'cooking_skill', 'gym_access')

    -- Domain mapping
    affects TEXT[] NOT NULL DEFAULT '{}', -- ['diet'], ['workout'], or ['both']

    -- Trigger conditions
    trigger_type VARCHAR(50) NOT NULL, -- 'time_based', 'action_based', 'context_based'
    trigger_condition JSONB, -- Specific trigger logic
    -- Example time_based: {"days_after_signup": 3}
    -- Example action_based: {"workout_count": 5}
    -- Example context_based: {"meal_disliked_count": 3}

    -- Question options (for choice-type questions)
    options JSONB, -- [{"value": "beginner", "label": "Beginner"}, ...]

    -- Tier unlocking
    tier_contribution FLOAT DEFAULT 1.0, -- How much this question contributes to tier (1 field = ~4.5%)

    -- Display settings
    priority INTEGER DEFAULT 0, -- Higher priority = shown first
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: micro_survey_triggers
-- Tracks when micro-surveys should be shown to users
CREATE TABLE IF NOT EXISTS micro_survey_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES micro_survey_questions(id) ON DELETE CASCADE,

    -- Trigger status
    trigger_type VARCHAR(50) NOT NULL,
    triggered_at TIMESTAMP,
    shown_at TIMESTAMP,
    dismissed_at TIMESTAMP,

    -- Trigger metadata
    trigger_metadata JSONB, -- Additional context about why triggered

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, question_id)
);

-- Table: micro_survey_responses
-- Stores user responses to micro-surveys
CREATE TABLE IF NOT EXISTS micro_survey_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES micro_survey_questions(id) ON DELETE CASCADE,

    -- Response data
    response_value TEXT NOT NULL, -- User's answer
    response_metadata JSONB, -- Additional response data

    -- Profile update tracking
    field_updated VARCHAR(100), -- Which UserProfileData field was updated
    old_completeness FLOAT, -- Profile completeness before response
    new_completeness FLOAT, -- Profile completeness after response
    old_tier VARCHAR(20), -- BASIC/STANDARD/PREMIUM before
    new_tier VARCHAR(20), -- BASIC/STANDARD/PREMIUM after
    threshold_crossed BOOLEAN DEFAULT FALSE, -- Did this response cross a tier threshold?

    -- Response timing
    responded_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, question_id)
);

-- Table: tier_unlock_events
-- Tracks when users unlock new tiers
CREATE TABLE IF NOT EXISTS tier_unlock_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Tier change
    old_tier VARCHAR(20) NOT NULL,
    new_tier VARCHAR(20) NOT NULL,
    completeness_percentage FLOAT NOT NULL,

    -- Triggering response
    triggering_response_id UUID REFERENCES micro_survey_responses(id),

    -- Regeneration tracking
    regeneration_offered_at TIMESTAMP DEFAULT NOW(),
    regeneration_accepted_at TIMESTAMP,
    regeneration_dismissed_at TIMESTAMP,

    -- Which plans were regenerated
    meal_plan_regenerated BOOLEAN DEFAULT FALSE,
    workout_plan_regenerated BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Table: user_profile_extended
-- Extended user profile fields collected via micro-surveys
CREATE TABLE IF NOT EXISTS user_profile_extended (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Diet-related fields (from micro-surveys)
    cooking_skill VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    cooking_time VARCHAR(50), -- '15-30 min', '30-45 min', '45-60 min', '60+ min'
    grocery_budget VARCHAR(50), -- 'low', 'medium', 'high'
    meals_per_day INTEGER,
    food_allergies TEXT[],
    disliked_foods TEXT[],
    meal_prep_preference VARCHAR(50), -- 'no_prep', 'some_prep', 'batch_cooking'

    -- Workout-related fields (from micro-surveys)
    gym_access BOOLEAN,
    equipment_available TEXT[], -- ['dumbbells', 'resistance_bands', 'pull_up_bar']
    workout_location_preference VARCHAR(50), -- 'home', 'gym', 'outdoor', 'mixed'
    injuries_limitations TEXT[],
    fitness_experience VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'

    -- Health & wellness (from micro-surveys)
    health_conditions TEXT[],
    medications TEXT[],
    sleep_quality INTEGER, -- 1-10 scale
    stress_level INTEGER, -- 1-10 scale
    energy_level INTEGER, -- 1-10 scale

    -- Lifestyle (from micro-surveys)
    work_schedule VARCHAR(50), -- 'regular_9_5', 'shift_work', 'flexible', 'irregular'
    family_size INTEGER,
    dietary_restrictions TEXT[],

    -- Profile completeness
    completeness_percentage FLOAT DEFAULT 0,
    current_tier VARCHAR(20) DEFAULT 'BASIC',

    -- Metadata
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_micro_survey_triggers_user ON micro_survey_triggers(user_id);
CREATE INDEX idx_micro_survey_triggers_status ON micro_survey_triggers(triggered_at, shown_at);
CREATE INDEX idx_micro_survey_responses_user ON micro_survey_responses(user_id);
CREATE INDEX idx_tier_unlock_events_user ON tier_unlock_events(user_id);
CREATE INDEX idx_user_profile_extended_tier ON user_profile_extended(current_tier);

-- Function to calculate profile completeness
CREATE OR REPLACE FUNCTION calculate_profile_completeness(p_user_id UUID)
RETURNS FLOAT AS $$
DECLARE
    v_completeness FLOAT;
    v_total_fields INTEGER := 22; -- From MealPlanPromptBuilder._calculate_completeness
    v_filled_fields INTEGER := 0;
BEGIN
    -- Count filled fields from profiles table
    SELECT
        (CASE WHEN main_goal IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN weight_kg IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN target_weight_kg IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN age IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN gender IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN height_cm IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN dietary_preference IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN activity_level IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN exercise_frequency IS NOT NULL THEN 1 ELSE 0 END)
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

    v_completeness := (v_filled_fields::FLOAT / v_total_fields) * 100;

    RETURN ROUND(v_completeness, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to determine tier from completeness
CREATE OR REPLACE FUNCTION determine_tier(p_completeness FLOAT)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF p_completeness < 30 THEN
        RETURN 'BASIC';
    ELSIF p_completeness < 70 THEN
        RETURN 'STANDARD';
    ELSE
        RETURN 'PREMIUM';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update completeness when user_profile_extended changes
CREATE OR REPLACE FUNCTION update_profile_completeness()
RETURNS TRIGGER AS $$
DECLARE
    v_completeness FLOAT;
    v_tier VARCHAR(20);
BEGIN
    v_completeness := calculate_profile_completeness(NEW.user_id);
    v_tier := determine_tier(v_completeness);

    NEW.completeness_percentage := v_completeness;
    NEW.current_tier := v_tier;
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_profile_completeness
    BEFORE INSERT OR UPDATE ON user_profile_extended
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completeness();

-- Comments for documentation
COMMENT ON TABLE micro_survey_questions IS 'Library of all micro-survey questions with trigger conditions and metadata';
COMMENT ON TABLE micro_survey_triggers IS 'Tracks when micro-surveys should be shown to specific users';
COMMENT ON TABLE micro_survey_responses IS 'Stores user responses and tracks tier progression';
COMMENT ON TABLE tier_unlock_events IS 'Logs tier unlock events and regeneration offers';
COMMENT ON TABLE user_profile_extended IS 'Extended user profile fields collected via micro-surveys';
