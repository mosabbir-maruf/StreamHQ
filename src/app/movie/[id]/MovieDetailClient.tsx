"use client";

import { Suspense, use } from "react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import { tmdb } from "@/api/tmdb";
import { Cast } from "tmdb-ts/dist/types/credits";
import { notFound } from "next/navigation";
import { Image } from "tmdb-ts";
import dynamic from "next/dynamic";
import { Params } from "@/types";
import { NextPage } from "next";
import { cachedFetch } from "@/utils/apiCache";

const PhotosSection = dynamic(() => import("@/components/ui/other/PhotosSection"));
const BackdropSection = dynamic(() => import("@/components/sections/Movie/Detail/Backdrop"));
const OverviewSection = dynamic(() => import("@/components/sections/Movie/Detail/Overview"));
const CastsSection = dynamic(() => import("@/components/sections/Movie/Detail/Casts"));
const RelatedSection = dynamic(() => import("@/components/sections/Movie/Detail/Related"));

interface MovieDetailClientProps {
  id: number;
}

const MovieDetailClient: NextPage<MovieDetailClientProps> = ({ id }) => {
  const {
    data: movie,
    isPending,
    error,
  } = useQuery({
    queryFn: () => cachedFetch(`movie-detail-${id}`, () =>
      tmdb.movies.details(id, [
        "images",
        "videos",
        "credits",
        "keywords",
        "recommendations",
        "similar",
        "reviews",
        "watch/providers",
      ]), 30 * 60 * 1000),
    queryKey: ["movie-detail", id],
    staleTime: 30 * 60 * 1000, // 30 minutes - detail data doesn't change often
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  if (isPending) {
    return (
      <div className="relative mx-auto max-w-5xl min-h-[60vh]">
        <Spinner size="lg" className="absolute-center" variant="simple" />
      </div>
    );
  }

  if (error) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <Suspense
        fallback={
          <div className="relative min-h-[60vh]">
            <Spinner size="lg" className="absolute-center" variant="simple" />
          </div>
        }
      >
        <div className="flex flex-col gap-10">
          <BackdropSection movie={movie} />
          <OverviewSection movie={movie} />
          {movie.credits?.cast && <CastsSection casts={movie.credits.cast as Cast[]} />}
          {movie.images?.backdrops && <PhotosSection images={movie.images.backdrops as Image[]} />}
          <RelatedSection movie={movie} />
        </div>
      </Suspense>
    </div>
  );
};

export default MovieDetailClient;
