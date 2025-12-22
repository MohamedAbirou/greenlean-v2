# GraphQL Backend Configuration

## Issue
The local `src/graphql/schema.supabase.graphql` file doesn't include UPDATE and DELETE mutations for:
- `daily_nutrition_logs`
- `workout_logs`

## Solution
These mutations ARE available in Supabase GraphQL by default, but the local schema file needs to be regenerated.

## Required Mutations (Already Available in Supabase)

### Nutrition Logs
```graphql
# Update
mutation UpdateNutrition($id: UUID!, $set: daily_nutrition_logsUpdateInput!) {
  updatedaily_nutrition_logsCollection(
    filter: { id: { eq: $id } }
    set: $set
  ) {
    records { id }
    affectedCount
  }
}

# Delete
mutation DeleteNutrition($id: UUID!) {
  deleteFromdaily_nutrition_logsCollection(
    filter: { id: { eq: $id } }
  ) {
    records { id }
    affectedCount
  }
}
```

### Workout Logs
```graphql
# Update
mutation UpdateWorkout($id: UUID!, $set: workout_logsUpdateInput!) {
  updateworkout_logsCollection(
    filter: { id: { eq: $id } }
    set: $set
  ) {
    records { id }
    affectedCount
  }
}

# Delete
mutation DeleteWorkout($id: UUID!) {
  deleteFromworkout_logsCollection(
    filter: { id: { eq: $id } }
  ) {
    records { id }
    affectedCount
  }
}
```

## How to Regenerate Schema

1. **Check Supabase Dashboard**: Ensure GraphQL is enabled for these tables
2. **Verify RLS Policies**: Make sure UPDATE and DELETE policies exist
3. **Regenerate Schema**:
   ```bash
   # If there's a schema generation command
   npx supabase gen types graphql --local > src/graphql/schema.supabase.graphql
   # OR
   # Manually add the Update/Delete input types to the schema
   ```

## Workaround
The mutations work even if not in the local schema file. The frontend can use them directly via GraphQL queries defined in `src/graphql/queries/logs.graphql`.
