# CURRENT FLOW ANALYSIS - Exact Workflow

## 🔍 CURRENT STATE (What Happens Now)

### 1. User Completes QuickOnboarding (4 Steps)
**Location**: `src/features/onboarding/pages/QuickOnboarding.tsx`

**Data Collected:**
- Step 1: weight_kg, height_cm, age, gender
- Step 2: goal (lose_weight/gain_muscle/maintain/improve_health)
- Step 3: activityLevel (sedentary/lightly_active/etc.)
- Step 4: dietType (balanced/keto/vegan/etc.)

**What's Saved:**
```typescript
// Line 144-154: Saves to profiles table
{
  weight_kg, height_cm, age, gender,
  fitness_goal, target_weight_kg,
  activity_level, onboarding_completed: true
}
```

### 2. Frontend Calls ML Service for Calculations
**Line 161**: `await calculateNutrition(data)`

**Endpoint**: `POST /calculate-nutrition` (lightweight, NO AI)

**Sends:**
```python
{
  user_id, weight_kg, height_cm, age, gender,
  goal, activity_level, target_weight_kg, diet_type
}
```

**Returns** (ml_service/app.py line 419-467):
```python
{
  bmi, bmr, tdee,
  goalCalories, goalWeight,
  macros: { protein_g, carbs_g, fat_g, ... }
}
```

**NO AI INVOLVED** - Just math calculations using Mifflin-St Jeor formula

### 3. Frontend Saves Calculations to Database
**Lines 175-208**: Saves to multiple tables
- `quiz_results`: minimal quiz data + calculations
- `user_macro_targets`: macro targets for tracking
- `user_streaks`: initialize streaks (0)
- `daily_activity_summary`: today's activity log (empty)
- `weight_history`: initial weight

### 4. Frontend Triggers AI Plan Generation (Fire & Forget)
**Lines 291-312**: Calls `/generate-plans` endpoint

**IMPORTANT**: This is **fire and forget** - doesn't wait for response!

```typescript
fetch('/generate-plans', {
  method: 'POST',
  body: JSON.stringify({
    userId, quizResultId,
    quizData: { mainGoal, dietaryStyle, exerciseFrequency, ... },
    preferences: { provider: 'openai', model: 'gpt-4o-mini' }
  })
}).catch(error => {
  // Doesn't block onboarding - plans can be generated later
});
```

### 5. Backend Receives /generate-plans Request
**Location**: `ml_service/app.py` line 293-368

**What it does:**
1. Returns calculations immediately (lines 355-362):
```python
{
  "success": True,
  "calculations": { bmi, bmr, tdee, macros, ... },
  "meal_plan_status": "generating",
  "workout_plan_status": "generating"
}
```

2. Fires background tasks (lines 345-350):
```python
asyncio.create_task(_generate_meal_plan_background(...))
asyncio.create_task(_generate_workout_plan_background(...))
```

**Plans generate in background** while user is redirected!

### 6. User Redirected to Dashboard
**Line 329**: `navigate('/dashboard')`

Plans are still generating in background. User can start logging meals/workouts immediately.

---

## ❌ CRITICAL ISSUES IDENTIFIED

### Issue #1: Body Fat & Body Type - UNNECESSARY!
**Problem**: Backend expects `bodyFatPercentage` and `bodyType` (line 309 of app.py)
- NOT collected in QuickOnboarding
- Using defaults or calculated estimates
- **SHOULD BE REMOVED** - unnecessary complexity

### Issue #2: Old Prompts Are TOO DETAILED
**Problem**: Your old prompts are MASSIVE (200+ lines each)

**Old Meal Plan Prompt Returns:**
```json
{
  "meals": [...],  // 3-5 meals with 10+ fields each
  "daily_totals": {...},
  "hydration_plan": { timing: [...], electrolyte_needs, ... },
  "shopping_list": { proteins, carbs, fats, vegetables, pantry_staples, estimated_cost },
  "personalized_tips": [...],
  "meal_prep_strategy": { batch_cooking, storage_tips, time_saving_hacks }
}
```

**Old Workout Plan Prompt Returns:**
```json
{
  "weekly_plan": [7 days with 5-8 exercises each],
  "weekly_summary": {...},
  "periodization_plan": {...},
  "exercise_library_by_location": {...},
  "progression_tracking": {...},
  "personalized_tips": [...],
  "injury_prevention": {...},
  "nutrition_timing": {...},
  "lifestyle_integration": {...}
}
```

**What Frontend Actually Uses** (from dashboard.ts types):

**DietPlanData** (line 64):
```typescript
{
  meals: Meal[],           // ✅ USED
  daily_totals: {...},     // ✅ USED
  shopping_list: {...},    // ✅ USED
  hydration_plan: {...},   // ✅ USED
  personalized_tips: [],   // ✅ USED
  meal_prep_strategy: {...} // ✅ USED
}
```

**WorkoutPlanData**:
```typescript
{
  weekly_plan: WeeklyPlan[],  // ✅ USED
  weekly_summary: {...},       // ✅ USED
  // Rest is NOT used by frontend!
}
```

**VERDICT**:
- Meal plan prompt: Mostly good, but too verbose
- Workout plan prompt: **50% of data is NOT used!** (periodization_plan, exercise_library_by_location, progression_tracking, injury_prevention, nutrition_timing, lifestyle_integration)

### Issue #3: "[Same JSON output format as BASIC]" - BROKEN!
**Problem**: In your new `prompt_builder.py`:

```python
# Line 291 in STANDARD prompt:
"[... OUTPUT FORMAT - Same JSON structure as BASIC ...]"

# Line 488 in PREMIUM prompt:
"[... Complete premium instructions similar to TypeScript version ...]"
```

**You're RIGHT!** AI has NO MEMORY! Each prompt needs the FULL JSON structure.

**Current TypeScript Implementation** (MealPlanPromptBuilder.ts):
- BASIC: Full JSON structure (lines 147-200)
- STANDARD: Says "same JSON output format" (line 291)
- PREMIUM: Full enhanced JSON structure (lines 400-486)

**This is WRONG in TypeScript too!** Each prompt should have the full JSON format.

### Issue #4: Backend NOT Using Progressive Profiling Properly
**Problem**: Backend `_generate_meal_plan_background` (line 131-158):

1. Uses new tiered prompt builder ✅
2. But... still expects OLD quiz data structure with 25+ fields ❌
3. The `_convert_to_user_profile` function (line 30-80) tries to extract fields that don't exist in QuickOnboarding ❌

**What's passed from QuickOnboarding** (line 297-303):
```typescript
{
  mainGoal, dietaryStyle, exerciseFrequency,
  targetWeight, activityLevel,
  weight, height, age, gender  // Only 8 fields!
}
```

**What `_convert_to_user_profile` tries to extract** (line 57-77):
```python
cooking_skill, cooking_time, grocery_budget,
meals_per_day, training_environment, equipment,
injuries, health_conditions, medications,
sleep_quality, stress_level, country,
disliked_foods, meal_prep_preference, water_intake_goal
# 15+ fields that DON'T EXIST!
```

**Result**: All these fields are `None`, which triggers BASIC prompt. ✅ This is actually CORRECT for progressive profiling!

**But**: The prompts should be redesigned to work BETTER with minimal data.

### Issue #5: No User Ability to Modify Plans
**Problem**: Plans are generated, saved to database, displayed... but:
- No way to edit meals
- No way to swap exercises
- No way to adjust macros
- No way to regenerate

**Solution**: Need UI for:
1. "Regenerate Plan" button
2. Meal/exercise swap suggestions
3. Macro adjustments
4. Save custom meals/workouts

---

## 🎯 RECOMMENDED SIMPLIFIED JSON STRUCTURES

### Simplified Meal Plan (Progressive Profiling)

**BASIC** (3 data points):
```json
{
  "meals": [
    {
      "meal_type": "breakfast/lunch/dinner/snack",
      "meal_name": "Simple, appetizing name",
      "prep_time_minutes": 10-30,
      "total_calories": 500,
      "total_protein": 30,
      "total_carbs": 50,
      "total_fats": 20,
      "foods": [
        {
          "name": "Chicken breast",
          "portion": "150g",
          "calories": 200,
          "protein": 30,
          "carbs": 0,
          "fats": 5
        }
      ],
      "recipe": "Quick instructions in one paragraph",
      "tips": ["1-2 practical tips"]
    }
  ],
  "daily_totals": {
    "calories": 2000,
    "protein": 150,
    "carbs": 200,
    "fats": 60
  },
  "shopping_list": {
    "proteins": ["Chicken 1kg"],
    "carbs": ["Rice 2kg"],
    "estimated_cost": "$50-70"
  },
  "notes": "Basic plan. Answer 3 quick questions to personalize!"
}
```

**STANDARD** (10-15 data points):
- Same as BASIC, PLUS:
  - `meal_timing` in each meal
  - `tags` array (e.g., "high-protein", "quick")
  - More detailed `shopping_list` (vegetables, fats, pantry_staples)
  - `meal_prep_strategy` (batch_cooking tips)
  - Respects dietary restrictions and cooking skill

**PREMIUM** (25+ data points):
- Same as STANDARD, PLUS:
  - `hydration_plan` with timing
  - `personalized_tips` (5-7 tips)
  - `meal_prep_strategy` with storage_tips and time_saving_hacks
  - Detailed nutrition considerations for health conditions
  - Cultural adaptations

### Simplified Workout Plan (Progressive Profiling)

**BASIC** (3 data points):
```json
{
  "weekly_plan": [
    {
      "day": "Monday",
      "workout_type": "Full Body",
      "duration_minutes": 45,
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60,
          "instructions": "Keep core tight, controlled motion"
        }
      ]
    }
  ],
  "weekly_summary": {
    "total_workout_days": 3,
    "rest_days": 4,
    "total_time_minutes": 135
  },
  "notes": "Basic plan. Tell us about your gym access to personalize!"
}
```

**STANDARD** (10-15 data points):
- Same as BASIC, PLUS:
  - `warmup` and `cooldown` activities
  - `alternatives` for each exercise (home/gym)
  - `progression` notes
  - Respects injuries and equipment availability

**PREMIUM** (25+ data points):
- Same as STANDARD, PLUS:
  - `personalized_tips` (5-7 tips)
  - `weekly_summary` with training split and progression strategy
  - Advanced programming (tempo, RPE targets)
  - Recovery recommendations based on sleep/stress

---

## ✅ CORRECTED WORKFLOW (How It SHOULD Work)

### Phase 1: Onboarding (Current - Working!)
1. User completes 4-step QuickOnboarding ✅
2. Frontend calls `/calculate-nutrition` → instant math ✅
3. Frontend saves to database (profiles, quiz_results, etc.) ✅
4. Frontend triggers `/generate-plans` (fire & forget) ✅
5. User redirected to `/dashboard` ✅

### Phase 2: Plan Generation (Background - Needs Fix!)
1. Backend receives minimal data (8 fields from QuickOnboarding)
2. Builds BASIC-tier prompt (uses smart defaults)
3. Calls AI API → generates simple meal + workout plan
4. Saves to `meal_plans` and `workout_plans` tables
5. User can view plans when ready

### Phase 3: Plan Display (Missing!)
**Need to create**: `/plans` or `/my-plans` route

**UI should show:**
- Meal Plan tab
- Workout Plan tab
- Stats tab
- "Regenerate" button
- "Customize" options (future)

### Phase 4: Progressive Profiling (After Phase 3!)
1. User views meal plan → micro-survey: "Any dietary restrictions?"
2. User answers → profile updated → plan regenerated (STANDARD tier)
3. User views workout plan → micro-survey: "Do you have gym access?"
4. User answers → profile updated → plan regenerated (STANDARD tier)
5. After 5-7 micro-surveys → PREMIUM tier plans

---

## 🚀 NEXT STEPS (In Order)

1. **Fix prompt_builder.py** - Add full JSON structure to STANDARD/PREMIUM
2. **Simplify prompts** - Remove unnecessary fields (body fat, periodization_plan, etc.)
3. **Test plan generation** - Verify BASIC tier works with QuickOnboarding data
4. **Create /plans page** - Display AI-generated meal + workout plans
5. **Add regenerate button** - Let users trigger new plan generation
6. **THEN integrate micro-surveys** - After plans display works

---

## 📊 DATABASE TABLES (Current)

**Plans are stored in:**
- `meal_plans` table (columns: user_id, plan_data JSONB, created_at)
- `workout_plans` table (columns: user_id, plan_data JSONB, created_at)

**Retrieved by:**
```typescript
// mlService.ts line 242-268
async getMealPlans(userId: string) {
  const { data } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}
```

---

## ❓ ANSWERS TO YOUR SPECIFIC QUESTIONS

1. **What happens after onboarding?** → User redirected to `/dashboard`, plans generate in background
2. **Do we send data to ML service?** → YES, twice: `/calculate-nutrition` (instant math) and `/generate-plans` (AI plans)
3. **What happens in backend?** → Returns calculations immediately, fires async tasks for AI generation
4. **Where are calculations stored?** → `quiz_results.calculations` and `user_macro_targets` table
5. **Are plans generated automatically?** → YES, automatically after onboarding (fire & forget)
6. **Is backend using progressive profiling?** → PARTIALLY - uses tiered prompts but needs refinement
7. **"[Same JSON output format as BASIC]"** → WRONG! Each prompt needs full JSON structure
8. **Old prompts too detailed?** → YES! Workout prompt returns 50% unused data
9. **Body fat/body type?** → REMOVE! Unnecessary complexity
10. **User modify plans?** → NOT YET - need to add UI for this

---

## 🎯 IMMEDIATE ACTIONS NEEDED

1. ✅ Fix `prompt_builder.py` - Add full JSON to all tiers
2. ✅ Remove body_fat and body_type from prompts
3. ✅ Simplify workout prompt - remove unused fields
4. ✅ Test generation with QuickOnboarding minimal data
5. ⏳ Create `/plans` page to display AI plans
6. ⏳ Add "Regenerate" button
7. ⏳ Integrate micro-surveys (AFTER plans display works)
