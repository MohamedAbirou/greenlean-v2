-- Micro-Survey Questions - Seed Data
-- Progressive Profiling: Threshold-Based Approach

-- TIME-BASED MICRO-SURVEYS
-- After 3 days: Energy & Sleep (affects BOTH diet and workout)
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('How would you rate your energy levels this week?', 'scale', 'energy_level', ARRAY['both'], 'time_based', '{"days_after_signup": 3}'::jsonb,
 '[{"value": 1, "label": "Very Low"}, {"value": 5, "label": "Moderate"}, {"value": 10, "label": "Excellent"}]'::jsonb, 100),

('How has your sleep quality been?', 'scale', 'sleep_quality', ARRAY['both'], 'time_based', '{"days_after_signup": 3}'::jsonb,
 '[{"value": 1, "label": "Very Poor"}, {"value": 5, "label": "Average"}, {"value": 10, "label": "Excellent"}]'::jsonb, 99);

-- After 7 days: Diet preferences
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('How much time do you typically have for cooking?', 'single_choice', 'cooking_time', ARRAY['diet'], 'time_based', '{"days_after_signup": 7}'::jsonb,
 '[{"value": "15-30 min", "label": "15-30 minutes"}, {"value": "30-45 min", "label": "30-45 minutes"}, {"value": "45-60 min", "label": "45-60 minutes"}, {"value": "60+ min", "label": "More than 1 hour"}]'::jsonb, 90),

('What is your cooking skill level?', 'single_choice', 'cooking_skill', ARRAY['diet'], 'time_based', '{"days_after_signup": 7}'::jsonb,
 '[{"value": "beginner", "label": "Beginner - Simple recipes only"}, {"value": "intermediate", "label": "Intermediate - Can follow most recipes"}, {"value": "advanced", "label": "Advanced - Comfortable with complex techniques"}]'::jsonb, 89),

('What is your typical weekly grocery budget?', 'single_choice', 'grocery_budget', ARRAY['diet'], 'time_based', '{"days_after_signup": 7}'::jsonb,
 '[{"value": "low", "label": "Budget-friendly ($50-75/week)"}, {"value": "medium", "label": "Moderate ($75-125/week)"}, {"value": "high", "label": "Premium ($125+/week)"}]'::jsonb, 88);

-- After 14 days: Workout setup & health
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('Do you have access to a gym?', 'single_choice', 'gym_access', ARRAY['workout'], 'time_based', '{"days_after_signup": 14}'::jsonb,
 '[{"value": "true", "label": "Yes, I have gym access"}, {"value": "false", "label": "No, I work out at home"}]'::jsonb, 80),

('What fitness equipment do you have available?', 'multi_choice', 'equipment_available', ARRAY['workout'], 'time_based', '{"days_after_signup": 14}'::jsonb,
 '[{"value": "dumbbells", "label": "Dumbbells"}, {"value": "resistance_bands", "label": "Resistance Bands"}, {"value": "pull_up_bar", "label": "Pull-up Bar"}, {"value": "kettlebells", "label": "Kettlebells"}, {"value": "barbell", "label": "Barbell"}, {"value": "yoga_mat", "label": "Yoga Mat"}, {"value": "none", "label": "No equipment"}]'::jsonb, 79),

('How stressed do you typically feel?', 'scale', 'stress_level', ARRAY['both'], 'time_based', '{"days_after_signup": 14}'::jsonb,
 '[{"value": 1, "label": "Very Calm"}, {"value": 5, "label": "Moderate Stress"}, {"value": 10, "label": "Very Stressed"}]'::jsonb, 78);

-- ACTION-BASED MICRO-SURVEYS
-- After completing 5 workouts
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('Where do you prefer to work out?', 'single_choice', 'workout_location_preference', ARRAY['workout'], 'action_based', '{"workout_count": 5}'::jsonb,
 '[{"value": "home", "label": "Home"}, {"value": "gym", "label": "Gym"}, {"value": "outdoor", "label": "Outdoor/Parks"}, {"value": "mixed", "label": "Mix of locations"}]'::jsonb, 70),

('What is your fitness experience level?', 'single_choice', 'fitness_experience', ARRAY['workout'], 'action_based', '{"workout_count": 5}'::jsonb,
 '[{"value": "beginner", "label": "Beginner - New to fitness"}, {"value": "intermediate", "label": "Intermediate - Regular exerciser"}, {"value": "advanced", "label": "Advanced - Years of experience"}]'::jsonb, 69);

-- After logging 10 meals
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('How many meals do you prefer to eat per day?', 'single_choice', 'meals_per_day', ARRAY['diet'], 'action_based', '{"meal_log_count": 10}'::jsonb,
 '[{"value": "2", "label": "2 meals (Intermittent fasting style)"}, {"value": "3", "label": "3 meals (Traditional)"}, {"value": "4", "label": "4-5 meals (Frequent smaller meals)"}]'::jsonb, 60),

('How do you feel about meal prepping?', 'single_choice', 'meal_prep_preference', ARRAY['diet'], 'action_based', '{"meal_log_count": 10}'::jsonb,
 '[{"value": "no_prep", "label": "Prefer cooking fresh daily"}, {"value": "some_prep", "label": "Some prep for convenience"}, {"value": "batch_cooking", "label": "Love batch cooking on weekends"}]'::jsonb, 59);

-- After viewing plans 10 times
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('What is your typical work schedule?', 'single_choice', 'work_schedule', ARRAY['both'], 'action_based', '{"plan_view_count": 10}'::jsonb,
 '[{"value": "regular_9_5", "label": "Regular 9-5"}, {"value": "shift_work", "label": "Shift work"}, {"value": "flexible", "label": "Flexible hours"}, {"value": "irregular", "label": "Irregular/Unpredictable"}]'::jsonb, 50);

-- CONTEXT-BASED MICRO-SURVEYS
-- After marking meals as "didn't like it" 3 times
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('Do you have any food allergies or intolerances?', 'multi_choice', 'food_allergies', ARRAY['diet'], 'context_based', '{"meal_disliked_count": 3}'::jsonb,
 '[{"value": "dairy", "label": "Dairy"}, {"value": "gluten", "label": "Gluten"}, {"value": "nuts", "label": "Nuts"}, {"value": "shellfish", "label": "Shellfish"}, {"value": "eggs", "label": "Eggs"}, {"value": "soy", "label": "Soy"}, {"value": "none", "label": "No allergies"}]'::jsonb, 40),

('Are there any foods you strongly dislike?', 'text', 'disliked_foods', ARRAY['diet'], 'context_based', '{"meal_disliked_count": 3}'::jsonb,
 NULL, 39);

-- After skipping workouts 3 times
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('Do you have any injuries or physical limitations?', 'text', 'injuries_limitations', ARRAY['workout'], 'context_based', '{"workout_skipped_count": 3}'::jsonb,
 NULL, 30);

-- After logging low energy 3 days
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('Are you currently taking any medications?', 'text', 'medications', ARRAY['both'], 'context_based', '{"low_energy_count": 3}'::jsonb,
 NULL, 20),

('Do you have any health conditions we should know about?', 'text', 'health_conditions', ARRAY['both'], 'context_based', '{"low_energy_count": 3}'::jsonb,
 NULL, 19);

-- ADVANCED QUESTIONS (helps reach PREMIUM tier)
-- After 21 days (for dedicated users)
INSERT INTO micro_survey_questions (question_text, question_type, field_name, affects, trigger_type, trigger_condition, options, priority) VALUES
('How many people are you cooking for?', 'single_choice', 'family_size', ARRAY['diet'], 'time_based', '{"days_after_signup": 21}'::jsonb,
 '[{"value": "1", "label": "Just me"}, {"value": "2", "label": "2 people"}, {"value": "3-4", "label": "3-4 people"}, {"value": "5+", "label": "5 or more"}]'::jsonb, 10),

('Do you follow any specific dietary restrictions?', 'multi_choice', 'dietary_restrictions', ARRAY['diet'], 'time_based', '{"days_after_signup": 21}'::jsonb,
 '[{"value": "halal", "label": "Halal"}, {"value": "kosher", "label": "Kosher"}, {"value": "low_sodium", "label": "Low Sodium"}, {"value": "low_sugar", "label": "Low Sugar"}, {"value": "diabetic", "label": "Diabetic-friendly"}, {"value": "none", "label": "No restrictions"}]'::jsonb, 9);

-- Grant permissions (adjust based on your RLS policies)
-- ALTER TABLE micro_survey_questions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE micro_survey_triggers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE micro_survey_responses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tier_unlock_events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profile_extended ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize as needed)
-- CREATE POLICY "Users can view their own triggers" ON micro_survey_triggers FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert their own responses" ON micro_survey_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can view their own profile extended" ON user_profile_extended FOR SELECT USING (auth.uid() = user_id);

COMMENT ON TABLE micro_survey_questions IS 'Seeded with 20+ micro-survey questions across time/action/context triggers';
