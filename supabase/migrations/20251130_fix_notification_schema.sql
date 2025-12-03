-- =============================================
-- Fix Notification Schema Inconsistencies
-- Date: 2025-11-30
-- =============================================

-- The notifications table uses 'user_id' but some triggers use 'recipient_id'
-- Let's standardize everything to use 'user_id' for consistency

-- Update notification trigger functions to use correct column name
CREATE OR REPLACE FUNCTION notify_badge_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_badge_name TEXT;
BEGIN
  -- Get badge name
  SELECT name INTO v_badge_name
  FROM badges
  WHERE id = NEW.badge_id;

  -- Create notification using user_id (not recipient_id)
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
    'Badge Earned!',
    'You earned the "' || v_badge_name || '" badge!',
    '🏆',
    jsonb_build_object('badge_id', NEW.badge_id, 'badge_name', v_badge_name)
  );

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_challenge_completed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_title TEXT;
  v_challenge_points INTEGER;
BEGIN
  -- Only notify when challenge is marked complete
  IF NEW.completed = TRUE AND (OLD.completed = FALSE OR OLD.completed IS NULL) THEN
    -- Get challenge details
    SELECT title, points INTO v_challenge_title, v_challenge_points
    FROM challenges
    WHERE id = NEW.challenge_id;

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
      'Challenge Complete!',
      'You completed "' || v_challenge_title || '"! +' || v_challenge_points || ' points!',
      '🎉',
      '/challenges',
      jsonb_build_object('challenge_id', NEW.challenge_id, 'points', v_challenge_points)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_streak_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Notify on specific milestones (7, 14, 30, 50, 100 days)
  IF NEW.current_streak IN (7, 14, 30, 50, 100) AND
     (OLD.current_streak IS NULL OR OLD.current_streak < NEW.current_streak) THEN

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
      'Streak Milestone!',
      NEW.current_streak || ' day ' || REPLACE(NEW.streak_type, '_', ' ') || ' streak! Keep it up!',
      '🔥',
      jsonb_build_object('streak_type', NEW.streak_type, 'streak_count', NEW.current_streak)
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_friend_challenge_join()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge_title TEXT;
  v_user_name TEXT;
BEGIN
  -- Get challenge title
  SELECT title INTO v_challenge_title
  FROM challenges
  WHERE id = NEW.challenge_id;

  -- Get user's name
  SELECT full_name INTO v_user_name
  FROM profiles
  WHERE id = NEW.user_id;

  -- Notify other participants of this challenge
  INSERT INTO notifications (user_id, type, title, message, icon, action_url, metadata)
  SELECT
    cp.user_id,
    'social',
    'Friend Joined Challenge',
    v_user_name || ' joined "' || v_challenge_title || '"!',
    '👋',
    '/challenges',
    jsonb_build_object('challenge_id', NEW.challenge_id, 'friend_id', NEW.user_id)
  FROM challenge_participants cp
  WHERE cp.challenge_id = NEW.challenge_id
    AND cp.user_id != NEW.user_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_weight_milestone()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_target_weight FLOAT;
  v_starting_weight FLOAT;
  v_progress FLOAT;
BEGIN
  -- Get target weight
  SELECT target_weight_kg INTO v_target_weight
  FROM profiles
  WHERE id = NEW.user_id;

  -- Get starting weight (first entry)
  SELECT weight_kg INTO v_starting_weight
  FROM weight_history
  WHERE user_id = NEW.user_id
  ORDER BY log_date ASC
  LIMIT 1;

  IF v_target_weight IS NOT NULL AND v_starting_weight IS NOT NULL THEN
    -- Calculate progress
    v_progress := ((v_starting_weight - NEW.weight_kg) / (v_starting_weight - v_target_weight)) * 100;

    -- Notify on milestones (25%, 50%, 75%, 100%)
    IF v_progress >= 25 AND v_progress < 26 THEN
      INSERT INTO notifications (user_id, type, title, message, icon, metadata)
      VALUES (NEW.user_id, 'achievement', 'Weight Goal Progress', '25% to your goal! Amazing progress!', '🎯', jsonb_build_object('progress_pct', 25));
    ELSIF v_progress >= 50 AND v_progress < 51 THEN
      INSERT INTO notifications (user_id, type, title, message, icon, metadata)
      VALUES (NEW.user_id, 'achievement', 'Weight Goal Progress', 'Halfway to your goal! Keep crushing it!', '🎯', jsonb_build_object('progress_pct', 50));
    ELSIF v_progress >= 75 AND v_progress < 76 THEN
      INSERT INTO notifications (user_id, type, title, message, icon, metadata)
      VALUES (NEW.user_id, 'achievement', 'Weight Goal Progress', '75% there! You are almost at your goal!', '🎯', jsonb_build_object('progress_pct', 75));
    ELSIF v_progress >= 100 THEN
      INSERT INTO notifications (user_id, type, title, message, icon, metadata)
      VALUES (NEW.user_id, 'achievement', 'Goal Reached!', 'GOAL REACHED! You did it! Congratulations!', '🎉', jsonb_build_object('progress_pct', 100));
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Notification for coupon generation (update from rewards migration)
CREATE OR REPLACE FUNCTION auto_generate_coupon()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reward_name TEXT;
  v_discount_type TEXT;
  v_discount_value TEXT;
  v_code TEXT;
BEGIN
  -- Only process discount rewards
  IF NEW.type = 'discount' THEN
    -- Get reward details
    SELECT name INTO v_reward_name
    FROM rewards_catalog
    WHERE id = NEW.reward_id;

    -- Parse discount type and value from reward_value
    -- Format examples: "10_percent_pro", "20_percent_premium", "free_month_pro"
    IF NEW.reward_value LIKE '%_percent_%' THEN
      v_discount_type := 'percentage';
      v_discount_value := split_part(NEW.reward_value, '_', 1); -- Extract number
    ELSIF NEW.reward_value LIKE 'free_month_%' THEN
      v_discount_type := 'free_month';
      v_discount_value := split_part(NEW.reward_value, '_', 3); -- Extract plan type
    ELSE
      v_discount_type := 'percentage';
      v_discount_value := '10'; -- Default
    END IF;

    -- Generate coupon
    v_code := create_coupon_from_reward(
      NEW.user_id,
      NEW.reward_id,
      v_reward_name,
      v_discount_type,
      v_discount_value,
      30 -- Expires in 30 days
    );

    -- Create notification with user_id
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
      'Coupon Ready!',
      'Your coupon code ' || v_code || ' is ready! Check your coupons to use it.',
      '🎟️',
      '/profile/coupons',
      jsonb_build_object('coupon_code', v_code, 'reward_id', NEW.reward_id)
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Add indexes for better notification query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_type_created ON notifications(type, created_at DESC);

COMMENT ON TABLE notifications IS 'User notifications with standardized user_id column for consistency';
