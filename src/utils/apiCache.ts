/**
 * High-performance API cache layer
 * Maintains quality while improving performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 200; // Increased cache size for better performance

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Get cache status for debugging
  getCacheStatus() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Math.round((now - entry.timestamp) / 1000),
      ttl: Math.round(entry.ttl / 1000),
      expired: now - entry.timestamp > entry.ttl
    }));
    
    return {
      totalEntries: this.cache.size,
      maxSize: this.maxSize,
      entries: entries.filter(e => e.key.includes('user-')),
    };
  }
}

// Global cache instance
export const apiCache = new APICache();

// Cache key generators
export const getCacheKey = {
  // Movies
  trendingMovies: () => 'trending-movies',
  popularMovies: () => 'popular-movies',
  nowPlayingMovies: () => 'now-playing-movies',
  topRatedMovies: () => 'top-rated-movies',
  bollywoodMovies: () => 'bollywood-movies',
  tamilMovies: () => 'tamil-movies',
  teluguMovies: () => 'telugu-movies',
  kannadaMovies: () => 'kannada-movies',
  malayalamMovies: () => 'malayalam-movies',
  banglaMovies: () => 'bangla-movies',
  
  // TV Shows
  'this-week-s-trending-tv-shows-list': () => 'trending-tv-shows-week',
  'popular-tv-shows-list': () => 'popular-tv-shows',
  'on-the-air-tv-shows-list': () => 'on-the-air-tv-shows',
  'bollywood-tv-shows-list': () => 'bollywood-tv-shows',
  'bangla-tv-shows-list': () => 'bangla-tv-shows',
  'top-rated-tv-shows-list': () => 'top-rated-tv-shows',
  'tamil-tv-shows-list': () => 'tamil-tv-shows',
  
  // Anime
  'trending-anime-list': () => 'trending-anime',
  'popular-anime-list': () => 'popular-anime',
  'top-rated-anime-list': () => 'top-rated-anime',
  'currently-airing-anime-list': () => 'currently-airing-anime',
  'upcoming-anime-list': () => 'upcoming-anime',
  'movies-anime-list': () => 'anime-movies',
  
  // Profile-specific cache keys
  userProfile: (userId: string) => `user-profile-${userId}`,
  userWatchlist: (userId: string, filterType: string = 'all', page: number = 1, limit: number = 20, doneFilter?: string) => 
    `user-watchlist-${userId}-${filterType}-${page}-${limit}-${doneFilter || 'all'}`,
  userCompleted: (userId: string, filterType: string = 'all', page: number = 1, limit: number = 20) => 
    `user-completed-${userId}-${filterType}-${page}-${limit}`,
  userHistory: (userId: string, limit: number = 20) => `user-history-${userId}-${limit}`,
  userStats: (userId: string) => `user-stats-${userId}`,
};

// Enhanced fetch with caching
export const cachedFetch = async <T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> => {
  // Check cache first
  const cached = apiCache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch fresh data
  try {
    const data = await fetchFn();
    apiCache.set(key, data, ttl);
    return data;
        } catch (error) {
          throw error;
        }
};

// Cache invalidation functions
export const invalidateUserCache = (userId: string) => {
  const keysToInvalidate = [
    getCacheKey.userProfile(userId),
    getCacheKey.userStats(userId),
  ];
  
  // Invalidate all watchlist, completed, and history cache entries for this user
  // We'll use a pattern-based approach since we can't enumerate all possible combinations
  const allKeys = Array.from(apiCache['cache'].keys());
  const userKeys = allKeys.filter(key => 
    key.includes(`user-watchlist-${userId}`) ||
    key.includes(`user-completed-${userId}`) ||
    key.includes(`user-history-${userId}`)
  );
  
  [...keysToInvalidate, ...userKeys].forEach(key => {
    apiCache['cache'].delete(key);
  });
};

export const invalidateProfileCache = (userId: string) => {
  invalidateUserCache(userId);
};

// Profile-specific cache utilities
export const getCachedUserProfile = async <T>(
  userId: string,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> => {
  return cachedFetch(getCacheKey.userProfile(userId), fetchFn, ttl);
};

export const getCachedUserWatchlist = async <T>(
  userId: string,
  filterType: string,
  page: number,
  limit: number,
  doneFilter: string | undefined,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes for user data
): Promise<T> => {
  return cachedFetch(
    getCacheKey.userWatchlist(userId, filterType, page, limit, doneFilter),
    fetchFn,
    ttl
  );
};

export const getCachedUserHistory = async <T>(
  userId: string,
  limit: number,
  fetchFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes for user data
): Promise<T> => {
  return cachedFetch(
    getCacheKey.userHistory(userId, limit),
    fetchFn,
    ttl
  );
};

// Preload critical data - optimized for better LCP and Speed Index
export const preloadCriticalData = async () => {
  try {
    const { tmdb } = await import('@/api/tmdb');
    const { anilist } = await import('@/api/anilist');

    // Preload critical data in parallel for faster loading
    const preloadPromises = [
      // Preload trending movies
      cachedFetch(
        getCacheKey.trendingMovies(),
        () => tmdb.trending.trending("movie", "week"),
        10 * 60 * 1000
      ),
      
      // Preload popular movies
      cachedFetch(
        getCacheKey.popularMovies(),
        () => tmdb.discover.movie({
          sort_by: "popularity.desc",
          "release_date.lte": new Date().toISOString().split('T')[0],
          include_adult: false,
          "with_runtime.gte": 30,
          "vote_count.gte": 10,
        }),
        30 * 60 * 1000
      ),

      // Preload trending anime
      cachedFetch(
        getCacheKey['trending-anime-list'](),
        () => anilist.getTrending(),
        10 * 60 * 1000
      ),

      // Preload now playing movies for better LCP
      cachedFetch(
        getCacheKey.nowPlayingMovies(),
        () => tmdb.movies.nowPlaying(),
        15 * 60 * 1000
      ),

      // Preload top rated movies
      cachedFetch(
        getCacheKey.topRatedMovies(),
        () => tmdb.movies.topRated(),
        30 * 60 * 1000
      ),
    ];

          // Execute all preloads in parallel
          await Promise.allSettled(preloadPromises);
        } catch (error) {
          // Silent fail for preload
        }
};
