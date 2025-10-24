"use client";

import { tmdb } from "@/api/tmdb";
import { queryClient } from "@/app/providers";
import TvShowHomeCard from "@/components/sections/TV/Cards/Poster";
import AnimePosterCard from "@/components/sections/Anime/Cards/Poster";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import { ContentType } from "@/types";
import { isEmpty } from "@/utils/helpers";
import { getLoadingLabel } from "@/utils/movies";
import { getSpinnerColor } from "@/utils/spinner";
import { Spinner } from "@heroui/react";
import { useInViewport } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Movie, Search, TV } from "tmdb-ts/dist/types";
import MoviePosterCard from "../Movie/Cards/Poster";
import SearchFilter from "./Filter";
import { anilist } from "@/api/anilist";
import { mal } from "@/api/mal";
import { transformMALListToAniList } from "@/utils/malTransformer";
import { AnimeListResponse } from "@/api/anilist";

// Cache to track which search queries are using MAL fallback
const searchFallbackCache = new Map<string, boolean>();

type FetchType = {
  page: number;
  type: ContentType;
  query: string;
};

interface AnimeSearchResult {
  page: number;
  results: any[];
  total_results: number;
  total_pages: number;
}

const fetchData = async ({
  page,
  type = "movie",
  query,
}: FetchType): Promise<Search<Movie> | Search<TV> | AnimeSearchResult> => {
  if (type === "anime") {
    // Create a unique cache key for this search query
    const cacheKey = `search-${query}-${page}`;
    
    // Check if we're already using MAL fallback for this search
    if (searchFallbackCache.get(cacheKey)) {
      return await searchFromMAL(query, page);
    }

    try {
      const res = await anilist.searchAnime(query, page);
      // Transform to match Search interface structure
      return {
        page: res.Page.pageInfo.currentPage,
        results: res.Page.media,
        total_results: res.Page.pageInfo.total,
        total_pages: res.Page.pageInfo.lastPage,
      };
      } catch (error) {
        // AniList search failed, trying MAL fallback
      
      // Check if it's a rate limit error
      const isRateLimited = error instanceof Error && 
        (error.message.startsWith("RATE_LIMIT") || /429|Too many/i.test(error.message));
      
      if (!isRateLimited) {
        // If it's not a rate limit error, re-throw it
        throw error;
      }

      
      // Mark this search as using MAL fallback
      searchFallbackCache.set(cacheKey, true);
      
      // Set a timeout to reset the fallback after 5 minutes
      setTimeout(() => {
        searchFallbackCache.delete(cacheKey);
      }, 5 * 60 * 1000);

      try {
        return await searchFromMAL(query, page);
        } catch (malError) {
          // MAL search also failed
        // If MAL also fails, throw the original AniList error
        throw error;
      }
    }
  }
  
  if (type === "movie") {
    const res = await tmdb.search.movies({ query, page });
    // Filter out movies with runtime < 30 minutes by fetching details for current page results
    const filtered = await Promise.all(
      res.results.map(async (m) => {
        try {
          const details = await tmdb.movies.details(m.id);
          return details.runtime !== null && details.runtime < 30 ? null : m;
        } catch {
          // If details fail, keep the item (fail-open) rather than hiding potentially valid results
          return m;
        }
      })
    );
    return { ...res, results: filtered.filter((x): x is Movie => Boolean(x)) } as Search<Movie>;
  }
  return tmdb.search.tvShows({ query, page });
};

// Helper function to search from MAL
async function searchFromMAL(query: string, page: number): Promise<AnimeSearchResult> {
  const malResponse = await mal.searchAnime(query, page, 20);
  const transformedResponse = transformMALListToAniList(malResponse);
  
  // Transform to match Search interface structure
  return {
    page: transformedResponse.Page.pageInfo.currentPage,
    results: transformedResponse.Page.media,
    total_results: transformedResponse.Page.pageInfo.total,
    total_pages: transformedResponse.Page.pageInfo.lastPage,
  };
}

const SearchList = () => {
  const { content } = useDiscoverFilters();
  const { ref, inViewport } = useInViewport();
  const [submittedSearchQuery, setSubmittedSearchQuery] = useState("");
  const triggered = !isEmpty(submittedSearchQuery);
  const { data, isFetching, isPending, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteQuery({
      enabled: triggered,
      queryKey: ["search-list", content, submittedSearchQuery],
      queryFn: ({ pageParam: page }) =>
        fetchData({ page, type: content, query: submittedSearchQuery }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    });

  useEffect(() => {
    if (inViewport) {
      fetchNextPage();
    }
  }, [inViewport]);

  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["search-list"] });
  }, [content]);

  const renderSearchResults = useMemo(() => {
    return () => {
      if (isEmpty(data?.pages[0].results)) {
        const contentLabel = content === "movie" ? "movies" : content === "tv" ? "TV series" : "anime";
        const queryColorClass = content === "movie" ? "text-primary" : content === "tv" ? "text-warning" : "text-danger";
        return (
          <h5 className="mt-56 text-center text-xl">
            No {contentLabel} found with query{" "}
            <span className={`${queryColorClass} font-semibold`}>"{submittedSearchQuery}"</span>
          </h5>
        );
      }

      const contentLabel = content === "movie" ? "movies" : content === "tv" ? "TV series" : "anime";
      const spinnerColor = content === "movie" ? "primary" : content === "tv" ? "warning" : "danger";
      const queryColorClass = content === "movie" ? "text-primary" : content === "tv" ? "text-warning" : "text-danger";

      return (
        <>
          <h5 className="text-center text-xl">
            <span className="motion-preset-focus">
              Found{" "}
              <span className="text-success font-semibold">{data?.pages[0].total_results}</span>{" "}
              {contentLabel} with query{" "}
              <span className={`${queryColorClass} font-semibold`}>"{submittedSearchQuery}"</span>
            </span>
          </h5>
          <div className="movie-grid">
            {content === "movie"
              ? data?.pages.map((page) =>
                  page.results.map((movie: any) => (
                    <MoviePosterCard key={movie.id} movie={movie as Movie} variant="bordered" />
                  )),
                )
              : content === "tv"
              ? data?.pages.map((page) =>
                  page.results.map((tv: any) => (
                    <TvShowHomeCard key={tv.id} tv={tv as TV} variant="bordered" />
                  )),
                )
              : data?.pages.map((page) =>
                  page.results.map((anime: any) => (
                    <AnimePosterCard key={anime.id} anime={anime as any} variant="bordered" />
                  )),
                )}
          </div>
        </>
      );
    };
  }, [content, data?.pages, submittedSearchQuery]);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <SearchFilter
        isLoading={isFetching}
        onSearchSubmit={(value) => setSubmittedSearchQuery(value.trim())}
      />
      {triggered && (
        <>
          <div className="relative flex flex-col items-center gap-8 w-full">
            {isPending ? (
              <Spinner
                size="lg"
                className="mt-20"
                color={getSpinnerColor(content)}
                variant="simple"
              />
            ) : (
              renderSearchResults()
            )}
          </div>
          <div ref={ref} className="flex h-24 items-center justify-center">
            {isFetchingNextPage && (
              <Spinner
                color={getSpinnerColor(content)}
                size="lg"
                variant="wave"
                label={getLoadingLabel()}
              />
            )}
            {!isEmpty(data?.pages[0].results) && !hasNextPage && !isPending && (
              <p className="text-muted-foreground text-center text-base">
                You have reached the end of the list.
              </p>
            )}
          </div>
        </>
      )}

      <BackToTopButton />
    </div>
  );
};

export default SearchList;
