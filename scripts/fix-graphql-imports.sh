#!/bin/bash
# Fix GraphQL Codegen Import Issues
# This script fixes namespace imports in the generated graphql.ts file

echo "🔧 Fixing GraphQL codegen imports..."

GRAPHQL_FILE="src/generated/graphql.ts"

if [ ! -f "$GRAPHQL_FILE" ]; then
  echo "❌ Error: $GRAPHQL_FILE not found"
  exit 1
fi

# 1. Fix imports
echo "📦 Fixing imports..."
sed -i '1,10s/import \* as ApolloReactCommon from "@apollo\/client";/import { useQuery, useLazyQuery, useMutation, useSuspenseQuery, skipToken } from "@apollo\/client";\nimport type { QueryHookOptions, LazyQueryHookOptions, MutationHookOptions, QueryResult, MutationTuple, SuspenseQueryHookOptions, SkipToken, MutationFunction, MutationResult, BaseMutationOptions } from "@apollo\/client";/' "$GRAPHQL_FILE"

sed -i '/import \* as ApolloReactHooks from "@apollo\/client";/d' "$GRAPHQL_FILE"

# 2. Fix hook calls
echo "🔗 Fixing hook calls..."
sed -i 's/ApolloReactHooks\.useQuery/useQuery/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactHooks\.useLazyQuery/useLazyQuery/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactHooks\.useMutation/useMutation/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactHooks\.useSuspenseQuery/useSuspenseQuery/g' "$GRAPHQL_FILE"

# 3. Fix type references
echo "📝 Fixing type references..."
sed -i 's/ApolloReactHooks\.QueryHookOptions/QueryHookOptions/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactHooks\.LazyQueryHookOptions/LazyQueryHookOptions/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactHooks\.MutationHookOptions/MutationHookOptions/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactHooks\.skipToken/skipToken/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactHooks\.SkipToken/SkipToken/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactHooks\.SuspenseQueryHookOptions/SuspenseQueryHookOptions/g' "$GRAPHQL_FILE"

# 4. Fix ApolloReactCommon references
echo "🔧 Fixing common references..."
sed -i 's/ApolloReactCommon\.QueryResult/QueryResult/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactCommon\.MutationTuple/MutationTuple/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactCommon\.MutationFunction/MutationFunction/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactCommon\.MutationResult/MutationResult/g' "$GRAPHQL_FILE"
sed -i 's/ApolloReactCommon\.BaseMutationOptions/BaseMutationOptions/g' "$GRAPHQL_FILE"

# 5. Fix Operations namespace
echo "📦 Fixing Operations namespace..."
sed -i 's/Operations\.GetUserProfileQuery/GetUserProfileQuery/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.GetUserProfileQueryVariables/GetUserProfileQueryVariables/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.GetProfileQuery/GetProfileQuery/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.GetProfileQueryVariables/GetProfileQueryVariables/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.GetUserSubscriptionQuery/GetUserSubscriptionQuery/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.GetUserSubscriptionQueryVariables/GetUserSubscriptionQueryVariables/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.UpdateUserProfileMutation/UpdateUserProfileMutation/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.UpdateUserProfileMutationVariables/UpdateUserProfileMutationVariables/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.CreateUserProfileMutation/CreateUserProfileMutation/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.CreateUserProfileMutationVariables/CreateUserProfileMutationVariables/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.UpdateUserAvatarMutation/UpdateUserAvatarMutation/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.UpdateUserAvatarMutationVariables/UpdateUserAvatarMutationVariables/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.DeleteUserAvatarMutation/DeleteUserAvatarMutation/g' "$GRAPHQL_FILE"
sed -i 's/Operations\.DeleteUserAvatarMutationVariables/DeleteUserAvatarMutationVariables/g' "$GRAPHQL_FILE"

# 6. Verify
APOLLO_COUNT=$(grep -c "ApolloReact" "$GRAPHQL_FILE" || true)
OPS_COUNT=$(grep -c "Operations\." "$GRAPHQL_FILE" || true)

echo ""
echo "✅ Done!"
echo "   Remaining ApolloReact references: $APOLLO_COUNT"
echo "   Remaining Operations references: $OPS_COUNT"

if [ "$APOLLO_COUNT" -eq 0 ] && [ "$OPS_COUNT" -eq 0 ]; then
  echo "   🎉 All imports fixed successfully!"
  exit 0
else
  echo "   ⚠️  Warning: Some references may still need manual fixing"
  exit 0
fi
