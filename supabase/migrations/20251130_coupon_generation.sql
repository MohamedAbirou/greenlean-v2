-- =============================================
-- Coupon Generation System
-- Date: 2025-11-30
-- =============================================

-- Coupon Codes Table
CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'amount', 'free_month')),
  discount_value TEXT NOT NULL, -- e.g., "10", "20", "pro", "premium"

  -- Redemption details
  reward_id UUID REFERENCES rewards_catalog(id) ON DELETE SET NULL,
  reward_name TEXT NOT NULL,

  -- Usage tracking
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  stripe_coupon_id TEXT, -- Stripe coupon ID if created

  -- Expiration
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupon_codes_user ON coupon_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_used ON coupon_codes(used);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_expires ON coupon_codes(expires_at);

-- RLS Policies
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupons"
  ON coupon_codes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupons"
  ON coupon_codes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons"
  ON coupon_codes
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Function: Generate unique coupon code
CREATE OR REPLACE FUNCTION generate_coupon_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random 10-character code (uppercase letters and numbers)
    v_code := 'GL-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM coupon_codes WHERE code = v_code) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$;

-- Function: Create coupon from reward redemption
CREATE OR REPLACE FUNCTION create_coupon_from_reward(
  p_user_id UUID,
  p_reward_id UUID,
  p_reward_name TEXT,
  p_discount_type TEXT,
  p_discount_value TEXT,
  p_expires_days INTEGER DEFAULT 30
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  -- Generate unique code
  v_code := generate_coupon_code();

  -- Calculate expiration
  v_expires_at := NOW() + (p_expires_days || ' days')::INTERVAL;

  -- Insert coupon
  INSERT INTO coupon_codes (
    user_id,
    code,
    discount_type,
    discount_value,
    reward_id,
    reward_name,
    expires_at
  ) VALUES (
    p_user_id,
    v_code,
    p_discount_type,
    p_discount_value,
    p_reward_id,
    p_reward_name,
    v_expires_at
  );

  RETURN v_code;
END;
$$;

-- Trigger: Auto-generate coupon when discount reward is redeemed
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
  IF NEW.reward_type = 'discount' THEN
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

    -- Create notification
    INSERT INTO notifications (
      recipient_id,
      type,
      entity_type,
      entity_id,
      message
    ) VALUES (
      NEW.user_id,
      'reward',
      'coupon',
      NEW.id::TEXT,
      '🎟️ Your coupon code ' || v_code || ' is ready! Check your coupons to use it.'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER after_discount_reward_redeemed
AFTER INSERT ON user_redeemed_rewards
FOR EACH ROW
EXECUTE FUNCTION auto_generate_coupon();
