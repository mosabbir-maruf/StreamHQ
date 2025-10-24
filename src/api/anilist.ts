/**
 * AniList API Client
 * Documentation: https://anilist.gitbook.io/anilist-apiv2-docs
 */

import { anilistRateLimiter, responseCache } from '@/utils/rateLimiter';
import { apiMonitor } from '@/utils/apiMonitor';

const ANILIST_API_URL = 'https://graphql.anilist.co';

export interface AnimeMedia {
  id: number;
  idMal?: number;
  title: {
    romaji: string;
    english?: string;
    native: string;
  };
  description: string;
  coverImage: {
    large: string;
    extraLarge: string;
    medium: string;
    color?: string;
  };
  bannerImage?: string;
  averageScore?: number;
  meanScore?: number;
  popularity: number;
  episodes?: number;
  duration?: number;
  status: string;
  startDate: {
    year?: number;
    month?: number;
    day?: number;
  };
  endDate: {
    year?: number;
    month?: number;
    day?: number;
  };
  season?: string;
  seasonYear?: number;
  format: string;
  genres: string[];
  studios: {
    nodes: Array<{
      id: number;
      name: string;
      isAnimationStudio: boolean;
    }>;
  };
  characters: {
    edges: Array<{
      id: number;
      role: string;
      node: {
        id: number;
        name: {
          full: string;
        };
        image: {
          large: string;
          medium: string;
        };
      };
      voiceActors: Array<{
        id: number;
        name: {
          full: string;
        };
        image: {
          large: string;
          medium: string;
        };
        language: string;
      }>;
    }>;
  };
  relations: {
    edges: Array<{
      id: number;
      relationType: string;
      node: {
        id: number;
        type: string;
        title: {
          romaji: string;
          english?: string;
        };
        coverImage: {
          large: string;
          medium: string;
        };
        averageScore?: number;
        startDate?: {
          year?: number;
        };
        format: string;
      };
    }>;
  };
  recommendations: {
    nodes: Array<{
      id: number;
      rating: number;
      mediaRecommendation: {
        id: number;
        title: {
          romaji: string;
          english?: string;
        };
        coverImage: {
          large: string;
          medium: string;
        };
        startDate?: {
          year?: number;
        };
        averageScore?: number;
        format: string;
      };
    }>;
  };
  trailer?: {
    id: string;
    site: string;
    thumbnail: string;
  };
  isAdult: boolean;
}

export interface AnimeListResponse {
  Page: {
    pageInfo: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
    media: AnimeMedia[];
  };
}

class AniListAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = ANILIST_API_URL;
  }

  private async query<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    // Create cache key for this query
    const cacheKey = `anilist-${query}-${JSON.stringify(variables)}`;
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Apply rate limiting
    await anilistRateLimiter.waitIfNeeded('anilist');
    
    // Record API request
    apiMonitor.recordRequest('anilist');
    
    // NOTE: When this runs in the browser (client components), Next.js revalidate has no effect.
    // We still include it so server-side callers benefit from caching.
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      next: { revalidate: 3600 },
    });

    // Rate limit handling: AniList returns 429 with optional Retry-After header
    if (response.status === 429) {
      apiMonitor.recordError('anilist', true);
      const retryAfter = response.headers.get('Retry-After') || '60';
      throw new Error(`RATE_LIMIT: Too many requests. Retry after ${retryAfter}s`);
    }

    if (!response.ok) {
      apiMonitor.recordError('anilist');
      // Include status code for easier upstream handling
      const text = await response.text().catch(() => '');
      
      // Try to parse JSON error response for better error messages
      let errorMessage = `HTTP_${response.status}: AniList API error`;
      if (text) {
        try {
          const errorJson = JSON.parse(text);
          if (errorJson.error) {
            if (typeof errorJson.error === 'string') {
              errorMessage += ` - ${errorJson.error}`;
            } else if (errorJson.error.messages && Array.isArray(errorJson.error.messages)) {
              errorMessage += ` - ${errorJson.error.messages.join(', ')}`;
            } else if (errorJson.error.message) {
              errorMessage += ` - ${errorJson.error.message}`;
            }
          } else {
            errorMessage += ` - ${text}`;
          }
        } catch {
          errorMessage += ` - ${text}`;
        }
      }
      
      throw new Error(errorMessage);
    }

    const json = await response.json();

    if (json?.errors && Array.isArray(json.errors) && json.errors.length > 0) {
      const message = json.errors[0]?.message || 'Unknown GraphQL error';
      // Bubble up a typed error for rate-limit-like messages as well
      if (/rate/i.test(message) || /limit/i.test(message)) {
        apiMonitor.recordError('anilist', true);
        throw new Error(`RATE_LIMIT: ${message}`);
      }
      apiMonitor.recordError('anilist');
      throw new Error(`GRAPHQL: ${message}`);
    }

    if (!json?.data) {
      throw new Error('GRAPHQL: Empty response data');
    }

    const result = json.data as T;
    
    // Cache the result for 5 minutes
    responseCache.set(cacheKey, result, 5 * 60 * 1000);
    
    return result;
  }

  /**
   * Get anime by ID with full details
   */
  async getAnimeById(id: number): Promise<AnimeMedia> {
    const query = `
      query ($id: Int) {
        Media(id: $id, type: ANIME) {
          id
          idMal
          title {
            romaji
            english
            native
          }
          description
          coverImage {
            large
            extraLarge
            medium
            color
          }
          bannerImage
          averageScore
          meanScore
          popularity
          episodes
          duration
          status
          startDate {
            year
            month
            day
          }
          endDate {
            year
            month
            day
          }
          season
          seasonYear
          format
          genres
          studios {
            nodes {
              id
              name
              isAnimationStudio
            }
          }
          characters(sort: ROLE, perPage: 10) {
            edges {
              id
              role
              node {
                id
                name {
                  full
                }
                image {
                  large
                  medium
                }
              }
              voiceActors(language: JAPANESE, sort: RELEVANCE) {
                id
                name {
                  full
                }
                image {
                  large
                  medium
                }
                language
              }
            }
          }
          relations {
            edges {
              id
              relationType
              node {
                id
                type
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                  medium
                }
                averageScore
                format
              }
            }
          }
          recommendations(sort: RATING_DESC, perPage: 10) {
            nodes {
              id
              rating
              mediaRecommendation {
                id
                title {
                  romaji
                  english
                }
                coverImage {
                  large
                  medium
                }
                startDate { year }
                averageScore
                format
              }
            }
          }
          trailer {
            id
            site
            thumbnail
          }
          isAdult
        }
      }
    `;

    const data = await this.query<{ Media: AnimeMedia | null }>(query, { id });
    if (!data?.Media) {
      // Explicitly throw to allow callers to distinguish true not-found from other errors
      throw new Error('NOT_FOUND: Anime not found');
    }
    return data.Media;
  }

  /**
   * Search anime by title
   */
  async searchAnime(search: string, page: number = 1, perPage: number = 20): Promise<AnimeListResponse> {
    const query = `
      query ($search: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate {
              year
            }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { search, page, perPage });
  }

  /**
   * Get trending anime
   */
  async getTrending(page: number = 1, perPage: number = 20): Promise<AnimeListResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate {
              year
            }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { page, perPage });
  }

  /**
   * Get popular anime
   */
  async getPopular(page: number = 1, perPage: number = 20): Promise<AnimeListResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate {
              year
            }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { page, perPage });
  }

  /**
   * Get top rated anime
   */
  async getTopRated(page: number = 1, perPage: number = 20): Promise<AnimeListResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, sort: SCORE_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate {
              year
            }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { page, perPage });
  }

  /**
   * Get anime by season
   */
  async getBySeason(
    season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL',
    year?: number,
    page: number = 1,
    perPage: number = 20
  ): Promise<AnimeListResponse> {
    const query = `
      query ($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate {
              year
            }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { season, year, page, perPage });
  }

  /**
   * Get anime by genre
   */
  async getByGenre(
    genre: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<AnimeListResponse> {
    const query = `
      query ($genre: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(genre: $genre, type: ANIME, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate {
              year
            }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { genre, page, perPage });
  }

  /**
   * Get currently airing anime
   */
  async getCurrentlyAiring(page: number = 1, perPage: number = 20): Promise<AnimeListResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate {
              year
            }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { page, perPage });
  }

  /**
   * Get upcoming anime
   */
  async getUpcoming(page: number = 1, perPage: number = 20): Promise<AnimeListResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, status: NOT_YET_RELEASED, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate {
              year
            }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { page, perPage });
  }

  /**
   * Get anime movies (format: MOVIE)
   */
  async getMovies(page: number = 1, perPage: number = 20): Promise<AnimeListResponse> {
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            total
            perPage
            currentPage
            lastPage
            hasNextPage
          }
          media(type: ANIME, format: MOVIE, sort: POPULARITY_DESC) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              extraLarge
              medium
              color
            }
            bannerImage
            averageScore
            popularity
            episodes
            format
            status
            startDate { year }
            genres
            isAdult
          }
        }
      }
    `;

    return this.query<AnimeListResponse>(query, { page, perPage });
  }
}

export const anilist = new AniListAPI();

