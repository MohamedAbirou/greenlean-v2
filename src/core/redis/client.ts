/**
 * Upstash Redis Client Configuration
 *
 * Used for:
 * - Query result caching (Apollo Client GraphQL queries)
 * - Rate limiting (API calls, AI generation requests)
 * - Session management
 * - Real-time features (leaderboards, notifications)
 */

import { Redis } from "@upstash/redis/cloudflare";

// Environment variables for Upstash Redis
const UPSTASH_REDIS_REST_URL = import.meta.env.VITE_UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_REST_TOKEN = import.meta.env.VITE_UPSTASH_REDIS_REST_TOKEN;
console.log("REDIS URL: ", UPSTASH_REDIS_REST_URL);
console.log("REDIS TOKEN: ", UPSTASH_REDIS_REST_TOKEN);

/**
 * Initialize Upstash Redis client
 * Uses REST API (works in browser and edge functions)
 */
export const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Check if Redis is properly configured
 */
export function isRedisConfigured(): boolean {
  return Boolean(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Test Redis connection
 */
export async function testRedisConnection(): Promise<boolean> {
  if (!isRedisConfigured()) {
    console.warn('⚠️ Redis not configured. Set VITE_UPSTASH_REDIS_REST_URL and VITE_UPSTASH_REDIS_REST_TOKEN');
    return false;
  }

  try {
    const pong = await redis.ping();
    console.log('✅ Redis connection successful:', pong);
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

/**
 * Cache keys namespace
 */
export const CACHE_KEYS = {
  // GraphQL query results
  USER_PROFILE: (userId: string) => `user:profile:${userId}`,
  MEAL_PLAN: (userId: string) => `meal:plan:${userId}`,
  WORKOUT_PLAN: (userId: string) => `workout:plan:${userId}`,
  NUTRITION_LOGS: (userId: string, date: string) => `nutrition:logs:${userId}:${date}`,
  WORKOUT_LOGS: (userId: string, date: string) => `workout:logs:${userId}:${date}`,

  // AI generation status
  AI_GENERATION_STATUS: (userId: string, type: string) => `ai:status:${type}:${userId}`,

  // Rate limiting
  RATE_LIMIT: (userId: string, action: string) => `ratelimit:${action}:${userId}`,

  // Session data
  SESSION: (sessionId: string) => `session:${sessionId}`,
} as const;

/**
 * Default cache TTLs (in seconds)
 */
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
} as const;

/**
 * Make Redis available globally in development
 */
if (import.meta.env.DEV) {
  (window as any).redis = redis;
  (window as any).testRedis = testRedisConnection;
  console.log('💡 Redis client loaded. Run: window.testRedis()');
}
