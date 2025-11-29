# Supabase GraphQL (pg_graphql) Setup Guide

## Step 1: Enable pg_graphql Extension

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **GreenLean**
3. Navigate to: **Database** → **Extensions** (left sidebar)
4. Search for: `pg_graphql`
5. Click the toggle to **Enable** the extension
6. Wait for the extension to be enabled (should take 5-10 seconds)

## Step 2: Verify GraphQL Endpoint

Your GraphQL endpoint is automatically available at:
```
https://YOUR_PROJECT_REF.supabase.co/graphql/v1
```

Replace `YOUR_PROJECT_REF` with your actual Supabase project reference (found in Project Settings → API).

Example:
```
https://abcdefghijklmnop.supabase.co/graphql/v1
```

## Step 3: Test the Connection

After enabling pg_graphql, you can test the connection using the provided test utility:

```bash
npm run dev
```

Then open the browser console and run:
```javascript
// This will be available in the global scope for testing
window.testGraphQL()
```

Or use the GraphQL playground in Supabase:
1. Go to **Database** → **GraphQL** (left sidebar)
2. Try this test query:
```graphql
query {
  user_profilesCollection(first: 1) {
    edges {
      node {
        id
        user_id
        age
      }
    }
  }
}
```

## Step 4: Understanding Supabase GraphQL Schema

Supabase pg_graphql **auto-generates** GraphQL types from your PostgreSQL tables with these conventions:

### Table to Type Mapping
- Table: `user_profiles` → Type: `user_profiles`
- Query: `user_profilesCollection` (for multiple records)
- Query: `user_profilesById` (for single record lookup)

### Query Structure
```graphql
# Get multiple records (with pagination)
query {
  user_profilesCollection(
    first: 10
    filter: { user_id: { eq: "some-uuid" } }
  ) {
    edges {
      node {
        id
        user_id
        age
        heightCm: height_cm
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Get single record by ID
query {
  user_profilesCollection(filter: { id: { eq: "some-uuid" } }) {
    edges {
      node {
        id
        user_id
      }
    }
  }
}
```

### Mutation Structure
```graphql
# Insert
mutation {
  insertIntouser_profilesCollection(objects: [
    {
      user_id: "uuid"
      age: 25
      height_cm: 175
    }
  ]) {
    records {
      id
      user_id
    }
  }
}

# Update
mutation {
  updateuser_profilesCollection(
    set: { age: 26 }
    filter: { id: { eq: "some-uuid" } }
  ) {
    records {
      id
      age
    }
  }
}

# Delete
mutation {
  deleteFromuser_profilesCollection(
    filter: { id: { eq: "some-uuid" } }
  ) {
    records {
      id
    }
  }
}
```

## Step 5: Field Name Conversion

Supabase uses **snake_case** for database columns but GraphQL can use **camelCase** with aliases:

```graphql
query {
  user_profilesCollection {
    edges {
      node {
        id
        userId: user_id          # Alias snake_case to camelCase
        heightCm: height_cm
        currentWeight: current_weight_kg
      }
    }
  }
}
```

## Step 6: Authentication

All GraphQL requests automatically use your Supabase JWT token:
- Passed in `Authorization: Bearer <token>` header
- Row Level Security (RLS) policies are enforced
- User context available in RLS policies

## Step 7: Common Tables in GreenLean

Based on your schema, these tables will be available:

### Core Tables
- `user_profilesCollection` - User profile data
- `meal_plansCollection` - Meal plans
- `mealsCollection` - Individual meals
- `meal_itemsCollection` - Food items in meals
- `workout_plansCollection` - Workout plans
- `workout_sessionsCollection` - Workout sessions
- `exercisesCollection` - Exercise definitions
- `workout_session_exercisesCollection` - Exercises in sessions

### Progress Tables
- `progress_logsCollection` - Weight/measurements tracking
- `goalsCollection` - User fitness goals

## Step 8: Testing Checklist

After enabling pg_graphql, verify:

- [ ] Extension is enabled in Supabase Dashboard
- [ ] GraphQL endpoint returns valid response (not 404)
- [ ] Can query `user_profilesCollection`
- [ ] Authentication token is passed correctly
- [ ] RLS policies are enforced (can only see own data)
- [ ] Mutations work (insert/update/delete)

## Troubleshooting

### Error: "Cannot query field"
- The extension might not be enabled yet
- Check Database → Extensions → pg_graphql is ON

### Error: "relation does not exist"
- Table name is case-sensitive
- Use exact table name from database (e.g., `user_profiles`, not `userProfiles`)

### Error: "permission denied"
- RLS policies are blocking access
- Check that policies allow access for authenticated users
- Verify JWT token is valid

### Error: 404 on GraphQL endpoint
- pg_graphql extension is not enabled
- Supabase project is not on a plan that supports GraphQL (should work on Free tier)

## Next Steps

Once pg_graphql is enabled and verified:
1. ✅ Update GraphQL schema to match Supabase format
2. ✅ Generate TypeScript types with codegen
3. ✅ Replace REST queries with GraphQL
4. ✅ Remove React Query
5. ✅ Test all features
