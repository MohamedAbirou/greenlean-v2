# Progressive Profiling - Complete Implementation Summary

## 🎯 What Was Implemented

### **Threshold-Based Progressive Profiling System**
Users start with minimal data (9 fields from QuickOnboarding), automatically get STANDARD tier plans, and can unlock PREMIUM tier through micro-surveys when they cross the 70% completeness threshold.

---

## 📊 Current State

### **Tier System**
- **BASIC** (<30% completeness): Simple plans, 2-3 tips, no meal prep
- **STANDARD** (30-70% completeness): ← **Users START here (40.9%)**
  - Meal prep basics
  - 4-6 personalized tips
  - Progression tracking for workouts
- **PREMIUM** (≥70% completeness):
  - Full meal prep strategies
  - 6-8+ personalized tips
  - Periodization plans
  - Injury prevention
  - Nutrition timing
  - Lifestyle integration

### **Auto-Tier Detection**
The system automatically determines tier based on profile completeness:
- **9/22 fields from QuickOnboarding = 40.9%** → STANDARD tier
- Prompt builders (`MealPlanPromptBuilder`, `WorkoutPlanPromptBuilder`) calculate completeness
- No hardcoded tiers - fully dynamic!

---

## 🔄 Current Flow (What Happens Now)

### **1. User Completes QuickOnboarding**
**9 Fields Collected:**
1. `main_goal` (lose_weight, gain_muscle, etc.)
2. `weight` (current weight in kg)
3. `target_weight` (goal weight in kg)
4. `age`
5. `gender`
6. `height` (cm)
7. `dietary_style` (balanced, vegetarian, etc.)
8. `activity_level` (sedentary, active, etc.)
9. `exercise_frequency` (1-2 times/week, Daily, etc.)

### **2. Frontend Sends Request**
```typescript
// QuickOnboarding.tsx (line 229-245)
await mlService.generatePlansUnified(
  user.id,
  savedQuizResult.id,
  {
    main_goal: data.mainGoal,
    dietary_style: data.dietType,
    exercise_frequency: exerciseFrequency,
    target_weight: data.targetWeight,
    activity_level: quizData.activityLevel,
    weight: data.currentWeight,
    height: data.height,
    age: data.age,
    gender: data.gender,
  },
  'openai',
  'gpt-4o-mini'
);
```

### **3. Backend Processes Request**
**`app.py` - `/generate-plans` endpoint (lines 284-471):**

**Step 1: Calculate Nutrition (Synchronous)**
```python
# Calculate BMI, BMR, TDEE, goal calories, macros
bmi = weight / (height_m ** 2)
bmr = calculate_bmr(...)
tdee = calculate_tdee(...)
goal_calories = calculate_goal_calories(...)
macros = calculate_macros(...)
```

**Step 2: Save to Database (Source of Truth)**
```python
# Save calculations to user_macro_targets table
await db_service.update_quiz_calculations(...)
await db_service.save_macro_targets(...)
await db_service.initialize_plan_status(...)
```

**Step 3: Fire Background Tasks (Concurrent)**
```python
# Fire-and-forget AI generation (non-blocking)
asyncio.create_task(_generate_meal_plan_background_unified(...))
asyncio.create_task(_generate_workout_plan_background_unified(...))
```

**Step 4: Return Immediately**
```python
return {
    "success": True,
    "calculations": calculations.model_dump(),  # ← Frontend uses this!
    "meal_plan_status": "generating",
    "workout_plan_status": "generating",
    "metadata": {"field_count": 9, "progressive_profiling": True}
}
```

### **4. Background AI Generation**

**Meal Plan Generation (`_generate_meal_plan_background_unified`):**
```python
# Convert to UserProfileData (9 fields filled, rest None)
user_profile = _convert_quick_to_meal_profile(quiz_data, nutrition)

# Auto-determine tier (NO HARDCODED 'BASIC' ANYMORE!)
prompt_response = MealPlanPromptBuilder.build_prompt(user_profile)

# Logs show tier determination:
# "Level=STANDARD, Completeness=40.9%, Used 13 defaults, Missing 13 fields"

# Generate with AI
meal_plan = await ai_service.generate_plan(prompt_response.prompt, ...)

# Save to ai_meal_plans table
await db_service.save_meal_plan(...)
await db_service.update_plan_status(user_id, "meal", "completed")
```

**Workout Plan Generation (`_generate_workout_plan_background_unified`):**
```python
# Convert to WorkoutUserProfileData
workout_profile = _convert_quick_to_workout_profile(quiz_data)

# Auto-determine tier
prompt_response = WorkoutPlanPromptBuilder.build_prompt(workout_profile)

# Generate with AI
workout_plan = await ai_service.generate_plan(...)

# Map goal to workout types (FIXED!)
workout_types = workout_type_map.get(quiz_data.main_goal, ['balanced'])
# Example: lose_weight → ["cardio", "strength"]

# Save to ai_workout_plans table
await db_service.save_workout_plan(..., workout_types, ...)
await db_service.update_plan_status(user_id, "workout", "completed")
```

### **5. Frontend Redirects to Dashboard**
```typescript
// Dashboard.tsx uses backend calculations (line 86)
const { targets: macroTargets } = useMacroTargets(user?.id);
// No duplicate calculation logic!

// Bento grid shows:
// - Calories: macroTargets.daily_calories
// - Protein: macroTargets.daily_protein_g
// - All from database ✅
```

### **6. User Views Plans**
```typescript
// Plans.tsx detects tier from JSON content
const getPersonalizationTier = () => {
  const tips = mealPlan.plan_data.personalized_tips || [];
  const mealPrep = mealPlan.plan_data.meal_prep_strategy;

  if (tips.length >= 6 && mealPrep?.batch_cooking?.length > 2) {
    return 'PREMIUM';
  } else if (tips.length >= 4 && mealPrep) {
    return 'STANDARD';  // ← Initial users get this!
  }
  return 'BASIC';
};

// UI adapts based on tier:
// - STANDARD users see: meal prep basics, 4-6 tips, progression tracking
// - Conditional rendering: {mealPrep && <MealPrepPanel />}
```

---

## 🚀 Future: Micro-Surveys (Not Yet Implemented)

### **Triggers**
- **Time-based**: After 3 days, 7 days, 14 days
- **Action-based**: After 5 workouts, 10 meals logged
- **Context-based**: After marking meals as "didn't like", skipping workouts

### **Question Categories**
Each question has metadata:
```typescript
{
  question: "Do you have access to a gym?",
  affects: ["workout"],  // or ["diet"] or ["both"]
  field: "gym_access",
  tier_unlock: "helps toward PREMIUM"
}
```

### **Regeneration Strategy (Threshold-Based)**

**Only regenerate when crossing tier thresholds!**

```
Day 1: 9 fields (40.9%) → STANDARD tier
       ↓
Day 3: Micro-survey → +2 fields (50%) → Still STANDARD
       → Just save, NO regeneration (saves AI costs!)
       ↓
Day 7: Micro-survey → +3 fields (68%) → Still STANDARD
       → Just save, NO regeneration
       ↓
Day 14: Micro-survey → +3 fields (81%) → PREMIUM UNLOCKED!
        ↓
        🎉 "You unlocked PREMIUM! Regenerate plans?"
        [Regenerate Now] [Later]
        ↓
        Only regenerate affected domain (diet or workout)
```

**Smart Regeneration:**
```python
if new_completeness >= 70 and old_completeness < 70:
    # Crossed threshold!
    prompt_user_to_regenerate()
    if user_confirms:
        if question.affects == ["diet"]:
            regenerate_meal_plan(user_id, tier='PREMIUM')
        if question.affects == ["workout"]:
            regenerate_workout_plan(user_id, tier='PREMIUM')
```

---

## 🧪 How to Test End-to-End

### **Prerequisites**
1. Backend running (ML service on port 8000)
2. Frontend running (`npm run dev`)
3. Database connected (PostgreSQL)
4. OpenAI API key configured

### **Test Steps**

**1. Complete Onboarding**
```
1. Navigate to /onboarding
2. Fill in QuickOnboarding form:
   - Goal: "Lose Weight"
   - Age: 30
   - Gender: Male
   - Weight: 85 kg
   - Target Weight: 75 kg
   - Height: 175 cm
   - Diet: Balanced
   - Activity: Moderately Active
   - Exercise: 3-4 times/week
3. Submit form
```

**Expected Backend Response:**
```json
{
  "success": true,
  "calculations": {
    "bmi": 27.8,
    "bmr": 1850,
    "tdee": 2590,
    "goalCalories": 2090,
    "macros": {
      "protein_g": 157,
      "carbs_g": 209,
      "fat_g": 70
    }
  },
  "meal_plan_status": "generating",
  "workout_plan_status": "generating"
}
```

**Check Backend Logs:**
```bash
# Look for tier determination:
[Unified] User {id} meal plan prompt: Level=STANDARD, Completeness=40.9%, ...
[Unified] User {id} workout plan prompt: Level=STANDARD, Completeness=40.9%, ...
```

**2. Verify Dashboard**
```
1. Should redirect to /dashboard
2. Check Bento Grid:
   - Calories target: 2090 kcal
   - Protein target: 157g
   - All from backend calculations ✅
```

**3. Check Plans Page**
```
1. Navigate to /plans
2. Should see:
   - Status: "Generating..." (with polling every 5s)
   - Once complete:
     * Meal plan with 4-6 tips
     * Meal prep basics section (STANDARD tier)
     * Shopping list
     * Hydration plan
   - Workout plan with:
     * Weekly plan
     * Progression tracking (STANDARD tier)
     * 4-6 personalized tips
```

**4. Verify Database**
```sql
-- Check calculations saved
SELECT * FROM user_macro_targets WHERE user_id = '{id}';
-- Should show: daily_calories=2090, daily_protein_g=157, ...

-- Check meal plan
SELECT status, plan_data FROM ai_meal_plans WHERE user_id = '{id}';
-- Status should be 'completed'
-- plan_data should have: personalized_tips (4-6), meal_prep_strategy (present)

-- Check workout plan
SELECT status, plan_data FROM ai_workout_plans WHERE user_id = '{id}';
-- Status should be 'completed'
-- workout_type should be ["cardio", "strength"] (from lose_weight goal)
```

**5. Verify Tier Detection**
```javascript
// In browser console on /plans:
const tier = getPersonalizationTier();
console.log(tier); // Should be "STANDARD"
console.log(mealPlan.plan_data.personalized_tips.length); // Should be 4-6
console.log(mealPlan.plan_data.meal_prep_strategy); // Should exist
```

---

## ✅ What's Fixed

### **Backend (`ml_service/app.py`)**
1. ✅ **Line 185**: Removed `requested_level='BASIC'` from meal plan generation
2. ✅ **Line 239**: Removed `requested_level='BASIC'` from workout plan generation
3. ✅ **Line 272**: Fixed `workout_type` mapping (was using `main_goal`, now maps properly)

### **Frontend**
1. ✅ **Dashboard.tsx**: Already using `useMacroTargets` hook (no duplicate calculations)
2. ✅ **Plans.tsx**: Complete with adaptive UI based on tier
3. ✅ **MealPlanView.tsx**: Conditional rendering of meal prep (STANDARD+)
4. ✅ **WorkoutPlanView.tsx**: Conditional rendering of premium features

---

## 📝 Summary

**Current State:**
- ✅ Auto-tier determination working (40.9% = STANDARD)
- ✅ Backend calculations saved to database
- ✅ Dashboard uses backend calculations
- ✅ Plans page adapts UI based on JSON content
- ✅ No hardcoded tiers anywhere

**Next Steps (Future):**
- [ ] Implement micro-survey infrastructure
- [ ] Add threshold-based regeneration logic
- [ ] Create micro-survey UI components
- [ ] Add "Update My Plans" button for manual regeneration

**What Users Experience:**
1. Complete onboarding (9 fields) → Redirect to dashboard
2. See calculations immediately (BMI, calories, macros)
3. Background AI generates STANDARD tier plans (4-6 tips, meal prep basics)
4. Plans page shows adaptive UI (meal prep section visible!)
5. In future: Answer micro-surveys → Cross 70% threshold → Unlock PREMIUM

---

## 🎉 Result

**Users now get STANDARD tier personalization from day 1** with just 9 fields!
- 4-6 personalized tips (vs 2-3 in BASIC)
- Meal prep strategies included
- Progression tracking for workouts
- All tier logic automated based on profile completeness
- Clean architecture, no duplication, fully scalable

**Cost-effective & User-friendly:**
- Only regenerate when crossing thresholds (saves AI costs)
- User controls when to regenerate
- Incremental improvement through micro-surveys
- Clear value proposition: "Unlock PREMIUM features by completing your profile!"
