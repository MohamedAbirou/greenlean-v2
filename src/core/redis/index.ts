/**
 * Redis Module Exports
 *
 * Centralized export for all Redis-related functionality
 */

// Client
export { redis, isRedisConfigured, testRedisConnection, CACHE_KEYS, CACHE_TTL } from './client';

// Rate Limiting
export {
  checkRateLimit,
  canGenerateMealPlan,
  canGenerateWorkoutPlan,
  canUploadImage,
  canUpdateProfile,
  resetRateLimit,
  RATE_LIMITS,
  type RateLimitConfig,
  type RateLimitResult,
} from './rateLimit';

// Caching
export {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  cacheAside,
  userProfileCache,
  mealPlanCache,
  workoutPlanCache,
  nutritionLogsCache,
  workoutLogsCache,
} from './cache';
