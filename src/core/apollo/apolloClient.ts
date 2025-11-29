/**
 * Apollo Client Configuration
 * GraphQL client setup with Supabase integration
 */

import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { supabase } from '@/lib/supabase/client';
import { env } from '@/core/config/env';

// GraphQL endpoint - Supabase pg_graphql extension
// Enable GraphQL in Supabase: Database > Extensions > pg_graphql
const GRAPHQL_ENDPOINT = `${env.supabase.url}/graphql/v1`;

/**
 * Authentication link - Adds Supabase auth token to requests
 */
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from Supabase
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      apikey: env.supabase.anonKey,
    },
  };
});

/**
 * Error link - Handles GraphQL and network errors
 */
const errorLink = onError((errorResponse: any) => {
  if (errorResponse.graphQLErrors) {
    errorResponse.graphQLErrors.forEach((error: any) => {
      console.error(
        `[GraphQL error]: Message: ${error.message}`,
        error.locations,
        error.path,
        error.extensions
      );

      // Handle authentication errors
      if (error.extensions?.code === 'UNAUTHENTICATED') {
        // Redirect to login or refresh token
        console.warn('Authentication required. Please log in.');
      }

      // Handle authorization errors
      if (error.extensions?.code === 'FORBIDDEN') {
        console.warn('Access forbidden. Insufficient permissions.');
      }
    });
  }

  if (errorResponse.networkError) {
    console.error(`[Network error]: ${errorResponse.networkError.message}`);

    // Handle offline state
    if (!navigator.onLine) {
      console.warn('App is offline. Some features may be unavailable.');
    }
  }
});

/**
 * HTTP link - Connects to GraphQL endpoint
 */
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'same-origin',
});

/**
 * Apollo Client instance
 */
export const apolloClient = new ApolloClient({
  link: from([
    errorLink,
    authLink,
    httpLink,
  ]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Cache configuration for paginated queries
          mealPlans: {
            keyArgs: ['filter'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          workoutPlans: {
            keyArgs: ['filter'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
          progressLogs: {
            keyArgs: ['userId', 'dateRange'],
            merge(existing = [], incoming) {
              return [...existing, ...incoming];
            },
          },
        },
      },
      // User type policy
      User: {
        keyFields: ['id'],
      },
      // MealPlan type policy
      MealPlan: {
        keyFields: ['id'],
      },
      // WorkoutPlan type policy
      WorkoutPlan: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

/**
 * Clear Apollo Client cache
 */
export const clearCache = async () => {
  await apolloClient.clearStore();
};

/**
 * Reset Apollo Client (clear cache and refetch active queries)
 */
export const resetClient = async () => {
  await apolloClient.resetStore();
};
