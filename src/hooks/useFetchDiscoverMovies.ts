"use client";

import { tmdb } from "@/api/tmdb";
import { DiscoverMoviesFetchQueryType } from "@/types/movie";
import { MovieDiscoverResult } from "tmdb-ts/dist/types/discover";

interface FetchDiscoverMovies {
  page?: number;
  type?: DiscoverMoviesFetchQueryType;
  genres?: string;
}

const useFetchDiscoverMovies = ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverMovies): Promise<MovieDiscoverResult> => {
  const discover = () => tmdb.discover.movie({ 
    page: page, 
    with_genres: genres,
    include_adult: false,
    "with_runtime.gte": 30,
  });
  const todayTrending = () => tmdb.trending.trending("movie", "day", { page });
  const thisWeekTrending = () => tmdb.trending.trending("movie", "week", { page });
  const popular = () => tmdb.discover.movie({ 
    page: page, 
    with_genres: genres,
    sort_by: "popularity.desc",
    "release_date.lte": new Date().toISOString().split('T')[0],
    include_adult: false,
    "with_runtime.gte": 30,
    "vote_count.gte": 10
  });
  const nowPlaying = () => tmdb.movies.nowPlaying({ page });
  const upcoming = () => tmdb.discover.movie({ 
    page: page, 
    with_genres: genres,
    sort_by: "primary_release_date.asc",
    "primary_release_date.gte": new Date().toISOString().split('T')[0],
    include_adult: false,
    "with_runtime.gte": 30,
    "vote_count.gte": 10
  });
  const topRated = () => tmdb.movies.topRated({ page });
  const bollywood = () => tmdb.discover.movie({ 
    page: page, 
    with_original_language: "hi",
    with_genres: genres,
    sort_by: "release_date.desc",
    "release_date.lte": new Date().toISOString().split('T')[0], // Only movies released on or before today
    include_adult: false, // Exclude adult content
    "with_runtime.gte": 30, // Minimum runtime: 30 minutes
    "vote_count.gte": 10 // Only include movies with at least 10 votes to ensure meaningful ratings
  });
  const tamil = () => tmdb.discover.movie({
    page: page,
    with_original_language: "ta",
    with_genres: genres,
    sort_by: "release_date.desc",
    "release_date.lte": new Date().toISOString().split('T')[0],
    include_adult: false,
    "with_runtime.gte": 30,
    "vote_count.gte": 10,
  });
  const kannada = () => tmdb.discover.movie({
    page: page,
    with_original_language: "kn",
    with_genres: genres,
    sort_by: "release_date.desc",
    "release_date.lte": new Date().toISOString().split('T')[0],
    include_adult: false,
    "with_runtime.gte": 30,
    "vote_count.gte": 10,
  });
  const malayalam = () => tmdb.discover.movie({
    page: page,
    with_original_language: "ml",
    with_genres: genres,
    sort_by: "release_date.desc",
    "release_date.lte": new Date().toISOString().split('T')[0],
    include_adult: false,
    "with_runtime.gte": 30,
    "vote_count.gte": 10,
  });
  const telugu = () => tmdb.discover.movie({
    page: page,
    with_original_language: "te",
    with_genres: genres,
    sort_by: "release_date.desc",
    "release_date.lte": new Date().toISOString().split('T')[0],
    include_adult: false,
    "with_runtime.gte": 30,
    "vote_count.gte": 10,
  });
  const bangla = () =>
    tmdb.discover.movie(
      {
        page: page,
        with_origin_country: "BD",
        with_genres: genres,
        sort_by: "release_date.desc",
        "release_date.lte": new Date().toISOString().split('T')[0],
        include_adult: false,
        "with_runtime.gte": 60,
      } as any,
    );

  const queryData = {
    discover,
    todayTrending,
    thisWeekTrending,
    popular,
    nowPlaying,
    upcoming,
    topRated,
    bollywood,
    tamil,
    kannada,
    malayalam,
    telugu,
    bangla,
  }[type];

  return queryData();
};

export default useFetchDiscoverMovies;
