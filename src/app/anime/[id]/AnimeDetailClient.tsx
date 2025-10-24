"use client";

import { Suspense, use } from "react";
import { Spinner } from "@heroui/spinner";
import { Button } from "@heroui/react";
import { notFound } from "next/navigation";
import dynamic from "next/dynamic";
import { Params } from "@/types";
import { NextPage } from "next";
import { useScrollIntoView } from "@mantine/hooks";
import SectionTitle from "@/components/ui/other/SectionTitle";
import { useAnimeDetailWithFallback } from "@/hooks/useAnimeDetailWithFallback";

const BackdropSection = dynamic(() => import("@/components/sections/Anime/Detail/Backdrop"));
const OverviewSection = dynamic(() => import("@/components/sections/Anime/Detail/Overview"));
const TopCastsSection = dynamic(() => import("@/components/sections/Anime/Detail/TopCasts"));
const PhotosSection = dynamic(() => import("@/components/sections/Anime/Detail/Photos"));
const RelatedSection = dynamic(() => import("@/components/sections/Anime/Detail/Related"));
const AnimeEpisodes = dynamic(() => import("@/components/sections/Anime/Detail/Episodes"));

interface AnimeDetailClientProps {
  id: number;
}

const AnimeDetailClient: NextPage<AnimeDetailClientProps> = ({ id }) => {
  const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({ duration: 500 });

  const {
    data: anime,
    isPending,
    error,
    refetch,
  } = useAnimeDetailWithFallback({ id });

  if (isPending) {
    return (
      <div className="relative mx-auto max-w-5xl min-h-[60vh]">
        <Spinner size="lg" className="absolute-center" variant="simple" color="danger" />
      </div>
    );
  }

  if (error) {
    const message = (error as Error)?.message || "Unknown error";
    if (message.startsWith("NOT_FOUND")) {
      notFound();
    }

    const isRateLimited = message.startsWith("RATE_LIMIT") || /429|Too many/i.test(message);
    const isServerError = message.startsWith("HTTP_5") || /500|502|503|504/i.test(message);

    return (
      <div className="relative mx-auto max-w-5xl min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <p className="text-default-500 text-center">
          {isRateLimited
            ? "You're temporarily rate-limited by AniList. Please try again shortly."
            : isServerError
            ? "AniList is experiencing server issues. We're trying alternative sources..."
            : "Failed to load this anime right now. Please try again."}
        </p>
        <Button color="danger" variant="shadow" onPress={() => refetch()}>Retry</Button>
        {process.env.NODE_ENV !== "production" && (
          <p className="text-xs text-default-400 break-all px-4 text-center">{message}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Suspense
        fallback={
          <div className="relative min-h-[60vh]">
            <Spinner size="lg" className="absolute-center" variant="simple" color="danger" />
          </div>
        }
      >
        <div className="flex flex-col gap-10">
          <BackdropSection anime={anime} />
          <OverviewSection
            anime={anime}
            onViewEpisodesClick={() => scrollIntoView({ alignment: "center" })}
          />
          <TopCastsSection anime={anime} />
          <PhotosSection anime={anime} />
          {anime.format !== "MOVIE" && (
            <section ref={targetRef} id="episodes" className="z-3 flex flex-col gap-2">
              <SectionTitle color="danger">{anime.episodes && anime.episodes > 1 ? "Season & Episode" : "Episode"}</SectionTitle>
              <AnimeEpisodes anime={anime} />
            </section>
          )}
          <RelatedSection anime={anime} />
        </div>
      </Suspense>
    </div>
  );
};

export default AnimeDetailClient;
