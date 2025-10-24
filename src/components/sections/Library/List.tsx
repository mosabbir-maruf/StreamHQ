"use client";

import { getWatchlist, removeAllWatchlist } from "@/actions/library";
import { queryClient } from "@/app/providers";
import BackToTopButton from "@/components/ui/button/BackToTopButton";
import ContentTypeSelection from "@/components/ui/other/ContentTypeSelection";
import SectionTitle from "@/components/ui/other/SectionTitle";
import useDiscoverFilters from "@/hooks/useDiscoverFilters";
import useSupabaseUser from "@/hooks/useSupabaseUser";
import useBreakpoints from "@/hooks/useBreakpoints";
import { isEmpty } from "@/utils/helpers";
import { Trash } from "@/utils/icons";
import { addToast, Button, Select, SelectItem, Spinner } from "@heroui/react";
import { useDisclosure, useInViewport } from "@mantine/hooks";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import MoviePosterCard from "../Movie/Cards/Poster";
import TvShowPosterCard from "../TV/Cards/Poster";
import AnimePosterCard from "../Anime/Cards/Poster";
import { getLoadingLabel } from "@/utils/movies";
import { getSpinnerColor } from "@/utils/spinner";
import { ITEMS_PER_PAGE } from "@/utils/constants";
import ConfirmationModal from "@/components/ui/overlay/ConfirmationModal";
import DeleteWatchlistButton from "@/components/ui/button/DeleteWatchlistButton";

type SortOption = "title" | "release_date" | "vote_average" | "created_at";
type FilterType = "movie" | "tv" | "anime" | "all";

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "release_date", label: "Release" },
  { key: "vote_average", label: "Rating" },
  { key: "created_at", label: "Date Added" },
];


const LibraryList = () => {
  const { ref, inViewport } = useInViewport();
  const { content } = useDiscoverFilters();
  const { data: user, isLoading: isUserLoading } = useSupabaseUser();
  const { mobile } = useBreakpoints();
  const [isPending, startTransition] = useTransition();

  const getContentTypeColors = () => {
    switch (content) {
      case "movie":
        return "primary";
      case "tv":
        return "warning";
      case "anime":
        return "danger";
      default:
        return "success";
    }
  };
  const [sortOption, setSortOption] = useState<SortOption>("created_at");
  const [showCompleted, setShowCompleted] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } =
    useInfiniteQuery({
      queryKey: ["watchlist", content, user?.id, showCompleted],
      queryFn: async ({ pageParam = 1 }) => {
        if (!user) return { success: true, data: [], hasNextPage: false };
        return await getWatchlist(content as FilterType, pageParam, ITEMS_PER_PAGE, showCompleted ? "done" : "undone");
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, pages) => {
        if (lastPage.hasNextPage) {
          return pages.length + 1;
        }
        return undefined;
      },
      enabled: !isUserLoading,
      staleTime: 1000 * 30, // 30 seconds for better responsiveness
    });

  useEffect(() => {
    if (inViewport && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inViewport]);

  const clearWatchlistMutation = useMutation({
    mutationFn: async (type: "movie" | "tv" | "anime") => {
      if (!user) throw new Error("User not authenticated");
      const result = await removeAllWatchlist(type, showCompleted);
      if (!result.success) {
        throw new Error(result.error || "Failed to clear watchlist");
      }
      const allItems = data?.pages.flatMap((page) => page.data || []) || [];
      const count = allItems.filter((item) => item.type === type).length;
      return { type, count, isCompleted: showCompleted };
    },
    onSuccess: ({ type, count, isCompleted }) => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });

      addToast({
        title: `Cleared ${count} ${isCompleted ? "completed " : ""}${type === "movie" ? "movies" : type === "tv" ? "TV shows" : "anime"}!`,
        color: getContentTypeColors(),
        icon: <Trash />,
      });

      close();
    },
    onError: (error) => {
      addToast({
        title: "Error",
        description: "Failed to clear watchlist. Please try again.",
        color: "danger",
      });
      // Clear watchlist error
    },
  });

  const sortedWatchlist = useMemo(() => {
    if (!data?.pages) return [];

    const allItems = data.pages.flatMap((page) => page.data || []);

    return [...allItems].sort((a, b) => {
      switch (sortOption) {
        case "vote_average":
        case "release_date":
          return b[sortOption] > a[sortOption] ? 1 : -1;
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }, [data?.pages, sortOption]);

  const confirmClearWatchlist = () => {
    startTransition(() => {
      if (content === "movie" || content === "tv" || content === "anime") {
        clearWatchlistMutation.mutate(content);
      }
    });
  };

  if (status === "error") {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-danger">Failed to load watchlist</p>
        <Button color="primary" onPress={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  const hasItems = !isEmpty(sortedWatchlist);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex w-full flex-col items-center justify-center gap-2">
          <ContentTypeSelection className="justify-center" />
          <div className="flex w-full flex-row items-center justify-end gap-1.5">
            <Select
              aria-label="Sort"
              size="sm"
              placeholder="Sort"
              className="w-32 sm:w-36 h-9"
              selectedKeys={[sortOption]}
              onChange={({ target }) => setSortOption(target.value as SortOption)}
            >
              {SORT_OPTIONS.map(({ key, label }) => (
                <SelectItem key={key}>{label}</SelectItem>
              ))}
            </Select>
            <Button
              color={showCompleted ? "success" : "default"}
              variant={showCompleted ? "shadow" : "bordered"}
              size="sm"
              onPress={() => setShowCompleted(!showCompleted)}
              className="px-3"
            >
              {showCompleted ? "Completed" : "Watchlist"}
            </Button>
            {hasItems && (
              <Button
                startContent={<Trash />}
                color="danger"
                variant="shadow"
                size="sm"
                onPress={() => {
                  if (user) open();
                }}
                isLoading={clearWatchlistMutation.isPending || isPending}
                className="px-3"
              >
                <span className="hidden sm:inline">
                  Clear {showCompleted ? "Completed " : ""}{content === "movie" ? "Movies" : content === "tv" ? "TV Shows" : "Anime"}
                </span>
                <span className="sm:hidden">
                  Clear
                </span>
              </Button>
            )}
          </div>
        </div>
        
        <SectionTitle 
          color={getSpinnerColor(content)}
        >
          {showCompleted 
            ? `Completed ${content === "movie" ? "Movies" : content === "tv" ? "TV Shows" : "Anime"}`
            : `My ${content === "movie" ? "Movies" : content === "tv" ? "TV Shows" : "Anime"}`
          }
        </SectionTitle>
        {status === "pending" ? (
          <Spinner
            size="lg"
            variant="simple"
            className="absolute-center mt-[30vh]"
            color={getSpinnerColor(content)}
          />
        ) : hasItems ? (
          <>
            <div className="movie-grid">
              {sortedWatchlist.map((data) => {
                if (data.type === "tv") {
                  return (
                    <div key={`tv-${data.id}`} className="relative group">
                      <Suspense>
                        <TvShowPosterCard
                          variant="bordered"
                          // @ts-expect-error: Type conversion for compatibility
                          tv={{
                            adult: data.adult,
                            backdrop_path: data.backdrop_path,
                            first_air_date: data.release_date,
                            id: data.id,
                            name: data.title,
                            poster_path: data.poster_path || "",
                            vote_average: data.vote_average,
                          }}
                        />
                      </Suspense>
                      <div className={`absolute top-2 right-2 z-10 transition-all duration-300 transform ${mobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:scale-110'}`}>
                        <DeleteWatchlistButton
                          id={data.id}
                          type={data.type}
                          title={data.title}
                          variant="icon"
                          size="sm"
                          className="shadow-lg"
                        />
                      </div>
                    </div>
                  );
                }
                if (data.type === "anime") {
                  return (
                    <div key={`anime-${data.id}`} className="relative group">
                      <Suspense>
                        <AnimePosterCard
                          variant="bordered"
                          anime={{
                            id: data.id,
                            title: {
                              romaji: data.title,
                              english: data.title,
                              native: data.title,
                            },
                            coverImage: {
                              large: data.poster_path || "",
                              extraLarge: data.poster_path || "",
                              medium: data.poster_path || "",
                            },
                            startDate: {
                              year: data.release_date ? parseInt(data.release_date.split('-')[0]) : undefined,
                            },
                            averageScore: data.vote_average * 10, // Convert from 10-point to 100-point scale
                            isAdult: data.adult,
                          }}
                        />
                      </Suspense>
                      <div className={`absolute top-2 right-2 z-10 transition-all duration-300 transform ${mobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:scale-110'}`}>
                        <DeleteWatchlistButton
                          id={data.id}
                          type={data.type}
                          title={data.title}
                          variant="icon"
                          size="sm"
                          className="shadow-lg"
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={`movie-${data.id}`} className="relative group">
                    <Suspense>
                      <MoviePosterCard
                        variant="bordered"
                        // @ts-expect-error: Type conversion for compatibility
                        movie={{
                          adult: data.adult,
                          backdrop_path: data.backdrop_path,
                          id: data.id,
                          poster_path: data.poster_path || "",
                          release_date: data.release_date,
                          title: data.title,
                          vote_average: data.vote_average,
                        }}
                      />
                    </Suspense>
                    <div className={`absolute top-2 right-2 z-10 transition-all duration-300 transform ${mobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-hover:scale-110'}`}>
                      <DeleteWatchlistButton
                        id={data.id}
                        type={data.type}
                        title={data.title}
                        variant="icon"
                        size="sm"
                        className="shadow-lg"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div ref={ref} className="flex h-24 items-center justify-center">
              {isFetchingNextPage && (
                <Spinner
                  size="lg"
                  variant="wave"
                  label={getLoadingLabel()}
                  color={getSpinnerColor(content)}
                />
              )}
              {!hasNextPage && !isFetchingNextPage && sortedWatchlist.length > 0 && (
                <p className="text-muted-foreground text-center text-base">
                  You have reached the end of your watchlist.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-[30vh] items-center justify-center">
            <p className="text-default-500">
              {showCompleted 
                ? `No completed ${content === "movie" ? "movies" : content === "tv" ? "TV shows" : "anime"} yet.`
                : `No ${content === "movie" ? "movies" : content === "tv" ? "TV shows" : "anime"} in your watchlist yet.`
              }
            </p>
          </div>
        )}
      </div>

      <BackToTopButton />

      <ConfirmationModal
        title={`Clear ${showCompleted ? "Completed " : ""}${content === "movie" ? "Movies" : content === "tv" ? "TV Shows" : "Anime"}?`}
        isOpen={opened}
        onClose={close}
        onConfirm={confirmClearWatchlist}
        confirmLabel="Clear All"
        isLoading={clearWatchlistMutation.isPending}
      >
        <p>
          Are you sure you want to remove all {showCompleted ? "completed " : ""}{content === "movie" ? "movies" : content === "tv" ? "TV shows" : "anime"}? This action cannot be undone.
        </p>
        <p className="text-default-500 text-sm">
          {sortedWatchlist.length} {sortedWatchlist.length === 1 ? "item" : "items"} will be
          removed.
        </p>
      </ConfirmationModal>
    </>
  );
};

export default LibraryList;
