"use client";

import BackToTopButton from "@/components/ui/button/BackToTopButton";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { memo, useEffect } from "react";
import AnimePosterCard from "../Anime/Cards/Poster";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useFetchDiscoverAnime from "@/hooks/useFetchDiscoverAnime";
import { DiscoverAnimeFetchQueryType } from "@/types/movie";
import Loop from "@/components/ui/other/Loop";
import PosterCardSkeleton from "@/components/ui/other/PosterCardSkeleton";
import { getLoadingLabel } from "@/utils/movies";

const AnimeDiscoverList = () => {
  const { ref, inViewport } = useInViewport();
  const { genresString, queryType } = useDiscoverFilters();

  const { data, isPending, status, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      queryKey: ["discover-anime", queryType, genresString],
      queryFn: ({ pageParam }) =>
        useFetchDiscoverAnime({
          page: pageParam,
          type: queryType as DiscoverAnimeFetchQueryType,
          genres: genresString,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.Page.pageInfo.currentPage < lastPage.Page.pageInfo.lastPage 
          ? lastPage.Page.pageInfo.currentPage + 1 
          : undefined,
    });

  useEffect(() => {
    if (inViewport && !isPending) {
      fetchNextPage();
    }
  }, [inViewport]);

  if (status === "error") return notFound();

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="movie-grid">
          <Loop count={20} prefix="SkeletonDiscoverAnimePosterCard">
            <PosterCardSkeleton variant="bordered" />
          </Loop>
        </div>
      </div>
    );
  }

  // Check if we have data and media
  const hasData = data && data.pages && data.pages.length > 0;
  const hasMedia = hasData && data.pages.some(page => page.Page && page.Page.media && page.Page.media.length > 0);

  if (!hasData || !hasMedia) {
    return (
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">No anime found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-10">
      <div className="movie-grid">
        {data.pages.map((page) => {
          if (!page.Page || !page.Page.media) {
            return null;
          }
          return page.Page.media.map((anime: any) => {
            return <AnimePosterCard key={anime.id} anime={anime} variant="bordered" isUpcoming={queryType === "upcoming"} />;
          });
        })}
      </div>
      <div ref={ref} className="flex h-24 items-center justify-center">
        {isFetchingNextPage && <Spinner size="lg" variant="wave" label={getLoadingLabel()} />}
        {!hasNextPage && !isPending && (
          <p className="text-muted-foreground text-center text-base">
            You have reached the end of the list.
          </p>
        )}
      </div>
      <BackToTopButton />
    </div>
  );
};

export default memo(AnimeDiscoverList);
