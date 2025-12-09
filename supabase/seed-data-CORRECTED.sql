-- CORRECTED Seed Data for Fitness Tracking Dashboard
-- Matches EXACT database schema from migrations

DO $$
DECLARE
  test_user_id UUID;
  meal_log_id UUID;
  workout_session_id UUID;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get the first user
  SELECT id INTO test_user_id FROM profiles LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Create a user first: INSERT INTO profiles (email) VALUES (''test@example.com'');';
  END IF;

  RAISE NOTICE 'Using user ID: %', test_user_id;

  -- ========================================
  -- WATER INTAKE (Last 7 days)
  -- ========================================
  FOR i IN 0..6 LOOP
    INSERT INTO water_intake_logs (user_id, log_date, amount_ml, logged_at)
    VALUES
      (test_user_id, today_date - i, 250, (today_date - i)::timestamp + interval '8 hours'),
      (test_user_id, today_date - i, 500, (today_date - i)::timestamp + interval '12 hours'),
      (test_user_id, today_date - i, 500, (today_date - i)::timestamp + interval '15 hours'),
      (test_user_id, today_date - i, 750, (today_date - i)::timestamp + interval '19 hours');
  END LOOP;

  -- ========================================
  -- BODY MEASUREMENTS (Last 30 days, weekly)
  -- ========================================
  FOR i IN 0..4 LOOP
    INSERT INTO body_measurements_simple (user_id, measurement_date, weight_kg, body_fat_percentage, waist_cm, hips_cm, notes)
    VALUES (
      test_user_id,
      today_date - (i * 7),
      75.5 - (i * 0.5),
      18.5 - (i * 0.3),
      82.0 - (i * 0.5),
      95.0 - (i * 0.3),
      CASE i
        WHEN 0 THEN 'Feeling great! Energy high.'
        WHEN 1 THEN 'Good progress this week.'
        ELSE 'Steady progress'
      END
    );
  END LOOP;

  -- ========================================
  -- MEAL LOGS (Last 14 days)
  -- EXACT SCHEMA: total_protein, total_carbs, total_fats (NO _g suffix!)
  -- meal_items: protein, carbs, fats (NO _g suffix!), serving_qty, serving_unit
  -- ========================================
  FOR day_offset IN 0..13 LOOP
    DECLARE
      log_date DATE := today_date - day_offset;
      breakfast_log_id UUID;
      lunch_log_id UUID;
      dinner_log_id UUID;
    BEGIN
      -- Breakfast
      INSERT INTO daily_nutrition_logs (user_id, log_date, meal_type, total_calories, total_protein, total_carbs, total_fats)
      VALUES (test_user_id, log_date, 'breakfast', 450, 25, 50, 15)
      RETURNING id INTO breakfast_log_id;

      INSERT INTO meal_items (user_id, nutrition_log_id, food_name, calories, protein, carbs, fats, serving_qty, serving_unit, logged_at)
      VALUES
        (test_user_id, breakfast_log_id, 'Oatmeal with Berries', 250, 10, 40, 5, 1, 'bowl', log_date::timestamp + interval '8 hours'),
        (test_user_id, breakfast_log_id, 'Scrambled Eggs', 150, 12, 2, 10, 2, 'eggs', log_date::timestamp + interval '8 hours'),
        (test_user_id, breakfast_log_id, 'Orange Juice', 50, 3, 8, 0, 1, 'glass', log_date::timestamp + interval '8 hours');

      -- Lunch
      INSERT INTO daily_nutrition_logs (user_id, log_date, meal_type, total_calories, total_protein, total_carbs, total_fats)
      VALUES (test_user_id, log_date, 'lunch', 650, 45, 60, 20)
      RETURNING id INTO lunch_log_id;

      INSERT INTO meal_items (user_id, nutrition_log_id, food_name, calories, protein, carbs, fats, serving_qty, serving_unit, logged_at)
      VALUES
        (test_user_id, lunch_log_id, 'Grilled Chicken Breast', 300, 35, 0, 8, 200, 'g', log_date::timestamp + interval '13 hours'),
        (test_user_id, lunch_log_id, 'Brown Rice', 200, 5, 45, 2, 1, 'cup', log_date::timestamp + interval '13 hours'),
        (test_user_id, lunch_log_id, 'Steamed Broccoli', 50, 3, 10, 0, 150, 'g', log_date::timestamp + interval '13 hours'),
        (test_user_id, lunch_log_id, 'Olive Oil', 100, 2, 5, 10, 1, 'tbsp', log_date::timestamp + interval '13 hours');

      -- Dinner
      INSERT INTO daily_nutrition_logs (user_id, log_date, meal_type, total_calories, total_protein, total_carbs, total_fats)
      VALUES (test_user_id, log_date, 'dinner', 550, 40, 45, 18)
      RETURNING id INTO dinner_log_id;

      INSERT INTO meal_items (user_id, nutrition_log_id, food_name, calories, protein, carbs, fats, serving_qty, serving_unit, logged_at)
      VALUES
        (test_user_id, dinner_log_id, 'Salmon Fillet', 350, 35, 0, 15, 150, 'g', log_date::timestamp + interval '19 hours'),
        (test_user_id, dinner_log_id, 'Sweet Potato', 150, 2, 35, 0, 1, 'medium', log_date::timestamp + interval '19 hours'),
        (test_user_id, dinner_log_id, 'Mixed Salad', 50, 3, 10, 3, 1, 'bowl', log_date::timestamp + interval '19 hours');
    END;
  END LOOP;

  -- ========================================
  -- WORKOUT SESSIONS (Last 14 days)
  -- EXACT SCHEMA: session_date (NOT workout_date!)
  -- ========================================
  FOR day_offset IN 0..13 LOOP
    IF day_offset % 2 = 0 OR day_offset % 3 = 0 THEN
      DECLARE
        log_date DATE := today_date - day_offset;
        workout_type TEXT := CASE (day_offset % 3)
          WHEN 0 THEN 'strength'
          WHEN 1 THEN 'cardio'
          ELSE 'strength'
        END;
      BEGIN
        INSERT INTO workout_sessions (
          user_id, session_date, session_start_time, session_end_time,
          workout_name, workout_type, total_exercises, total_sets, total_volume_kg, calories_burned,
          location, energy_level, mood_after, status, notes
        )
        VALUES (
          test_user_id,
          log_date,
          log_date::timestamp + interval '18 hours',
          log_date::timestamp + interval '19 hours 30 minutes',
          CASE workout_type
            WHEN 'strength' THEN 'Upper Body Strength'
            WHEN 'cardio' THEN 'HIIT Cardio'
            ELSE 'Full Body'
          END,
          workout_type,
          CASE workout_type WHEN 'strength' THEN 6 ELSE 1 END,
          CASE workout_type WHEN 'strength' THEN 18 ELSE 0 END,
          CASE workout_type WHEN 'strength' THEN 2500.0 ELSE 0.0 END,
          CASE workout_type WHEN 'strength' THEN 400 ELSE 500 END,
          CASE (day_offset % 2) WHEN 0 THEN 'gym' ELSE 'home' END,
          4,
          'great',
          'completed',
          'Great session!'
        )
        RETURNING id INTO workout_session_id;

        -- Add exercise sets for strength workouts
        IF workout_type = 'strength' THEN
          -- Bench Press
          INSERT INTO exercise_sets (user_id, workout_session_id, exercise_name, exercise_category, set_number, reps, weight_kg, rest_seconds)
          VALUES
            (test_user_id, workout_session_id, 'Bench Press', 'chest', 1, 12, 60, 90),
            (test_user_id, workout_session_id, 'Bench Press', 'chest', 2, 10, 65, 90),
            (test_user_id, workout_session_id, 'Bench Press', 'chest', 3, 8, 70, 90);

          -- Rows
          INSERT INTO exercise_sets (user_id, workout_session_id, exercise_name, exercise_category, set_number, reps, weight_kg, rest_seconds)
          VALUES
            (test_user_id, workout_session_id, 'Bent Over Rows', 'back', 1, 12, 50, 90),
            (test_user_id, workout_session_id, 'Bent Over Rows', 'back', 2, 10, 55, 90),
            (test_user_id, workout_session_id, 'Bent Over Rows', 'back', 3, 8, 60, 90);

          -- Shoulder Press
          INSERT INTO exercise_sets (user_id, workout_session_id, exercise_name, exercise_category, set_number, reps, weight_kg, rest_seconds)
          VALUES
            (test_user_id, workout_session_id, 'Shoulder Press', 'shoulders', 1, 12, 40, 60),
            (test_user_id, workout_session_id, 'Shoulder Press', 'shoulders', 2, 10, 45, 60),
            (test_user_id, workout_session_id, 'Shoulder Press', 'shoulders', 3, 8, 50, 60);

          -- Curls
          INSERT INTO exercise_sets (user_id, workout_session_id, exercise_name, exercise_category, set_number, reps, weight_kg, rest_seconds)
          VALUES
            (test_user_id, workout_session_id, 'Bicep Curls', 'arms', 1, 15, 15, 60),
            (test_user_id, workout_session_id, 'Bicep Curls', 'arms', 2, 12, 17.5, 60),
            (test_user_id, workout_session_id, 'Bicep Curls', 'arms', 3, 10, 20, 60);

          -- Triceps
          INSERT INTO exercise_sets (user_id, workout_session_id, exercise_name, exercise_category, set_number, reps, weight_kg, rest_seconds)
          VALUES
            (test_user_id, workout_session_id, 'Tricep Extensions', 'arms', 1, 15, 12.5, 60),
            (test_user_id, workout_session_id, 'Tricep Extensions', 'arms', 2, 12, 15, 60),
            (test_user_id, workout_session_id, 'Tricep Extensions', 'arms', 3, 10, 17.5, 60);

          -- Face Pulls
          INSERT INTO exercise_sets (user_id, workout_session_id, exercise_name, exercise_category, set_number, reps, weight_kg, rest_seconds)
          VALUES
            (test_user_id, workout_session_id, 'Face Pulls', 'shoulders', 1, 20, 25, 60),
            (test_user_id, workout_session_id, 'Face Pulls', 'shoulders', 2, 18, 27.5, 60),
            (test_user_id, workout_session_id, 'Face Pulls', 'shoulders', 3, 15, 30, 60);
        END IF;
      END;
    END IF;
  END LOOP;

  -- ========================================
  -- PERSONAL RECORDS
  -- ========================================
  INSERT INTO exercise_personal_records (user_id, exercise_name, exercise_category, reps, weight_kg, achieved_at)
  VALUES
    (test_user_id, 'Bench Press', 'chest', 8, 70, today_date - 2),
    (test_user_id, 'Bent Over Rows', 'back', 8, 60, today_date - 4),
    (test_user_id, 'Shoulder Press', 'shoulders', 8, 50, today_date - 6);

  -- ========================================
  -- PROGRESS MILESTONES
  -- ========================================
  INSERT INTO progress_milestones (user_id, milestone_name, milestone_type, target_value, current_value, achieved, achieved_at, description)
  VALUES
    (test_user_id, 'Lost 5kg', 'weight_loss', 5, 5, TRUE, today_date - 21, 'Lost 5kg!'),
    (test_user_id, '30 Day Streak', 'streak', 30, 30, TRUE, today_date - 7, '30 days streak'),
    (test_user_id, 'Bench 70kg', 'strength', 70, 70, TRUE, today_date - 2, 'New bench PR!');

  -- ========================================
  -- JOURNEY TIMELINE
  -- ========================================
  INSERT INTO user_journey_timeline (user_id, event_date, event_type, title, description)
  VALUES
    (test_user_id, today_date, 'note', 'Daily Journal', 'Feeling motivated! Hit new PR on bench.'),
    (test_user_id, today_date - 2, 'workout_pr', 'New Bench PR!', 'Achieved 8 reps at 70kg'),
    (test_user_id, today_date - 7, 'achievement', '30 Day Streak', 'Logged for 30 consecutive days!'),
    (test_user_id, today_date - 21, 'milestone', 'Weight Loss', 'Lost 5kg!'),
    (test_user_id, today_date - 30, 'note', 'Starting Journey', 'Day 1. Excited to transform!');

  RAISE NOTICE '✅ Seed data created successfully!';
  RAISE NOTICE 'Data for last 14 days created.';

END $$;
