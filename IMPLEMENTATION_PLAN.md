# 🚀 GreenLean v2 - Complete Implementation Plan

**Date**: 2025-11-30
**Status**: Ready for Implementation
**Priority**: HIGH - Migration to GraphQL + Complete Gamification

---

## 📊 Current State Analysis

### ✅ What's Working
- GraphQL + Apollo Client infrastructure is set up
- Profile queries migrated to GraphQL
- Stripe integration (100%)
- Basic gamification tables exist in database
- Notification triggers exist (automatic)

### ❌ Critical Issues Found

#### 1. **Challenges & Gamification Still Using React Query** 🔴
**Files Affected:**
- `src/pages/Challenges.tsx` - Uses React Query hooks
- `src/features/challenges/hooks/useChallenges.ts` - All React Query
- `src/features/challenges/api/challengesApi.ts` - Direct Supabase calls

**Database Tables (Exist but not in GraphQL):**
- `challenges` ✅
- `challenge_participants` ✅
- `badges` ✅
- `user_rewards` ✅
- `rewards_catalog` ✅
- `user_reward_redemptions` ✅
- `user_badges` ✅

**Problem**: Migration docs say "GraphQL migration complete" but challenges still use React Query!

#### 2. **Profile/Settings Routing Confusion** 🔴
**Current Routes:**
- `/profile` - Stats, progress, badges (direct Supabase queries)
- `/settings` - Modern tabs system (Account, Profile, Billing, etc.)
- `/profile/settings` - OLD implementation with React Query hooks

**Issues:**
- `/profile` button navigates to `/settings` (line 261) NOT `/profile/settings`
- `/profile/settings` uses old `useProfile` and `useSubscription` React Query hooks
- Confusion: 3 different routes for similar purposes

**Required Fix:**
- Consolidate to `/profile` (view) and `/profile/settings` (edit)
- Migrate `/profile/settings` to GraphQL
- Update navigation flow

#### 3. **Phase 9 Gamification - Only 30% Done** 🔴
**What EXISTS:**
- ✅ Database tables for rewards, badges, themes
- ✅ Challenges page UI
- ✅ Points system
- ✅ Notification triggers

**What's MISSING:**
- ❌ Rewards Catalog UI (users can earn points but can't spend them!)
- ❌ Theme Unlock System (themes in DB, no unlock mechanism)
- ❌ Avatar Customization (referenced but not implemented)
- ❌ Coupon Generation (no implementation)

#### 4. **Phase 5 & 3.6 Incomplete** 🟡
**Phase 5 - Onboarding:**
- ✅ 3-question quick start
- ✅ 13 micro-surveys defined
- ❌ Survey trigger logic NOT implemented

**Phase 3.6 - AI Prompts:**
- ✅ BASIC/STANDARD/PREMIUM tiers
- ✅ Smart defaults
- ❌ ML inference NOT implemented

#### 5. **No Redis Caching** 🟡
- GraphQL queries go straight to Supabase
- No caching layer for challenges, leaderboards, rewards
- Performance impact for frequently accessed data

---

## 🎯 Implementation Tasks

### **PHASE 1: Fix Challenges - Migrate to GraphQL** (Priority: CRITICAL)

#### Task 1.1: Update GraphQL Schema
**File**: `src/graphql/schema.supabase.graphql`

Add types:
```graphql
type challenges {
  id: UUID!
  title: String!
  description: String!
  type: String! # workout, nutrition, hybrid, social
  difficulty: String! # beginner, intermediate, advanced
  points: Int!
  badge_id: UUID
  badge: badges
  requirements: JSON!
  start_date: Datetime
  end_date: Datetime
  is_active: Boolean
  created_at: Datetime
  updated_at: Datetime
  participants: [challenge_participants!]
}

type badges {
  id: UUID!
  name: String!
  description: String
  icon: String
  color: String
  requirement_type: String
  requirement_value: Int
  created_at: Datetime
}

type challenge_participants {
  id: UUID!
  challenge_id: UUID!
  user_id: UUID!
  progress: JSON!
  completed: Boolean!
  completion_date: Datetime
  streak_count: Int
  last_progress_date: Datetime
  streak_expires_at: Datetime
  streak_warning_sent: Boolean
  created_at: Datetime
  challenge: challenges
}

type user_rewards {
  user_id: UUID!
  points: Int!
  lifetime_points: Int!
  badges: JSON!
  created_at: Datetime
  updated_at: Datetime
}

type rewards_catalog {
  id: UUID!
  name: String!
  description: String!
  type: String! # discount, theme, avatar, feature_unlock, physical_item
  points_cost: Int!
  tier_requirement: String
  stock_quantity: Int
  is_active: Boolean
  image_url: String
  metadata: JSON
  created_at: Datetime
  updated_at: Datetime
}

type user_reward_redemptions {
  id: UUID!
  user_id: UUID!
  reward_id: UUID!
  redeemed_at: Datetime!
  status: String!
  redemption_code: String
  metadata: JSON
  reward: rewards_catalog
}
```

Add filters and queries:
```graphql
input challengesFilter {
  id: UUIDFilter
  type: StringFilter
  difficulty: StringFilter
  is_active: BooleanFilter
}

input challenge_participantsFilter {
  user_id: UUIDFilter
  challenge_id: UUIDFilter
  completed: BooleanFilter
}

type Query {
  challengesCollection(filter: challengesFilter): challengesConnection
  challenge_participantsCollection(filter: challenge_participantsFilter): challenge_participantsConnection
  badgesCollection: badgesConnection
  user_rewardsCollection(filter: user_rewardsFilter): user_rewardsConnection
  rewards_catalogCollection(filter: rewards_catalogFilter): rewards_catalogConnection
}

type Mutation {
  insertIntochallenge_participantsCollection(objects: [challenge_participantsInsertInput!]!): challenge_participantsInsertResponse
  updatechallenge_participantsCollection(set: challenge_participantsUpdateInput!, filter: challenge_participantsFilter): challenge_participantsUpdateResponse
  insertIntouser_reward_redemptionsCollection(objects: [user_reward_redemptionsInsertInput!]!): user_reward_redemptionsInsertResponse
}
```

#### Task 1.2: Create GraphQL Queries
**File**: `src/graphql/queries/challenges.graphql`

```graphql
query GetChallenges($userId: UUID) {
  challengesCollection(filter: { is_active: { eq: true } }) {
    edges {
      node {
        id
        title
        description
        type
        difficulty
        points
        badge_id
        requirements
        start_date
        end_date
        is_active
        badge {
          id
          name
          description
          icon
          color
        }
      }
    }
  }
  challenge_participantsCollection(filter: { user_id: { eq: $userId } }) {
    edges {
      node {
        id
        challenge_id
        user_id
        progress
        completed
        completion_date
        streak_count
        last_progress_date
        streak_expires_at
      }
    }
  }
}

query GetUserRewards($userId: UUID!) {
  user_rewardsCollection(filter: { user_id: { eq: $userId } }) {
    edges {
      node {
        user_id
        points
        lifetime_points
        badges
        created_at
        updated_at
      }
    }
  }
}

mutation JoinChallenge($challengeId: UUID!, $userId: UUID!) {
  insertIntochallenge_participantsCollection(
    objects: [{
      challenge_id: $challengeId
      user_id: $userId
      progress: { current: 0 }
      completed: false
      streak_count: 0
    }]
  ) {
    records {
      id
      challenge_id
      user_id
    }
    affectedCount
  }
}

mutation UpdateChallengeProgress($challengeId: UUID!, $userId: UUID!, $progress: JSON!, $completed: Boolean!) {
  updatechallenge_participantsCollection(
    filter: { challenge_id: { eq: $challengeId }, user_id: { eq: $userId } }
    set: { progress: $progress, completed: $completed }
  ) {
    records {
      id
      progress
      completed
    }
    affectedCount
  }
}
```

#### Task 1.3: Regenerate TypeScript Types
```bash
npm run codegen
```

#### Task 1.4: Create GraphQL Hooks
**File**: `src/features/challenges/hooks/useChallengesGraphQL.ts`

```typescript
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_CHALLENGES,
  GET_USER_REWARDS,
  JOIN_CHALLENGE,
  UPDATE_CHALLENGE_PROGRESS,
  QUIT_CHALLENGE
} from '@/graphql/queries/challenges.graphql';

export function useChallengesGraphQL(userId?: string | null) {
  return useQuery(GET_CHALLENGES, {
    variables: { userId },
    skip: !userId,
    pollInterval: 30000, // Refresh every 30s
  });
}

export function useUserRewardsGraphQL(userId?: string | null) {
  return useQuery(GET_USER_REWARDS, {
    variables: { userId },
    skip: !userId,
  });
}

export function useJoinChallengeGraphQL() {
  const [joinChallenge, { loading, error }] = useMutation(JOIN_CHALLENGE, {
    refetchQueries: ['GetChallenges', 'GetUserRewards'],
  });

  return { joinChallenge, loading, error };
}

export function useUpdateChallengeProgressGraphQL() {
  const [updateProgress, { loading, error }] = useMutation(UPDATE_CHALLENGE_PROGRESS, {
    refetchQueries: ['GetChallenges', 'GetUserRewards'],
  });

  return { updateProgress, loading, error };
}
```

#### Task 1.5: Update Challenges Page
**File**: `src/pages/Challenges.tsx`

Replace:
```typescript
// OLD
import { useChallengesQuery, useUserRewards, useJoinChallenge } from "@/features/challenges";

// NEW
import { useChallengesGraphQL, useUserRewardsGraphQL, useJoinChallengeGraphQL } from "@/features/challenges";
```

#### Task 1.6: Delete Old React Query Code
```bash
rm src/features/challenges/hooks/useChallenges.ts
rm src/features/challenges/api/challengesApi.ts
```

---

### **PHASE 2: Add Redis Caching Layer** (Priority: HIGH)

#### Task 2.1: Install Upstash Redis
```bash
npm install @upstash/redis
```

#### Task 2.2: Create Redis Client
**File**: `src/lib/redis/client.ts`

```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: import.meta.env.VITE_UPSTASH_REDIS_URL,
  token: import.meta.env.VITE_UPSTASH_REDIS_TOKEN,
});

// Cache keys
export const CACHE_KEYS = {
  challenges: (userId: string) => `challenges:${userId}`,
  userRewards: (userId: string) => `rewards:${userId}`,
  leaderboard: (challengeId: string) => `leaderboard:${challengeId}`,
  rewards catalog: 'rewards:catalog',
};

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  challenges: 300, // 5 minutes
  userRewards: 60, // 1 minute
  leaderboard: 120, // 2 minutes
  rewardsCatalog: 3600, // 1 hour
};
```

#### Task 2.3: Add Caching to Apollo Client
**File**: `src/core/apollo/apolloClient.ts`

Add custom fetch function with Redis caching.

---

### **PHASE 3: Fix Profile/Settings Routing** (Priority: HIGH)

#### Task 3.1: Update Routes
**File**: `src/core/router/routes.tsx`

Keep:
- `/profile` - View-only profile with stats
- `/profile/settings` - Edit profile settings
- Remove duplicate `/settings` route OR redirect to `/profile/settings`

#### Task 3.2: Migrate ProfileSettings to GraphQL
**File**: `src/pages/ProfileSettings.tsx`

Replace:
```typescript
// OLD
import { useProfile } from "@/features/profile/hooks/useProfile";
import { useSubscription } from "@/features/profile/hooks/useSubscription";

// NEW
import { useProfileGraphQL } from "@/features/profile/hooks/useProfileGraphQL";
import { useSubscriptionGraphQL } from "@/features/billing/hooks/useSubscriptionGraphQL";
```

#### Task 3.3: Update Profile Page Navigation
**File**: `src/pages/Profile.tsx` (line 261)

Change:
```typescript
// OLD
onClick={() => navigate('/settings')}

// NEW
onClick={() => navigate('/profile/settings')}
```

---

### **PHASE 4: Implement Missing Gamification Features** (Priority: HIGH)

#### Task 4.1: Rewards Catalog UI
**File**: `src/pages/RewardsCatalog.tsx`

This page already exists! Check implementation:
```typescript
import { useState } from 'react';
import { useAuth } from '@/features/auth';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
// Implement:
// - Fetch rewards_catalog from GraphQL
// - Display reward cards with points cost
// - Allow redemption if user has enough points
// - Show redeemed rewards
```

#### Task 4.2: Theme Unlock System
**File**: `src/features/rewards/hooks/useThemeUnlock.ts`

```typescript
export function useThemeUnlock() {
  const { user } = useAuth();
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([]);

  // Fetch user_reward_redemptions where type = 'theme'
  // Apply theme to app
  // Save preference
}
```

**File**: `src/features/rewards/components/ThemeSelector.tsx`

Already referenced in ProfileSettings.tsx (line 142)! Implement it.

#### Task 4.3: Avatar Customization
**File**: `src/features/rewards/components/AvatarCustomizer.tsx`

Already referenced in ProfileSettings.tsx (line 146)! Implement it.

#### Task 4.4: Coupon Generation
**File**: `src/features/rewards/components/CouponManager.tsx`

Already referenced in ProfileSettings.tsx (line 155)! Implement it.

---

### **PHASE 5: Complete Onboarding - MicroSurvey Triggers** (Priority: MEDIUM)

#### Task 5.1: Find MicroSurvey Definitions
Check for survey configuration files.

#### Task 5.2: Implement Trigger Logic
**File**: `src/features/onboarding/hooks/useMicroSurveyTriggers.ts`

```typescript
export function useMicroSurveyTriggers() {
  // Trigger surveys based on:
  // - User actions (completed workout, logged meal)
  // - Time-based (day 7, day 14, day 30)
  // - Progress milestones
  // - Profile completeness
}
```

---

### **PHASE 6: AI Prompts ML Inference** (Priority: MEDIUM)

#### Task 6.1: Implement ML Inference
**File**: `src/features/ai-prompts/ml/inference.ts`

```typescript
// Use user's:
// - Quiz results
// - Progress history
// - Meal/workout logs
// To intelligently select prompt tier
```

---

### **PHASE 7: Bento Grid Dashboard** (Priority: MEDIUM)

#### Task 7.1: Dashboard Redesign
**File**: `src/pages/DashboardV2.tsx` or `src/features/dashboard/pages/Dashboard.tsx`

Transform to Bento Grid layout:
- Hero stats card
- Quick actions
- Progress charts
- Recent activity
- Challenges widget
- Streak widget

---

## 📋 Task Checklist

### Critical Path (Do First)
- [ ] 1.1 Update GraphQL schema with challenges/badges/rewards
- [ ] 1.2 Create challenges.graphql queries
- [ ] 1.3 Regenerate TypeScript types
- [ ] 1.4 Create GraphQL hooks for challenges
- [ ] 1.5 Update Challenges.tsx to use GraphQL
- [ ] 1.6 Delete old React Query code
- [ ] 2.1-2.3 Add Redis caching layer
- [ ] 3.1-3.3 Fix profile/settings routing
- [ ] 4.1 Implement Rewards Catalog UI
- [ ] 4.2 Implement Theme Unlock System
- [ ] 4.3 Implement Avatar Customization
- [ ] 4.4 Implement Coupon Generation

### Important (Do Second)
- [ ] 5.1-5.2 MicroSurvey trigger logic
- [ ] 6.1 ML inference for AI prompts
- [ ] 7.1 Bento Grid Dashboard

---

## 🚨 Breaking Changes

1. **Challenges hooks** - Components using old React Query hooks will break
2. **Profile settings** - `/settings` route needs redirect
3. **Gamification features** - New UI for rewards will change user flow

---

## ✅ Success Criteria

1. Zero React Query imports in challenges feature
2. All gamification features accessible and functional
3. Profile/settings routing is clear and consistent
4. Redis caching reduces API calls by 60%+
5. All tests pass
6. No TypeScript errors

---

## 📝 Notes

- Keep Stripe API calls as REST (external service)
- Keep Supabase Storage as Storage API (not GraphQL)
- Keep Supabase Auth as Auth API (not GraphQL)
- GraphQL is ONLY for database queries

---

**Ready to implement!** 🚀
