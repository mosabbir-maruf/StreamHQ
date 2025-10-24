/**
 * API Usage Monitor to track and prevent rate limiting
 */

interface APIStats {
  requests: number;
  lastRequest: number;
  errors: number;
  rateLimitHits: number;
}

class APIMonitor {
  private stats: Map<string, APIStats> = new Map();

  recordRequest(apiName: string): void {
    const now = Date.now();
    const current = this.stats.get(apiName) || {
      requests: 0,
      lastRequest: 0,
      errors: 0,
      rateLimitHits: 0
    };

    current.requests++;
    current.lastRequest = now;
    this.stats.set(apiName, current);

  }

  recordError(apiName: string, isRateLimit: boolean = false): void {
    const current = this.stats.get(apiName) || {
      requests: 0,
      lastRequest: 0,
      errors: 0,
      rateLimitHits: 0
    };

    current.errors++;
    if (isRateLimit) {
      current.rateLimitHits++;
    }

    this.stats.set(apiName, current);
  }

  getStats(apiName: string): APIStats | null {
    return this.stats.get(apiName) || null;
  }

  getAllStats(): Map<string, APIStats> {
    return new Map(this.stats);
  }

  resetStats(apiName?: string): void {
    if (apiName) {
      this.stats.delete(apiName);
    } else {
      this.stats.clear();
    }
  }

  // Get health status
  getHealthStatus(apiName: string): 'healthy' | 'warning' | 'critical' {
    const stats = this.getStats(apiName);
    if (!stats) return 'healthy';

    const errorRate = stats.requests > 0 ? (stats.errors / stats.requests) * 100 : 0;
    const rateLimitRate = stats.requests > 0 ? (stats.rateLimitHits / stats.requests) * 100 : 0;

    if (rateLimitRate > 5 || errorRate > 10) {
      return 'critical';
    } else if (rateLimitRate > 2 || errorRate > 5) {
      return 'warning';
    }

    return 'healthy';
  }

  // Log current status
  logStatus(): void {
    // Status logging removed for production
  }
}

export const apiMonitor = new APIMonitor();

// Status logging disabled for production
