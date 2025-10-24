"use client";

import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import { siteConfig } from "@/config/site";
import { Spinner } from "@heroui/react";
import dynamic from "next/dynamic";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useState, useEffect } from "react";
import { getSpinnerColor } from "@/utils/spinner";
import useBreakpoints from "@/hooks/useBreakpoints";

const MovieHomeList = dynamic(() => import("@/components/sections/Movie/HomeList"));
const TvShowHomeList = dynamic(() => import("@/components/sections/TV/HomeList"));
const AnimeHomeList = dynamic(() => import("@/components/sections/Anime/HomeList"));

const HomePageList: React.FC = () => {
  const { movies, tvShows, anime } = siteConfig.queryLists;
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv", "anime"]).withDefault("movie"),
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedSections, setLoadedSections] = useState(3); // Start with 3 sections for better LCP
  const [isHydrated, setIsHydrated] = useState(false);
  const { mobile } = useBreakpoints();

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle section transition loading state
  useEffect(() => {
    if (!isHydrated) return;
    
    // Reset loaded sections when content changes
    setLoadedSections(3);
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100); // Short delay to show transition

    return () => clearTimeout(timer);
  }, [content, isHydrated]);

  // Progressive loading effect - runs on mount and content change
  useEffect(() => {
    if (!isHydrated) return;
    
    const loadMoreSections = () => {
      setLoadedSections(prev => {
        const currentLists = getCurrentLists();
        const newCount = Math.min(prev + 1, currentLists.length);
        return newCount;
      });
    };

    // Load sections progressively - optimized for better LCP and Speed Index
    // Use slower intervals on mobile to reduce CPU load and heat
    const baseInterval = mobile ? 200 : 50; // Slower on mobile
    const timers = [
      setTimeout(loadMoreSections, baseInterval),    // Load second section
      setTimeout(loadMoreSections, baseInterval * 3),   // Load third section
      setTimeout(loadMoreSections, baseInterval * 6),   // Load fourth section
      setTimeout(loadMoreSections, baseInterval * 10),   // Load fifth section
      setTimeout(loadMoreSections, baseInterval * 15),   // Load sixth section
      setTimeout(loadMoreSections, baseInterval * 20),  // Load seventh section
      setTimeout(loadMoreSections, baseInterval * 26),  // Load eighth section
      setTimeout(loadMoreSections, baseInterval * 32),  // Load ninth section
      setTimeout(loadMoreSections, baseInterval * 40),  // Load tenth section
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [content, isHydrated, mobile]);


  const getCurrentLists = () => {
    if (content === "movie") return movies;
    if (content === "tv") return tvShows;
    return anime;
  };

  const getListComponent = () => {
    if (content === "movie") return MovieHomeList;
    if (content === "tv") return TvShowHomeList;
    return AnimeHomeList;
  };

  const currentLists = getCurrentLists();
  const ListComponent = getListComponent();


  // Show loading state until hydrated to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" className="absolute-center" variant="simple" color={getSpinnerColor(content)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ContentTypeSelection className="justify-center" />
      <div className="relative flex min-h-32 flex-col gap-12">
        {isTransitioning ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Spinner
              size="lg"
              variant="simple"
              color={getSpinnerColor(content)}
              label={`Loading ${content === "movie" ? "Movies" : content === "tv" ? "TV Shows" : "Anime"}...`}
            />
          </div>
        ) : (
          <>
            {currentLists.slice(0, loadedSections).map((item) => (
              <ListComponent key={item.name} {...item} />
            ))}
            {loadedSections < currentLists.length && (
              <div className="flex items-center justify-center min-h-[200px]">
                <Spinner
                  size="md"
                  variant="simple"
                  color={getSpinnerColor(content)}
                  label="Loading more content..."
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePageList;
