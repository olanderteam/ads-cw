import type { VercelRequest } from '@vercel/node';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
}

const store = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60_000; // 60 seconds
const MAX_REQUESTS = 30;

/**
 * Checks whether the given IP address is within the rate limit.
 *
 * Uses an in-memory sliding window of 60 seconds with a max of 30 requests.
 * Returns `allowed: false` and a `retryAfter` value (in seconds) when the limit is exceeded.
 */
export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  // New IP or expired window — reset
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1, retryAfter: 0 };
  }

  // Within window but over limit
  if (entry.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((WINDOW_MS - (now - entry.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  // Within window and within limit
  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, retryAfter: 0 };
}

/**
 * Extracts the client IP address from the request.
 * Reads the first IP from `x-forwarded-for` header, falling back to `remoteAddress`.
 */
export function getClientIp(request: VercelRequest): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return (request.socket as any)?.remoteAddress || 'unknown';
}
