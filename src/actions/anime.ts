"use server";

import { anilist } from "@/api/anilist";
import { ActionResponse } from "@/types";

export const getAnimeLastPosition = async (id: number, episode: number): Promise<number> => {
  try {
    const { createClient } = await import("@/utils/supabase/server");
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
      .eq("type", "anime")
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

