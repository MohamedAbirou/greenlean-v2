# GraphQL + Apollo Client Setup

This document explains the GraphQL and Apollo Client architecture for GreenLean.

## Overview

The app uses Apollo Client for GraphQL data fetching and state management, integrated with Supabase's GraphQL API.

## Architecture

### 1. Apollo Client Configuration (`src/core/apollo/apolloClient.ts`)

- **Authentication Link**: Automatically adds Supabase auth tokens to all GraphQL requests
- **Error Link**: Handles GraphQL and network errors with proper logging
- **HTTP Link**: Connects to Supabase GraphQL endpoint
- **InMemoryCache**: Configured with type policies for optimal caching

### 2. Apollo Provider (`src/core/providers/ApolloProvider.tsx`)

Wraps the entire app to provide Apollo Client context to all components.

### 3. GraphQL Schema (`src/graphql/schema.graphql`)

Comprehensive schema defining all types, queries, and mutations:

- **User & Profile Management**
- **Meal Plans & Nutrition**
- **Workout Plans & Exercises**
- **Progress Tracking**
- **Goals & Gamification**

### 4. GraphQL Queries (`src/graphql/queries/`)

Example queries and mutations organized by feature:

- `user.graphql` - User profile queries
- `mealPlan.graphql` - Meal plan CRUD operations
- `workoutPlan.graphql` - Workout plan management
- `progress.graphql` - Progress tracking and logging

## Setup Instructions

### 1. Enable GraphQL in Supabase

```sql
-- Enable pg_graphql extension in your Supabase project
-- Database > Extensions > pg_graphql
```

### 2. Generate TypeScript Types

```bash
npm run codegen
```

This generates TypeScript types and React hooks from your GraphQL schema and queries.

### 3. Using GraphQL Hooks (After Codegen)

```typescript
import { useGetMeQuery, useUpdateUserProfileMutation } from '@/generated/graphql';

function MyComponent() {
  // Query example
  const { data, loading, error } = useGetMeQuery();

  // Mutation example
  const [updateProfile] = useUpdateUserProfileMutation();

  const handleUpdate = async () => {
    await updateProfile({
      variables: {
        input: {
          fullName: 'John Doe',
          age: 30,
        },
      },
    });
  };

  // ...
}
```

## Environment Variables

Ensure these are set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Scripts

- `npm run codegen` - Generate TypeScript types and hooks from GraphQL schema
- `npm run codegen:watch` - Watch mode for continuous type generation

## Cache Management

Apollo Client cache can be managed programmatically:

```typescript
import { clearCache, resetClient } from '@/core/apollo/apolloClient';

// Clear cache without refetching
await clearCache();

// Reset client and refetch active queries
await resetClient();
```

## Error Handling

The error link automatically logs:

- GraphQL errors (with authentication/authorization handling)
- Network errors (with offline detection)

Errors are logged to the console for debugging.

## Type Policies

Cache behavior is configured for:

- **Pagination**: `mealPlans`, `workoutPlans`, `progressLogs`
- **Normalization**: `User`, `MealPlan`, `WorkoutPlan` by `id`

## Next Steps

1. **Backend Setup**: Implement GraphQL resolvers in Supabase Edge Functions
2. **Testing**: Add integration tests for GraphQL operations
3. **Optimistic Updates**: Configure optimistic UI for better UX
4. **Subscriptions**: Add real-time GraphQL subscriptions for live updates

## Resources

- [Apollo Client Docs](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [Supabase GraphQL](https://supabase.com/docs/guides/database/extensions/pg_graphql)
