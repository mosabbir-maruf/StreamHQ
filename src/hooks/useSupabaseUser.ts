"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { queryClient } from "@/app/providers";
import { addToast } from "@heroui/react";

type AuthUserData = User & {
  username: string;
  avatar: string | null;
  is_public: boolean;
  bio: string | null;
  social_link: string | null;
};

const fetchUser = async (): Promise<AuthUserData | null> => {
  let AuthUser: AuthUserData | null = null;

  const supabase = createClient();

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    // Error fetching user

    addToast({
      title: "Error fetching user",
      description: error.message,
      color: "danger",
    });

    return null;
  }

  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("username, avatar, is_public, bio, social_link")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return null;
    }

    if (profile) {
      AuthUser = {
        ...user,
        username: (profile as any).username,
        avatar: (profile as any).avatar,
        is_public: (profile as any).is_public ?? true,
        bio: (profile as any).bio,
        social_link: (profile as any).social_link,
      };
    }
  }

  return AuthUser;
};

const useSupabaseUser = () => {
  const supabase = createClient();

  const query = useQuery({
    queryKey: ["supabase-user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      queryClient.invalidateQueries({ queryKey: ["supabase-user"] });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  return query;
};

export default useSupabaseUser;
