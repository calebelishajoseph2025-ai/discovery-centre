/**
 * In-memory sliding window / token bucket rate limiter.
 * Used for API endpoints (plan, ics, feedback, etc.).
 */

interface RateBucket {
  tokens: number;
  lastRefill: number;
}

export class InMemoryRateLimiter {
  private buckets = new Map<string, RateBucket>();
  private readonly maxTokens: number;
  private readonly refillIntervalMs: number;
  private readonly tokensPerRefill: number;

  constructor(maxTokens = 60, intervalMs = 60000) {
    this.maxTokens = maxTokens;
    this.refillIntervalMs = intervalMs;
    this.tokensPerRefill = maxTokens;
  }

  public take(key: string, count = 1): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.maxTokens, lastRefill: now };
      this.buckets.set(key, bucket);
    } else {
      // Refill tokens according to elapsed time
      const elapsed = now - bucket.lastRefill;
      if (elapsed > this.refillIntervalMs) {
        bucket.tokens = this.maxTokens;
        bucket.lastRefill = now;
      } else {
        const added = Math.floor(
          (elapsed / this.refillIntervalMs) * this.tokensPerRefill
        );
        if (added > 0) {
          bucket.tokens = Math.min(this.maxTokens, bucket.tokens + added);
          bucket.lastRefill = now;
        }
      }
    }

    if (bucket.tokens >= count) {
      bucket.tokens -= count;
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const waitMs = Math.max(0, this.refillIntervalMs - (now - bucket.lastRefill));
    const retryAfterSeconds = Math.ceil(waitMs / 1000) || 1;
    return { allowed: false, retryAfterSeconds };
  }

  public reset(): void {
    this.buckets.clear();
  }
}

// Global default limiters
export const planRateLimiter = new InMemoryRateLimiter(60, 60000); // 60 requests per minute
export const feedbackRateLimiter = new InMemoryRateLimiter(5, 3600000); // 5 per hour
export const shortPlanRateLimiter = new InMemoryRateLimiter(20, 3600000); // 20 per hour
export const favouritesRateLimiter = new InMemoryRateLimiter(60, 3600000); // 60 per hour
