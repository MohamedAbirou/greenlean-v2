# 🚀 Supabase Edge Functions Deployment Guide

This guide explains how to deploy and manage GreenLean's Supabase Edge Functions.

---

## 📦 Available Edge Functions

### 1. **delete-account**
**Purpose**: Complete account deletion including Stripe cancellation  
**Location**: `/supabase/functions/delete-account/index.ts`  
**Trigger**: User clicks "Delete Account" in Settings  

**What it does:**
1. Gets user's Stripe subscription
2. Cancels Stripe subscription
3. Deletes user profile (CASCADE deletes all related data)
4. Deletes auth user

**Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`

---

### 2. **subscribe-newsletter**
**Purpose**: Newsletter subscription with Resend email  
**Location**: `/supabase/functions/subscribe-newsletter/index.ts`  
**Trigger**: User submits email in footer  

**What it does:**
1. Validates email
2. Inserts into `newsletter_subscribers` table
3. Sends welcome email via Resend

**Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

---

## 🛠️ Recommended Additional Functions

### 3. **webhook-stripe** (RECOMMENDED)
**Purpose**: Handle Stripe webhook events  

```typescript
// supabase/functions/webhook-stripe/index.ts
// Handles:
// - checkout.session.completed
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
```

---

### 4. **generate-weekly-summary** (RECOMMENDED)
**Purpose**: Cron job to generate AI insights  

```typescript
// supabase/functions/generate-weekly-summary/index.ts
// Scheduled to run every Sunday at midnight
// Generates weekly_summaries for all users
```

---

## 📝 Deployment Steps

### Prerequisites
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Link to Project
```bash
# Navigate to project root
cd /path/to/greenlean-v2

# Link to your Supabase project
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy Functions
```bash
# Deploy all functions
supabase functions deploy

# Or deploy individually
supabase functions deploy delete-account
supabase functions deploy subscribe-newsletter
```

### Set Environment Variables
```bash
# Set secrets for edge functions
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=xxx

# List all secrets
supabase secrets list
```

---

## 🧪 Testing Edge Functions Locally

### Start Local Development
```bash
# Start Supabase locally
supabase start

# Serve edge functions locally
supabase functions serve
```

### Test with cURL
```bash
# Test delete-account
curl -i --location --request POST 'http://localhost:54321/functions/v1/delete-account' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"userId":"xxx"}'

# Test subscribe-newsletter
curl -i --location --request POST 'http://localhost:54321/functions/v1/subscribe-newsletter' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com"}'
```

---

## 📊 Monitoring & Logs

### View Logs
```bash
# View logs for a specific function
supabase functions logs delete-account

# Stream logs in real-time
supabase functions logs delete-account --follow
```

### Dashboard
Access the Supabase Dashboard to view:
- Function invocations
- Error rates
- Execution times
- Recent logs

---

## 🔒 Security Best Practices

1. **Always validate user auth** before performing sensitive operations
2. **Use service role key** only in edge functions, never expose to frontend
3. **Implement rate limiting** to prevent abuse
4. **Sanitize inputs** to prevent injection attacks
5. **Log errors** but don't expose sensitive data

---

## 🚨 Troubleshooting

### Function not found
```bash
# Ensure function is deployed
supabase functions list

# Redeploy if needed
supabase functions deploy function-name
```

### Environment variable missing
```bash
# Check if secret is set
supabase secrets list

# Set missing secret
supabase secrets set KEY_NAME=value
```

### CORS errors
Make sure to include CORS headers in all responses:
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

---

## 📋 Production Checklist

- [ ] Deploy all edge functions
- [ ] Set production environment variables
- [ ] Test each function endpoint
- [ ] Set up error monitoring
- [ ] Configure rate limiting
- [ ] Review function permissions
- [ ] Test Stripe webhooks
- [ ] Verify email sending works
- [ ] Load test critical functions

---

## 🔗 Useful Commands

```bash
# Deploy specific function
supabase functions deploy function-name

# Delete a function
supabase functions delete function-name

# View function code
cat supabase/functions/function-name/index.ts

# Tail logs
supabase functions logs function-name --follow

# Test locally
supabase functions serve function-name
```

---

**Last Updated**: 2025-11-29  
**Functions**: 2 deployed, 2 recommended
