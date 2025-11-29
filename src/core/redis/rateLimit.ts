/**
 * Rate Limiting with Upstash Redis
 *
 * Implements sliding window rate limiting for:
 * - AI generation requests (meal plans, workout plans)
 * - GraphQL mutations
 * - File uploads
 * - API calls to external services
 */

import { redis, CACHE_KEYS, isRedisConfigured } from './client';

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the window
   */
  maxRequests: number;

  /**
   * Time window in seconds
   */
  windowSeconds: number;

  /**
   * Optional custom error message
   */
  errorMessage?: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean;

  /**
   * Number of requests remaining in current window
   */
  remaining: number;

  /**
   * Total limit
   */
  limit: number;

  /**
   * Time in seconds until the window resets
   */
  resetIn: number;

  /**
   * Error message if not allowed
   */
  error?: string;
}

/**
 * Predefined rate limit configs for common actions
 */
export const RATE_LIMITS = {
  // AI Generation - expensive operations
  AI_MEAL_PLAN: {
    maxRequests: 3,
    windowSeconds: 3600, // 3 per hour
    errorMessage: 'You can only generate 3 meal plans per hour. Please try again later.',
  },
  AI_WORKOUT_PLAN: {
    maxRequests: 3,
    windowSeconds: 3600, // 3 per hour
    errorMessage: 'You can only generate 3 workout plans per hour. Please try again later.',
  },

  // Mutations - prevent spam
  CREATE_LOG: {
    maxRequests: 100,
    windowSeconds: 60, // 100 per minute
    errorMessage: 'Too many requests. Please slow down.',
  },
  UPDATE_PROFILE: {
    maxRequests: 10,
    windowSeconds: 60, // 10 per minute
    errorMessage: 'Too many profile updates. Please wait a moment.',
  },

  // File uploads
  UPLOAD_IMAGE: {
    maxRequests: 10,
    windowSeconds: 3600, // 10 per hour
    errorMessage: 'You can upload up to 10 images per hour.',
  },

  // API calls
  EXTERNAL_API: {
    maxRequests: 60,
    windowSeconds: 60, // 60 per minute
    errorMessage: 'API rate limit exceeded. Please try again in a moment.',
  },
} as const;

/**
 * Check rate limit for a specific action
 *
 * Uses sliding window algorithm with Redis:
 * 1. Get current count
 * 2. Increment count
 * 3. Set expiry if first request in window
 * 4. Check if over limit
 */
export async function checkRateLimit(
  userId: string,
  action: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  // If Redis is not configured, allow all requests (development mode)
  if (!isRedisConfigured()) {
    return {
      allowed: true,
      remaining: config.maxRequests,
      limit: config.maxRequests,
      resetIn: config.windowSeconds,
    };
  }

  try {
    const key = CACHE_KEYS.RATE_LIMIT(userId, action);

    // Get current count
    const current = await redis.get<number>(key);
    const count = current ? Number(current) : 0;

    // Check if over limit
    if (count >= config.maxRequests) {
      const ttl = await redis.ttl(key);

      return {
        allowed: false,
        remaining: 0,
        limit: config.maxRequests,
        resetIn: ttl > 0 ? ttl : config.windowSeconds,
        error: config.errorMessage || 'Rate limit exceeded',
      };
    }

    // Increment counter
    const newCount = await redis.incr(key);

    // Set expiry if this is the first request in the window
    if (newCount === 1) {
      await redis.expire(key, config.windowSeconds);
    }

    const ttl = await redis.ttl(key);

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      limit: config.maxRequests,
      resetIn: ttl > 0 ? ttl : config.windowSeconds,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);

    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: config.maxRequests,
      limit: config.maxRequests,
      resetIn: config.windowSeconds,
    };
  }
}

/**
 * Helper: Check if user can generate AI meal plan
 */
export async function canGenerateMealPlan(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'ai_meal_plan', RATE_LIMITS.AI_MEAL_PLAN);
}

/**
 * Helper: Check if user can generate AI workout plan
 */
export async function canGenerateWorkoutPlan(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'ai_workout_plan', RATE_LIMITS.AI_WORKOUT_PLAN);
}

/**
 * Helper: Check if user can upload image
 */
export async function canUploadImage(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'upload_image', RATE_LIMITS.UPLOAD_IMAGE);
}

/**
 * Helper: Check if user can update profile
 */
export async function canUpdateProfile(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'update_profile', RATE_LIMITS.UPDATE_PROFILE);
}

/**
 * Reset rate limit for a specific action (admin function)
 */
export async function resetRateLimit(userId: string, action: string): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  try {
    const key = CACHE_KEYS.RATE_LIMIT(userId, action);
    await redis.del(key);
  } catch (error) {
    console.error('Failed to reset rate limit:', error);
  }
}

/**
 * Make rate limiting available globally in development
 */
if (import.meta.env.DEV) {
  (window as any).checkRateLimit = checkRateLimit;
  (window as any).canGenerateMealPlan = canGenerateMealPlan;
  (window as any).canGenerateWorkoutPlan = canGenerateWorkoutPlan;
  console.log('💡 Rate limiting loaded. Try: window.canGenerateMealPlan("test-user-id")');
}
