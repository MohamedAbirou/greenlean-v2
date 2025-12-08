-- =============================================
-- Automatic Notification Triggers for User Actions
-- Date: 2025-11-30
-- =============================================

-- Notification for meal logged
CREATE OR REPLACE FUNCTION notify_meal_logged()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_meal_count INTEGER;
BEGIN
  -- Count total meals logged today
  SELECT COUNT(*) INTO v_meal_count
  FROM nutrition_logs
  WHERE user_id = NEW.user_id
    AND DATE(logged_at) = CURRENT_DATE;

  -- Create encouraging notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    icon,
    metadata
  ) VALUES (
    NEW.user_id,
    'success',
    'Meal Logged!',
    'Great job logging your meal! That''s ' || v_meal_count || ' meal(s) today. 🎯',
    '🍽️',
    jsonb_build_object('meal_count_today', v_meal_count, 'log_id', NEW.id)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER after_meal_logged
AFTER INSERT ON nutrition_logs
FOR EACH ROW
EXECUTE FUNCTION notify_meal_logged();

-- Notification for workout completed
CREATE OR REPLACE FUNCTION notify_workout_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_workout_count INTEGER;
  v_points_earned INTEGER := 10;
BEGIN
  -- Count workouts completed this week
  SELECT COUNT(*) INTO v_workout_count
  FROM workout_logs
  WHERE user_id = NEW.user_id
    AND logged_at >= CURRENT_DATE - INTERVAL '7 days';

  -- Award points for completing workout
  INSERT INTO user_rewards (user_id, points, lifetime_points)
  VALUES (NEW.user_id, v_points_earned, v_points_earned)
  ON CONFLICT (user_id)
  DO UPDATE SET
    points = user_rewards.points + v_points_earned,
    lifetime_points = user_rewards.lifetime_points + v_points_earned,
    updated_at = NOW();

  -- Create notification
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    icon,
    action_url,
    metadata
  ) VALUES (
    NEW.user_id,
    'achievement',
    'Workout Complete!',
    'Awesome! You completed a workout. +' || v_points_earned || ' points! 💪',
    '💪',
    '/dashboard?tab=workouts',
    jsonb_build_object('workout_count_week', v_workout_count, 'points_earned', v_points_earned)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER after_workout_completed
AFTER INSERT ON workout_logs
FOR EACH ROW
EXECUTE FUNCTION notify_workout_completed();

-- Notification for weight updated
CREATE OR REPLACE FUNCTION notify_weight_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    icon,
    action_url,
    metadata
  ) VALUES (
    NEW.user_id,
    'info',
    'Weight Logged',
    'Your weight has been updated. Keep tracking your progress! 📊',
    '⚖️',
    '/dashboard?tab=progress',
    jsonb_build_object('weight', NEW.weight)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER after_weight_updated
AFTER INSERT ON weight_history
FOR EACH ROW
EXECUTE FUNCTION notify_weight_updated();

-- Notification for plan generation completed
CREATE OR REPLACE FUNCTION notify_plan_generated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_type TEXT;
BEGIN
  -- Determine plan type
  v_plan_type := CASE
    WHEN TG_TABLE_NAME = 'ai_meal_plans' THEN 'meal'
    WHEN TG_TABLE_NAME = 'ai_workout_plans' THEN 'workout'
    ELSE 'plan'
  END;

  -- Only notify when status changes to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      icon,
      action_url,
      metadata
    ) VALUES (
      NEW.user_id,
      'success',
      'Your Plan is Ready!',
      'Your personalized ' || v_plan_type || ' plan has been generated! 🎉',
      '✨',
      '/dashboard',
      jsonb_build_object('plan_type', v_plan_type, 'plan_id', NEW.id)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER after_meal_plan_generated
AFTER UPDATE ON ai_meal_plans
FOR EACH ROW
EXECUTE FUNCTION notify_plan_generated();

CREATE TRIGGER after_workout_plan_generated
AFTER UPDATE ON ai_workout_plans
FOR EACH ROW
EXECUTE FUNCTION notify_plan_generated();

-- Notification for daily logging streak
CREATE OR REPLACE FUNCTION check_daily_logging_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_streak_days INTEGER := 0;
  v_last_log_date DATE;
  v_is_new_streak BOOLEAN := FALSE;
BEGIN
  -- Check if user has streak record
  SELECT current_streak, last_activity_date INTO v_streak_days, v_last_log_date
  FROM user_streaks
  WHERE user_id = NEW.user_id AND streak_type = 'daily_logging';

  IF NOT FOUND THEN
    -- Create new streak
    INSERT INTO user_streaks (user_id, streak_type, current_streak, longest_streak, last_activity_date)
    VALUES (NEW.user_id, 'daily_logging', 1, 1, CURRENT_DATE);
    v_is_new_streak := TRUE;
  ELSIF v_last_log_date = CURRENT_DATE THEN
    -- Already logged today, do nothing
    RETURN NEW;
  ELSIF v_last_log_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Continuing streak
    v_streak_days := v_streak_days + 1;
    UPDATE user_streaks
    SET current_streak = v_streak_days,
        longest_streak = GREATEST(longest_streak, v_streak_days),
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND streak_type = 'daily_logging';
  ELSE
    -- Streak broken, start new
    v_streak_days := 1;
    UPDATE user_streaks
    SET current_streak = 1,
        last_activity_date = CURRENT_DATE,
        updated_at = NOW()
    WHERE user_id = NEW.user_id AND streak_type = 'daily_logging';
    v_is_new_streak := TRUE;
  END IF;

  -- Notify on milestones
  IF v_streak_days IN (3, 7, 14, 30, 50, 100) AND NOT v_is_new_streak THEN
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      icon,
      metadata
    ) VALUES (
      NEW.user_id,
      'achievement',
      v_streak_days || '-Day Streak!',
      '🔥 ' || v_streak_days || ' days in a row! You''re on fire!',
      '🔥',
      jsonb_build_object('streak_days', v_streak_days)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER track_nutrition_logging_streak
AFTER INSERT ON nutrition_logs
FOR EACH ROW
EXECUTE FUNCTION check_daily_logging_streak();

COMMENT ON FUNCTION notify_meal_logged() IS 'Creates notification when user logs a meal';
COMMENT ON FUNCTION notify_workout_completed() IS 'Creates notification and awards points when user completes a workout';
COMMENT ON FUNCTION notify_weight_updated() IS 'Creates notification when user logs weight';
COMMENT ON FUNCTION notify_plan_generated() IS 'Creates notification when AI plan generation completes';
COMMENT ON FUNCTION check_daily_logging_streak() IS 'Tracks and notifies on daily logging streaks';
