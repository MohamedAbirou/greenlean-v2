/**
 * Redis Cache Utilities for GraphQL Query Results
 *
 * Provides caching layer for:
 * - User profiles
 * - Meal plans
 * - Workout plans
 * - Logs and entries
 *
 * Reduces database load and improves response times
 */

import { redis, CACHE_KEYS, CACHE_TTL, isRedisConfigured } from './client';

/**
 * Generic cache get with automatic JSON parsing
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isRedisConfigured()) {
    return null;
  }

  try {
    const value = await redis.get<T>(key);
    return value;
  } catch (error) {
    console.error('Cache get failed:', key, error);
    return null;
  }
}

/**
 * Generic cache set with automatic JSON stringification
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error('Cache set failed:', key, error);
  }
}

/**
 * Delete a cache key
 */
export async function cacheDelete(key: string): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete failed:', key, error);
  }
}

/**
 * Delete multiple cache keys by pattern
 * Warning: Use with caution - scans all keys
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    // Note: Upstash Redis REST API doesn't support SCAN
    // For production, consider using specific key deletion
    console.warn('Pattern deletion not supported with Upstash REST API');
  } catch (error) {
    console.error('Cache delete pattern failed:', pattern, error);
  }
}

// ==================================================================
// SPECIFIC CACHE HELPERS
// ==================================================================

/**
 * User Profile Cache
 */
export const userProfileCache = {
  async get(userId: string) {
    return cacheGet<any>(CACHE_KEYS.USER_PROFILE(userId));
  },

  async set(userId: string, profile: any) {
    return cacheSet(CACHE_KEYS.USER_PROFILE(userId), profile, CACHE_TTL.LONG);
  },

  async invalidate(userId: string) {
    return cacheDelete(CACHE_KEYS.USER_PROFILE(userId));
  },
};

/**
 * Meal Plan Cache
 */
export const mealPlanCache = {
  async get(userId: string) {
    return cacheGet<any>(CACHE_KEYS.MEAL_PLAN(userId));
  },

  async set(userId: string, plan: any) {
    return cacheSet(CACHE_KEYS.MEAL_PLAN(userId), plan, CACHE_TTL.MEDIUM);
  },

  async invalidate(userId: string) {
    return cacheDelete(CACHE_KEYS.MEAL_PLAN(userId));
  },
};

/**
 * Workout Plan Cache
 */
export const workoutPlanCache = {
  async get(userId: string) {
    return cacheGet<any>(CACHE_KEYS.WORKOUT_PLAN(userId));
  },

  async set(userId: string, plan: any) {
    return cacheSet(CACHE_KEYS.WORKOUT_PLAN(userId), plan, CACHE_TTL.MEDIUM);
  },

  async invalidate(userId: string) {
    return cacheDelete(CACHE_KEYS.WORKOUT_PLAN(userId));
  },
};

/**
 * Nutrition Logs Cache
 */
export const nutritionLogsCache = {
  async get(userId: string, date: string) {
    return cacheGet<any>(CACHE_KEYS.NUTRITION_LOGS(userId, date));
  },

  async set(userId: string, date: string, logs: any) {
    return cacheSet(CACHE_KEYS.NUTRITION_LOGS(userId, date), logs, CACHE_TTL.SHORT);
  },

  async invalidate(userId: string, date: string) {
    return cacheDelete(CACHE_KEYS.NUTRITION_LOGS(userId, date));
  },
};

/**
 * Workout Logs Cache
 */
export const workoutLogsCache = {
  async get(userId: string, date: string) {
    return cacheGet<any>(CACHE_KEYS.WORKOUT_LOGS(userId, date));
  },

  async set(userId: string, date: string, logs: any) {
    return cacheSet(CACHE_KEYS.WORKOUT_LOGS(userId, date), logs, CACHE_TTL.SHORT);
  },

  async invalidate(userId: string, date: string) {
    return cacheDelete(CACHE_KEYS.WORKOUT_LOGS(userId, date));
  },
};

/**
 * Cache-aside pattern helper
 *
 * Usage:
 * const data = await cacheAside(
 *   'my-key',
 *   () => fetchDataFromDB(),
 *   CACHE_TTL.LONG
 * );
 */
export async function cacheAside<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.MEDIUM
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch from source
  const data = await fetchFn();

  // Store in cache
  await cacheSet(key, data, ttlSeconds);

  return data;
}

/**
 * Make cache utilities available globally in development
 */
if (import.meta.env.DEV) {
  (window as any).cache = {
    get: cacheGet,
    set: cacheSet,
    delete: cacheDelete,
    userProfile: userProfileCache,
    mealPlan: mealPlanCache,
    workoutPlan: workoutPlanCache,
    nutritionLogs: nutritionLogsCache,
    workoutLogs: workoutLogsCache,
  };
  console.log('💡 Cache utilities loaded. Try: window.cache.userProfile.get("user-id")');
}
