/**
 * Transform MAL API responses to match AniList format
 * This ensures compatibility with existing components
 */

import { MALAnimeMedia, MALAnimeListResponse } from '@/api/mal';
import { AnimeMedia, AnimeListResponse } from '@/api/anilist';

export function transformMALToAniList(malAnime: MALAnimeMedia): AnimeMedia {
  // Extract the best title (prefer English, fallback to Japanese, then main title)
  const englishTitle = malAnime.title_english || malAnime.titles?.find(t => t.type === 'English')?.title;
  const japaneseTitle = malAnime.title_japanese || malAnime.titles?.find(t => t.type === 'Japanese')?.title;
  const mainTitle = malAnime.title;

  return {
    id: malAnime.mal_id,
    idMal: malAnime.mal_id,
    title: {
      romaji: japaneseTitle || mainTitle,
      english: englishTitle || mainTitle,
      native: japaneseTitle || mainTitle,
    },
    description: malAnime.synopsis || '',
    coverImage: {
      large: malAnime.images.jpg.large_image_url,
      extraLarge: malAnime.images.jpg.large_image_url,
      medium: malAnime.images.jpg.image_url,
      color: undefined, // MAL doesn't provide color information
    },
    bannerImage: undefined, // MAL doesn't provide banner images
    averageScore: malAnime.score ? Math.round(malAnime.score * 10) : undefined,
    meanScore: malAnime.score ? Math.round(malAnime.score * 10) : undefined,
    popularity: malAnime.popularity || 0,
    episodes: malAnime.episodes || undefined,
    duration: malAnime.duration ? parseInt(malAnime.duration) : undefined,
    status: transformStatus(malAnime.status),
    startDate: {
      year: malAnime.aired?.prop?.from?.year || malAnime.year || undefined,
      month: malAnime.aired?.prop?.from?.month || undefined,
      day: malAnime.aired?.prop?.from?.day || undefined,
    },
    endDate: {
      year: malAnime.aired?.prop?.to?.year || undefined,
      month: malAnime.aired?.prop?.to?.month || undefined,
      day: malAnime.aired?.prop?.to?.day || undefined,
    },
    season: malAnime.season?.toUpperCase() || undefined,
    seasonYear: malAnime.year || undefined,
    format: transformFormat(malAnime.type),
    genres: malAnime.genres?.map(g => g.name) || [],
    studios: {
      nodes: malAnime.studios?.map(studio => ({
        id: studio.mal_id,
        name: studio.name,
        isAnimationStudio: true, // Assume all studios are animation studios
      })) || [],
    },
    characters: {
      edges: [], // MAL doesn't provide character data in basic responses
    },
    relations: {
      edges: [], // MAL doesn't provide relations in basic responses
    },
    recommendations: {
      nodes: [], // MAL doesn't provide recommendations in basic responses
    },
    trailer: malAnime.trailer ? {
      id: malAnime.trailer.youtube_id,
      site: 'youtube',
      thumbnail: `https://img.youtube.com/vi/${malAnime.trailer.youtube_id}/hqdefault.jpg`,
    } : undefined,
    isAdult: malAnime.rating === 'R+ - Mild Nudity' || malAnime.rating === 'Rx - Hentai',
  };
}

export function transformMALListToAniList(malResponse: MALAnimeListResponse): AnimeListResponse {
  return {
    Page: {
      pageInfo: {
        total: malResponse.pagination.items.total,
        perPage: malResponse.pagination.items.per_page,
        currentPage: malResponse.pagination.current_page,
        lastPage: malResponse.pagination.last_visible_page,
        hasNextPage: malResponse.pagination.has_next_page,
      },
      media: malResponse.data.map(transformMALToAniList),
    },
  };
}

function transformStatus(malStatus: string): string {
  const statusMap: Record<string, string> = {
    'Currently Airing': 'RELEASING',
    'Finished Airing': 'FINISHED',
    'Not yet aired': 'NOT_YET_RELEASED',
    'On Hiatus': 'HIATUS',
    'Cancelled': 'CANCELLED',
  };
  
  return statusMap[malStatus] || 'UNKNOWN';
}

function transformFormat(malType: string): string {
  const formatMap: Record<string, string> = {
    'TV': 'TV',
    'Movie': 'MOVIE',
    'OVA': 'OVA',
    'ONA': 'ONA',
    'Special': 'SPECIAL',
    'Music': 'MUSIC',
  };
  
  return formatMap[malType] || 'TV';
}

/**
 * Get genre ID from genre name for MAL API
 */
export function getGenreId(genreName: string): number | null {
  const genreMap: Record<string, number> = {
    'Action': 1,
    'Adventure': 2,
    'Cars': 3,
    'Comedy': 4,
    'Dementia': 5,
    'Demons': 6,
    'Drama': 8,
    'Ecchi': 9,
    'Fantasy': 10,
    'Game': 11,
    'Harem': 35,
    'Historical': 13,
    'Horror': 14,
    'Josei': 43,
    'Kids': 15,
    'Magic': 16,
    'Martial Arts': 17,
    'Mecha': 18,
    'Military': 38,
    'Music': 19,
    'Mystery': 7,
    'Parody': 20,
    'Police': 39,
    'Psychological': 40,
    'Romance': 22,
    'Samurai': 21,
    'School': 23,
    'Sci-Fi': 24,
    'Seinen': 42,
    'Shoujo': 25,
    'Shoujo Ai': 26,
    'Shounen': 27,
    'Shounen Ai': 28,
    'Slice of Life': 36,
    'Space': 29,
    'Sports': 30,
    'Super Power': 31,
    'Supernatural': 37,
    'Thriller': 41,
    'Vampire': 32,
    'Yaoi': 33,
    'Yuri': 34,
  };
  
  return genreMap[genreName] || null;
}
