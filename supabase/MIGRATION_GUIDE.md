# GreenLean Database Migration Guide

## Overview
This guide explains the complete database transformation from the old schema to the new production-ready schema.

## What Changed

### ✅ KEPT (Enhanced or Unchanged)
- **profiles** - Core user data (enhanced with more fields)
- **quiz_results** - Historical health assessments
- **ai_meal_plans** - AI-generated meal plans
- **ai_workout_plans** - AI-generated workout plans
- **challenges** - Gamification system
- **challenge_participants** - User challenge participation
- **user_rewards** - Points and badges
- **workout_logs** - Exercise tracking
- **daily_nutrition_logs** - Food logging
- **daily_water_intake** - Hydration tracking
- **badges** - Achievement system

### ➕ ADDED (New Tables)
- **subscriptions** - Stripe integration for monetization
- **subscription_tiers** - Plan limits and features
- **usage_metrics** - Feature gating and analytics
- **user_micro_surveys** - Progressive profiling
- **user_profile_completeness** - Onboarding tracking
- **food_database** - Nutritionix API cache
- **user_recent_foods** - Quick meal logging
- **meal_templates** - User-created meal combos
- **exercise_library** - Exercise database with videos
- **user_exercise_progress** - Progressive overload tracking
- **rewards_catalog** - Real rewards to redeem
- **user_reward_redemptions** - Redemption tracking
- **user_themes** - Unlockable themes
- **user_friends** - Social features
- **social_challenges** - Friend competitions
- **progress_photos** - Photo tracking
- **notifications** - Enhanced notification system
- **meal_reminders** - Automated reminders

### ❌ REMOVED (Replaced or Deprecated)
- **admin_users** → Use Supabase's built-in admin roles
- **plans** → Replaced by `subscriptions` + `subscription_tiers`
- **challenge_participant_rewards** → Merged into `user_reward_redemptions`
- **user_reviews** → Moved to external review platform (Trustpilot)
- **app_settings** → Moved to environment variables
- **user_engagements** → Use analytics service (PostHog/Mixpanel)
- **engagement_snapshots** → Use analytics service

## Migration Steps

### 1. Create New Supabase Project
```bash
# Create a new project in Supabase Dashboard
# Note your project URL and anon key
```

### 2. Run the Migration
```bash
# From the greenlean directory
cd supabase

# Run the production schema
psql $DATABASE_URL < migrations/20251123_production_schema_v1.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### 3. Update Environment Variables
```env
# .env.local
VITE_SUPABASE_URL=your_new_project_url
VITE_SUPABASE_ANON_KEY=your_new_anon_key

# Stripe (for subscriptions)
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Nutritionix (for food database)
NUTRITIONIX_APP_ID=your_app_id
NUTRITIONIX_APP_KEY=your_app_key
```

### 4. Configure Stripe Webhooks
1. Create webhook endpoint in Stripe Dashboard: `https://your-domain.com/api/stripe/webhook`
2. Subscribe to events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### 5. Set Up Edge Functions
```bash
# Deploy edge functions
supabase functions deploy

# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set NUTRITIONIX_APP_ID=...
supabase secrets set NUTRITIONIX_APP_KEY=...
```

## Database Schema Highlights

### Subscription Tiers

| Tier | Price (Monthly) | AI Generations | Barcode Scanner | Social Features |
|------|----------------|----------------|-----------------|-----------------|
| Free | $0 | 2/month | ❌ | ❌ |
| Pro | $9.99 | 50/month | ✅ | ✅ |
| Premium | $19.99 | 200/month | ✅ | ✅ |

### Feature Gating Example
```typescript
// Check if user can generate meal plan
const canGenerate = await supabase.rpc('can_use_feature', {
  p_user_id: user.id,
  p_feature: 'ai_meal_plan'
});

if (canGenerate) {
  // Generate plan
  await generateMealPlan();

  // Track usage
  await supabase.rpc('track_usage', {
    p_user_id: user.id,
    p_feature: 'ai_meal_plan',
    p_increment: 1
  });
}
```

### Progressive Profiling Example
```typescript
// Check profile completeness
const { data: completeness } = await supabase
  .from('user_profile_completeness')
  .select('*')
  .eq('user_id', user.id)
  .single();

// completeness.personalization_level will be 'BASIC', 'STANDARD', or 'PREMIUM'
// Use this to determine which AI prompt template to use
```

## Key Functions

### 1. `can_use_feature(user_id, feature)` → boolean
Checks if user can use a feature based on their subscription tier and usage.

### 2. `track_usage(user_id, feature, increment)` → void
Increments usage counter for feature gating.

### 3. `calculate_profile_completeness(user_id)` → void
Recalculates and updates user's profile completeness percentage.

### 4. `award_points(user_id, points, reason)` → void
Awards points to user and creates notification.

## Row Level Security (RLS)

All tables have RLS enabled. Users can only:
- ✅ View/edit their own data
- ✅ View public data (food database, exercises, challenges)
- ❌ View other users' data (except progress photos if shared)

Service role has full access for:
- Stripe webhooks
- Background jobs
- Admin operations

## Testing the Migration

### 1. Create Test User
```sql
-- In Supabase SQL Editor
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
VALUES ('test@greenlean.com', crypt('password123', gen_salt('bf')), NOW());
```

### 2. Test Subscription Creation
```typescript
const { data, error } = await supabase
  .from('subscriptions')
  .insert({
    user_id: user.id,
    tier: 'pro',
    status: 'active',
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });
```

### 3. Test Feature Gating
```typescript
const canUse = await supabase.rpc('can_use_feature', {
  p_user_id: user.id,
  p_feature: 'barcode_scanner'
});

console.log('Can use barcode scanner:', canUse); // Should be true for Pro/Premium
```

## Rollback Plan

If you need to rollback:

1. **Keep old Supabase project active** (don't delete it yet)
2. **Switch environment variables** back to old project
3. **Deploy old frontend** from git tag

```bash
git checkout <old-commit-hash>
npm run build
# Deploy old build
```

## Post-Migration Checklist

- [ ] All tables created successfully
- [ ] RLS policies working
- [ ] Test user can sign up
- [ ] Test user can create subscription
- [ ] Feature gating works correctly
- [ ] AI plan generation works
- [ ] Food logging works
- [ ] Workout logging works
- [ ] Notifications work
- [ ] Stripe webhooks configured
- [ ] Edge functions deployed
- [ ] Environment variables updated
- [ ] Frontend updated to use new tables

## Support

If you encounter issues:
1. Check Supabase logs for errors
2. Review RLS policies
3. Verify environment variables
4. Check Stripe webhook logs
5. Contact support@greenlean.com

## Next Steps

After successful migration:
1. Import existing user data (if migrating from old DB)
2. Set up monitoring (Sentry, PostHog)
3. Configure email notifications (Resend/SendGrid)
4. Set up backup schedule
5. Enable database backups in Supabase Dashboard
