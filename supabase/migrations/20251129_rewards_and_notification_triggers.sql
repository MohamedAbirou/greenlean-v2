-- =============================================
-- Rewards Redemption & Automatic Notifications
-- Date: 2025-11-29
-- =============================================

-- User Redeemed Rewards Table
CREATE TABLE IF NOT EXISTS user_redeemed_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reward_id UUID REFERENCES rewards_catalog(id) ON DELETE CASCADE NOT NULL,
  
  type TEXT NOT NULL CHECK (type IN ('discount', 'theme', 'feature', 'badge', 'physical')),
  reward_value TEXT NOT NULL, -- e.g., "20% off", "premium_theme_1"
  points_spent INTEGER NOT NULL,
  
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_redeemed_rewards_user ON user_redeemed_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_redeemed_rewards_reward ON user_redeemed_rewards(reward_id);

-- RLS
ALTER TABLE user_redeemed_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own redeemed rewards"
  ON user_redeemed_rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can redeem rewards"
  ON user_redeemed_rewards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- AUTOMATIC NOTIFICATION TRIGGERS
-- =============================================

-- Function: Create notification for badge earned
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
  
  -- Create notification
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    type,
    entity_type,
    entity_id,
    message
  ) VALUES (
    NEW.user_id,
    NULL,
    'reward',
    'badge',
    NEW.badge_id::TEXT,
    '🏆 You earned the "' || v_badge_name || '" badge!'
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_badge_earned
AFTER INSERT ON user_badges
FOR EACH ROW
EXECUTE FUNCTION notify_badge_earned();

-- Function: Create notification for challenge completed
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
      recipient_id,
      sender_id,
      type,
      entity_type,
      entity_id,
      message
    ) VALUES (
      NEW.user_id,
      NULL,
      'challenge',
      'challenge',
      NEW.challenge_id::TEXT,
      '🎉 You completed "' || v_challenge_title || '"! +' || v_challenge_points || ' points!'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_challenge_completed
AFTER UPDATE ON challenge_participants
FOR EACH ROW
EXECUTE FUNCTION notify_challenge_completed();

-- Function: Create notification for streak milestone
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
      recipient_id,
      sender_id,
      type,
      entity_type,
      entity_id,
      message
    ) VALUES (
      NEW.user_id,
      NULL,
      'reward',
      'streak',
      NEW.id::TEXT,
      '🔥 ' || NEW.current_streak || ' day ' || 
      REPLACE(NEW.streak_type, '_', ' ') || ' streak! Keep it up!'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_streak_milestone
AFTER UPDATE ON user_streaks
FOR EACH ROW
EXECUTE FUNCTION notify_streak_milestone();

-- Function: Award points for challenge completion
CREATE OR REPLACE FUNCTION award_challenge_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_points INTEGER;
BEGIN
  -- Only award when challenge is marked complete
  IF NEW.completed = TRUE AND (OLD.completed = FALSE OR OLD.completed IS NULL) THEN
    -- Get challenge points
    SELECT points INTO v_points
    FROM challenges
    WHERE id = NEW.challenge_id;
    
    -- Award points
    INSERT INTO user_rewards (user_id, points, lifetime_points)
    VALUES (NEW.user_id, v_points, v_points)
    ON CONFLICT (user_id)
    DO UPDATE SET
      points = user_rewards.points + v_points,
      lifetime_points = user_rewards.lifetime_points + v_points,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_challenge_award_points
AFTER UPDATE ON challenge_participants
FOR EACH ROW
EXECUTE FUNCTION award_challenge_points();

-- Function: Notify when friend joins challenge
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
  INSERT INTO notifications (recipient_id, sender_id, type, entity_type, entity_id, message)
  SELECT 
    cp.user_id,
    NEW.user_id,
    'challenge',
    'challenge',
    NEW.challenge_id::TEXT,
    v_user_name || ' joined "' || v_challenge_title || '"!'
  FROM challenge_participants cp
  WHERE cp.challenge_id = NEW.challenge_id 
    AND cp.user_id != NEW.user_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_friend_joins_challenge
AFTER INSERT ON challenge_participants
FOR EACH ROW
EXECUTE FUNCTION notify_friend_challenge_join();

-- Function: Notify on weight goal milestone
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
      INSERT INTO notifications (recipient_id, type, entity_type, entity_id, message)
      VALUES (NEW.user_id, 'reward', 'weight', NEW.id::TEXT, '🎯 25% to your goal! Amazing progress!');
    ELSIF v_progress >= 50 AND v_progress < 51 THEN
      INSERT INTO notifications (recipient_id, type, entity_type, entity_id, message)
      VALUES (NEW.user_id, 'reward', 'weight', NEW.id::TEXT, '🎯 Halfway to your goal! Keep crushing it!');
    ELSIF v_progress >= 75 AND v_progress < 76 THEN
      INSERT INTO notifications (recipient_id, type, entity_type, entity_id, message)
      VALUES (NEW.user_id, 'reward', 'weight', NEW.id::TEXT, '🎯 75% there! You're almost at your goal!');
    ELSIF v_progress >= 100 THEN
      INSERT INTO notifications (recipient_id, type, entity_type, entity_id, message)
      VALUES (NEW.user_id, 'reward', 'weight', NEW.id::TEXT, '🎉 GOAL REACHED! You did it! Congratulations!');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_weight_log_milestone
AFTER INSERT ON weight_history
FOR EACH ROW
EXECUTE FUNCTION notify_weight_milestone();

-- =============================================
-- SEED DEFAULT REWARDS
-- =============================================

INSERT INTO rewards_catalog (name, description, cost_points, type, value, icon, is_active) VALUES
-- Discount Rewards
('10% Off Pro Plan', 'Get 10% off your next Pro subscription month', 500, 'discount', '10_percent_pro', '🎫', TRUE),
('20% Off Premium Plan', 'Get 20% off your next Premium subscription month', 1000, 'discount', '20_percent_premium', '🎟️', TRUE),
('1 Month Free Pro', 'Unlock Pro features for 1 month free', 2500, 'discount', 'free_month_pro', '🎁', TRUE),

-- Theme Rewards
('Ocean Theme', 'Cool blue ocean-inspired color scheme', 300, 'theme', 'ocean_theme', '🌊', TRUE),
('Forest Theme', 'Calming green forest color scheme', 300, 'theme', 'forest_theme', '🌲', TRUE),
('Sunset Theme', 'Warm orange and purple gradient', 300, 'theme', 'sunset_theme', '🌅', TRUE),
('Midnight Theme', 'Deep purple and black dark theme', 500, 'theme', 'midnight_theme', '🌙', TRUE),
('Champion Theme', 'Gold and black premium theme', 800, 'theme', 'champion_theme', '👑', TRUE),

-- Feature Unlocks
('Custom Avatar Frames', 'Unlock exclusive avatar frame collection', 400, 'feature', 'avatar_frames', '🖼️', TRUE),
('Workout Animations', 'Unlock animated workout demonstrations', 600, 'feature', 'workout_animations', '🎬', TRUE),
('Advanced Analytics', 'Unlock detailed progress analytics dashboard', 1000, 'feature', 'advanced_analytics', '📊', TRUE),

-- Badges
('Beta Tester Badge', 'Exclusive badge for early supporters', 200, 'badge', 'beta_tester', '🏷️', TRUE),
('Fitness Enthusiast Badge', 'Show your dedication to fitness', 150, 'badge', 'fitness_enthusiast', '💪', TRUE),
('Nutrition Expert Badge', 'Master of healthy eating', 150, 'badge', 'nutrition_expert', '🥗', TRUE),

-- Physical Rewards  (Limited Stock)
('GreenLean T-Shirt', 'Official GreenLean fitness t-shirt (size selection after redemption)', 5000, 'physical', 'tshirt', '👕', TRUE),
('GreenLean Water Bottle', 'Premium insulated water bottle with GreenLean logo', 3000, 'physical', 'water_bottle', '💧', TRUE),
('GreenLean Resistance Bands Set', 'Complete set of 5 resistance bands', 7000, 'physical', 'resistance_bands', '🎗️', TRUE)

ON CONFLICT DO NOTHING;
