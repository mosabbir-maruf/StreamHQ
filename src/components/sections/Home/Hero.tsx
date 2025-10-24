"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@heroui/react";
import { Suspense, useState, useEffect } from "react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { getSpinnerColor } from "@/utils/spinner";

const MovieRecentHero = dynamic(() => import("@/components/sections/Movie/RecentHero"));
const TvRecentHero = dynamic(() => import("@/components/sections/TV/RecentHero"));
const AnimeRecentHero = dynamic(() => import("@/components/sections/Anime/RecentHero"));

const HomeHero: React.FC = () => {
  const [content] = useQueryState(
    "content",
    parseAsStringLiteral(["movie", "tv", "anime"]).withDefault("movie"),
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to prevent flash of loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [content]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" className="absolute-center" variant="simple" color={getSpinnerColor(content)} />
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner size="lg" className="absolute-center" variant="simple" color={getSpinnerColor(content)} />}>
      {content === "movie" ? <MovieRecentHero /> : content === "tv" ? <TvRecentHero /> : <AnimeRecentHero />}
    </Suspense>
  );
};

export default HomeHero;


