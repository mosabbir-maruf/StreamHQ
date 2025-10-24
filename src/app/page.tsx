"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { Spinner } from "@heroui/react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { getSpinnerColor } from "@/utils/spinner";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import { hasVisitedBefore, markAsVisited } from "@/utils/landing";
import { useSearchParams } from "next/navigation";

// Pre-load critical components
const HomeHero = dynamic(() => import("@/components/sections/Home/Hero"));
const ContinueWatching = dynamic(() => import("@/components/sections/Home/ContinueWatching"));
const HomePageList = dynamic(() => import("@/components/sections/Home/List"));

// Landing page components
const LandingHero = dynamic(() => import("@/components/sections/Landing/LandingHero"));
const LandingFeatures = dynamic(() => import("@/components/sections/Landing/LandingFeatures"));
const LandingContentShowcase = dynamic(() => import("@/components/sections/Landing/LandingContentShowcase"));
const LandingCTA = dynamic(() => import("@/components/sections/Landing/LandingCTA"));


const HomePage = () => {
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv", "anime"]).withDefault("movie"),
  );
  const { data: user, isLoading } = useSupabaseUser();
  const [showLanding, setShowLanding] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoading) {
      // Clear profile context when navigating to home page
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('profileContext');
      }

      // Check if user clicked "Start Watching" button
      if (searchParams.get('visited') === 'true') {
        markAsVisited();
        setShowLanding(false);
        return;
      }

      if (!user && !hasVisitedBefore()) {
        // First time visitor - show landing page
        setShowLanding(true);
      } else {
        // Returning visitor or authenticated user - show normal app
        setShowLanding(false);
      }
    }
  }, [user, isLoading, searchParams]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
      </div>
    );
  }

  // Show landing page for unauthenticated users
  if (showLanding) {
    return (
      <>
        <div className="min-h-screen">
          {/* Hero Section */}
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
            </div>
          }>
            <LandingHero />
          </Suspense>

          {/* Features Section */}
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
            </div>
          }>
            <LandingFeatures />
          </Suspense>

          {/* Content Showcase Section */}
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
            </div>
          }>
            <LandingContentShowcase />
          </Suspense>

          {/* Call to Action Section */}
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner size="lg" className="absolute-center" variant="simple" color="primary" />
            </div>
          }>
            <LandingCTA />
          </Suspense>
        </div>
      </>
    );
  }

  // Show authenticated home page for logged-in users
  return (
    <>
      <div className="flex flex-col gap-2 md:gap-3">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner size="lg" className="absolute-center" variant="simple" color={getSpinnerColor(content)} />
          </div>
        }>
          <HomeHero />
        </Suspense>
        <div className="mt-2 md:mt-4">
          <ContinueWatching />
        </div>
        <div className="mt-4 md:mt-6">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Spinner size="lg" className="absolute-center" variant="simple" color={getSpinnerColor(content)} />
            </div>
          }>
            <HomePageList />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default HomePage;
