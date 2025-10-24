"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { User, Check, Share, Lock } from "@/utils/icons";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { addToast } from "@heroui/react";
import { env } from "@/utils/env";
import { CustomTabs, TabContent } from "@/components/ui/tabs/CustomTabs";
import ProfilePosterCard from "@/components/sections/Profile/Cards/Poster";
import { getWatchlist, getWatchlistCounts } from "@/actions/library";
import { getUserHistories, getHistoryCount } from "@/actions/histories";
import useSupabaseUser from "@/hooks/useSupabaseUser";

// Helper function to get the display link
const getDisplayLink = (url: string) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;
    
    // Remove www. from hostname if present
    const cleanHostname = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    
    // Combine hostname and pathname, but limit pathname length for display
    const fullPath = cleanHostname + pathname;
    
    // Limit total length to prevent overly long displays
    return fullPath.length > 50 ? cleanHostname + pathname.substring(0, 47 - cleanHostname.length) + '...' : fullPath;
  } catch (e) {
    return url; // Fallback in case of invalid URL
  }
};

interface PublicUser {
  id: string;
  username: string;
  avatar: string | null;
  is_public: boolean;
  bio: string | null;
  social_link: string | null;
}

interface PublicProfileClientProps {
  userId: string;
}

export default function PublicProfileClient({ userId }: PublicProfileClientProps) {
  const { data: currentUser } = useSupabaseUser();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("watchlist");
  const [watchlistData, setWatchlistData] = useState<any[]>([]);
  const [completedData, setCompletedData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Counts for private profiles
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  // Separate effect for setting profile context after user data is loaded
  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      // Always set to the current profile URL for consistency
      // The SmartBackButton will handle the logic of whether to go to private or public profile
      sessionStorage.setItem('profileContext', `/profile/${user.username}`);
    }
  }, [user]);

  const getContentType = (item: any): "movie" | "anime" | "tv" => {
    // For watchlist items, use the type field
    if (item.type) {
      return item.type as "movie" | "anime" | "tv";
    }
    // For history items, use the type field
    if (item.type) {
      return item.type as "movie" | "anime" | "tv";
    }
    // Default fallback
    return "movie";
  };

  const renderContentGrid = (data: any[], type: string) => {
    // Show private message for private profiles
    if (!user?.is_public) {
      return (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-default-200 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Lock className="text-xl sm:text-2xl text-default-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-2">This profile is private</h3>
          <p className="text-xs sm:text-sm text-default-500 max-w-sm">
            Content is hidden for privacy
          </p>
        </div>
      );
    }

    if (loadingData) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-2/3 bg-default-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-default-200 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Check className="text-xl sm:text-2xl text-default-400" />
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-2">
            {type === "watchlist" ? "No items in watchlist" :
             type === "completed" ? "No completed items" :
             "No viewing history"}
          </h3>
          <p className="text-xs sm:text-sm text-default-500 max-w-sm">
            {type === "watchlist" ? "Start adding movies and shows to your watchlist" :
             type === "completed" ? "Mark items as done to see them here" :
             "Your viewing history will appear here"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
        {data.slice(0, 24).map((item, index) => {
          const contentType = getContentType(item);
          return (
            <div key={`${item.id}-${index}`} className="aspect-2/3">
              <ProfilePosterCard
                item={item}
                type={contentType}
                variant="full"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const loadPrivateProfileCounts = async (targetUserId: string) => {
    try {
      // Load watchlist counts
      const watchlistCounts = await getWatchlistCounts(targetUserId);
      setWatchlistCount(watchlistCounts.watchlistCount);
      setCompletedCount(watchlistCounts.completedCount);
      
      // Load history count
      const historyCountResult = await getHistoryCount(targetUserId);
      setHistoryCount(historyCountResult);
    } catch (error) {
      // Error handled silently
    }
  };

  const loadUserData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setLoadingData(true);
    
    try {
      const supabase = createClient();
      
      // Get user profile - try by ID first, then by username
      // Check if userId looks like a UUID (starts with letters/numbers and has dashes)
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
      
      let { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id, username, avatar, is_public, bio, social_link")
        .eq(isUUID ? "id" : "username", userId)
        .single();

      if (userError || !userData) {
        addToast({
          title: "User not found",
          color: "danger",
        });
        return;
      }

      // Check if profile is public (default to true if column doesn't exist yet)
      const isPublic = (userData as any).is_public ?? true;
      if (isPublic === false) {
        addToast({
          title: "This profile is private",
          color: "warning",
        });
        // Set empty data for private profiles but load counts
        setWatchlistData([]);
        setCompletedData([]);
        setHistoryData([]);
        setUser({
          id: (userData as any).id,
          username: (userData as any).username,
          avatar: (userData as any).avatar,
          is_public: false,
          bio: (userData as any).bio,
          social_link: (userData as any).social_link,
        });
        
        // Load counts for private profile
        await loadPrivateProfileCounts((userData as any).id);
        return;
      }

      setUser({
        id: (userData as any).id,
        username: (userData as any).username,
        avatar: (userData as any).avatar,
        is_public: isPublic,
        bio: (userData as any).bio,
        social_link: (userData as any).social_link,
      });

      // Update profile context with username-based URL for cleaner back navigation
      if (typeof window !== 'undefined') {
        const profileUrl = `/profile/${(userData as any).username}`;
        sessionStorage.setItem('profileContext', profileUrl);
      }

      // Load user's content (public data only) - using cached server actions
      // Watchlist
      const watchlistResult = await getWatchlist("all", 1, 12, "undone", (userData as any).id);
      if (watchlistResult.success) {
        setWatchlistData(watchlistResult.data || []);
      }

      // Completed items
      const completedResult = await getWatchlist("all", 1, 12, "done", (userData as any).id);
      if (completedResult.success) {
        setCompletedData(completedResult.data || []);
      }

      // History
      const historyResult = await getUserHistories(24, (userData as any).id);
      if (historyResult.success) {
        setHistoryData(historyResult.data || []);
      }
    } catch (error) {
      addToast({
        title: "Error loading profile",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
      setLoadingData(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-foreground-500">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4 text-foreground">User not found</h1>
          <p className="text-foreground-500">This profile doesn't exist or is private.</p>
        </div>
      </div>
    );
  }

  // Show enhanced private profile with counts and social link
  if (user.is_public === false) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Instagram-style Header */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            <div className="flex justify-center md:justify-start">
              <Avatar
                src={user.avatar || undefined}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-2 border-divider"
                showFallback
                fallback={<User className="text-2xl sm:text-4xl" />}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Username */}
              <div className="flex items-center justify-center md:justify-start gap-1 mb-3 md:mb-4">
                <h1 className="text-xl sm:text-2xl font-light">{user.username || "User"}</h1>
                {user.id === env.NEXT_PUBLIC_ADMIN_USER_ID && (
                  <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
                    <Image
                      src="/images/verified.png"
                      alt="Verified"
                      width={20}
                      height={20}
                      sizes="20px"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-4 sm:gap-6 mb-3 md:mb-4">
                <div className="text-center">
                  <div className="font-semibold text-base sm:text-lg">
                    {watchlistCount + completedCount + historyCount}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-500">items</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base sm:text-lg">{completedCount}</div>
                  <div className="text-xs sm:text-sm text-foreground-500">watched</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base sm:text-lg">{watchlistCount}</div>
                  <div className="text-xs sm:text-sm text-foreground-500">watchlist</div>
                </div>
              </div>

              {/* Bio */}
              <div className="text-xs sm:text-sm mb-3 md:mb-4 px-4 md:px-0">
                <p className="text-foreground-500">
                  {user.bio || "No bio yet"}
                </p>
              </div>

              {/* Social Link */}
              {user.social_link && (
                <div className="text-xs sm:text-sm mb-3 md:mb-4 px-4 md:px-0">
                  <a 
                    href={user.social_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-600 transition-colors"
                  >
                    {getDisplayLink(user.social_link)}
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 px-4 md:px-0">
                <Button
                  size="sm"
                  variant="bordered"
                  className="text-xs sm:text-sm font-medium w-full sm:w-auto"
                  startContent={<Share className="text-xs sm:text-sm" />}
                  onPress={() => {
                    const profileUrl = `${window.location.origin}/profile/${user.username}`;
                    navigator.clipboard.writeText(profileUrl);
                    addToast({
                      title: "Profile link copied to clipboard",
                      color: "success",
                    });
                  }}
                >
                  Share profile
                </Button>
              </div>
            </div>
          </div>

          {/* Content Tabs - Custom Design */}
          <div className="border-t border-divider mt-4">
            <CustomTabs
              items={[
                { key: "watchlist", label: "Watchlist" },
                { key: "completed", label: "Watched" },
                { key: "history", label: "History" }
              ]}
              defaultValue="watchlist"
              variant="line"
              size="md"
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabContent value="watchlist">
                <div className="mt-4">
                  {renderContentGrid([], "watchlist")}
                </div>
              </TabContent>
              <TabContent value="completed">
                <div className="mt-4">
                  {renderContentGrid([], "completed")}
                </div>
              </TabContent>
              <TabContent value="history">
                <div className="mt-4">
                  {renderContentGrid([], "history")}
                </div>
              </TabContent>
            </CustomTabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Instagram-style Header */}
      <div className="max-w-6xl mx-auto px-4 py-2">

        {/* Profile Header - Instagram Style */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Mobile Layout */}
          <div className="block md:hidden -mt-2">
            {/* Profile Picture and Name Row */}
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar - Left aligned */}
              <Avatar
                src={user.avatar || undefined}
                className="w-20 h-20 border-2 border-divider flex-shrink-0"
                showFallback
                fallback={<User className="text-2xl" />}
              />
              
              {/* Name and Stats - Right side of profile picture */}
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-2">
                  <h1 className="text-xl font-light">{user.username || "User"}</h1>
                  {user.id === env.NEXT_PUBLIC_ADMIN_USER_ID && (
                    <div className="flex items-center justify-center w-4 h-4">
                      <Image
                        src="/images/verified.png"
                        alt="Verified"
                        width={16}
                        height={16}
                        sizes="16px"
                        className="w-4 h-4"
                      />
                    </div>
                  )}
                </div>
                
                {/* Stats - 3-grid layout under username */}
                <div className="grid grid-cols-3 gap-2 mb-2 justify-start">
                  <div className="text-left">
                    <div className="font-semibold text-sm">{watchlistData.length + completedData.length + historyData.length}</div>
                    <div className="text-xs text-foreground-500">Items</div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{completedData.length}</div>
                    <div className="text-xs text-foreground-500">Watched</div>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-sm">{watchlistData.length}</div>
                    <div className="text-xs text-foreground-500">Watchlist</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="text-sm mb-4">
              <p className="text-foreground-500">
                {user.bio || "No bio yet"}
              </p>
            </div>

            {/* Share Button - Full width */}
            <Button
              size="sm"
              variant="bordered"
              className="text-sm font-medium w-full mb-0"
              startContent={<Share className="text-sm" />}
              onPress={() => {
                const profileUrl = `${window.location.origin}/profile/${user.username}`;
                navigator.clipboard.writeText(profileUrl);
                addToast({
                  title: "Profile link copied to clipboard",
                  color: "success",
                });
              }}
            >
              Share
            </Button>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex md:flex-row gap-6 md:gap-8">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <Avatar
                src={user.avatar || undefined}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-2 border-divider"
                showFallback
                fallback={<User className="text-2xl sm:text-4xl" />}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {/* Username */}
              <div className="flex items-center justify-center md:justify-start gap-1 mb-3 md:mb-4">
                <h1 className="text-xl sm:text-2xl font-light">{user.username || "User"}</h1>
                {user.id === env.NEXT_PUBLIC_ADMIN_USER_ID && (
                  <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
                    <Image
                      src="/images/verified.png"
                      alt="Verified"
                      width={20}
                      height={20}
                      sizes="20px"
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center md:justify-start gap-4 sm:gap-6 mb-3 md:mb-4">
                <div className="text-center">
                  <div className="font-semibold text-base sm:text-lg">
                    {!user?.is_public 
                      ? watchlistCount + completedCount + historyCount
                      : watchlistData.length + completedData.length + historyData.length
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-500">items</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base sm:text-lg">
                    {!user?.is_public ? completedCount : completedData.length}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-500">watched</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base sm:text-lg">
                    {!user?.is_public ? watchlistCount : watchlistData.length}
                  </div>
                  <div className="text-xs sm:text-sm text-foreground-500">watchlist</div>
                </div>
              </div>

              {/* Bio */}
              <div className="text-xs sm:text-sm mb-3 md:mb-4 px-4 md:px-0">
                <p className="text-foreground-500">
                  {user.bio || "No bio yet"}
                </p>
              </div>

              {/* Social Link */}
              {user.social_link && (
                <div className="text-xs sm:text-sm mb-3 md:mb-4 px-4 md:px-0">
                  <a 
                    href={user.social_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary-600 transition-colors"
                  >
                    {getDisplayLink(user.social_link)}
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 px-4 md:px-0">
                <Button
                  size="sm"
                  variant="bordered"
                  className="text-xs sm:text-sm font-medium w-full sm:w-auto"
                  startContent={<Share className="text-xs sm:text-sm" />}
                  onPress={() => {
                    const profileUrl = `${window.location.origin}/profile/${user.username}`;
                    navigator.clipboard.writeText(profileUrl);
                    addToast({
                      title: "Profile link copied to clipboard",
                      color: "success",
                    });
                  }}
                >
                  Share profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs - Custom Design */}
        <div className="border-t border-divider mt-4">
          <CustomTabs
            items={[
              { key: "watchlist", label: "Watchlist" },
              { key: "completed", label: "Watched" },
              { key: "history", label: "History" }
            ]}
            defaultValue="watchlist"
            variant="line"
            size="md"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabContent value="watchlist">
              <div className="mt-4">
                {renderContentGrid(watchlistData, "watchlist")}
              </div>
            </TabContent>
            <TabContent value="completed">
              <div className="mt-4">
                {renderContentGrid(completedData, "completed")}
              </div>
            </TabContent>
            <TabContent value="history">
              <div className="mt-4">
                {renderContentGrid(historyData, "history")}
              </div>
            </TabContent>
          </CustomTabs>
        </div>
      </div>
    </div>
  );
}
