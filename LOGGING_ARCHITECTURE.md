# COMPREHENSIVE LOGGING SYSTEM ANALYSIS

## DATABASE ARCHITECTURE DISCOVERED

### MEAL LOGGING TABLES

#### 1. `daily_nutrition_logs` (✅ EXPOSED IN GRAPHQL)
**Purpose**: Primary logging table for meal entries
**GraphQL**: Available via `insertIntodaily_nutrition_logsCollection`

**Schema**:
```sql
- id: UUID (PK)
- user_id: UUID! (FK → profiles)
- log_date: DATE! (default: CURRENT_DATE)
- meal_type: TEXT! (breakfast/lunch/dinner/snack)
- food_items: JSONB! (default: '[]'::jsonb)
- total_calories: DOUBLE PRECISION (default: 0)
- total_protein: DOUBLE PRECISION (default: 0)
- total_carbs: DOUBLE PRECISION (default: 0)
- total_fats: DOUBLE PRECISION (default: 0)
- notes: TEXT
- created_at: TIMESTAMP (default: now())
```

**GraphQL Input Type**:
```graphql
input daily_nutrition_logsInsertInput {
  user_id: UUID!
  log_date: Date!
  meal_type: String!
  food_items: JSON!
  total_calories: Float
  total_protein: Float
  total_carbs: Float
  total_fats: Float
  notes: String
}
```

#### 2. `meal_items` (❌ NOT EXPOSED IN GRAPHQL)
**Purpose**: Detailed item-level tracking (BACKEND ONLY)
**GraphQL**: NOT available
**Status**: DO NOT USE for client-side logging

**Schema**:
```sql
- id: UUID (PK)
- user_id: UUID! (FK → profiles)
- nutrition_log_id: UUID (FK → daily_nutrition_logs) -- OPTIONAL!
- food_id: UUID (FK → food_database)
- food_name: TEXT!
- brand_name: TEXT
- serving_qty: DOUBLE PRECISION!
- serving_unit: TEXT!
- calories, protein, carbs, fats, fiber, sugar, sodium
- logged_at: TIMESTAMP
- source: TEXT (default: 'manual')
- from_ai_plan: BOOLEAN
- ai_meal_plan_id: UUID (FK)
- photo_log_id, voice_log_id: UUID (FKs)
- meal_type: TEXT
```

#### 3. `meal_photo_logs` (❌ NOT EXPOSED)
**Purpose**: AI photo analysis results
**Links to**: daily_nutrition_logs via nutrition_log_id

#### 4. `voice_meal_logs` (❌ NOT EXPOSED)
**Purpose**: Voice entry transcription results
**Links to**: daily_nutrition_logs via nutrition_log_id

---

### WORKOUT LOGGING TABLES

#### 1. `workout_logs` (✅ EXPOSED IN GRAPHQL)
**Purpose**: Primary logging table for workout entries
**GraphQL**: Available via `insertIntoworkout_logsCollection`

**Schema**:
```sql
- id: UUID (PK)
- user_id: UUID! (FK → profiles)
- workout_date: DATE! (default: CURRENT_DATE)
- workout_type: TEXT!
- exercises: JSONB! (default: '[]'::jsonb)
- duration_minutes: INTEGER
- calories_burned: INTEGER
- notes: TEXT
- completed: BOOLEAN (default: false)
- created_at: TIMESTAMP (default: now())
```

**GraphQL Input Type**:
```graphql
input workout_logsInsertInput {
  user_id: UUID!
  workout_date: Date!
  workout_type: String!
  exercises: JSON!
  duration_minutes: Int
  calories_burned: Int
  notes: String
  completed: Boolean
}
```

#### 2. `workout_sessions` (❌ NOT EXPOSED IN GRAPHQL)
**Purpose**: Detailed session tracking with metadata (BACKEND ONLY)
**GraphQL**: NOT available
**Status**: DO NOT USE for client-side logging

**Schema**:
```sql
- id: UUID (PK)
- user_id: UUID! (FK → profiles)
- session_date: DATE!
- session_start_time, session_end_time: TIMESTAMP
- duration_minutes: INTEGER (computed)
- workout_name: TEXT!
- workout_type: TEXT!
- workout_plan_id: UUID (FK → ai_workout_plans)
- from_ai_plan: BOOLEAN
- plan_day_name: TEXT
- total_exercises, total_sets, total_reps: INTEGER
- total_volume_kg: DOUBLE PRECISION
- calories_burned: INTEGER
- location, weather: TEXT
- difficulty_rating, energy_level: INTEGER
- many more fields...
```

#### 3. `exercise_sets` (❌ NOT EXPOSED IN GRAPHQL)
**Purpose**: Individual set-level tracking (BACKEND ONLY)
**Links to**: workout_sessions via workout_session_id
**GraphQL**: NOT available

**Schema**:
```sql
- id: UUID (PK)
- workout_session_id: UUID! (FK → workout_sessions)
- user_id: UUID! (FK → profiles)
- exercise_id: UUID (FK → exercise_library)
- exercise_name: TEXT!
- set_number: INTEGER!
- reps, weight_kg, duration_seconds, distance_meters
- rpe, rest_seconds, tempo
- is_warmup, is_dropset, is_failure
- is_pr_weight, is_pr_reps, is_pr_volume
```

---

## ARCHITECTURE DECISION

### ✅ RECOMMENDED APPROACH

**For Client-Side Logging:**

1. **Meals**: Use ONLY `daily_nutrition_logs`
   - Store food items as JSON array in `food_items` field
   - Calculate and store totals in aggregate fields

2. **Workouts**: Use ONLY `workout_logs`
   - Store exercises as JSON array in `exercises` field
   - Calculate and store duration/calories

**For Backend/Server:**
- `meal_items`, `workout_sessions`, `exercise_sets` may be populated via:
  - Database triggers
  - Backend Edge Functions
  - Background jobs
- These provide detailed queryability and analytics

### ❌ REDUNDANCY TO REMOVE

**DO NOT:**
- Try to insert into `meal_items` from client
- Try to insert into `workout_sessions` from client
- Try to insert into `exercise_sets` from client

These tables are NOT exposed in GraphQL for good reason - they're for backend processing.

---

## JSON STRUCTURE REQUIREMENTS

### Expected JSON Format for `food_items`

The `food_items` field should contain an array of food objects. Since pg_graphql uses JSONB, it must be valid JSON.

**Correct Structure**:
```json
[
  {
    "name": "Chicken Breast",
    "brand": "Organic Farms",
    "serving_qty": 1,
    "serving_unit": "piece",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fats": 3.6
  },
  {
    "name": "Brown Rice",
    "serving_qty": 0.5,
    "serving_unit": "cup",
    "calories": 108,
    "protein": 2.3,
    "carbs": 22,
    "fats": 0.9
  }
]
```

### Expected JSON Format for `exercises`

**Correct Structure**:
```json
[
  {
    "name": "Bench Press",
    "category": "strength",
    "muscle_group": "chest",
    "sets": [
      {
        "set_number": 1,
        "reps": 10,
        "weight_kg": 60,
        "completed": true
      },
      {
        "set_number": 2,
        "reps": 8,
        "weight_kg": 65,
        "completed": true
      }
    ]
  },
  {
    "name": "Squat",
    "category": "strength",
    "muscle_group": "legs",
    "sets": [
      {
        "set_number": 1,
        "reps": 12,
        "weight_kg": 80,
        "completed": true
      }
    ]
  }
]
```

---

## CURRENT ERROR: "Invalid input for JSON type"

### Possible Causes:

1. **Field names**: JSON keys might be inconsistent
2. **Data types**: Numbers passed as strings or vice versa
3. **Missing required fields** in JSON objects
4. **Apollo Client serialization**: May need explicit handling

### Solution:

Will verify the exact structure being sent and ensure it matches the expected JSONB format. May need to ensure:
- All numeric values are actual numbers, not strings
- All strings are properly quoted
- No undefined/null values where not expected
- JSON is properly nested

---

## TABLES TO KEEP vs REMOVE

### ✅ KEEP (Essential for Client):
- `daily_nutrition_logs`
- `workout_logs`

### ✅ KEEP (Backend/Future Use):
- `meal_items` (detailed tracking, queryability)
- `workout_sessions` (advanced analytics)
- `exercise_sets` (PR tracking, progression)
- `meal_photo_logs` (AI photo analysis)
- `voice_meal_logs` (voice transcription)

### ❌ DO NOT EXPOSE TO CLIENT:
- Keep current GraphQL schema (only logs exposed)
- Backend can populate detail tables via triggers/functions

---

## NEXT STEPS

1. Fix meal logging to use correct JSON structure
2. Fix workout logging to use correct JSON structure
3. Test mutations with proper data
4. Verify no "Invalid input for JSON type" errors
5. Document the correct usage pattern for developers
