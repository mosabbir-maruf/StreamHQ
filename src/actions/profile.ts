"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { invalidateUserCache } from "@/utils/apiCache";
import { isAdminOnlyAvatar } from "@/utils/avatar";
import { env } from "@/utils/env";

export interface UpdateProfileData {
  username: string;
  avatar?: string;
  bio?: string;
  social_link?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateEmailData {
  newEmail: string;
  currentPassword: string;
}

export interface UpdatePrivacyData {
  isPublic: boolean;
}

export interface ActionResponse {
  success: boolean;
  message: string;
}

export async function updateProfile(data: UpdateProfileData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "User not authenticated" };
    }

    // Check if user is trying to use an admin-only avatar
    if (data.avatar && isAdminOnlyAvatar(data.avatar)) {
      const isAdmin = env.NEXT_PUBLIC_ADMIN_USER_ID && user.id === env.NEXT_PUBLIC_ADMIN_USER_ID;
      if (!isAdmin) {
        return { success: false, message: "This avatar is restricted to admin users only" };
      }
    }

    // Check if username is already taken by another user
    if (data.username) {
      const { data: existingUser, error: checkError } = await supabase
        .from("profiles")
        .select("id, username")
        .eq("username", data.username)
        .neq("id", user.id)
        .maybeSingle();

      if (checkError) {
        return { success: false, message: "Error checking username availability" };
      }

      if (existingUser) {
        return { success: false, message: "Username is already taken" };
      }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: data.username,
        avatar: data.avatar,
        bio: data.bio,
        social_link: data.social_link,
      })
      .eq("id", user.id);

    if (updateError) {
      return { success: false, message: "Failed to update profile" };
    }

    revalidatePath("/profile");
    
    // Invalidate user cache
    invalidateUserCache(user.id);
    
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function updatePassword(data: UpdatePasswordData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "User not authenticated" };
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function updateEmail(data: UpdateEmailData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "User not authenticated" };
    }

    // Verify current password before allowing email change
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: data.currentPassword,
    });

    if (signInError) {
      return { success: false, message: "Current password is incorrect" };
    }

    // Update email
    const { error: updateError } = await supabase.auth.updateUser({
      email: data.newEmail,
    });

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    return { 
      success: true, 
      message: "Email update initiated. Please check your new email for verification." 
    };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred" };
  }
}

export async function updatePrivacy(data: UpdatePrivacyData): Promise<ActionResponse> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, message: "User not authenticated" };
    }

    // Update privacy setting
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_public: data.isPublic,
      } as any)
      .eq("id", user.id);

    if (updateError) {
      return { success: false, message: "Failed to update privacy setting" };
    }

    revalidatePath("/profile");
    
    // Invalidate user cache
    invalidateUserCache(user.id);
    
    return { 
      success: true, 
      message: data.isPublic 
        ? "Profile is now public" 
        : "Profile is now private" 
    };
  } catch (error) {
    return { success: false, message: "An unexpected error occurred" };
  }
}
