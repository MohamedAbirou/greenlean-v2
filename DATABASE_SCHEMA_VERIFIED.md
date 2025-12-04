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
3. ✅ `ai_meal_plans` - Meal plans with macro targets
4. ✅ `ai_workout_plans` - Workout plans
5. ✅ `user_micro_surveys` - Progressive profiling surveys
6. ✅ `user_profile_completeness` - Automatic tier calculation

**Tables That DON'T Exist** (mentioned in analysis but not in schema):
1. ❌ `user_macro_targets` - Use `ai_meal_plans` columns instead
2. ❌ `user_streaks` - Not implemented yet
3. ❌ `daily_activity_summary` - Not implemented yet
4. ❌ `weight_history` - Not implemented yet

**Fields That DON'T Exist** (in `profiles` table):
1. ❌ `fitness_goal` - Store in `quiz_results.answers` instead
2. ❌ `country` - Removed in production schema

---

## ✅ NEXT STEPS

Now that schema is verified, proceed with:
1. Fix `prompt_builder.py` - Add full JSON to STANDARD/PREMIUM tiers
2. Update all database operations to use correct table/field names
3. Remove references to non-existent tables
4. Merge endpoints into single route
