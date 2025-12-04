# Progressive Profiling Implementation Plan

**Date**: 2025-12-04
**Objective**: Replace old quiz-based approach with progressive profiling throughout the entire stack

---

## 🎯 Core Principles

1. **BASIC = Minimal** (3-4 fields) - Works immediately with smart defaults
2. **STANDARD = Enhanced** (10-15 fields) - From micro-surveys over time
3. **PREMIUM = Full Personalization** (25+ fields) - Complete profile

---

## ✅ Completed (Phase 1 - Partial)

1. ✅ MealPlanPromptBuilder created (but tiers are backwards!)
2. ✅ Removed body_fat and body_type
3. ✅ Simplified workout prompt (but should be PREMIUM, not default!)
4. ✅ Database schema verification (but missing 4 tables!)

---

## 📋 Implementation Order

### **BACKEND - Part 1: Database & Schema (Priority: CRITICAL)**

#### Task 1.1: Update DATABASE_SCHEMA_VERIFIED.md
**File**: `/DATABASE_SCHEMA_VERIFIED.md`

Add newly discovered tables from `20251124_add_competitive_tracking_tables.sql`:

```markdown
## ✅ ADDITIONAL TABLES (Found in 20251124 migration)

### user_macro_targets
- id, user_id, effective_date
- daily_calories, daily_protein_g, daily_carbs_g, daily_fats_g, daily_water_ml
- source ('manual', 'ai_generated', 'coach_assigned'), notes
- UNIQUE(user_id, effective_date)
- **USE THIS** instead of ai_meal_plans columns for macro storage!

### user_streaks
- id, user_id, streak_type
- current_streak, longest_streak, last_logged_date, streak_start_date
- total_days_logged
- UNIQUE(user_id, streak_type)

### daily_activity_summary
- id, user_id, activity_date
- Nutrition: calories_consumed, protein_g, carbs_g, fats_g, water_glasses, meals_logged
- Workout: workouts_completed, workout_duration_minutes, calories_burned
- Flags: logged_nutrition, logged_workout, logged_weight, completed_all_goals
- UNIQUE(user_id, activity_date)

### weight_history
- id, user_id, weight_kg, log_date
- measurement_time, notes, source
- UNIQUE(user_id, log_date)
```

**ALSO ADD**:
- body_measurements table
- user_badges table
- scheduled_workouts table
- weekly_summaries table

---

### **BACKEND - Part 2: Prompt Builders (Priority: HIGH)**

#### Task 2.1: Create WorkoutPlanPromptBuilder
**File**: `/ml_service/services/workout_prompt_builder.py` (NEW)

**Structure** (mirror MealPlanPromptBuilder):

```python
from typing import Literal, List, Dict, Any, Optional, TypedDict
from dataclasses import dataclass

PersonalizationLevel = Literal['BASIC', 'STANDARD', 'PREMIUM']

@dataclass
class WorkoutUserProfileData:
    # Core Info (BASIC - 3-4 fields)
    main_goal: str  # lose_weight, gain_muscle, improve_endurance, etc.
    current_weight: float
    age: Optional[int] = None
    gender: Optional[str] = None

    # STANDARD level (10-15 fields)
    activity_level: Optional[str] = None
    exercise_frequency: Optional[str] = None
    training_environment: Optional[List[str]] = None
    available_equipment: Optional[List[str]] = None
    injuries: Optional[str] = None

    # PREMIUM level (25+ fields)
    preferred_exercise: Optional[List[str]] = None
    health_conditions: Optional[List[str]] = None
    medications: Optional[str] = None
    sleep_quality: Optional[str] = None
    stress_level: Optional[int] = None
    flexibility_level: Optional[str] = None
    past_workout_experience: Optional[str] = None
    workout_time_preference: Optional[str] = None
    motivation_level: Optional[int] = None
    # ... etc

class WorkoutPlanPromptBuilder:
    @classmethod
    def build_prompt(cls, user_data: WorkoutUserProfileData, requested_level: PersonalizationLevel) -> AIPromptResponse:
        completeness = cls._calculate_completeness(user_data)
        effective_level = cls._determine_effective_level(requested_level, completeness)

        if effective_level == 'BASIC':
            prompt, used_defaults, missing = cls._build_basic_prompt(user_data)
        elif effective_level == 'STANDARD':
            prompt, used_defaults, missing = cls._build_standard_prompt(user_data)
        else:
            prompt, used_defaults, missing = cls._build_premium_prompt(user_data)

        return AIPromptResponse(
            prompt=prompt,
            metadata=AIPromptMetadata(
                personalization_level=effective_level,
                data_completeness=completeness,
                fields_used=21 - len(missing),
                missing_fields=missing,
                used_defaults=used_defaults
            )
        )
```

**BASIC Prompt** - Minimal workout plan:
```python
def _build_basic_prompt(cls, data: WorkoutUserProfileData):
    """
    BASIC WORKOUT PLAN (3-4 data points)
    - Works IMMEDIATELY with smart defaults
    - Generic but effective full-body plan
    - No equipment required (bodyweight focus)
    """

    defaults = cls._get_defaults_for_goal(data.main_goal)

    prompt = f"""Create a SIMPLE, beginner-friendly 7-day workout plan.

USER INFO:
- Goal: {data.main_goal}
- Weight: {data.current_weight} kg
- Age: {data.age or 'Not specified'}
- Gender: {data.gender or 'Not specified'}

DEFAULTS (we don't know user's preferences yet):
- Exercise Frequency: {defaults['exercise_frequency']}
- Training Environment: Home (bodyweight focus)
- Equipment: Minimal (resistance bands, water bottles)
- Experience Level: Beginner

CREATE:
1. **Works for ANYONE** - No gym required
2. **Safe & Effective** - Focus on form over intensity
3. **Simple to Follow** - Clear instructions, beginner-friendly
4. **Progressive** - Build up gradually

OUTPUT JSON:
{{
  "weekly_plan": [
    {{
      "day": "Monday",
      "workout_type": "Full Body Strength",
      "training_location": "Home",
      "focus": "Total body conditioning",
      "duration_minutes": 30,
      "intensity": "Moderate",
      "exercises": [
        {{
          "name": "Bodyweight Squats",
          "category": "compound",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60,
          "instructions": "Stand feet shoulder-width apart. Lower hips back and down. Keep chest up. Return to standing.",
          "muscle_groups": ["quads", "glutes", "core"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Chair squats (sit-to-stand)",
            "harder": "Jump squats"
          }}
        }}
        // ... 3-5 exercises total
      ],
      "warmup": {{
        "duration_minutes": 5,
        "activities": ["Arm circles", "Leg swings", "Light cardio"]
      }},
      "cooldown": {{
        "duration_minutes": 5,
        "activities": ["Stretching", "Deep breathing"]
      }}
    }}
  ],
  "weekly_summary": {{
    "total_workout_days": 3,
    "strength_days": 2,
    "cardio_days": 1,
    "rest_days": 4,
    "total_time_minutes": 120,
    "difficulty_level": "beginner",
    "training_split": "Full Body 3x/week",
    "notes": "Start here! As you share more preferences, we'll personalize this plan for you."
  }}
}}

Return ONLY JSON, no markdown."""

    return prompt, list(defaults.keys()), missing_fields
```

**STANDARD Prompt** - Enhanced with preferences:
```python
def _build_standard_prompt(cls, data: WorkoutUserProfileData):
    """
    STANDARD WORKOUT PLAN (10-15 data points)
    - Uses user's training preferences
    - Adapts to equipment availability
    - Respects injury limitations
    """

    # Include user preferences + equipment + injury adaptations
    # JSON output: weekly_plan + weekly_summary (same structure)
```

**PREMIUM Prompt** - Full personalization (THE DETAILED ONE):
```python
def _build_premium_prompt(cls, data: WorkoutUserProfileData):
    """
    PREMIUM WORKOUT PLAN (25+ data points)
    - THIS IS THE COMPETITIVE ADVANTAGE!
    - Periodization planning
    - Exercise library by location
    - Progression tracking
    - Injury prevention
    - Nutrition timing
    - Lifestyle integration
    """

    # THIS is where we include ALL the advanced features:
    # - periodization_plan
    # - exercise_library_by_location
    # - progression_tracking
    # - personalized_tips (based on sleep, stress, health)
    # - injury_prevention (specific to user's injuries)
    # - nutrition_timing (pre/post workout)
    # - lifestyle_integration (busy days, travel)

    # JSON output: FULL structure with all fields
```

---

#### Task 2.2: Fix MealPlanPromptBuilder Tiers
**File**: `/ml_service/services/prompt_builder.py`

**PROBLEM**: Currently BASIC has detailed JSON, PREMIUM has simplified!

**FIX**:
1. **BASIC** should be minimal (3-4 meals, simple recipes, generic)
2. **STANDARD** should add preferences (dietary style, allergies, cooking skill)
3. **PREMIUM** should be MOST detailed (hydration_plan, personalized_tips, meal_prep_strategy with weekly schedule)

**Current BASIC** is actually fine - keep it
**Current STANDARD** needs MORE detail
**Current PREMIUM** needs MOST detail (it's already good!)

Actually wait - I need to re-read what I created...

---

### **BACKEND - Part 3: Unified Endpoint (Priority: CRITICAL)**

#### Task 3.1: Create Unified `/generate-plans` Endpoint
**File**: `/ml_service/app.py`

**Current State**:
- `/calculate-nutrition` - Returns calculations only
- `/generate-plans` - Takes quiz data, generates plans

**New State**:
- **Single `/generate-plans` endpoint** that:
  1. ✅ Calculates nutrition (BMR, TDEE, macros)
  2. ✅ Saves to `user_macro_targets` table
  3. ✅ Saves to `quiz_results` table
  4. ✅ Returns calculations IMMEDIATELY to frontend
  5. ✅ Triggers BOTH meal AND workout plan generation in background
  6. ✅ Uses progressive profiling for both plans

**Implementation**:

```python
@app.post("/generate-plans")
async def generate_plans(request: GeneratePlansRequest):
    """
    Unified endpoint for nutrition calculation + plan generation.

    Flow:
    1. Calculate nutrition (sync)
    2. Save to database (sync)
    3. Return calculations immediately (sync)
    4. Generate plans in background (async - fire & forget)
    """
    try:
        # STEP 1: Calculate nutrition profile
        calc_result = calculate_nutrition_profile(request.answers)

        calculations = Calculations(
            bmi=calc_result["bmi"],
            bmr=calc_result["bmr"],
            tdee=calc_result["tdee"],
            macros=Macros(**calc_result["macros"]),
            goalCalories=calc_result["goalCalories"],
            goalWeight=calc_result["targetWeight"] or 0.0,
        )

        # STEP 2: Save to database (BOTH tables!)
        # Save to quiz_results (historical record)
        await db_service.update_quiz_calculations(
            request.quiz_result_id,
            calc_result
        )

        # Save to user_macro_targets (current active targets)
        await db_service.save_macro_targets(
            user_id=request.user_id,
            calories=calculations.goalCalories,
            protein_g=calculations.macros.protein_g,
            carbs_g=calculations.macros.carbs_g,
            fats_g=calculations.macros.fat_g,
            source='ai_generated'
        )

        # STEP 3: Return calculations IMMEDIATELY
        response_data = {
            "calculations": calculations.model_dump(),
            "display": calc_result["display"],
            "message": "Nutrition calculated! Generating your personalized plans in background..."
        }

        # STEP 4: Generate plans in background (fire & forget)
        asyncio.create_task(
            _generate_both_plans_background(
                request=request,
                nutrition=calc_result,
                calculations=calculations
            )
        )

        return response_data

    except Exception as e:
        logger.error(f"Error in generate_plans: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def _generate_both_plans_background(
    request: GeneratePlansRequest,
    nutrition: Dict[str, Any],
    calculations: Calculations
):
    """
    Background task: Generate BOTH meal and workout plans using progressive profiling.
    """
    try:
        # Get profile completeness level
        profile_level = await db_service.get_profile_completeness_level(request.user_id)
        micro_surveys = await db_service.get_answered_micro_surveys(request.user_id)

        # Build UserProfileData from minimal request + surveys
        user_profile = _build_user_profile_data(request, micro_surveys)

        # MEAL PLAN - Using MealPlanPromptBuilder
        meal_prompt_response = MealPlanPromptBuilder.build_prompt(
            user_data=user_profile,
            requested_level=profile_level
        )

        # WORKOUT PLAN - Using WorkoutPlanPromptBuilder
        workout_prompt_response = WorkoutPlanPromptBuilder.build_prompt(
            user_data=WorkoutUserProfileData(...),
            requested_level=profile_level
        )

        # Generate both plans in parallel
        meal_task = _generate_meal_plan_with_prompt(meal_prompt_response, ...)
        workout_task = _generate_workout_plan_with_prompt(workout_prompt_response, ...)

        await asyncio.gather(meal_task, workout_task)

    except Exception as e:
        logger.error(f"Background plan generation failed: {str(e)}")
        # Save error to database for user visibility
```

---

### **BACKEND - Part 4: Database Service Enhancements**

#### Task 4.1: Add Methods for New Tables
**File**: `/ml_service/services/database_service.py`

```python
async def save_macro_targets(
    self,
    user_id: str,
    calories: int,
    protein_g: float,
    carbs_g: float,
    fats_g: float,
    source: str = 'ai_generated',
    effective_date: str = None
):
    """Save macro targets to user_macro_targets table"""

async def update_user_streak(self, user_id: str, streak_type: str):
    """Update streak when user logs activity"""

async def save_daily_activity(self, user_id: str, activity_data: Dict[str, Any]):
    """Save daily activity summary"""

async def log_weight(self, user_id: str, weight_kg: float, notes: str = None):
    """Log weight to weight_history table"""
```

---

### **BACKEND - Part 5: Unit System & Country Detection**

#### Task 5.1: Add Country/Locale Detection
**File**: `/ml_service/utils/locale_detection.py` (NEW)

```python
from typing import Tuple, Literal

UnitSystem = Literal['metric', 'imperial']

# Countries using imperial system
IMPERIAL_COUNTRIES = {'US', 'LR', 'MM'}  # USA, Liberia, Myanmar

def detect_unit_system_from_country(country_code: str) -> UnitSystem:
    """Detect unit system from country code"""
    return 'imperial' if country_code in IMPERIAL_COUNTRIES else 'metric'

def detect_country_from_ip(ip_address: str) -> str:
    """Detect country from IP address (requires geoip2 library)"""
    # TODO: Implement GeoIP lookup
    pass

def format_weight(value_kg: float, unit_system: UnitSystem) -> Tuple[float, str]:
    """Format weight based on unit system"""
    if unit_system == 'imperial':
        lbs = value_kg * 2.20462
        return round(lbs, 1), 'lbs'
    return round(value_kg, 1), 'kg'

def format_height(value_cm: float, unit_system: UnitSystem) -> Tuple[float, str]:
    """Format height based on unit system"""
    if unit_system == 'imperial':
        inches = value_cm / 2.54
        feet = int(inches // 12)
        remaining_inches = round(inches % 12)
        return (feet, remaining_inches), 'ft'
    return round(value_cm, 1), 'cm'
```

---

### **FRONTEND - Part 1: ML Service Updates**

#### Task 6.1: Update mlService.ts
**File**: `/src/services/ml/mlService.ts`

**Changes**:
1. Remove `body_type` references (lines 17, 178)
2. Remove `fitness_goal` (use data from quiz_results instead)
3. Add country detection
4. Update to use new unified endpoint
5. Add unit system conversion

```typescript
// Add country detection
async detectUserCountry(): Promise<string> {
  try {
    // Try to get from browser locale first
    const locale = navigator.language;
    const country = locale.split('-')[1] || 'US';
    return country;
  } catch (error) {
    return 'US'; // Default
  }
}

// Add unit system detection
getUnitSystem(country: string): 'metric' | 'imperial' {
  const imperialCountries = ['US', 'LR', 'MM'];
  return imperialCountries.includes(country) ? 'imperial' : 'metric';
}
```

---

### **FRONTEND - Part 2: Onboarding Refactor**

#### Task 7.1: Fix QuickOnboarding.tsx
**File**: `/src/features/onboarding/pages/QuickOnboarding.tsx`

**Changes**:
1. Remove direct ML service calls
2. Use mlService.ts instead
3. Send minimal data (3-4 fields only)
4. Auto-detect country & unit system
5. Save to correct tables

---

## 🔧 Best Practices to Implement

1. **Error Handling**:
   - Try-catch blocks everywhere
   - Proper error logging
   - User-friendly error messages
   - Error state storage in database

2. **Request Validation**:
   - Pydantic models for all requests
   - Field validation
   - Type checking

3. **Background Tasks**:
   - Proper asyncio.create_task usage
   - Task cancellation on errors
   - Progress tracking

4. **Database Transactions**:
   - Atomic operations
   - Rollback on errors
   - Connection pooling

5. **Logging**:
   - Structured logging
   - Log levels (DEBUG, INFO, WARNING, ERROR)
   - Request/response logging
   - Performance metrics

6. **Type Safety**:
   - TypedDict for all data structures
   - Proper type hints
   - mypy compliance

---

## 📊 Testing Plan

1. **Unit Tests**:
   - Test each prompt builder tier
   - Test nutrition calculations
   - Test database operations

2. **Integration Tests**:
   - Test full flow (onboarding → calculations → plans)
   - Test progressive profiling levels
   - Test error scenarios

3. **Performance Tests**:
   - Measure prompt generation time
   - Measure database query performance
   - Test concurrent requests

---

## 🚀 Deployment Checklist

1. ✅ All database tables verified
2. ✅ All prompt builders tested
3. ✅ Endpoint unified and tested
4. ✅ Frontend refactored
5. ✅ Unit tests passing
6. ✅ Integration tests passing
7. ✅ Documentation updated
8. ✅ Error handling complete
9. ✅ Logging implemented
10. ✅ Code reviewed

---

## 📝 Notes

- **CRITICAL**: BASIC = minimal, PREMIUM = detailed (not the other way around!)
- **Database**: user_macro_targets is THE source of truth for current macros
- **Progressive Profiling**: Users unlock features as they provide more data
- **Unit System**: Auto-detect from country, allow manual override
- **Country Detection**: Browser locale first, IP fallback, manual override
