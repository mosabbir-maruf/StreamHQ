import { useQuery } from "@tanstack/react-query";
import { anilist } from "@/api/anilist";
import { mal } from "@/api/mal";
import { transformMALToAniList } from "@/utils/malTransformer";

// Cache to track which anime details are using MAL fallback
const detailFallbackCache = new Map<number, boolean>();

interface UseAnimeDetailProps {
  id: number;
  malId?: number;
}

export const useAnimeDetail = ({ id, malId }: UseAnimeDetailProps) => {
  return useQuery({
    queryKey: ["anime-detail", id, malId],
    queryFn: async () => {
      // Check if we're already using MAL fallback for this anime
      if (detailFallbackCache.get(id)) {
        if (malId) {
          const malAnime = await mal.getAnimeById(malId);
          return transformMALToAniList(malAnime);
        } else {
          throw new Error("MAL ID required for fallback");
        }
      }

      try {
        // Try AniList first
        const animeData = await anilist.getAnimeById(id);
        
        // If we have a MAL ID from the response, store it for potential future fallback
        if (animeData.idMal && !malId) {
          // We could store this in a cache for future use, but for now just return the data
        }
        
        return animeData;
      } catch (error) {
        // AniList API failed, trying MAL fallback
        
        // Check if it's a rate limit error or server error that should trigger fallback
        const isRateLimited = error instanceof Error && 
          (error.message.startsWith("RATE_LIMIT") || /429|Too many/i.test(error.message));
        
        const isServerError = error instanceof Error && 
          (error.message.startsWith("HTTP_5") || /500|502|503|504/i.test(error.message));
        
        if (!isRateLimited && !isServerError) {
          // If it's not a rate limit or server error, re-throw it
          throw error;
        }

        // If we have a MAL ID, try MAL API
        if (malId) {
          try {
            
            // Mark this anime as using MAL fallback
            detailFallbackCache.set(id, true);
            
            // Set a timeout to reset the fallback after 5 minutes
            setTimeout(() => {
              detailFallbackCache.delete(id);
            }, 5 * 60 * 1000);
            
            const malAnime = await mal.getAnimeById(malId);
            return transformMALToAniList(malAnime);
        } catch (malError) {
          // MAL API also failed
            // If MAL also fails, throw the original AniList error
            throw error;
          }
        } else {
          // No MAL ID available, throw the original error
          throw error;
        }
      }
    },
    retry: (failureCount, error) => {
      // Don't retry if it's a NOT_FOUND error
      if (error instanceof Error && error.message.startsWith("NOT_FOUND")) {
        return false;
      }
      // Don't retry if we're already using MAL fallback
      if (detailFallbackCache.get(id)) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
  });
};
