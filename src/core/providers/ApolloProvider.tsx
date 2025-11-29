/**
 * Apollo Provider
 * Wraps the app with Apollo Client for GraphQL queries
 */

import { ApolloProvider as ApolloClientProvider } from '@apollo/client/react';
import type { ReactNode } from 'react';
import { apolloClient } from '@/core/apollo/apolloClient';

interface ApolloProviderProps {
  children: ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <ApolloClientProvider client={apolloClient}>
      {children}
    </ApolloClientProvider>
  );
}
