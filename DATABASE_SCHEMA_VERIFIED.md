# DATABASE SCHEMA VERIFICATION

**Date**: 2025-12-04
**Source**: `supabase/migrations/20251123_production_schema_v1.sql` (Production Schema v1)

---

## ✅ VERIFIED TABLES & FIELDS

### 1. `profiles` Table (Lines 26-53)

**Columns Available:**
```sql
- id UUID PRIMARY KEY (references auth.users)
- email TEXT NOT NULL UNIQUE
- full_name TEXT
- username TEXT UNIQUE
- avatar_url TEXT
- age INTEGER
- gender TEXT (male, female, other, prefer_not_to_say)
- height_cm FLOAT
- weight_kg FLOAT
- target_weight_kg FLOAT
- unit_system TEXT DEFAULT 'metric' (metric, imperial)
- activity_level TEXT
- onboarding_completed BOOLEAN DEFAULT FALSE
- onboarding_step INTEGER DEFAULT 0
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

**❌ MISSING FIELDS** (mentioned in CURRENT_FLOW_ANALYSIS.md but don't exist):
- `fitness_goal` - Does NOT exist! (mentioned in line 19 of analysis)
- `country` - Does NOT exist in production schema (existed in older migration)

**✅ CORRECT APPROACH**: QuickOnboarding saves directly to `profiles` table without `fitness_goal`. The goal is stored in `quiz_results.answers` JSONB instead.

---

### 2. `quiz_results` Table (Lines 136-144)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- answers JSONB NOT NULL         -- All quiz answers including goal
- calculations JSONB              -- BMI, BMR, TDEE, macros, etc.
- created_at TIMESTAMPTZ
```

**✅ CORRECT**: This is where QuickOnboarding data is stored:
- `answers` = { mainGoal, dietaryStyle, exerciseFrequency, targetWeight, activityLevel, weight, height, age, gender }
- `calculations` = { bmi, bmr, tdee, goalCalories, goalWeight, macros: {...} }

---

### 3. `ai_meal_plans` Table (Lines 188-212)

**⚠️ TABLE NAME**: It's `ai_meal_plans`, NOT `meal_plans` (as mentioned in analysis doc)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- quiz_result_id UUID (FK to quiz_results, can be NULL)
- plan_data JSONB NOT NULL        -- Full meal plan JSON structure
- daily_calories INTEGER          -- Target calories
- daily_protein FLOAT             -- Target protein (g)
- daily_carbs FLOAT               -- Target carbs (g)
- daily_fats FLOAT                -- Target fats (g)
- preferences TEXT                -- User preferences
- restrictions TEXT               -- Dietary restrictions
- status TEXT DEFAULT 'active'    -- (generating, active, completed, archived, failed)
- is_active BOOLEAN DEFAULT TRUE  -- Only one active plan per user
- error_message TEXT              -- Error details if failed
- generated_at TIMESTAMPTZ
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

**✅ CRITICAL**: Macro targets are stored HERE in columns, not in separate `user_macro_targets` table!

---

### 4. `ai_workout_plans` Table (Lines 215-234)

**⚠️ TABLE NAME**: It's `ai_workout_plans`, NOT `workout_plans`

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- quiz_result_id UUID (FK to quiz_results, can be NULL)
- plan_data JSONB NOT NULL        -- Full workout plan JSON structure
- workout_type TEXT NOT NULL      -- Type of workout program
- duration_per_session TEXT       -- e.g., "45 minutes"
- frequency_per_week INTEGER      -- Days per week
- status TEXT DEFAULT 'active'    -- (generating, active, completed, archived, failed)
- is_active BOOLEAN DEFAULT TRUE  -- Only one active plan per user
- error_message TEXT              -- Error details if failed
- generated_at TIMESTAMPTZ
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

---

### 5. ❌ `user_macro_targets` Table - DOES NOT EXIST!

**Issue**: CURRENT_FLOW_ANALYSIS.md mentions saving to `user_macro_targets` table (line 51), but this table **does not exist** in the production schema.

**✅ CORRECT APPROACH**: Macro targets are stored in `ai_meal_plans` table columns:
- `daily_calories`
- `daily_protein`
- `daily_carbs`
- `daily_fats`

---

### 6. Other Tables Mentioned in Analysis

**✅ `user_streaks`** - Mentioned in analysis line 52, but **DOES NOT EXIST** in production schema
**✅ `daily_activity_summary`** - Mentioned in analysis line 53, but **DOES NOT EXIST** in production schema
**✅ `weight_history`** - Mentioned in analysis line 54, but **DOES NOT EXIST** in production schema

**Note**: These might have been planned but not implemented yet.

---

### 7. `user_micro_surveys` Table (Lines 147-162)

**Columns Available** (for progressive profiling):
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- survey_id TEXT NOT NULL         -- e.g., 'dietary_restrictions', 'cooking_time'
- question TEXT NOT NULL
- answer TEXT NOT NULL
- category TEXT NOT NULL          -- (nutrition, fitness, lifestyle, health)
- priority INTEGER DEFAULT 5      -- Higher = ask sooner
- source TEXT DEFAULT 'micro_survey' -- (micro_survey, inferred, explicit)
- confidence FLOAT DEFAULT 1.0    -- 0.0 to 1.0 for ML-inferred answers
- answered_at TIMESTAMPTZ
- created_at TIMESTAMPTZ
```

**✅ READY**: This table exists and is ready for progressive profiling integration.

---

### 8. `user_profile_completeness` Table (Lines 165-181)

**Columns Available:**
```sql
- user_id UUID PRIMARY KEY (FK to profiles)
- total_fields INTEGER DEFAULT 25
- completed_fields INTEGER DEFAULT 0
- completeness_percentage FLOAT GENERATED ALWAYS AS (completed_fields / total_fields * 100) STORED
- personalization_level TEXT GENERATED ALWAYS AS (
    CASE
      WHEN completeness_percentage < 30 THEN 'BASIC'
      WHEN completeness_percentage < 70 THEN 'STANDARD'
      ELSE 'PREMIUM'
    END
  ) STORED
- last_triggered_survey TEXT
- last_updated TIMESTAMPTZ
```

**✅ READY**: Automatic tier calculation based on completeness!

---

## 🔧 REQUIRED CODE CHANGES

### 1. Update Table Names in Code
- Change `meal_plans` → `ai_meal_plans`
- Change `workout_plans` → `ai_workout_plans`

### 2. Remove References to Non-Existent Tables
- Remove `user_macro_targets` table operations
- Remove `user_streaks` table operations
- Remove `daily_activity_summary` table operations
- Remove `weight_history` table operations

### 3. Store Macro Targets in `ai_meal_plans`
Instead of separate table, store in `ai_meal_plans` columns:
```python
await supabase.table('ai_meal_plans').insert({
    'user_id': user_id,
    'quiz_result_id': quiz_result_id,
    'plan_data': meal_plan_json,
    'daily_calories': calculations['goalCalories'],
    'daily_protein': calculations['macros']['protein_g'],
    'daily_carbs': calculations['macros']['carbs_g'],
    'daily_fats': calculations['macros']['fat_g'],
    'status': 'active',
    'is_active': True
})
```

### 4. Fix `profiles` Table Updates
Remove references to non-existent fields:
- ❌ `fitness_goal` (doesn't exist)
- ❌ `country` (doesn't exist in production schema)

Store goal in `quiz_results.answers` instead.

---

## 📋 SUMMARY

**Tables That Exist:**
1. ✅ `profiles` - User basic info
2. ✅ `quiz_results` - Quiz answers + calculations (JSONB)
3. ✅ `ai_meal_plans` - Meal plans with plan_data JSONB
4. ✅ `ai_workout_plans` - Workout plans with plan_data JSONB
5. ✅ `user_micro_surveys` - Progressive profiling surveys
6. ✅ `user_profile_completeness` - Automatic tier calculation
7. ✅ `user_macro_targets` - Current active macro targets (NEW!)
8. ✅ `user_streaks` - Streak tracking for gamification (NEW!)
9. ✅ `daily_activity_summary` - Daily activity logs (NEW!)
10. ✅ `weight_history` - Weight tracking over time (NEW!)
11. ✅ `body_measurements` - Body measurements tracking (NEW!)
12. ✅ `user_badges` - Earned badges/achievements (NEW!)
13. ✅ `scheduled_workouts` - Scheduled workout plans (NEW!)
14. ✅ `weekly_summaries` - Auto-generated weekly insights (NEW!)

**Fields That DON'T Exist** (in `profiles` table):
1. ❌ `fitness_goal` - Store in `quiz_results.answers` instead
2. ❌ `country` - Removed in production schema

---

## ✅ ADDITIONAL TABLES (from 20251124_add_competitive_tracking_tables.sql)

### 7. `user_macro_targets` Table (Lines 139-158)

**⚠️ THIS IS THE SOURCE OF TRUTH FOR CURRENT MACROS!** (Not ai_meal_plans columns)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- effective_date DATE NOT NULL DEFAULT CURRENT_DATE
- daily_calories INTEGER NOT NULL
- daily_protein_g FLOAT NOT NULL
- daily_carbs_g FLOAT NOT NULL
- daily_fats_g FLOAT NOT NULL
- daily_water_ml INTEGER DEFAULT 2000
- source TEXT DEFAULT 'manual' (manual, ai_generated, coach_assigned)
- notes TEXT
- created_at TIMESTAMPTZ
- UNIQUE(user_id, effective_date)
```

**✅ USE THIS TABLE** for:
- Storing current macro targets from AI calculations
- Tracking macro changes over time (historical record)
- Differentiating between AI-generated vs manually set targets

---

### 8. `user_streaks` Table (Lines 65-84)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- streak_type TEXT NOT NULL (nutrition_logging, workout_logging, daily_weigh_in, water_goal)
- current_streak INTEGER DEFAULT 0
- longest_streak INTEGER DEFAULT 0
- last_logged_date DATE
- streak_start_date DATE
- total_days_logged INTEGER DEFAULT 0
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- UNIQUE(user_id, streak_type)
```

**✅ USE THIS TABLE** for:
- Gamification & user engagement
- Tracking logging consistency
- Triggering streak notifications
- Badge/achievement unlocks

**Auto-Updated By Triggers:**
- `after_nutrition_log_insert` - Updates nutrition_logging streak
- `after_workout_log_insert` - Updates workout_logging streak
- `after_weight_log_insert` - Updates daily_weigh_in streak

---

### 9. `daily_activity_summary` Table (Lines 103-132)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- activity_date DATE NOT NULL DEFAULT CURRENT_DATE

-- Nutrition Tracking
- calories_consumed INTEGER DEFAULT 0
- protein_g FLOAT DEFAULT 0
- carbs_g FLOAT DEFAULT 0
- fats_g FLOAT DEFAULT 0
- water_glasses INTEGER DEFAULT 0
- meals_logged INTEGER DEFAULT 0

-- Workout Tracking
- workouts_completed INTEGER DEFAULT 0
- workout_duration_minutes INTEGER DEFAULT 0
- calories_burned INTEGER DEFAULT 0

-- Engagement Flags
- logged_nutrition BOOLEAN DEFAULT FALSE
- logged_workout BOOLEAN DEFAULT FALSE
- logged_weight BOOLEAN DEFAULT FALSE
- completed_all_goals BOOLEAN DEFAULT FALSE

- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
- UNIQUE(user_id, activity_date)
```

**✅ USE THIS TABLE** for:
- Dashboard analytics (daily/weekly/monthly views)
- Progress tracking over time
- Identifying engagement patterns
- Generating weekly summaries

---

### 10. `weight_history` Table (Lines 12-27)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- weight_kg FLOAT NOT NULL
- log_date DATE NOT NULL DEFAULT CURRENT_DATE
- measurement_time TIME
- notes TEXT
- source TEXT DEFAULT 'manual' (manual, scale_sync, photo_import)
- created_at TIMESTAMPTZ
- UNIQUE(user_id, log_date)
```

**✅ USE THIS TABLE** for:
- Weight trend charts
- Progress tracking
- Goal achievement calculation
- Weekly/monthly analytics

---

### 11. `body_measurements` Table (Lines 30-58)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- log_date DATE NOT NULL DEFAULT CURRENT_DATE

-- Measurements (in cm)
- neck_cm FLOAT
- shoulders_cm FLOAT
- chest_cm FLOAT
- waist_cm FLOAT
- hips_cm FLOAT
- left_arm_cm FLOAT
- right_arm_cm FLOAT
- left_thigh_cm FLOAT
- right_thigh_cm FLOAT
- left_calf_cm FLOAT
- right_calf_cm FLOAT

-- Body Composition
- body_fat_percentage FLOAT
- muscle_mass_kg FLOAT

- notes TEXT
- created_at TIMESTAMPTZ
- UNIQUE(user_id, log_date)
```

**✅ USE THIS TABLE** for:
- Body composition tracking (optional)
- Progress photos correlation
- Body recomposition goals

---

### 12. `user_badges` Table (Lines 87-100)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- badge_id UUID NOT NULL (FK to badges)
- earned_at TIMESTAMPTZ DEFAULT NOW()
- progress INTEGER DEFAULT 0
- notification_sent BOOLEAN DEFAULT FALSE
- viewed BOOLEAN DEFAULT FALSE
- UNIQUE(user_id, badge_id)
```

**✅ USE THIS TABLE** for:
- Tracking earned achievements
- Gamification features
- Notification management

---

### 13. `scheduled_workouts` Table (Lines 165-185)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- workout_date DATE NOT NULL
- workout_name TEXT NOT NULL
- workout_type TEXT NOT NULL (strength, cardio, flexibility, sports, rest)
- exercises JSONB NOT NULL DEFAULT '[]'::jsonb
- completed BOOLEAN DEFAULT FALSE
- completed_at TIMESTAMPTZ
- skipped BOOLEAN DEFAULT FALSE
- skipped_reason TEXT
- notes TEXT
- created_at TIMESTAMPTZ
- updated_at TIMESTAMPTZ
```

**✅ USE THIS TABLE** for:
- Scheduling workouts from AI plan
- Tracking completion status
- Rescheduling missed workouts
- Progress analytics

---

### 14. `weekly_summaries` Table (Lines 192-227)

**Columns Available:**
```sql
- id UUID PRIMARY KEY
- user_id UUID NOT NULL (FK to profiles)
- week_start_date DATE NOT NULL
- week_end_date DATE NOT NULL

-- Nutrition Stats
- avg_daily_calories INTEGER
- avg_daily_protein FLOAT
- avg_daily_carbs FLOAT
- avg_daily_fats FLOAT
- total_meals_logged INTEGER

-- Workout Stats
- total_workouts INTEGER
- total_workout_minutes INTEGER
- total_calories_burned INTEGER

-- Weight Progress
- starting_weight_kg FLOAT
- ending_weight_kg FLOAT
- weight_change_kg FLOAT

-- Engagement
- perfect_logging_days INTEGER
- workout_consistency_percentage FLOAT

-- AI Insights
- insights JSONB DEFAULT '[]'::jsonb
- recommendations JSONB DEFAULT '[]'::jsonb

- generated_at TIMESTAMPTZ DEFAULT NOW()
- UNIQUE(user_id, week_start_date)
```

**✅ USE THIS TABLE** for:
- Weekly recap emails
- Progress reports
- AI-generated insights
- Motivational feedback

---

## 📋 SUMMARY
