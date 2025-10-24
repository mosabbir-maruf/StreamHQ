import { anilist } from "@/api/anilist";
import { mal } from "@/api/mal";
import { transformMALListToAniList, getGenreId } from "@/utils/malTransformer";
import { DiscoverAnimeFetchQueryType } from "@/types/movie";

// Cache to track which queries are currently using MAL fallback
const fallbackCache = new Map<string, boolean>();

interface UseFetchDiscoverAnimeProps {
  page?: number;
  type: DiscoverAnimeFetchQueryType;
  genres?: string;
}

const useFetchDiscoverAnime = async ({
  page = 1,
  type,
  genres,
}: UseFetchDiscoverAnimeProps) => {
  // Create a unique cache key for this query
  const cacheKey = `${type}-${page}-${genres || 'no-genres'}`;
  
  // Check if we're already using MAL fallback for this query
  if (fallbackCache.get(cacheKey)) {
    return await fetchFromMAL({ page, type, genres });
  }

  try {
    // Try AniList first
    return await fetchFromAniList({ page, type, genres });
    } catch (error) {
      // AniList API failed, trying MAL fallback
    
    // Check if it's a rate limit error
    const isRateLimited = error instanceof Error && 
      (error.message.startsWith("RATE_LIMIT") || /429|Too many/i.test(error.message));
    
    if (!isRateLimited) {
      // If it's not a rate limit error, re-throw it
      throw error;
    }

    
    // Mark this query as using MAL fallback
    fallbackCache.set(cacheKey, true);
    
    // Set a timeout to reset the fallback after 5 minutes
    setTimeout(() => {
      fallbackCache.delete(cacheKey);
    }, 5 * 60 * 1000);
    
    try {
      return await fetchFromMAL({ page, type, genres });
      } catch (malError) {
        // MAL API also failed
      // If MAL also fails, throw the original AniList error
      throw error;
    }
  }
};

// Helper function to fetch from AniList
async function fetchFromAniList({
  page,
  type,
  genres,
}: UseFetchDiscoverAnimeProps) {
  // Handle genre filtering if provided
  if (genres && genres.trim() !== "") {
    const genreList = genres.split(",").filter(g => g.trim() !== "");
    if (genreList.length > 0) {
      // For now, use the first genre for filtering
      // AniList doesn't support multiple genres in a single query easily
      return await anilist.getByGenre(genreList[0], page, 20);
    }
  }

  // Handle different query types
  switch (type) {
    case "discover":
    case "trending":
      return await anilist.getTrending(page, 20);
    case "popular":
      return await anilist.getPopular(page, 20);
    case "topRated":
      return await anilist.getTopRated(page, 20);
    case "airing":
      return await anilist.getCurrentlyAiring(page, 20);
    case "upcoming":
      return await anilist.getUpcoming(page, 20);
    case "animeMovies":
      return await anilist.getMovies(page, 20);
    default:
      // Default to trending
      return await anilist.getTrending(page, 20);
  }
}

// Helper function to fetch from MAL
async function fetchFromMAL({
  page,
  type,
  genres,
}: UseFetchDiscoverAnimeProps) {
  let malResponse;
  
  // Handle genre filtering for MAL
  if (genres && genres.trim() !== "") {
    const genreList = genres.split(",").filter(g => g.trim() !== "");
    if (genreList.length > 0) {
      const genreId = getGenreId(genreList[0]);
      if (genreId) {
        malResponse = await mal.getAnimeByGenre(genreId, page, 20);
      } else {
        // If genre not found in MAL, fall back to popular
        malResponse = await mal.getPopular(page, 20);
      }
    } else {
      malResponse = await mal.getPopular(page, 20);
    }
  } else {
    // Handle different query types for MAL
    switch (type) {
      case "discover":
      case "trending":
        malResponse = await mal.getTopAnime(page, 20);
        break;
      case "popular":
        malResponse = await mal.getPopular(page, 20);
        break;
      case "topRated":
        malResponse = await mal.getTopRated(page, 20);
        break;
      case "airing":
        malResponse = await mal.getCurrentlyAiring(page, 20);
        break;
      case "upcoming":
        malResponse = await mal.getUpcoming(page, 20);
        break;
      case "animeMovies":
        malResponse = await mal.getMovies(page, 20);
        break;
      default:
        malResponse = await mal.getTopAnime(page, 20);
    }
  }
  
  // Transform MAL response to AniList format
  return transformMALListToAniList(malResponse);
}

export default useFetchDiscoverAnime;
