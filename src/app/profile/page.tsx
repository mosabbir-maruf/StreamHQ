"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@bprogress/next/app";
import { Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { CustomTabs, TabContent } from "@/components/ui/tabs/CustomTabs";
import { addToast } from "@heroui/react";
import { env } from "@/utils/env";
import { User, Mail, LockPassword, Check, ArrowLeft, Gear, Share } from "@/utils/icons";

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

import { updateProfile, updatePassword, updateEmail, updatePrivacy } from "@/actions/profile";
import { getWatchlist } from "@/actions/library";
import { getUserHistories } from "@/actions/histories";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import AvatarSelector from "@/components/ui/input/AvatarSelector";
import PasswordInput from "@/components/ui/input/PasswordInput";
import ProfilePosterCard from "@/components/sections/Profile/Cards/Poster";
import { useUsernameAvailability } from "@/hooks/useUsernameAvailability";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/helpers";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileUpdateSchema, PasswordUpdateSchema, EmailUpdateSchema } from "@/schemas/profile";
import { detectBrandFromReferrer, getBrandConfig, getBrandClasses, BrandConfig } from "@/utils/branding";
import "@/styles/instagram-profile.css";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user, isLoading } = useSupabaseUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandConfig, setBrandConfig] = useState<BrandConfig>(getBrandConfig('default'));
  const [activeTab, setActiveTab] = useState("watchlist");
  const [watchlistData, setWatchlistData] = useState<any[]>([]);
  const [completedData, setCompletedData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [contentType, setContentType] = useState<"movie" | "tv" | "anime" | "default">("default");

  // Profile form
  const profileForm = useForm({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      username: "",
      avatar: "",
      bio: "",
      social_link: "",
    },
  });

  // Username availability check
  const currentUsername = profileForm.watch("username");
  const usernameAvailability = useUsernameAvailability(currentUsername, user?.username);

  // Custom validation for special user
  const validateUsername = (value: string) => {
    if (user?.id === env.NEXT_PUBLIC_ADMIN_USER_ID) {
      // Special user has no restrictions on characters or length
      if (value.length === 0) return "Username is required";
      return true;
    } else {
      // Regular users need at least 4 characters
      if (value.length < 4) return "Username must be at least 4 characters";
      if (value.length > 15) return "Username must be less than 15 characters";
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores";
      
      // Check availability if username is valid format and not the same as current
      if (value.length >= 4 && value !== user?.username) {
        if (usernameAvailability.isLoading) return "Checking availability...";
        if (usernameAvailability.isAvailable === false) return "Username is already taken";
        if (usernameAvailability.error) return "Error checking username";
      }
      
      return true;
    }
  };

  // Password form
  const passwordForm = useForm({
    resolver: zodResolver(PasswordUpdateSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Email form
  const emailForm = useForm({
    resolver: zodResolver(EmailUpdateSchema),
    defaultValues: {
      newEmail: "",
      currentPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        username: user.username || "",
        avatar: user.avatar || "",
        bio: user.bio || "",
        social_link: user.social_link || "",
      });
      emailForm.setValue("newEmail", "");
      setIsPublic((user as any).is_public ?? true);
      loadUserData();
      
      // Set profile context for back button navigation
      if (typeof window !== 'undefined') {
        const profileUrl = `/profile/${user.username}`;
        sessionStorage.setItem('profileContext', profileUrl);
      }
    }
  }, [user, profileForm, emailForm]);

  // Check for settings query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('settings') === 'true') {
        setShowAccountSettings(true);
        // Clean up the URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  useEffect(() => {
    const brandType = detectBrandFromReferrer();
    setBrandConfig(getBrandConfig(brandType));
    
    // Detect content type from referrer
    const referrer = document.referrer;
    if (referrer.includes('/movie/')) {
      setContentType('movie');
    } else if (referrer.includes('/tv/')) {
      setContentType('tv');
    } else if (referrer.includes('/anime/')) {
      setContentType('anime');
    } else {
      setContentType('default');
    }
  }, []);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      // Load watchlist
      const watchlistResult = await getWatchlist("all", 1, 12);
      if (watchlistResult.success) {
        setWatchlistData(watchlistResult.data || []);
      }

      // Load completed items
      const completedResult = await getWatchlist("all", 1, 12, "done");
      if (completedResult.success) {
        setCompletedData(completedResult.data || []);
      }

      // Load history
      const historyResult = await getUserHistories(12);
      if (historyResult.success) {
        setHistoryData(historyResult.data || []);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoadingData(false);
    }
  };

  const handleProfileUpdate = profileForm.handleSubmit(async (data) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { success, message } = await updateProfile(data);

      addToast({
        title: message,
        color: success ? "success" : "danger",
      });

      if (success) {
        window.location.reload();
      }
    } catch (error) {
      addToast({
        title: "Error updating profile",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handlePasswordUpdate = passwordForm.handleSubmit(async (data) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { success, message } = await updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      addToast({
        title: message,
        color: success ? "success" : "danger",
      });

      if (success) {
        passwordForm.reset();
      }
    } catch (error) {
      addToast({
        title: "Error updating password",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleEmailUpdate = emailForm.handleSubmit(async (data) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { success, message } = await updateEmail(data);

      addToast({
        title: message,
        color: success ? "success" : "danger",
      });

      if (success) {
        emailForm.setValue("currentPassword", "");
      }
    } catch (error) {
      addToast({
        title: "Error updating email",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const handlePrivacyUpdate = async (isPublic: boolean) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { success, message } = await updatePrivacy({ isPublic });

      addToast({
        title: message,
        color: success ? "success" : "danger",
      });

      if (success) {
        setIsPublic(isPublic);
      }
    } catch (error) {
      addToast({
        title: "Error updating privacy setting",
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const getButtonColor = () => {
    switch (contentType) {
      case "movie": return "primary";
      case "tv": return "warning";
      case "anime": return "danger";
      default: return "primary";
    }
  };

  const renderContentGrid = (data: any[], type: string) => {
    if (loadingData) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
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
             type === "completed" ? "No watched items" :
             "No viewing history"}
          </h3>
          <p className="text-xs sm:text-sm text-default-500 max-w-sm">
            {type === "watchlist" ? "Start adding movies and shows to your watchlist" :
             type === "completed" ? "Mark items as watched to see them here" :
             "Your viewing history will appear here"}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Link href="/auth">
            <Button color="primary">Go to Login</Button>
          </Link>
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
                     <div className="text-xs text-foreground-500">Total</div>
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

            {/* Social Link */}
            {user.social_link && (
              <div className="text-sm mb-4">
                <a 
                  href={user.social_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  {getDisplayLink(user.social_link)}
                </a>
              </div>
            )}

            {/* Action Buttons - 2-grid layout */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                size="sm"
                variant="bordered"
                className="text-sm font-medium"
                onPress={() => setShowSettings(true)}
              >
                Edit Profile
              </Button>
              <Button
                size="sm"
                variant="bordered"
                className="text-sm font-medium"
                startContent={<Gear className="text-sm" />}
                onPress={() => setShowAccountSettings(true)}
              >
                Settings
              </Button>
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
                  <div className="font-semibold text-base sm:text-lg">{watchlistData.length + completedData.length + historyData.length}</div>
                  <div className="text-xs sm:text-sm text-foreground-500">total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base sm:text-lg">{completedData.length}</div>
                  <div className="text-xs sm:text-sm text-foreground-500">watched</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-base sm:text-lg">{watchlistData.length}</div>
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
                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
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
                  onPress={() => setShowSettings(true)}
                >
                  Edit profile
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  className="text-xs sm:text-sm font-medium w-full sm:w-auto"
                  startContent={<Gear className="text-xs sm:text-sm" />}
                  onPress={() => setShowAccountSettings(true)}
                >
                  Settings
                </Button>
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

        {/* Edit Profile Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <Card className="w-full max-w-lg bg-background border border-divider max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-4 sticky top-0 bg-background z-10">
                <h2 className="text-base sm:text-lg font-semibold">Edit profile</h2>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onPress={() => setShowSettings(false)}
                  className="text-foreground-500 hover:text-foreground"
                >
                  ×
                </Button>
              </CardHeader>
              <CardBody className="space-y-4 sm:space-y-6 pt-0">
                {/* Profile Picture and Name */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <Avatar
                      src={profileForm.watch("avatar")}
                      className="w-12 h-12 sm:w-16 sm:h-16"
                      showFallback
                      fallback={<User className="text-xl sm:text-2xl" />}
                    />
                    <div className="flex-1">
                      <div className="text-base sm:text-lg font-semibold">{user.username || "User"}</div>
                    </div>
                  </div>
                  <AvatarSelector
                    selectedAvatar={profileForm.watch("avatar")}
                    onAvatarSelect={(avatar) => profileForm.setValue("avatar", avatar)}
                    className="text-xs sm:text-sm w-full sm:w-auto"
                    userId={user?.id}
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <div className="relative">
                    <Input
                      {...profileForm.register("username", {
                        validate: validateUsername
                      })}
                      placeholder="Enter your username"
                      variant="bordered"
                      isInvalid={!!profileForm.formState.errors.username}
                      errorMessage={profileForm.formState.errors.username?.message}
                      className="w-full"
                      endContent={
                        currentUsername && currentUsername.length >= 4 && currentUsername !== user?.username && usernameAvailability.isLoading ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : currentUsername && currentUsername.length >= 4 && currentUsername !== user?.username && usernameAvailability.isAvailable === true ? (
                          <div className="w-4 h-4 text-success">✓</div>
                        ) : currentUsername && currentUsername.length >= 4 && currentUsername !== user?.username && usernameAvailability.isAvailable === false ? (
                          <div className="w-4 h-4 text-danger">X</div>
                        ) : null
                      }
                    />
                    {/* Real-time availability feedback */}
                    {currentUsername && currentUsername.length >= 4 && currentUsername !== user?.username && (
                      <div className="mt-1 text-xs">
                        {usernameAvailability.isLoading && (
                          <span className="text-primary">Checking availability...</span>
                        )}
                        {usernameAvailability.isAvailable === true && (
                          <span className="text-success">✓ Username is available</span>
                        )}
                        {usernameAvailability.isAvailable === false && (
                          <span className="text-danger">X Username is already taken</span>
                        )}
                        {usernameAvailability.error && (
                          <span className="text-warning">⚠ Error checking username</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Bio</label>
                  <div className="relative">
                    <textarea
                      {...profileForm.register("bio")}
                      placeholder="Tell us about yourself..."
                      className="w-full h-16 sm:h-20 px-3 py-2 bg-default-100 border border-default-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                      maxLength={150}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-foreground-500">
                      {profileForm.watch("bio")?.length || 0}/150
                    </div>
                  </div>
                </div>

                {/* Social Link */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Social Link</label>
                  <Input
                    {...profileForm.register("social_link")}
                    placeholder=""
                    variant="bordered"
                    isInvalid={!!profileForm.formState.errors.social_link}
                    errorMessage={profileForm.formState.errors.social_link?.message}
                    className="w-full"
                    size="sm"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    color="primary"
                    onPress={() => handleProfileUpdate()}
                    isLoading={isSubmitting}
                    className="w-full"
                  >
                    Submit
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Account Settings Modal */}
        {showAccountSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <Card className="w-full max-w-2xl bg-background border-0 shadow-none max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between pb-2 sticky top-0 bg-background z-10">
                <h2 className="text-sm sm:text-base font-medium">Account Settings</h2>
                <button
                  onClick={() => setShowAccountSettings(false)}
                  className="text-foreground-400 hover:text-foreground text-lg sm:text-xl leading-none"
                >
                  ×
                </button>
              </CardHeader>
              <CardBody className="space-y-6 sm:space-y-8 pt-0">
                {/* Email Settings */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm text-foreground-600">Email Settings</h3>
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-medium">New Email</label>
                    <Input
                      {...emailForm.register("newEmail")}
                      placeholder="Enter your new email"
                      variant="bordered"
                      type="email"
                      isInvalid={!!emailForm.formState.errors.newEmail}
                      errorMessage={emailForm.formState.errors.newEmail?.message}
                      className="w-full"
                      size="sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-medium">Current Password</label>
                    <PasswordInput
                      {...emailForm.register("currentPassword")}
                      placeholder="Enter your current password"
                      variant="bordered"
                      isInvalid={!!emailForm.formState.errors.currentPassword}
                      errorMessage={emailForm.formState.errors.currentPassword?.message}
                      className="w-full"
                      size="sm"
                    />
                  </div>
                  <Button
                    color={getButtonColor()}
                    variant="bordered"
                    onPress={() => handleEmailUpdate()}
                    isLoading={isSubmitting}
                    className="w-full text-xs sm:text-sm font-medium"
                    size="sm"
                  >
                    Update Email
                  </Button>
                </div>

                {/* Password Settings */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm text-foreground-600">Password Settings</h3>
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-medium">Current Password</label>
                    <PasswordInput
                      {...passwordForm.register("currentPassword")}
                      placeholder="Enter your current password"
                      variant="bordered"
                      isInvalid={!!passwordForm.formState.errors.currentPassword}
                      errorMessage={passwordForm.formState.errors.currentPassword?.message}
                      className="w-full"
                      size="sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-medium">New Password</label>
                    <PasswordInput
                      {...passwordForm.register("newPassword")}
                      placeholder="Enter your new password"
                      variant="bordered"
                      isInvalid={!!passwordForm.formState.errors.newPassword}
                      errorMessage={passwordForm.formState.errors.newPassword?.message}
                      className="w-full"
                      size="sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs sm:text-sm font-medium">Confirm New Password</label>
                    <PasswordInput
                      {...passwordForm.register("confirmPassword")}
                      placeholder="Confirm your new password"
                      variant="bordered"
                      isInvalid={!!passwordForm.formState.errors.confirmPassword}
                      errorMessage={passwordForm.formState.errors.confirmPassword?.message}
                      className="w-full"
                      size="sm"
                    />
                  </div>
                  <Button
                    color={getButtonColor()}
                    variant="bordered"
                    onPress={() => handlePasswordUpdate()}
                    isLoading={isSubmitting}
                    className="w-full text-xs sm:text-sm font-medium"
                    size="sm"
                  >
                    Update Password
                  </Button>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-3">
                  <h3 className="text-xs sm:text-sm text-foreground-600">Privacy Settings</h3>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Profile Visibility</label>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-foreground-500">
                          {isPublic 
                            ? "Your profile is visible to everyone" 
                            : "Your profile is only visible to you"
                          }
                        </p>
                      </div>
                      <Button
                        color={getButtonColor()}
                        variant="bordered"
                        onPress={() => handlePrivacyUpdate(!isPublic)}
                        isLoading={isSubmitting}
                        size="sm"
                        className="min-w-16 text-xs sm:text-sm font-medium w-full sm:w-auto"
                      >
                        {isPublic ? "Public" : "Private"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
