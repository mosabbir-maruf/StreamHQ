"use client";

import { tmdb } from "@/api/tmdb";
import { DiscoverTvShowsFetchQueryType } from "@/types/movie";
import { TvShowDiscoverResult } from "tmdb-ts/dist/types/discover";

interface FetchDiscoverTvShows {
  page?: number;
  type?: DiscoverTvShowsFetchQueryType;
  genres?: string;
}

const useFetchDiscoverTvShows = ({
  page = 1,
  type = "discover",
  genres,
}: FetchDiscoverTvShows): Promise<TvShowDiscoverResult> => {
  const discover = () => tmdb.discover.tvShow({ page: page, with_genres: genres });
  const todayTrending = () => tmdb.trending.trending("tv", "day", { page: page });
  const thisWeekTrending = () => tmdb.trending.trending("tv", "week", { page: page });
  const popular = () =>
    tmdb.discover.tvShow({
      page: page,
      with_genres: genres,
      sort_by: "popularity.desc",
      "first_air_date.lte": new Date().toISOString().split("T")[0],
      include_adult: false,
      "vote_count.gte": 10,
    } as any);
  const onTheAir = () => tmdb.tvShows.onTheAir({ page: page });
  const topRated = () => tmdb.tvShows.topRated({ page: page });
  const bollywoodTv = () =>
    // Hindi-language TV shows
    tmdb.discover.tvShow({
      page: page,
      with_original_language: "hi",
      with_genres: genres,
      sort_by: "first_air_date.desc",
      "first_air_date.lte": new Date().toISOString().split("T")[0],
      include_adult: false,
      "vote_count.gte": 10,
    } as any);

  const tamilTv = () =>
    tmdb.discover.tvShow({
      page: page,
      with_original_language: "ta",
      with_genres: genres,
      sort_by: "first_air_date.desc",
      "first_air_date.lte": new Date().toISOString().split("T")[0],
      include_adult: false,
      "vote_count.gte": 10,
    } as any);


  const queryData = {
    discover,
    todayTrending,
    thisWeekTrending,
    popular,
    onTheAir,
    topRated,
    bollywoodTv,
    tamilTv,
    banglaTv: () =>
      tmdb.discover.tvShow({
        page: page,
        with_origin_country: "BD",
        with_genres: genres,
        sort_by: "first_air_date.desc",
        "first_air_date.lte": new Date().toISOString().split("T")[0],
        include_adult: false,
      } as any),
  }[type];

  // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
  return queryData();
};

export default useFetchDiscoverTvShows;
