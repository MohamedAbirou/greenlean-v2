-- =============================================
-- Auto-Create Free Subscription on User Signup
-- Date: 2025-11-24
-- =============================================

-- Function to create free subscription for new users
CREATE OR REPLACE FUNCTION handle_new_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Create free tier subscription
  INSERT INTO public.subscriptions (
    user_id,
    tier,
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    'free',
    'active',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user_subscription after profile creation
-- This runs AFTER the handle_new_user trigger creates the profile
DROP TRIGGER IF EXISTS on_profile_created_subscription ON public.profiles;
CREATE TRIGGER on_profile_created_subscription
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_subscription();

-- Comment
COMMENT ON FUNCTION handle_new_user_subscription() IS 'Automatically creates a free tier subscription when a new user profile is created';
