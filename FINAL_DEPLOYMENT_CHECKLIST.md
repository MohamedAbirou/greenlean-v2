# ✅ Final Production Deployment Checklist

**Project**: GreenLean SaaS Platform  
**Status**: 90% Complete - Ready for final deployment  
**Target Launch**: 2 weeks from today

---

## 🔥 Critical Tasks (MUST DO)

### 1. Implement BentoGrid Dashboard Layout
**Status**: ❌ Not Started  
**Priority**: HIGH  
**Effort**: 4-6 hours  

The Phase 3 requirement was a Bento Grid layout for the dashboard. Currently using standard grid.

**Action Items**:
- [ ] Create `BentoGrid` component inspired by [bento.me](https://bento.me)
- [ ] Refactor Dashboard to use Bento layout
- [ ] Make cards draggable/resizable (optional)
- [ ] Ensure mobile responsive

**Files to modify**:
- `/src/features/dashboard/pages/Dashboard.tsx`
- Create: `/src/shared/components/ui/bento-grid.tsx`

---

### 2. Deploy Stripe Webhook Handler
**Status**: ❌ Not Created  
**Priority**: CRITICAL  
**Effort**: 3-4 hours  

Stripe webhooks are essential for subscription lifecycle management.

**Action Items**:
- [ ] Create `/supabase/functions/webhook-stripe/index.ts`
- [ ] Handle events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- [ ] Update `subscriptions` table based on events
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:54321/functions/v1/webhook-stripe`
- [ ] Deploy to production
- [ ] Configure webhook endpoint in Stripe Dashboard

---

### 3. Configure Email Service (Resend)
**Status**: ⚠️ Code Ready, Needs API Key  
**Priority**: HIGH  
**Effort**: 1 hour  

Email functionality is built but needs Resend API key.

**Action Items**:
- [ ] Sign up for [Resend](https://resend.com)
- [ ] Verify sender domain
- [ ] Get API key
- [ ] Set Supabase secret: `supabase secrets set RESEND_API_KEY=re_xxx`
- [ ] Test newsletter subscription
- [ ] Test account deletion confirmation email

---

## 🎯 High Priority Tasks (SHOULD DO)

### 4. Add Error Monitoring
**Status**: ❌ Not Configured  
**Priority**: HIGH  
**Effort**: 2 hours  

**Recommended**: Sentry

**Action Items**:
- [ ] Sign up for Sentry
- [ ] Install `@sentry/react`
- [ ] Configure in `/src/main.tsx`
- [ ] Add error boundaries
- [ ] Test error reporting

```bash
npm install @sentry/react
```

---

### 5. Add Analytics
**Status**: ❌ Not Configured  
**Priority**: HIGH  
**Effort**: 2-3 hours  

**Recommended**: PostHog (privacy-friendly) or Google Analytics

**Action Items**:
- [ ] Choose analytics provider
- [ ] Install SDK
- [ ] Track key events: signups, subscriptions, AI generations
- [ ] Set up conversion funnels
- [ ] Create dashboards

---

### 6. SEO Optimization
**Status**: ⚠️ Partial  
**Priority**: MEDIUM  
**Effort**: 3-4 hours  

**Action Items**:
- [ ] Add meta tags to all pages
- [ ] Create `sitemap.xml`
- [ ] Create `robots.txt`
- [ ] Add OpenGraph images
- [ ] Add JSON-LD structured data
- [ ] Submit to Google Search Console

**Files to create**:
- `/public/sitemap.xml`
- `/public/robots.txt`
- Component: `/src/shared/components/SEO/MetaTags.tsx`

---

### 7. Create Weekly AI Summary Cron Job
**Status**: ❌ Not Created  
**Priority**: MEDIUM  
**Effort**: 4-5 hours  

**Action Items**:
- [ ] Create `/supabase/functions/generate-weekly-summary/index.ts`
- [ ] Implement SQL query to calculate weekly stats
- [ ] Call ML service to generate AI insights
- [ ] Insert into `weekly_summaries` table
- [ ] Send email notification
- [ ] Schedule as Supabase cron job (Sundays at midnight)

---

## 🚀 Deployment Steps

### Phase 1: Pre-Deployment (Day 1-2)
- [ ] Complete BentoGrid dashboard
- [ ] Create Stripe webhook handler
- [ ] Test all user flows end-to-end
- [ ] Load test with k6 or Artillery

### Phase 2: Infrastructure Setup (Day 3-4)
- [ ] Configure Resend API key
- [ ] Set up Sentry error monitoring
- [ ] Set up analytics (PostHog/GA)
- [ ] Configure domain and SSL
- [ ] Set up CDN (Cloudflare)

### Phase 3: Database Migration (Day 5)
- [ ] Run all migrations on production Supabase:
  ```bash
  supabase db push
  ```
- [ ] Verify all tables created
- [ ] Check RLS policies
- [ ] Test triggers and functions

### Phase 4: Edge Functions (Day 6)
- [ ] Deploy all edge functions:
  ```bash
  supabase functions deploy delete-account
  supabase functions deploy subscribe-newsletter
  supabase functions deploy webhook-stripe
  supabase functions deploy generate-weekly-summary
  ```
- [ ] Set production secrets
- [ ] Test each function

### Phase 5: Frontend Deployment (Day 7)
- [ ] Build production bundle: `npm run build`
- [ ] Deploy to Vercel/Netlify/Cloudflare Pages
- [ ] Configure environment variables
- [ ] Test in production
- [ ] Monitor for errors

### Phase 6: Stripe Configuration (Day 8)
- [ ] Switch Stripe to live mode
- [ ] Update price IDs in code
- [ ] Configure webhook endpoint
- [ ] Test subscription flows
- [ ] Test cancellations

### Phase 7: ML Service Deployment (Day 9)
- [ ] Deploy Python ML service (Railway/Render/Fly.io)
- [ ] Update `VITE_ML_SERVICE_URL`
- [ ] Test AI generation
- [ ] Monitor response times

### Phase 8: Final Testing (Day 10-12)
- [ ] Test all user flows
- [ ] Test payment flows
- [ ] Test AI generation limits
- [ ] Test feature gates
- [ ] Load testing
- [ ] Security audit

### Phase 9: SEO & Marketing (Day 13-14)
- [ ] SEO optimization
- [ ] Submit sitemap
- [ ] Create blog posts
- [ ] Social media assets
- [ ] Launch announcements

### Phase 10: Launch! 🚀 (Day 15)
- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Watch for user feedback
- [ ] Fix critical bugs immediately

---

## 🔒 Security Checklist

- [ ] All API keys in environment variables
- [ ] RLS policies on all tables
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting on edge functions
- [ ] Input validation everywhere
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF tokens on forms

---

## 📊 Monitoring Setup

### Metrics to Track
- [ ] Error rate (Sentry)
- [ ] Response times (Vercel Analytics)
- [ ] Database performance (Supabase Dashboard)
- [ ] User signups (Analytics)
- [ ] Subscription conversions (Stripe Dashboard)
- [ ] AI generation usage (Database)
- [ ] Churn rate (Stripe)

### Alerts to Configure
- [ ] Error spike (> 10/min)
- [ ] High response time (> 2s)
- [ ] Database connection errors
- [ ] Payment failures
- [ ] ML service downtime

---

## 🧪 Testing Matrix

| Feature | Manual Test | Automated Test |
|---------|-------------|----------------|
| User Signup | ✅ | ⚠️ |
| Login | ✅ | ⚠️ |
| Onboarding | ✅ | ❌ |
| Dashboard | ✅ | ❌ |
| AI Generation | ✅ | ❌ |
| Meal Logging | ✅ | ❌ |
| Workout Logging | ✅ | ❌ |
| Barcode Scanner | ✅ | ❌ |
| Subscription | ✅ | ❌ |
| Cancellation | ✅ | ❌ |
| Feature Gates | ✅ | ❌ |
| Challenges | ✅ | ❌ |
| Settings | ✅ | ❌ |
| Account Deletion | ✅ | ❌ |

**Recommendation**: Add E2E tests with Playwright before launch

---

## 💰 Cost Estimates (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Supabase | Pro | $25 |
| Vercel | Pro | $20 |
| Resend | Starter | $0-20 |
| Sentry | Team | $26 |
| PostHog | Starter | $0 |
| Railway (ML) | Starter | $5-20 |
| Stripe | Pay-as-you-go | 2.9% + 30¢ |
| **Total** | - | **$76-111** |

*Scales with user growth*

---

## 📈 Success Metrics (First Month)

- [ ] 100 signups
- [ ] 10 paid subscriptions
- [ ] < 1% error rate
- [ ] < 2s average page load
- [ ] 90%+ uptime
- [ ] 4.5+ star rating (if app store)

---

## 🎉 Post-Launch Tasks

- [ ] Send launch email to newsletter
- [ ] Post on Product Hunt
- [ ] Post on Reddit (r/fitness, r/nutrition)
- [ ] Tweet announcement
- [ ] Create demo video
- [ ] Write launch blog post
- [ ] Collect user feedback
- [ ] Iterate based on feedback

---

**Created**: 2025-11-29  
**Status**: Ready for final sprint  
**Estimated Launch**: 2 weeks
