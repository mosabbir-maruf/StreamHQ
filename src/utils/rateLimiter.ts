/**
 * Rate Limiter utility to prevent hitting API rate limits
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  delayMs: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private getKey(apiName: string): string {
    return apiName;
  }

  private cleanup(apiName: string): void {
    const key = this.getKey(apiName);
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove requests older than the window
    const validRequests = requests.filter(timestamp => now - timestamp < this.config.windowMs);
    this.requests.set(key, validRequests);
  }

  async waitIfNeeded(apiName: string): Promise<void> {
    const key = this.getKey(apiName);
    this.cleanup(apiName);
    
    const requests = this.requests.get(key) || [];
    
    if (requests.length >= this.config.maxRequests) {
      // Calculate how long to wait
      const oldestRequest = Math.min(...requests);
      const waitTime = this.config.windowMs - (Date.now() - oldestRequest);
      
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.cleanup(apiName);
      }
    }
    
    // Add current request
    const now = Date.now();
    const currentRequests = this.requests.get(key) || [];
    currentRequests.push(now);
    this.requests.set(key, currentRequests);
    
    // Add base delay to be extra safe
    if (this.config.delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, this.config.delayMs));
    }
  }
}

// AniList rate limiter: 90 requests per minute (maximum allowed)
export const anilistRateLimiter = new RateLimiter({
  maxRequests: 90, // 90 requests per minute (maximum allowed)
  windowMs: 60 * 1000, // 1 minute window
  delayMs: 667, // 667ms delay between requests (60s/90 = 0.667s)
});

// MAL rate limiter: 3 requests per second (Jikan maximum)
export const malRateLimiter = new RateLimiter({
  maxRequests: 3, // 3 requests per second (maximum allowed)
  windowMs: 1000, // 1 second window
  delayMs: 334, // 334ms delay between requests (1s/3 = 0.334s)
});

// Cache for API responses to reduce requests
class ResponseCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttlMs: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const responseCache = new ResponseCache();

// Clean up cache every 5 minutes
setInterval(() => {
  responseCache.cleanup();
}, 5 * 60 * 1000);
