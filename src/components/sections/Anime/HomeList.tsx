"use client";

import { AnimeListResponse } from "@/api/anilist";
import SectionTitle from "../../ui/other/SectionTitle";
import Carousel from "../../ui/wrapper/Carousel";
import AnimePosterCard from "./Cards/Poster";
import { Link, Skeleton } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { kebabCase } from "string-ts";
import { cachedFetch, getCacheKey } from "@/utils/apiCache";

export interface AnimeHomeListProps {
  name: string;
  query: () => Promise<AnimeListResponse>;
  param: string;
}

const AnimeHomeList: React.FC<AnimeHomeListProps> = ({ name, query, param }) => {
  // Use param for stable, hydration-safe ids/keys across server and client
  const key = `${param}-anime-list`;
  const { ref, inViewport } = useInViewport();
  
  // Enhanced query with smart caching
  const { data, isPending } = useQuery({
    queryFn: async () => {
      // Use cached fetch for better performance
      const cacheKey = key;
      return cachedFetch(cacheKey, query, 5 * 60 * 1000);
    },
    queryKey: ["anime-home-list", param],
    enabled: true, // Always enable to load sections progressively
    staleTime: 10 * 60 * 1000, // 10 minutes - longer for better performance
    gcTime: 30 * 60 * 1000, // 30 minutes - keep in memory longer
    retry: 1, // Reduce retries for faster failure
    retryDelay: 500, // Faster retry
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });


  // Force all anime section titles to use red (danger) indicator
  const titleColor = "danger";

  return (
    <section id={key} className="min-h-[250px] md:min-h-[300px]" ref={ref}>
      {isPending ? (
        <div className="flex w-full flex-col gap-5">
          <div className="flex grow items-center justify-between">
            <Skeleton className="h-7 w-40 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-[250px] rounded-lg md:h-[300px]" />
        </div>
      ) : (
        <div className="z-3 flex flex-col gap-2">
          <div className="flex grow items-center justify-between">
            <SectionTitle color={titleColor as any}>{name}</SectionTitle>
            <Link
              size="sm"
              href={`/discover?content=anime&type=${param}`}
              isBlock
              color="foreground"
              className="rounded-full"
            >
              See All &gt;
            </Link>
          </div>
          <Carousel>
            {data?.Page?.media?.map((anime) => (
              <div key={anime.id} className="embla__slide flex min-h-fit max-w-fit items-center px-1 py-2">
                <AnimePosterCard anime={anime} isUpcoming={param === "upcoming"} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </section>
  );
};

export default AnimeHomeList;

