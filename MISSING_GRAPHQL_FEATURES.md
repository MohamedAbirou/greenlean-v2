# Missing GraphQL Schema Features

## Overview

Several database tables exist but are NOT currently exposed in the GraphQL schema (`src/graphql/schema.supabase.graphql`). These tables need to be exposed via Supabase's pg_graphql configuration.

---

## Tables That Need GraphQL Exposure

### 1. **`weight_history`** (❌ NOT EXPOSED)

**Purpose**: Track user weight over time

**Required For**:
- Log Weight button in OverviewTab
- Progress tracking charts
- Weight trend analysis

**Expected GraphQL Operations**:
```graphql
# Query
query GetWeightHistory($userId: UUID!, $startDate: Date, $endDate: Date) {
  weight_historyCollection(
    filter: {
      user_id: { eq: $userId }
      log_date: { gte: $startDate, lte: $endDate }
    }
    orderBy: { log_date: DescNullsLast }
  ) {
    edges {
      node {
        id
        user_id
        weight_kg
        weight_lbs
        log_date
        notes
        created_at
      }
    }
  }
}

# Mutation
mutation LogWeight($input: weight_historyInsertInput!) {
  insertIntoweight_historyCollection(objects: [$input]) {
    records {
      id
      weight_kg
      log_date
    }
    affectedCount
  }
}
```

---

### 2. **`daily_water_intake`** (❌ NOT EXPOSED)

**Purpose**: Track daily water consumption

**Database Schema**:
```sql
- id: UUID (PK)
- user_id: UUID! (FK → profiles) [UNIQUE with log_date]
- log_date: DATE! (default: CURRENT_DATE) [UNIQUE with user_id]
- glasses: INTEGER (default: 0)
- total_ml: INTEGER (default: 0)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**Required For**:
- Add Water button in OverviewTab
- Hydration tracking
- Daily water goal monitoring

**Expected GraphQL Operations**:
```graphql
# Query
query GetDailyWaterIntake($userId: UUID!, $logDate: Date!) {
  daily_water_intakeCollection(
    filter: {
      user_id: { eq: $userId }
      log_date: { eq: $logDate }
    }
  ) {
    edges {
      node {
        id
        user_id
        log_date
        glasses
        total_ml
        created_at
        updated_at
      }
    }
  }
}

# Upsert Mutation (since user_id + log_date is UNIQUE)
mutation UpsertWaterIntake($userId: UUID!, $logDate: Date!, $glasses: Int!, $totalMl: Int!) {
  insertIntodaily_water_intakeCollection(
    objects: [{
      user_id: $userId
      log_date: $logDate
      glasses: $glasses
      total_ml: $totalMl
    }]
    onConflict: {
      constraint: "daily_water_intake_user_id_log_date_key"
      update: ["glasses", "total_ml", "updated_at"]
    }
  ) {
    records {
      id
      glasses
      total_ml
    }
  }
}
```

---

### 3. **`user_streaks`** (Need to check if exists)

**Purpose**: Track user streaks and consistency

**Potential Use Cases**:
- Workout streaks
- Logging streaks
- Gamification features

---

### 4. **`meal_items`** (❌ NOT EXPOSED - Intentional?)

**Purpose**: Detailed item-level meal tracking

**Status**: Currently NOT exposed (backend-only table)

**Decision**: Keep as backend-only? Or expose for detailed queries?

**If exposed, enables**:
- Detailed food history queries
- Favorite foods analysis
- Ingredient tracking
- Photo/voice log references

---

### 5. **`workout_sessions`** (❌ NOT EXPOSED - Intentional?)

**Purpose**: Detailed session-level workout tracking

**Status**: Currently NOT exposed (backend-only table)

**Decision**: Keep as backend-only? Or expose for advanced features?

**If exposed, enables**:
- Detailed session metadata
- Advanced workout analytics
- Performance tracking
- Location/weather context

---

### 6. **`exercise_sets`** (❌ NOT EXPOSED - Intentional?)

**Purpose**: Individual set-level tracking

**Status**: Currently NOT exposed (backend-only table)

**Decision**: Keep as backend-only? Or expose for PR tracking?

**If exposed, enables**:
- Personal record (PR) tracking
- Set-by-set analysis
- Volume progression
- RPE trends

---

## How to Expose Tables in Supabase

### Option 1: Supabase Dashboard (Easiest)

1. Go to Supabase Dashboard → API Settings
2. Navigate to GraphQL section
3. Check which tables are exposed
4. Enable missing tables

### Option 2: RLS Policies (Required)

Tables must have proper Row Level Security policies:

```sql
-- Example for weight_history
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own weight history"
ON weight_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weight history"
ON weight_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Similar for daily_water_intake
ALTER TABLE daily_water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own water intake"
ON daily_water_intake FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own water intake"
ON daily_water_intake FOR ALL
USING (auth.uid() = user_id);
```

### Option 3: Check pg_graphql Configuration

```sql
-- Check which schemas are exposed
SELECT * FROM graphql.get_schema_version();

-- Check table permissions
SELECT schemaname, tablename, tableowner
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('weight_history', 'daily_water_intake', 'user_streaks');
```

---

## Implementation Priority

### HIGH PRIORITY (Blocking UI features):
1. ✅ `daily_nutrition_logs` - Already exposed
2. ✅ `workout_logs` - Already exposed
3. ❌ **`weight_history`** - Needed for "Log Weight" button
4. ❌ **`daily_water_intake`** - Needed for "Add Water" button

### MEDIUM PRIORITY (Analytics & Progress):
5. `user_streaks` - For gamification
6. `weekly_progress_detailed` - For progress charts
7. `workout_analytics` - For workout insights

### LOW PRIORITY (Advanced Features):
8. `meal_items` - Detailed meal tracking (currently backend-only)
9. `workout_sessions` - Detailed session tracking (currently backend-only)
10. `exercise_sets` - Set-level tracking (currently backend-only)

---

## Action Items for Backend Team

1. **Enable GraphQL for priority tables**:
   - `weight_history`
   - `daily_water_intake`
   - `user_streaks` (if exists)

2. **Set up RLS policies** for exposed tables

3. **Regenerate GraphQL schema**:
   ```bash
   supabase db reset  # Or appropriate schema refresh command
   ```

4. **Update frontend schema**:
   ```bash
   npm run codegen
   ```

---

## Frontend Implementation Status

Once tables are exposed, these components are ready:

- [ ] WeightLogModal - Ready to implement
- [ ] WaterIntakeWidget - Ready to implement
- [ ] ProgressTab weight charts - Needs weight_history data
- [ ] Streak tracking - Needs user_streaks table

---

## Notes

- **pg_graphql** auto-generates schema based on database structure and permissions
- Tables without proper RLS policies won't appear in GraphQL
- After exposing tables, run `npm run codegen` to update TypeScript types
- The frontend is built to handle these features once backend is configured
