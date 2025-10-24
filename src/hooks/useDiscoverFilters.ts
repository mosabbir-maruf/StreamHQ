import { queryClient as q } from "@/app/providers";
import { siteConfig } from "@/config/site";
import { DISCOVER_MOVIES_VALID_QUERY_TYPES, DISCOVER_TVS_VALID_QUERY_TYPES, DISCOVER_ANIME_VALID_QUERY_TYPES } from "@/types/movie";
import { parseAsSet } from "@/utils/parsers";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { useCallback, useMemo, useEffect } from "react";

const VALID_CONTENT_TYPES = ["movie", "tv", "anime"] as const;
const DEFAULT_QUERY_TYPE = "discover";

const useDiscoverFilters = () => {
  const { movies, tvShows, anime } = siteConfig.queryLists;

  const [genres, setGenres] = useQueryState("genres", parseAsSet.withDefault(new Set([])));
  const [queryType, setQueryType] = useQueryState(
    "type",
    parseAsStringLiteral([
      ...DISCOVER_MOVIES_VALID_QUERY_TYPES,
      ...DISCOVER_TVS_VALID_QUERY_TYPES,
      ...DISCOVER_ANIME_VALID_QUERY_TYPES,
    ]).withDefault(DEFAULT_QUERY_TYPE),
  );
  const [content, setContent] = useQueryState(
    "content",
    parseAsStringLiteral(VALID_CONTENT_TYPES).withDefault("movie"),
  );

  const types = useMemo(
    () => [
      { name: "Discover", key: DEFAULT_QUERY_TYPE },
      ...(content === "movie" ? movies : content === "tv" ? tvShows : anime).map(({ name, param }) => ({
        name: content === "anime" 
          ? name 
          : name.replace(/(Movies|TV Shows|Anime)/g, "").trim(),
        key: param,
      })),
    ],
    [content, movies, tvShows, anime],
  );

  const genresString = useMemo(
    () =>
      Array.from(genres)
        .filter((genre) => genre !== "")
        .join(","),
    [genres],
  );

  const resetFilters = useCallback(() => {
    setGenres(null);
    setQueryType(DEFAULT_QUERY_TYPE);
  }, [setGenres, setQueryType]);

  const clearQueries = useCallback(() => {
    const queryKeys = ["discover-movies", "discover-tv-shows", "discover-anime"];
    queryKeys.forEach((key) => {
      if (!q.isFetching({ queryKey: [key] })) {
        q.removeQueries({ queryKey: [key] });
      }
    });
  }, [q]);

  useEffect(() => {
    clearQueries();
  }, [content, queryType, genresString]);

  // Store content type in sessionStorage for auth page detection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('lastContentType', content);
    }
  }, [content]);

  return {
    types,
    genres,
    queryType,
    content,
    genresString,
    setGenres,
    setQueryType,
    setContent,
    resetFilters,
  };
};

export default useDiscoverFilters;
