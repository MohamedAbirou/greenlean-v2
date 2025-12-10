# 🚨 CRITICAL FIXES - EXACT FIELD NAMES FROM DATABASE

## ❌ WRONG FIELD NAMES I USED:
- `total_protein_g` ❌
- `total_carbs_g` ❌
- `total_fats_g` ❌
- `workout_date` ❌

## ✅ CORRECT FIELD NAMES FROM YOUR DATABASE:
- `total_protein` ✅ (NO _g suffix!)
- `total_carbs` ✅ (NO _g suffix!)
- `total_fats` ✅ (NO _g suffix!)
- `session_date` ✅ (NOT workout_date!)

---

## 🔧 FILES THAT NEED FIXING:

### 1. Dashboard.tsx (CRITICAL!)

**File:** `src/features/dashboard/pages/Dashboard.tsx`

**Line ~92-95:** Change field names in nutrition totals calculation:

```typescript
// WRONG (what I wrote):
protein: acc.protein + (meal.total_protein_g || 0),
carbs: acc.carbs + (meal.total_carbs_g || 0),
fats: acc.fats + (meal.total_fats_g || 0),

// CORRECT (matches database):
protein: acc.protein + (meal.total_protein || 0),
carbs: acc.carbs + (meal.total_carbs || 0),
fats: acc.fats + (meal.total_fats || 0),
```

**Line ~101-116:** Fix workout data handling:

```typescript
// WRONG:
const workouts = await workoutTrackingService.getWorkoutHistory(...);
workouts: workouts.data?.length || 0,

// CORRECT:
const workoutsResult = await workoutTrackingService.getWorkoutHistory(...);
const workouts = workoutsResult.data || [];
workouts: workouts.length,
```

---

### 2. MealList.tsx

**File:** `src/features/dashboard/components/MealList.tsx`

Search for ALL instances of:
- `total_protein_g` → Replace with `total_protein`
- `total_carbs_g` → Replace with `total_carbs`
- `total_fats_g` → Replace with `total_fats`

---

### 3. WorkoutList.tsx

**File:** `src/features/dashboard/components/WorkoutList.tsx`

Search for ALL instances of:
- `workout_date` → Replace with `session_date`
- `workout.workout_date` → Replace with `workout.session_date`

---

### 4. ProgressCharts.tsx

**File:** `src/features/dashboard/components/ProgressCharts.tsx`

Check if using:
- `total_protein_g` → Should be `total_protein`
- `total_carbs_g` → Should be `total_carbs`
- `total_fats_g` → Should be `total_fats`

---

### 5. WeeklyComparison.tsx

**File:** `src/features/dashboard/components/WeeklyComparison.tsx`

Check nutrition field references:
- `total_protein_g` → Should be `total_protein`
- `total_carbs_g` → Should be `total_carbs`
- `total_fats_g` → Should be `total_fats`

---

## 📝 EXACT CHANGES NEEDED:

### Dashboard.tsx - Find and Replace:

1. **Line ~92:**
   ```
   FIND: meal.total_protein_g
   REPLACE: meal.total_protein
   ```

2. **Line ~93:**
   ```
   FIND: meal.total_carbs_g
   REPLACE: meal.total_carbs
   ```

3. **Line ~94:**
   ```
   FIND: meal.total_fats_g
   REPLACE: meal.total_fats
   ```

4. **Line ~101:** Add Result to variable name
   ```
   FIND: const workouts = await
   REPLACE: const workoutsResult = await
   ```

5. **After Line ~107:** Add extraction line
   ```
   ADD: const workouts = workoutsResult.data || [];
   ```

6. **Line ~115:**
   ```
   FIND: workouts: workouts.data?.length || 0,
   REPLACE: workouts: workouts.length,
   ```

---

## ✅ USE CORRECTED SEED DATA:

**File to use:** `supabase/seed-data-CORRECTED.sql`
**Old file (WRONG):** `supabase/seed-data.sql` ❌ DELETE THIS

The corrected seed data uses:
- ✅ `total_protein`, `total_carbs`, `total_fats` (NO _g)
- ✅ `session_date` (NOT workout_date)
- ✅ `serving_qty`, `serving_unit` (correct field names)
- ✅ All other fields match your exact database schema

---

## 🧪 HOW TO TEST:

1. **Delete old seed data** (if you ran it):
   ```sql
   DELETE FROM meal_items;
   DELETE FROM daily_nutrition_logs;
   DELETE FROM workout_sessions;
   DELETE FROM exercise_sets;
   DELETE FROM water_intake_logs;
   DELETE FROM body_measurements_simple;
   ```

2. **Run CORRECTED seed data:**
   ```sql
   -- Copy/paste entire content of seed-data-CORRECTED.sql
   -- into Supabase SQL Editor and run
   ```

3. **Apply the 6 fixes above to Dashboard.tsx**

4. **Search and replace in other components**

5. **Refresh dashboard** - Should work perfectly!

---

## 🎯 SUMMARY:

**Root cause:** I assumed field names had `_g` suffix, but your database doesn't use that convention.

**Fix:** Remove all `_g` suffixes from field names in all components.

**Affected files:**
- Dashboard.tsx (6 changes)
- MealList.tsx (search/replace)
- WorkoutList.tsx (session_date fix)
- ProgressCharts.tsx (check)
- WeeklyComparison.tsx (check)
