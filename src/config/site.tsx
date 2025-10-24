import { tmdb } from "@/api/tmdb";
import { SiteConfigType } from "@/types";
import { GoHomeFill, GoHome } from "react-icons/go";
import { IoIosSunny } from "react-icons/io";
import { IoCompass, IoCompassOutline, IoMoon, IoSearch, IoSearchOutline } from "react-icons/io5";
import { TbFolder, TbFolderFilled } from "react-icons/tb";
export const siteConfig: SiteConfigType = {
  name: "StreamHQ",
  description: "Your ultimate binge-watching paradise! Movies, TV shows, and anime galore - all free, all awesome!",
  favicon: "/favicon.ico",
  navItems: [
    {
      label: "Home",
      href: "/",
      icon: <GoHome className="size-full" />,
      activeIcon: <GoHomeFill className="size-full" />,
    },
    {
      label: "Discover",
      href: "/discover",
      icon: <IoCompassOutline className="size-full" />,
      activeIcon: <IoCompass className="size-full" />,
    },
    {
      label: "Library",
      href: "/library",
      icon: <TbFolder className="size-full" />,
      activeIcon: <TbFolderFilled className="size-full" />,
    },
  ],
  themes: [
    {
      name: "dark",
      icon: <IoMoon className="size-full" />,
    },
    {
      name: "light",
      icon: <IoIosSunny className="size-full" />,
    },
  ],
  queryLists: {
    anime: [
      {
        name: "Trending",
        query: async () => {
          const { anilist } = await import("@/api/anilist");
          return anilist.getTrending();
        },
        param: "trending",
      },
      {
        name: "Currently Airing",
        query: async () => {
          const { anilist } = await import("@/api/anilist");
          return anilist.getCurrentlyAiring();
        },
        param: "airing",
      },
      {
        name: "Popular",
        query: async () => {
          const { anilist } = await import("@/api/anilist");
          return anilist.getPopular();
        },
        param: "popular",
      },
      {
        name: "Top Rated",
        query: async () => {
          const { anilist } = await import("@/api/anilist");
          return anilist.getTopRated();
        },
        param: "topRated",
      },
      {
        name: "Upcoming",
        query: async () => {
          const { anilist } = await import("@/api/anilist");
          return anilist.getUpcoming();
        },
        param: "upcoming",
      },
      {
        name: "Movies",
        query: async () => {
          const { anilist } = await import("@/api/anilist");
          return anilist.getMovies();
        },
        param: "animeMovies",
      },
    ],
    movies: [
      {
        name: "This Week's Trending Movies",
        query: () => tmdb.trending.trending("movie", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Popular Movies",
        query: () => tmdb.discover.movie({
          sort_by: "popularity.desc",
          "release_date.lte": new Date().toISOString().split('T')[0],
          include_adult: false,
          "with_runtime.gte": 30,
          "vote_count.gte": 10,
        }),
        param: "popular",
      },
      {
        name: "Now Playing Movies",
        query: () => tmdb.movies.nowPlaying(),
        param: "nowPlaying",
      },
      {
        name: "Bollywood",
        query: () => tmdb.discover.movie({ 
          with_original_language: "hi",
          sort_by: "release_date.desc",
          "release_date.lte": new Date().toISOString().split('T')[0], // Only movies released on or before today
          include_adult: false, // Exclude adult content
          "with_runtime.gte": 60, // Minimum 60 minutes to ensure it's a movie, not a short or TV episode
          "vote_count.gte": 10 // Only include movies with at least 10 votes to ensure meaningful ratings
        }),
        param: "bollywood",
      },
      {
        name: "Tamil",
        query: () => tmdb.discover.movie({
          with_original_language: "ta",
          sort_by: "release_date.desc",
          "release_date.lte": new Date().toISOString().split('T')[0],
          include_adult: false,
          "with_runtime.gte": 60,
          "vote_count.gte": 10,
        }),
        param: "tamil",
      },
      {
        name: "Telugu",
        query: () => tmdb.discover.movie({
          with_original_language: "te",
          sort_by: "release_date.desc",
          "release_date.lte": new Date().toISOString().split('T')[0],
          include_adult: false,
          "with_runtime.gte": 60,
          "vote_count.gte": 10,
        }),
        param: "telugu",
      },
      {
        name: "Kannada",
        query: () => tmdb.discover.movie({
          with_original_language: "kn",
          sort_by: "release_date.desc",
          "release_date.lte": new Date().toISOString().split('T')[0],
          include_adult: false,
          "with_runtime.gte": 60,
          "vote_count.gte": 10,
        }),
        param: "kannada",
      },
      {
        name: "Malayalam",
        query: () => tmdb.discover.movie({
          with_original_language: "ml",
          sort_by: "release_date.desc",
          "release_date.lte": new Date().toISOString().split('T')[0],
          include_adult: false,
          "with_runtime.gte": 60,
          "vote_count.gte": 10,
        }),
        param: "malayalam",
      },
      {
        name: "Bangla",
        query: () =>
          tmdb.discover.movie(
            {
              with_origin_country: "BD",
              sort_by: "release_date.desc",
              "release_date.lte": new Date().toISOString().split('T')[0],
              include_adult: false,
              "with_runtime.gte": 60,
            } as any,
          ),
        param: "bangla",
      },
      {
        name: "Top Rated Movies",
        query: () => tmdb.movies.topRated(),
        param: "topRated",
      },
    ],
    tvShows: [
      {
        name: "This Week's Trending TV Shows",
        query: () => tmdb.trending.trending("tv", "week"),
        param: "thisWeekTrending",
      },
      {
        name: "Popular TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'PopularTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.popular(),
        param: "popular",
      },
      {
        name: "On The Air TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'OnTheAirResult' but required in type 'TV'.
        query: () => tmdb.tvShows.onTheAir(),
        param: "onTheAir",
      },
      {
        name: "Bollywood TV Shows",
        // Hindi-language TV shows, recent first, exclude adult, minimum votes for quality
        query: () =>
          tmdb.discover.tvShow({
            // cast to any for flexible filter keys supported by TMDB API
            with_original_language: "hi",
            sort_by: "first_air_date.desc",
            "first_air_date.lte": new Date().toISOString().split("T")[0],
            include_adult: false,
            "vote_count.gte": 10,
          } as any),
        param: "bollywoodTv",
      },
      {
        name: "Bangla TV Shows",
        query: () =>
          tmdb.discover.tvShow({
            with_origin_country: "BD",
            sort_by: "first_air_date.desc",
            "first_air_date.lte": new Date().toISOString().split("T")[0],
            include_adult: false,
          } as any),
        param: "banglaTv",
      },
      {
        name: "Top Rated TV Shows",
        // @ts-expect-error: Property 'adult' is missing in type 'TopRatedTvShowResult' but required in type 'TV'.
        query: () => tmdb.tvShows.topRated(),
        param: "topRated",
      },
      {
        name: "Tamil TV Shows",
        query: () =>
          tmdb.discover.tvShow({
            with_original_language: "ta",
            sort_by: "first_air_date.desc",
            "first_air_date.lte": new Date().toISOString().split("T")[0],
            include_adult: false,
            "vote_count.gte": 10,
          } as any),
        param: "tamilTv",
      },
    ],
  },
  socials: {
    github: "https://github.com/mosabbir-maruf",
    telegram: "https://t.me/mosabbir_maruf",
    website: "https://mosabbir.dev",
  },
  legal: {
    legalInfoPath: "/aboutandfaq",
    privacyPath: "/privacy",
  },
};

export type SiteConfig = typeof siteConfig;
