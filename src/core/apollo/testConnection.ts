/**
 * GraphQL Connection Test Utility
 * Use this to verify Supabase pg_graphql is properly configured
 */

import { apolloClient } from './apolloClient';
import { gql } from '@apollo/client';

/**
 * Test query - tries to fetch user profiles
 * This will verify:
 * 1. pg_graphql extension is enabled
 * 2. GraphQL endpoint is accessible
 * 3. Authentication is working
 * 4. Schema is auto-generated
 */
const TEST_QUERY = gql`
  query TestConnection {
    user_profilesCollection(first: 1) {
      edges {
        node {
          id
          user_id
        }
      }
    }
  }
`;

/**
 * Tests the GraphQL connection to Supabase
 * Call this from the browser console: window.testGraphQL()
 */
export async function testGraphQLConnection() {
  console.log('🔍 Testing GraphQL connection to Supabase...');
  console.log('📡 Endpoint:', apolloClient.link);

  try {
    const result = await apolloClient.query({
      query: TEST_QUERY,
      fetchPolicy: 'network-only', // Skip cache for testing
    });

    console.log('✅ GraphQL connection successful!');
    console.log('📊 Data:', result.data);

    if ((result.data as any)?.user_profilesCollection) {
      console.log('✅ pg_graphql is enabled and working');
      console.log('✅ user_profiles table is accessible');
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error: any) {
    console.error('❌ GraphQL connection failed');
    console.error('Error:', error);

    // Helpful error messages
    if (error.message?.includes('404')) {
      console.error(`
⚠️  404 Error - pg_graphql is NOT enabled

📝 To fix:
1. Go to Supabase Dashboard
2. Navigate to: Database → Extensions
3. Find "pg_graphql" and enable it
4. Wait 5-10 seconds for activation
5. Try again
      `);
    } else if (error.message?.includes('UNAUTHENTICATED')) {
      console.error(`
⚠️  Authentication Error - No valid session

📝 To fix:
1. Log in to the application
2. Try again after authentication
      `);
    } else if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
      console.error(`
⚠️  Table Not Found Error

📝 Possible causes:
1. Table "user_profiles" doesn't exist in database
2. RLS policies are blocking access
3. Schema name is incorrect
      `);
    } else {
      console.error(`
⚠️  Unknown Error

📝 Check:
1. Supabase project is active
2. Environment variables are correct (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
3. Network connection is stable
      `);
    }

    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Make test function available globally in development
 */
if (import.meta.env.DEV) {
  (window as any).testGraphQL = testGraphQLConnection;
  console.log('💡 GraphQL test utility loaded. Run: window.testGraphQL()');
}
