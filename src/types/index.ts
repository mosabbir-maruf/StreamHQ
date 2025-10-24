import { Movie, TV } from "tmdb-ts/dist/types";

export type ContentType = "movie" | "tv" | "anime";

export type Params<T> = {
  params: Promise<T>;
};

export type ActionResponse<T = null> = Promise<{
  success: boolean;
  message?: string;
  data?: T;
}>;

export type MovieParam =
  | "todayTrending"
  | "thisWeekTrending"
  | "popular"
  | "nowPlaying"
  | "upcoming"
  | "topRated"
  | "bollywood"
  | "tamil"
  | "malayalam"
  | "kannada"
  | "telugu"
  | "bangla";

export type TvShowParam =
  | "todayTrending"
  | "thisWeekTrending"
  | "popular"
  | "onTheAir"
  | "topRated"
  | "bollywoodTv"
  | "tamilTv"
  | "banglaTv"
  ;

export type QueryList<T extends Movie | TV> = {
  name: string;
  query: () => Promise<{
    page: number;
    results: T[];
    total_results: number;
    total_pages: number;
  }>;
  param: T extends Movie ? MovieParam : TvShowParam;
};

export type SiteConfigType = {
  name: string;
  description: string;
  favicon: string;
  navItems: {
    label: string;
    href: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
  }[];
  queryLists: {
    anime: any[];
    movies: QueryList<Movie>[];
    tvShows: QueryList<TV>[];
  };
  themes: {
    name: "light" | "dark" | "system";
    icon: React.ReactNode;
  }[];
  socials: {
    github: string;
    telegram?: string;
    website?: string;
    instagram?: string;
    youtube?: string;
  };
  legal: {
    legalInfoPath: string;
    privacyPath: string;
  };
};

export type PlayersProps = {
  title: string;
  source: `https://${string}`;
  recommended?: boolean;
  fast?: boolean;
  ads?: boolean;
  resumable?: boolean;
  // HiAnime specific properties
  provider?: "hianime" | "vidsrc" | "vidsrc-icu" | "nontongo" | "vidlink";
  quality?: string;
  type?: "sub" | "dub" | "both";
  server?: string;
  serverType?: "VidWish" | "MegaPlay";
  iframe?: string;
  streamingData?: {
    file: string;
    type: "hls" | "mp4";
    tracks?: Array<{
      file: string;
      kind: string;
    }>;
    intro?: {
      start: number;
      end: number;
    };
    outro?: {
      start: number;
      end: number;
    };
  };
};

export type Settings = {
  theme: "light" | "dark" | "system";
  showSpecialSeason: boolean;
  disableAnimation: boolean;
  saveWatchHistory: boolean;
};
