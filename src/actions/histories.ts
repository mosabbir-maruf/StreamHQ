"use server";

import { tmdb } from "@/api/tmdb";
import { VidlinkEventData } from "@/hooks/useVidlinkPlayer";
import { ActionResponse } from "@/types";
import { HistoryDetail } from "@/types/movie";
import { mutateMovieTitle, mutateTvShowTitle } from "@/utils/movies";
import { createClient } from "@/utils/supabase/server";
import { getCachedUserHistory, invalidateUserCache } from "@/utils/apiCache";

export const syncHistory = async (
  data: VidlinkEventData["data"],
  completed?: boolean,
): ActionResponse => {
  // Saving history

  if (!data) return { success: false, message: "No data to save" };

  if (data.mediaType === "tv" && (!data.season || !data.episode)) {
    return { success: false, message: "Missing season or episode" };
  }

  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "You must be logged in to save history",
      };
    }

    // Validate required fields
    if (!data.mtmdbId || !data.mediaType) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    // Validate type
    if (!["movie", "tv", "anime"].includes(data.mediaType)) {
      return {
        success: false,
        message: 'Invalid content type. Must be "movie", "tv", or "anime"',
      };
    }

    let media: any;
    let title: string;
    let releaseDate: string;
    let adult: boolean;
    let backdropPath: string | null;
    let posterPath: string | null;
    let voteAverage: number;

    if (data.mediaType === "anime") {
      // For anime, we need to fetch from AniList
      const { anilist } = await import("@/api/anilist");
      const animeData = await anilist.getAnimeById(data.mtmdbId);
      const { mutateAnimeTitle, normalizeAnimeScore } = await import("@/utils/anime");
      
      title = mutateAnimeTitle(animeData);
      releaseDate = animeData.startDate?.year ? `${animeData.startDate.year}-01-01` : "";
      adult = animeData.isAdult;
      backdropPath = animeData.bannerImage || animeData.coverImage?.large || null;
      posterPath = animeData.coverImage?.large || null;
      voteAverage = normalizeAnimeScore(animeData.averageScore);
    } else {
      media = data.mediaType === "movie"
        ? await tmdb.movies.details(data.mtmdbId)
        : await tmdb.tvShows.details(data.mtmdbId);
      
      title = "title" in media ? mutateMovieTitle(media) : mutateTvShowTitle(media);
      releaseDate = "release_date" in media ? media.release_date : media.first_air_date;
      adult = "adult" in media ? media.adult : false;
      backdropPath = media.backdrop_path;
      posterPath = media.poster_path;
      voteAverage = media.vote_average;
    }

    // Insert or update history
    const { data: history, error } = await supabase
      .from("histories")
      .upsert(
        {
          user_id: user.id,
          media_id: data.mtmdbId,
          type: data.mediaType,
          season: data.season || 0,
          episode: data.episode || 0,
          duration: data.duration,
          last_position: data.currentTime,
          completed: completed || false,
          adult: adult,
          backdrop_path: backdropPath,
          poster_path: posterPath,
          release_date: releaseDate,
          title: title,
          vote_average: voteAverage,
        },
        {
          onConflict: "user_id,media_id,type,season,episode",
        },
      )
      .select();

    if (error) {
      // History save error
      return {
        success: false,
        message: "Failed to save history",
      };
    }

    // History saved
    
    // Invalidate user cache
    invalidateUserCache(user.id);

    return {
      success: true,
      message: "History saved",
    };
  } catch (error) {
    // Unexpected error
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
};

export const getUserHistories = async (limit: number = 20, userId?: string): ActionResponse<HistoryDetail[]> => {
  try {
    // Use service role client for public profile access to bypass RLS
    const supabase = await createClient(userId ? true : false);

    // Get user ID (either provided or current user)
    let targetUserId: string;
    
    if (userId) {
      // Use provided userId (for public profiles)
      targetUserId = userId;
    } else {
      // Get current user (for authenticated users)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          message: "User not authenticated",
        };
      }
      
      targetUserId = user.id;
    }

    // Use cached fetch for better performance
    return await getCachedUserHistory(
      targetUserId,
      limit,
      async () => {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<ActionResponse<HistoryDetail[]>>((_, reject) => {
          setTimeout(() => reject(new Error("Request timeout")), 10000); // 10 second timeout
        });

        const fetchPromise = async (): Promise<ActionResponse<HistoryDetail[]>> => {
          const { data, error } = await supabase
            .from("histories")
            .select("*")
            .eq("user_id", targetUserId)
            .order("updated_at", { ascending: false })
            .limit(limit);

          if (error) {
            // History fetch error
            return {
              success: false,
              message: "Failed to fetch history",
            };
          }

          return {
            success: true,
            data,
          };
        };

        return await Promise.race([fetchPromise(), timeoutPromise]);
      }
    );
  } catch (error) {
    // Unexpected error
    return {
      success: false,
      message: "An unexpected error occurred",
    };
  }
};

export const getMovieLastPosition = async (id: number): Promise<number> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
      .from("histories")
      .select("last_position")
      .eq("user_id", user.id)
      .eq("media_id", id)
      .eq("type", "movie");

    if (error) {
      // History fetch error
      return 0;
    }

    return data?.[0]?.last_position || 0;
  } catch (error) {
    // Unexpected error
    return 0;
  }
};

export const getTvShowLastPosition = async (
  id: number,
  season: number,
  episode: number,
): Promise<number> => {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return 0;
    }

    const { data, error } = await supabase
      .from("histories")
      .select("last_position")
      .eq("user_id", user.id)
      .eq("media_id", id)
      .eq("type", "tv")
      .eq("season", season)
      .eq("episode", episode);

    if (error) {
      // History fetch error
      return 0;
    }

    return data?.[0]?.last_position || 0;
  } catch (error) {
    // Unexpected error
    return 0;
  }
};

/**
 * Get user's history count for private profiles
 */
export async function getHistoryCount(userId: string): Promise<number> {
  try {
    // Use service role client for public profile access to bypass RLS
    const supabase = await createClient(true);

    const { count, error } = await supabase
      .from("histories")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (error) {
      return 0;
    }

    return count || 0;
  } catch (error) {
    return 0;
  }
}
