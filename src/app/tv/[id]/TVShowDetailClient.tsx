"use client";

import { tmdb } from "@/api/tmdb";
import { Params } from "@/types";
import { Spinner } from "@heroui/react";
import { useScrollIntoView } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { Suspense, use } from "react";
import dynamic from "next/dynamic";
import { NextPage } from "next";
import { cachedFetch } from "@/utils/apiCache";

const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const TvShowRelatedSection = dynamic(() => import("@/components/sections/TV/Details/Related"));
const TvShowCastsSection = dynamic(() => import("@/components/sections/TV/Details/Casts"));
const TvShowBackdropSection = dynamic(() => import("@/components/sections/TV/Details/Backdrop"));
const TvShowOverviewSection = dynamic(() => import("@/components/sections/TV/Details/Overview"));
const TvShowsSeasonsSelection = dynamic(() => import("@/components/sections/TV/Details/Seasons"));

interface TVShowDetailClientProps {
  id: number;
}

const TVShowDetailClient: NextPage<TVShowDetailClientProps> = ({ id }) => {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
    duration: 500,
  });

  const {
    data: tv,
    isPending,
    error,
  } = useQuery({
    queryFn: () => cachedFetch(`tv-detail-${id}`, () =>
      tmdb.tvShows.details(id, [
        "images",
        "videos",
        "credits",
        "keywords",
        "recommendations",
        "similar",
        "reviews",
        "watch/providers",
      ]), 30 * 60 * 1000),
    queryKey: ["tv-show-detail", id],
    staleTime: 30 * 60 * 1000, // 30 minutes - detail data doesn't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isPending) {
    return (
      <div className="mx-auto max-w-5xl">
        <Spinner size="lg" className="absolute-center" color="warning" variant="simple" />
      </div>
    );
  }

  if (error) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Suspense
        fallback={
          <Spinner size="lg" className="absolute-center" color="warning" variant="simple" />
        }
      >
        <div className="flex flex-col gap-10">
          <TvShowBackdropSection tv={tv} />
          <TvShowOverviewSection
            onViewEpisodesClick={() => scrollIntoView({ alignment: "center" })}
            tv={tv}
          />
          {tv.credits?.cast && <TvShowCastsSection casts={tv.credits.cast} />}
          {tv.images?.backdrops && <PhotosSection images={tv.images.backdrops} type="tv" />}
          <TvShowsSeasonsSelection ref={targetRef} id={id} seasons={tv.seasons} />
          <TvShowRelatedSection tv={tv} />
        </div>
      </Suspense>
    </div>
  );
};

export default TVShowDetailClient;
