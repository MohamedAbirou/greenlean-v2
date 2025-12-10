-- Seed Data for Fitness Tracking Dashboard
-- Run this after setting up the database to get test data

-- Note: Replace USER_ID_HERE with your actual user ID from the profiles table
-- You can get it by running: SELECT id FROM profiles LIMIT 1;

DO $$
DECLARE
  test_user_id UUID;
  meal_log_id UUID;
  workout_session_id UUID;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Get the first user from profiles (or create one if needed)
  SELECT id INTO test_user_id FROM profiles LIMIT 1;

  IF test_user_id IS NULL THEN
    RAISE NOTICE 'No user found in profiles table. Please create a user first.';
    RETURN;
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
  -- BODY MEASUREMENTS (Last 30 days, every 7 days)
  -- ========================================
  FOR i IN 0..4 LOOP
    INSERT INTO body_measurements_simple (user_id, measurement_date, weight_kg, body_fat_percentage, waist_cm, hips_cm, notes)
    VALUES (
      test_user_id,
      today_date - (i * 7),
      75.5 - (i * 0.5), -- Gradual weight loss
      18.5 - (i * 0.3), -- Gradual body fat decrease
      82.0 - (i * 0.5),
      95.0 - (i * 0.3),
      CASE i
        WHEN 0 THEN 'Feeling great! Energy levels high.'
        WHEN 1 THEN 'Good progress this week.'
        WHEN 2 THEN 'Slight plateau but staying consistent.'
        WHEN 3 THEN 'Breaking through!'
        ELSE 'Starting the journey'
      END
    );
  END LOOP;

  -- ========================================
  -- MEAL LOGS (Last 14 days)
  -- ========================================
  FOR day_offset IN 0..13 LOOP
    DECLARE
      log_date DATE := today_date - day_offset;
      breakfast_log_id UUID;
      lunch_log_id UUID;
      dinner_log_id UUID;
      snack_log_id UUID;
    BEGIN
      -- Breakfast
      INSERT INTO daily_nutrition_logs (user_id, log_date, meal_type, total_calories, total_protein, total_carbs, total_fats)
      VALUES (test_user_id, log_date, 'breakfast', 450, 25, 50, 15)
      RETURNING id INTO breakfast_log_id;

      INSERT INTO meal_items (user_id, nutrition_log_id, meal_date, meal_type, food_name, calories, protein_g, carbs_g, fats_g, serving_size, serving_unit)
      VALUES
        (test_user_id, breakfast_log_id, log_date, 'breakfast', 'Oatmeal with Berries', 250, 10, 40, 5, 1, 'bowl'),
        (test_user_id, breakfast_log_id, log_date, 'breakfast', 'Scrambled Eggs', 150, 12, 2, 10, 2, 'eggs'),
        (test_user_id, breakfast_log_id, log_date, 'breakfast', 'Orange Juice', 50, 3, 8, 0, 1, 'glass');

      -- Lunch
      INSERT INTO daily_nutrition_logs (user_id, log_date, meal_type, total_calories, total_protein, total_carbs, total_fats)
      VALUES (test_user_id, log_date, 'lunch', 650, 45, 60, 20)
      RETURNING id INTO lunch_log_id;

      INSERT INTO meal_items (user_id, nutrition_log_id, meal_date, meal_type, food_name, calories, protein_g, carbs_g, fats_g, serving_size, serving_unit)
      VALUES
        (test_user_id, lunch_log_id, log_date, 'lunch', 'Grilled Chicken Breast', 300, 35, 0, 8, 200, 'g'),
        (test_user_id, lunch_log_id, log_date, 'lunch', 'Brown Rice', 200, 5, 45, 2, 1, 'cup'),
        (test_user_id, lunch_log_id, log_date, 'lunch', 'Steamed Broccoli', 50, 3, 10, 0, 150, 'g'),
        (test_user_id, lunch_log_id, log_date, 'lunch', 'Olive Oil Dressing', 100, 2, 5, 10, 1, 'tbsp');

      -- Dinner
      INSERT INTO daily_nutrition_logs (user_id, log_date, meal_type, total_calories, total_protein, total_carbs, total_fats)
      VALUES (test_user_id, log_date, 'dinner', 550, 40, 45, 18)
      RETURNING id INTO dinner_log_id;

      INSERT INTO meal_items (user_id, nutrition_log_id, meal_date, meal_type, food_name, calories, protein_g, carbs_g, fats_g, serving_size, serving_unit)
      VALUES
        (test_user_id, dinner_log_id, log_date, 'dinner', 'Salmon Fillet', 350, 35, 0, 15, 150, 'g'),
        (test_user_id, dinner_log_id, log_date, 'dinner', 'Sweet Potato', 150, 2, 35, 0, 1, 'medium'),
        (test_user_id, dinner_log_id, log_date, 'dinner', 'Mixed Salad', 50, 3, 10, 3, 1, 'bowl');

      -- Snack (only every other day)
      IF day_offset % 2 = 0 THEN
        INSERT INTO daily_nutrition_logs (user_id, log_date, meal_type, total_calories, total_protein, total_carbs, total_fats)
        VALUES (test_user_id, log_date, 'snack', 200, 15, 20, 8)
        RETURNING id INTO snack_log_id;

        INSERT INTO meal_items (user_id, nutrition_log_id, meal_date, meal_type, food_name, calories, protein_g, carbs_g, fats_g, serving_size, serving_unit)
        VALUES
          (test_user_id, snack_log_id, log_date, 'snack', 'Greek Yogurt', 120, 12, 15, 3, 150, 'g'),
          (test_user_id, snack_log_id, log_date, 'snack', 'Almonds', 80, 3, 5, 5, 15, 'g');
      END IF;
    END;
  END LOOP;

  -- ========================================
  -- WORKOUT SESSIONS (Last 14 days, 4 times per week)
  -- ========================================
  FOR day_offset IN 0..13 LOOP
    IF day_offset % 2 = 0 OR day_offset % 3 = 0 THEN -- Workout every 2-3 days
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
          location, overall_intensity, notes
        )
        VALUES (
          test_user_id,
          log_date,
          log_date::timestamp + interval '18 hours',
          log_date::timestamp + interval '19 hours 30 minutes',
          CASE workout_type
            WHEN 'strength' THEN 'Upper Body Strength'
            WHEN 'cardio' THEN 'HIIT Cardio Session'
            ELSE 'Full Body'
          END,
          workout_type,
          CASE workout_type WHEN 'strength' THEN 6 ELSE 1 END,
          CASE workout_type WHEN 'strength' THEN 18 ELSE 0 END,
          CASE workout_type WHEN 'strength' THEN 2500.0 ELSE 0.0 END,
          CASE workout_type WHEN 'strength' THEN 400 ELSE 500 END,
          CASE (day_offset % 2) WHEN 0 THEN 'gym' ELSE 'home' END,
          CASE (day_offset % 3) WHEN 0 THEN 'high' WHEN 1 THEN 'medium' ELSE 'low' END,
          'Great session! Feeling strong.'
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

          -- Bent Over Rows
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

          -- Bicep Curls
          INSERT INTO exercise_sets (user_id, workout_session_id, exercise_name, exercise_category, set_number, reps, weight_kg, rest_seconds)
          VALUES
            (test_user_id, workout_session_id, 'Bicep Curls', 'arms', 1, 15, 15, 60),
            (test_user_id, workout_session_id, 'Bicep Curls', 'arms', 2, 12, 17.5, 60),
            (test_user_id, workout_session_id, 'Bicep Curls', 'arms', 3, 10, 20, 60);

          -- Tricep Extensions
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

        -- Add cardio session
        IF workout_type = 'cardio' THEN
          INSERT INTO cardio_sessions (user_id, workout_session_id, cardio_type, duration_minutes, distance_meters, avg_heart_rate, calories_burned)
          VALUES (test_user_id, workout_session_id, 'running', 30, 5000, 155, 500);
        END IF;
      END;
    END IF;
  END LOOP;

  -- ========================================
  -- PERSONAL RECORDS (some PRs from recent workouts)
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
    (test_user_id, 'Lost 5kg', 'weight_loss', 5, 5, TRUE, today_date - 21, 'Successfully lost 5kg!'),
    (test_user_id, '30 Day Streak', 'streak', 30, 30, TRUE, today_date - 7, 'Logged for 30 consecutive days'),
    (test_user_id, 'Bench Press 70kg', 'strength', 70, 70, TRUE, today_date - 2, 'Hit new bench press PR!'),
    (test_user_id, 'Lost 10kg', 'weight_loss', 10, 5, FALSE, NULL, 'Working towards 10kg weight loss'),
    (test_user_id, '100 Workouts', 'workouts', 100, 45, FALSE, NULL, 'Complete 100 total workouts');

  -- ========================================
  -- JOURNEY TIMELINE EVENTS
  -- ========================================
  INSERT INTO user_journey_timeline (user_id, event_date, event_type, title, description)
  VALUES
    (test_user_id, today_date, 'note', 'Daily Journal', 'Feeling motivated and energized! Hit a new PR on bench press today.'),
    (test_user_id, today_date - 2, 'workout_pr', 'New Bench Press PR!', 'Achieved 8 reps at 70kg'),
    (test_user_id, today_date - 7, 'achievement', '30 Day Streak', 'Successfully logged meals and workouts for 30 consecutive days!'),
    (test_user_id, today_date - 14, 'note', 'Daily Journal', 'Two weeks in and feeling great. Energy levels are high.'),
    (test_user_id, today_date - 21, 'milestone', 'Weight Loss Milestone', 'Lost 5kg! Halfway to my goal.'),
    (test_user_id, today_date - 30, 'note', 'Starting My Journey', 'Today is day 1. Excited to transform my health!');

  RAISE NOTICE 'Seed data created successfully!';
  RAISE NOTICE 'Created:';
  RAISE NOTICE '- Water intake logs for 7 days';
  RAISE NOTICE '- Body measurements for 30 days (weekly)';
  RAISE NOTICE '- Meal logs for 14 days (3-4 meals per day)';
  RAISE NOTICE '- Workout sessions for 14 days (4/week)';
  RAISE NOTICE '- 3 Personal records';
  RAISE NOTICE '- 5 Progress milestones';
  RAISE NOTICE '- 6 Journey timeline events';

END $$;
