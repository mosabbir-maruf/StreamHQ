"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { getCachedUserWatchlist, invalidateUserCache } from "@/utils/apiCache";

// Types
type ContentType = "movie" | "tv" | "anime";
type FilterType = ContentType | "all";

interface WatchlistItem {
  id: number;
  type: ContentType;
  adult: boolean;
  backdrop_path: string;
  poster_path?: string | null;
  release_date: string;
  title: string;
  vote_average: number;
}

interface WatchlistEntry extends WatchlistItem {
  user_id: string;
  created_at: string;
  done?: boolean; // Optional for backward compatibility
}

interface ActionResponse<T = any> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

interface WatchlistResponse extends ActionResponse<WatchlistEntry[]> {
  totalCount?: number;
  totalPages?: number;
  currentPage?: number;
  hasNextPage?: boolean;
}

interface CheckWatchlistResponse extends ActionResponse {
  isInWatchlist: boolean;
  done?: boolean;
}

/**
 * Add item to watchlist
 */
export async function addToWatchlist(item: WatchlistItem): Promise<ActionResponse<WatchlistEntry>> {
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
        error: "You must be logged in to add items to watchlist",
      };
    }

    // Validate required fields
    if (!item.id || !item.type || !item.title) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Validate type
    if (!["movie", "tv", "anime"].includes(item.type)) {
      return {
        success: false,
        error: 'Invalid content type. Must be "movie", "tv", or "anime"',
      };
    }

    // Add to watchlist
    const { data, error } = await supabase
      .from("watchlist")
      .insert({
        user_id: user.id,
        id: item.id,
        type: item.type,
        adult: item.adult || false,
        backdrop_path: item.backdrop_path || "",
        poster_path: item.poster_path || null,
        release_date: item.release_date || new Date().toISOString().split("T")[0],
        title: item.title,
        vote_average: item.vote_average || 0,
      })
      .select()
      .single<WatchlistEntry>();

    if (error) {
      // Check if it's a duplicate error
      if (error.code === "23505") {
        return {
          success: false,
          error: "This item is already in your watchlist",
        };
      }

      // Watchlist add error
      return {
        success: false,
        error: "Failed to add item to watchlist",
      };
    }

    // Revalidate the watchlist page if you have one
    revalidatePath("/library");
    
    // Invalidate user cache
    invalidateUserCache(user.id);

    return {
      success: true,
      data,
      message: "Added to watchlist successfully",
    };
  } catch (error) {
    // Unexpected error
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Add item directly to done list (without adding to watchlist)
 */
export async function addToDoneList(item: WatchlistItem): Promise<ActionResponse> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "You must be logged in to mark as done" };
    }

    // Validate required fields
    if (!item.id || !item.type || !item.title) {
      return { success: false, error: "Missing required fields" };
    }

    if (!["movie", "tv", "anime"].includes(item.type)) {
      return { success: false, error: 'Invalid content type. Must be "movie", "tv", or "anime"' };
    }

    // Insert directly into done table
    const { error } = await supabase
      .from("watchlist_done")
      .insert({
        user_id: user.id,
        id: item.id,
        type: item.type,
        adult: item.adult || false,
        backdrop_path: item.backdrop_path || "",
        poster_path: item.poster_path || null,
        release_date: item.release_date || new Date().toISOString().split("T")[0],
        title: item.title,
        vote_average: item.vote_average || 0,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });

    if (error) {
      if (error.code === "23505") {
        return { success: true, message: "Already marked as done" };
      }
      return { success: false, error: "Failed to add to completed list" };
    }

    // Ensure it is not in watchlist anymore (idempotent cleanup)
    await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("id", item.id)
      .eq("type", item.type);

    revalidatePath("/library");
    
    // Invalidate user cache
    invalidateUserCache(user.id);
    
    return { success: true, message: "Added to completed list" };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Remove item from watchlist
 */
export async function removeFromWatchlist(id: number, type: ContentType): Promise<ActionResponse> {
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
        error: "You must be logged in to remove items from watchlist",
      };
    }

    // Validate inputs
    if (!id || !type) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Validate type
    if (!["movie", "tv", "anime"].includes(type)) {
      return {
        success: false,
        error: "Invalid content type",
      };
    }

    // Delete from watchlist
    const { error } = await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type);

    if (error) {
      // Watchlist remove error
      return {
        success: false,
        error: "Failed to remove item from watchlist",
      };
    }

    // Revalidate the watchlist page
    revalidatePath("/library");
    
    // Invalidate user cache
    invalidateUserCache(user.id);

    return {
      success: true,
      message: "Removed from watchlist successfully",
    };
  } catch (error) {
    // Unexpected error
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Remove all items from watchlist or completed list
 */
export const removeAllWatchlist = async (type: ContentType, fromCompleted: boolean = false): Promise<ActionResponse> => {
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
        error: "You must be logged in to remove items from watchlist",
      };
    }

    // Validate type
    if (!["movie", "tv", "anime"].includes(type)) {
      return {
        success: false,
        error: "Invalid content type",
      };
    }

    // Delete from appropriate table
    const tableName = fromCompleted ? "watchlist_done" : "watchlist";
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq("user_id", user.id)
      .eq("type", type);

    if (error) {
      // Remove error
      return {
        success: false,
        error: `Failed to remove items from ${fromCompleted ? "completed list" : "watchlist"}`,
      };
    }

    // Revalidate the watchlist page
    revalidatePath("/library");
    
    // Invalidate user cache
    invalidateUserCache(user.id);

    return {
      success: true,
      message: `Removed items from ${fromCompleted ? "completed list" : "watchlist"} successfully`,
    };
  } catch (error) {
    // Unexpected error
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
};

/**
 * Check if item is in watchlist
 */
export async function checkInWatchlist(
  id: number,
  type: ContentType,
): Promise<CheckWatchlistResponse> {
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
        isInWatchlist: false,
        error: "User not authenticated",
      };
    }

    // Check if exists in watchlist
    const { data: watchlistData, error: watchlistError } = await supabase
      .from("watchlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type)
      .single();

    // Check if exists in done list
    const { data: doneData, error: doneError } = await supabase
      .from("watchlist_done")
      .select("id")
      .eq("user_id", user.id)
      .eq("id", id)
      .eq("type", type)
      .single();

    if (watchlistError && watchlistError.code !== "PGRST116" && doneError && doneError.code !== "PGRST116") {
      return {
        success: false,
        isInWatchlist: false,
        error: "Failed to check watchlist status",
      };
    }

    const isInWatchlist = !!watchlistData;
    const done = !!doneData;

    return {
      success: true,
      // Only count active watchlist as in watchlist; 'done' lives separately
      isInWatchlist,
      done,
    };
  } catch (error) {
    // Unexpected error
    return {
      success: false,
      isInWatchlist: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get user's watchlist with pagination - optimized for infinite scroll
 */
export async function getWatchlist(
  filterType: FilterType = "all",
  page: number = 1,
  limit: number = 20,
  doneFilter?: "all" | "done" | "undone",
  userId?: string,
): Promise<WatchlistResponse> {
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
          data: [],
          error: "User not authenticated",
        };
      }
      
      targetUserId = user.id;
    }

    // Use cached fetch for better performance
    return await getCachedUserWatchlist(
      targetUserId,
      filterType,
      page,
      limit,
      doneFilter,
      async () => {
        // Calculate offset
        const offset = (page - 1) * limit;

        // Build base query - only get active watchlist items
        let query = supabase
          .from("watchlist")
          .select("*", { count: "exact" })
          .eq("user_id", targetUserId)
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        // Apply type filter if not 'all'
        if (filterType !== "all" && ["movie", "tv", "anime"].includes(filterType)) {
          query = query.eq("type", filterType);
        }

        const { data, count, error } = await query;

        // For active watchlist, all items are not done
        let filteredData = data || [];
        if (doneFilter && doneFilter === "done") {
          // If user wants to see done items, we need to fetch from done table instead
          const doneQuery = supabase
            .from("watchlist_done")
            .select("*", { count: "exact" })
            .eq("user_id", targetUserId)
            .order("completed_at", { ascending: false })
            .range(offset, offset + limit - 1);

          if (filterType !== "all" && ["movie", "tv", "anime"].includes(filterType)) {
            doneQuery.eq("type", filterType);
          }

          const { data: doneData, count: doneCount, error: doneError } = await doneQuery;
          
          if (doneError) {
            return {
              success: false,
              data: [],
              error: "Failed to fetch done items",
            };
          }

          // Transform done data to match watchlist format
          const transformedDoneData = (doneData || []).map(item => ({
            ...item,
            done: true
          }));

          return {
            success: true,
            data: transformedDoneData as WatchlistEntry[],
            totalCount: doneCount || 0,
            totalPages: Math.ceil((doneCount || 0) / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil((doneCount || 0) / limit),
          };
        }

        if (error) {
          // Watchlist fetch error
          return {
            success: false,
            data: [],
            error: "Failed to fetch watchlist",
          };
        }

        const totalPages = Math.ceil((count || 0) / limit);

        // Transform data to include done status (all active items are not done)
        const transformedData = filteredData.map(item => ({
          ...item,
          done: false
        }));

        return {
          success: true,
          data: transformedData as WatchlistEntry[],
          totalCount: count || 0,
          totalPages,
          currentPage: page,
          hasNextPage: page < totalPages,
        };
      }
    );
  } catch (error) {
    // Unexpected error
    return {
      success: false,
      data: [],
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Mark item as done/undone
 */
export async function markAsDone(
  id: number,
  type: ContentType,
  done: boolean
): Promise<ActionResponse> {
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
        error: "You must be logged in to mark items as done",
      };
    }

    // Validate inputs
    if (!id || !type) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Validate type
    if (!["movie", "tv", "anime"].includes(type)) {
      return {
        success: false,
        error: "Invalid content type",
      };
    }

    if (done) {
      // First, get the watchlist item data
      const { data: watchlistItem, error: fetchError } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .eq("id", id)
        .eq("type", type)
        .single();

      if (fetchError || !watchlistItem) {
        return {
          success: false,
          error: "Item not found in watchlist",
        };
      }

      // Add to watchlist_done table with all the item data
      const { error: insertError } = await supabase
        .from("watchlist_done")
        .insert({
          user_id: user.id,
          id,
          type,
          adult: watchlistItem.adult,
          backdrop_path: watchlistItem.backdrop_path,
          poster_path: watchlistItem.poster_path,
          release_date: watchlistItem.release_date,
          title: watchlistItem.title,
          vote_average: watchlistItem.vote_average,
          created_at: watchlistItem.created_at,
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        // Check if it's a duplicate error (already marked as done)
        if (insertError.code === "23505") {
          return {
            success: true,
            message: "Already marked as done",
          };
        }
        return {
          success: false,
          error: "Failed to mark as done",
        };
      }

      // Remove from watchlist table
      const { error: deleteError } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("id", id)
        .eq("type", type);

      if (deleteError) {
        // If deletion fails, try to remove from done table to maintain consistency
        await supabase
          .from("watchlist_done")
          .delete()
          .eq("user_id", user.id)
          .eq("id", id)
          .eq("type", type);
        
        return {
          success: false,
          error: "Failed to move item to done list",
        };
      }
    } else {
      // Unmark as done: just remove from done list (do NOT add back to watchlist)
      const { error: deleteError } = await supabase
        .from("watchlist_done")
        .delete()
        .eq("user_id", user.id)
        .eq("id", id)
        .eq("type", type);

      if (deleteError) {
        return {
          success: false,
          error: "Failed to remove item from completed list",
        };
      }
    }

    // Revalidate the watchlist page
    revalidatePath("/library");
    
    // Invalidate user cache
    invalidateUserCache(user.id);

    return {
      success: true,
      message: done ? "Marked as done and added to completed list" : "Removed from completed list",
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Toggle done status (helper function)
 */
export async function toggleDoneStatus(
  id: number,
  type: ContentType,
  currentDoneStatus: boolean
): Promise<ActionResponse> {
  return await markAsDone(id, type, !currentDoneStatus);
}

/**
 * Toggle watchlist status (helper function)
 */
export async function toggleWatchlist(item: WatchlistItem): Promise<ActionResponse> {
  const checkResult = await checkInWatchlist(item.id, item.type);

  if (!checkResult.success) {
    return checkResult;
  }

  if (checkResult.isInWatchlist) {
    return await removeFromWatchlist(item.id, item.type);
  } else {
    return await addToWatchlist(item);
  }
}

/**
 * Get user's watchlist counts for private profiles
 */
export async function getWatchlistCounts(userId: string): Promise<{
  watchlistCount: number;
  completedCount: number;
}> {
  try {
    // Use service role client for public profile access to bypass RLS
    const supabase = await createClient(true);

    // Get watchlist count
    const { count: watchlistCount, error: watchlistError } = await supabase
      .from("watchlist")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (watchlistError) {
      return { watchlistCount: 0, completedCount: 0 };
    }

    // Get completed count
    const { count: completedCount, error: completedError } = await supabase
      .from("watchlist_done")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (completedError) {
      return { watchlistCount: watchlistCount || 0, completedCount: 0 };
    }

    return {
      watchlistCount: watchlistCount || 0,
      completedCount: completedCount || 0,
    };
  } catch (error) {
    return { watchlistCount: 0, completedCount: 0 };
  }
}
