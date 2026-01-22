# 🌿 GreenLean: Project Handover & Deployment Guide

## 1. Project Overview

**GreenLean** is a production-ready, AI-powered health and fitness SaaS platform designed to provide users with personalized meal plans and workout programs.

It includes a comprehensive **user dashboard**, **AI plan generation**, **gamification system** (challenges, streaks, badges), **progress tracking**, and a robust **admin panel** for analytics and management.

### 🔑 Key Features
- **AI-Powered Personalization** – Generates custom meal and workout plans from user progressive profiling.
- **Comprehensive Dashboard** – Tracks and logs meals, workouts, and progress.
- **Gamification System** – Challenges, streaks, and rewards.
- **Progress Tracking** – Logs meals, workouts, hydration, and measurements.
- **Secure Authentication** – Supabase Auth + RLS.
- **Subscription Management** – Stripe integration for billing.

### ⚙️ Technology Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, React Query, Zustand  
- **Backend (ML Service):** FastAPI (Python), OpenAI / Anthropic / Gemini / Llama  
- **Database & Auth:** Supabase (PostgreSQL + RLS)  
- **Payments:** Stripe  
- **Deployment:** Vercel (frontend), Render/Railway (ML service)

---

## 2. Setup & Deployment Instructions

### 2.1. Prerequisites
You’ll need:
- Node.js (LTS)
- Python 3.11+
- Git
- Supabase Account
- Stripe Account
- AI Provider Account (OpenAI, Anthropic, etc.)

---

### 2.2. Environment Variables

#### 🖥️ Frontend (`.env`)
```bash
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_ML_SERVICE_URL="YOUR_ML_SERVICE_PRODUCTION_URL"
# ════════════════════════════════════════════════════════════
# GreenLean SaaS - Complete Environment Variables
# ════════════════════════════════════════════════════════════

# ────────────────────────────────────────────────────────────
# SUPABASE
# ────────────────────────────────────────────────────────────
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

SUPABASE_GRAPHQL_URL="YOUR_SUPABASE_URL/graphql/v1"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"


# ────────────────────────────────────────────────────────────
# STRIPE (Get from https://dashboard.stripe.com/apikeys)
# ────────────────────────────────────────────────────────────
VITE_STRIPE_PUBLISHABLE_KEY="YOUR_STRIPE_PUBLISHABLE_KEY"

# Pro Plan Price IDs (create these in Stripe Dashboard)
VITE_STRIPE_PRO_MONTHLY_PRICE_ID="YOUR_STRIPE_PRO_MONTHLY_PRICE_ID"
VITE_STRIPE_PRO_YEARLY_PRICE_ID="YOUR_STRIPE_PRO_YEARLY_PRICE_ID"

# Premium Plan Price IDs
VITE_STRIPE_PREMIUM_MONTHLY_PRICE_ID="YOUR_STRIPE_PREMIUM_MONTHLY_PRICE_ID"
VITE_STRIPE_PREMIUM_YEARLY_PRICE_ID="YOUR_STRIPE_PREMIUM_MONTHLY_PRICE_ID"

# ────────────────────────────────────────────────────────────
# ML SERVICE (if using FastAPI backend)
# ────────────────────────────────────────────────────────────
VITE_ML_SERVICE_URL=http://localhost:5001 # "YOUR_BACKEND_HOSTING_URL"


# ────────────────────────────────────────────────────────────
# Third-Party APIs
# ────────────────────────────────────────────────────────────

# USDA (for food database)
VITE_USDA_API_KEY="YOUR_USDA_API_KEY"

# ExerciseDB (for exercise library)
VITE_EXERCISEDB_API_KEY="YOUR_EXERCISEDB_API_KEY" # From Rapid API

# Sentry (error tracking)
VITE_SENTRY_DSN=https://...@sentry.io/...

# Redis (Database Caching)
VITE_UPSTASH_REDIS_REST_URL="YOUR_UPSTASH_REDIS_URL"
VITE_UPSTASH_REDIS_REST_TOKEN="YOUR_UPSTASH_REDIS_TOKEN"

SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET="YOUR_SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET"

# ────────────────────────────────────────────────────────────
# ENVIRONMENT
# ────────────────────────────────────────────────────────────
VITE_ENV=development  # development | staging | production
````

#### ⚙️ ML Service (`ml_service/.env`)

```bash
# Database
dbname="YOUR_SUPABASE_DB_NAME"
host="YOUR_SUPABASE_DB_HOST"
user="YOUR_SUPABASE_DB_USER"
password="YOUR_SUPABASE_DB_PASSWORD"
port="YOUR_SUPABASE_DB_PORT" # 5432

APP_HOST="0.0.0.0"
APP_PORT="5001"

# AI Providers
OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
ANTHROPIC_API_KEY="YOUR_ANTHROPIC_API_KEY"
GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY"
LLAMA_API_KEY="YOUR_LLAMA_API_KEY"

# App
AI_TEMPERATURE="0.7"
AI_MAX_TOKENS="8000"
LOG_LEVEL="INFO"
DEFAULT_AI_PROVIDER="openai"
DEFAULT_MODEL_NAME="gpt-4o-mini"
DB_POOL_MIN_SIZE="1"
DB_POOL_MAX_SIZE="10"
```

---

### 2.3. Local Development

#### 🚀 Frontend

```bash
git clone https://github.com/MohamedAbirou/greenlean-v2.git greenlean
cd greenlean
npm install
npm run dev
```

Runs at [http://localhost:5173](http://localhost:5173)

#### 🧠 ML Service

```bash
cd ml_service
python -m venv venv
source venv/bin/activate  # or .\venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 5001 # or python app.py
```

Runs at [http://localhost:5001](http://localhost:5001)

Ensure `VITE_ML_SERVICE_URL=http://localhost:5001`

---

### 2.4. Production Deployment

#### 🟩 Frontend (Vercel)

1. Link repo to Vercel
2. Add `VITE_` environment variables
3. Build & deploy
4. Optionally connect your custom domain

#### 🟦 ML Service (Railway)

1. Add environment variables from `/ml_service/.env`
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Update `VITE_ML_SERVICE_URL` in frontend `.env`

---

## 3. Database Migration Guide (Supabase)

### 3.1. Supabase Setup

1. Create an organization in Supabase
2. I'll transfer the project with the keys and everything
3. Add them to `.env` files # (in frontend with VITE_ as prefix)

---

## 4. Integrations

### 4.1. Stripe

* Create product & price in Stripe Dashboard
* Add keys and price ID in `.env`
* Add webhook endpoint:

  ```
  https://YOUR_SUPABASE_URL/api/stripe/webhook
  ```

  Events:

  * `checkout.session.completed`
  * `customer.subscription.deleted`
  * `customer.subscription.updated`
  * `customer.subscription.created`
  * `customer.updated`
  * `invoice.payment_succeeded`
  * `invoice.payment_failed`
  * `invoice.finalized`
  * `invoice.sent`
  * `payment_intent.payment_failed`
  * `payment_intent.succeeded`

### 4.2. AI Providers

Set at least one:

```bash
OPENAI_API_KEY=sk-...
DEFAULT_AI_PROVIDER=openai
DEFAULT_MODEL_NAME=gpt-4o-mini
```

---

## 5. File Structure & Code Overview

### 🧩 Frontend (`src/`)

```
core/        -> env config, providers, routing
features/    -> main app features (auth, dashboard, etc...)
shared/      -> reusable components & hooks
lib/         -> external library configs
store/       -> Zustand global state
```

### ⚙️ ML Service (`ml_service/`)

```
app.py             -> main FastAPI entrypoint
config/            -> settings & logging
models/            -> Pydantic schemas
prompts/           -> AI prompt templates
services/          -> ai_service.py, database.py
utils/             -> calculations, conversions
```

---

## 6. Maintenance & Handoff Notes

### 🗄️ Database

* Supabase auto-backups daily
* Manual backup via Admin Panel or dashboard
* Export with `pg_dump` if needed

### 🔐 API Key Rotation

Regularly rotate keys:

* Supabase anon / service_role
* Stripe secret / webhook
* OpenAI / Anthropic keys

### 🧩 Dependencies Update

Frontend:

```bash
npm update
```

ML Service:

```bash
pip install --upgrade -r requirements.txt
```

### 🔁 Stripe Webhook Updates

If Supabase URL changes → update webhook endpoint in Stripe.

---

## 🧠 Final Notes

This guide covers everything you need to **deploy, operate, and maintain** GreenLean.
For deeper explanations or architecture insights, see the `TECH_HIGHLIGHTS_ONE_PAGER.md`.

---

**Author:** Liam
**Version:** 2.0
**Last Updated:** `22.01.2026`
