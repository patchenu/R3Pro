import type { VercelRequest, VercelResponse } from '@vercel/node';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory sliding window cache (compatible with serverless warm instances & Upstash Redis)
const rateLimitCache = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Checks and increments rate limit for a given key
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = rateLimitCache.get(key);

  // Clean expired record or start new window
  if (!record || now >= record.resetAt) {
    rateLimitCache.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt: now + windowMs
    };
  }

  // Increment within window
  record.count += 1;
  const remaining = Math.max(0, maxRequests - record.count);
  const allowed = record.count <= maxRequests;

  return {
    allowed,
    limit: maxRequests,
    remaining,
    resetAt: record.resetAt
  };
}

/**
 * Injects standard security rate limiting headers into VercelResponse
 */
export function setRateLimitHeaders(res: VercelResponse, result: RateLimitResult): void {
  res.setHeader('X-RateLimit-Limit', result.limit.toString());
  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000).toString());
}

/**
 * Extracts client IP from Vercel/Cloudflare headers
 */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.trim();
  }
  return '127.0.0.1';
}
