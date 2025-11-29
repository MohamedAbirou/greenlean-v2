/**
 * Fix GraphQL Codegen Import Issues
 * Cross-platform Node.js script (works on Windows, Mac, Linux)
 *
 * This script fixes the broken namespace imports that graphql-codegen generates
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GRAPHQL_FILE = join(__dirname, '..', 'src', 'generated', 'graphql.ts');

console.log('🔧 Fixing GraphQL codegen imports...');
console.log(`📁 File: ${GRAPHQL_FILE}`);

try {
  let content = readFileSync(GRAPHQL_FILE, 'utf-8');

  console.log('📝 Original file length:', content.length);

  // Split into lines for easier manipulation
  const lines = content.split('\n');

  // Find where imports end (first line that doesn't start with 'import')
  let importEndIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line && !line.startsWith('import') && !line.startsWith('//') && !line.startsWith('*')) {
      importEndIndex = i;
      break;
    }
  }

  console.log(`📦 Found ${importEndIndex} import lines`);

  // Replace all import lines with correct ones
  // Apollo Client v4 exports hooks from /react subpath (not /react/hooks)
  const correctImports = [
    `import { gql } from "@apollo/client";`,
    `import { useQuery, useMutation, useLazyQuery, useSuspenseQuery, skipToken } from "@apollo/client/react";`,
    `import type { QueryHookOptions, LazyQueryHookOptions, MutationHookOptions, QueryResult, SuspenseQueryHookOptions, SkipToken } from "@apollo/client/react";`,
    ``,
    `// Type aliases for codegen compatibility`,
    `export type OperationVariables = Record<string, any>;`,
    `export type MutationFunction<TData, TVariables extends OperationVariables = OperationVariables> = (options?: { variables?: TVariables }) => Promise<{ data?: TData }>;`,
    `export type MutationResult<TData> = { data?: TData; loading: boolean; error?: any };`,
    `export type BaseMutationOptions<TData, TVariables extends OperationVariables = OperationVariables> = MutationHookOptions<TData, TVariables>;`,
    `export type MutationTuple<TData, TVariables extends OperationVariables = OperationVariables> = [MutationFunction<TData, TVariables>, MutationResult<TData>];`,
  ];

  // Rebuild content: correct imports + rest of file
  const restOfFile = lines.slice(importEndIndex).join('\n');
  content = correctImports.join('\n') + '\n' + restOfFile;

  // Fix namespace references in the body
  content = content.replace(/ApolloReactHooks\.useQuery\b/g, 'useQuery');
  content = content.replace(/ApolloReactHooks\.useLazyQuery\b/g, 'useLazyQuery');
  content = content.replace(/ApolloReactHooks\.useMutation\b/g, 'useMutation');
  content = content.replace(/ApolloReactHooks\.useSuspenseQuery\b/g, 'useSuspenseQuery');
  content = content.replace(/ApolloReactHooks\.skipToken\b/g, 'skipToken');
  content = content.replace(/ApolloReactHooks\.QueryHookOptions\b/g, 'QueryHookOptions');
  content = content.replace(/ApolloReactHooks\.LazyQueryHookOptions\b/g, 'LazyQueryHookOptions');
  content = content.replace(/ApolloReactHooks\.MutationHookOptions\b/g, 'MutationHookOptions');
  content = content.replace(/ApolloReactHooks\.SuspenseQueryHookOptions\b/g, 'SuspenseQueryHookOptions');
  content = content.replace(/ApolloReactHooks\.SkipToken\b/g, 'SkipToken');

  // Fix Suspense query type issues (variables can be optional)
  content = content.replace(/return useSuspenseQuery<([^>]+), ([^>]+)>\(([^,]+), options\);/g,
    'return useSuspenseQuery<$1, $2>($3, options as any);');

  content = content.replace(/ApolloReactCommon\.QueryResult/g, 'QueryResult');
  content = content.replace(/ApolloReactCommon\.MutationTuple/g, 'MutationTuple');
  content = content.replace(/ApolloReactCommon\.MutationFunction/g, 'MutationFunction');
  content = content.replace(/ApolloReactCommon\.MutationResult/g, 'MutationResult');
  content = content.replace(/ApolloReactCommon\.BaseMutationOptions/g, 'BaseMutationOptions');

  // Fix Operations namespace - remove it completely (generic regex for all types)
  content = content.replace(/Operations\.(\w+)/g, '$1');

  // Write the fixed content
  writeFileSync(GRAPHQL_FILE, content, 'utf-8');

  console.log('📝 Fixed file length:', content.length);

  // Count remaining issues
  const apolloCount = (content.match(/ApolloReact/g) || []).length;
  const opsCount = (content.match(/Operations\./g) || []).length;

  console.log('');
  console.log('✅ Done!');
  console.log(`   Remaining ApolloReact references: ${apolloCount}`);
  console.log(`   Remaining Operations references: ${opsCount}`);

  if (apolloCount === 0 && opsCount === 0) {
    console.log('   🎉 All imports fixed successfully!');
  } else {
    console.log('   ⚠️  Warning: Some references may still need manual fixing');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
