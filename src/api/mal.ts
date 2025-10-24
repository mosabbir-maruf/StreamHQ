/**
 * MyAnimeList (MAL) API Client using Jikan API
 * Documentation: https://jikan.moe/
 */

import { malRateLimiter, responseCache } from '@/utils/rateLimiter';
import { apiMonitor } from '@/utils/apiMonitor';

const JIKAN_API_URL = 'https://api.jikan.moe/v4';

export interface MALAnimeMedia {
  mal_id: number;
  url: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  trailer: {
    youtube_id: string;
    url: string;
    embed_url: string;
  } | null;
  approved: boolean;
  titles: Array<{
    type: string;
    title: string;
  }>;
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  title_synonyms: string[];
  type: string;
  source: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  aired: {
    from: string;
    to: string | null;
    prop: {
      from: {
        day: number | null;
        month: number | null;
        year: number | null;
      };
      to: {
        day: number | null;
        month: number | null;
        year: number | null;
      };
    };
    string: string;
  };
  duration: string;
  rating: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number | null;
  members: number | null;
  favorites: number | null;
  synopsis: string | null;
  background: string | null;
  season: string | null;
  year: number | null;
  broadcast: {
    day: string | null;
    time: string | null;
    timezone: string | null;
    string: string | null;
  };
  producers: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  licensors: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  studios: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  genres: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  explicit_genres: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  themes: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
  demographics: Array<{
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }>;
}

export interface MALAnimeListResponse {
  data: MALAnimeMedia[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

class MALAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = JIKAN_API_URL;
  }

  private async query<T>(endpoint: string): Promise<T> {
    // Create cache key for this endpoint
    const cacheKey = `mal-${endpoint}`;
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Apply rate limiting
    await malRateLimiter.waitIfNeeded('mal');
    
    // Record API request
    apiMonitor.recordRequest('mal');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'StreamHQ/1.0',
      },
    });

    // Rate limit handling: Jikan has 3 requests per second limit
    if (response.status === 429) {
      apiMonitor.recordError('mal', true);
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new Error(`RATE_LIMIT: Too many requests. Retry after ${retryAfter}s`);
    }

    if (!response.ok) {
      apiMonitor.recordError('mal');
      const text = await response.text().catch(() => '');
      throw new Error(`HTTP_${response.status}: MAL API error${text ? ` - ${text}` : ''}`);
    }

    const json = await response.json();

    if (json?.error) {
      apiMonitor.recordError('mal');
      throw new Error(`MAL_API: ${json.error}`);
    }

    const result = json as T;
    
    // Cache the result for 10 minutes (MAL data changes less frequently)
    responseCache.set(cacheKey, result, 10 * 60 * 1000);
    
    return result;
  }

  /**
   * Get anime by MAL ID
   */
  async getAnimeById(malId: number): Promise<MALAnimeMedia> {
    const data = await this.query<{ data: MALAnimeMedia }>(`/anime/${malId}`);
    return data.data;
  }

  /**
   * Search anime by query
   */
  async searchAnime(query: string, page: number = 1, limit: number = 20): Promise<MALAnimeListResponse> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true', // Safe for work content only
    });
    
    return this.query<MALAnimeListResponse>(`/anime?${params}`);
  }

  /**
   * Get top anime
   */
  async getTopAnime(page: number = 1, limit: number = 20): Promise<MALAnimeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
    });
    
    return this.query<MALAnimeListResponse>(`/top/anime?${params}`);
  }

  /**
   * Get anime by genre
   */
  async getAnimeByGenre(genreId: number, page: number = 1, limit: number = 20): Promise<MALAnimeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
    });
    
    return this.query<MALAnimeListResponse>(`/anime?genres=${genreId}&${params}`);
  }

  /**
   * Get currently airing anime
   */
  async getCurrentlyAiring(page: number = 1, limit: number = 20): Promise<MALAnimeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
      status: 'airing',
    });
    
    return this.query<MALAnimeListResponse>(`/anime?${params}`);
  }

  /**
   * Get upcoming anime
   */
  async getUpcoming(page: number = 1, limit: number = 20): Promise<MALAnimeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
      status: 'upcoming',
    });
    
    return this.query<MALAnimeListResponse>(`/anime?${params}`);
  }

  /**
   * Get anime movies
   */
  async getMovies(page: number = 1, limit: number = 20): Promise<MALAnimeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
      type: 'movie',
    });
    
    return this.query<MALAnimeListResponse>(`/anime?${params}`);
  }

  /**
   * Get popular anime
   */
  async getPopular(page: number = 1, limit: number = 20): Promise<MALAnimeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
      order_by: 'popularity',
      sort: 'desc',
    });
    
    return this.query<MALAnimeListResponse>(`/anime?${params}`);
  }

  /**
   * Get top rated anime
   */
  async getTopRated(page: number = 1, limit: number = 20): Promise<MALAnimeListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sfw: 'true',
      order_by: 'score',
      sort: 'desc',
    });
    
    return this.query<MALAnimeListResponse>(`/anime?${params}`);
  }
}

export const mal = new MALAPI();
