import { PlayersProps } from "@/types";
import { HiAnimeService } from "@/services/hianime";

/**
 * Generates a list of movie players with their respective titles and source URLs.
 * Each player is constructed using the provided movie ID.
 *
 * @param {string | number} id - The ID of the movie to be embedded in the player URLs.
 * @param {number} [startAt] - The start position in seconds to be embedded in the player URLs. Optional.
 * @returns {PlayersProps[]} - An array of objects, each containing
 * the title of the player and the corresponding source URL.
 */
export const getMoviePlayers = (id: string | number, startAt?: number): PlayersProps[] => {
  return [
    {
      title: "Source 1 (VidKing)",
      source: `https://www.vidking.net/embed/movie/${id}?color=0066cc&autoPlay=true&nextEpisode=true&episodeSelector=true${startAt ? `&progress=${startAt}` : ""}`,
      recommended: true,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 2 (VidLink)",
      source: `https://vidlink.pro/movie/${id}?player=jw&primaryColor=006fee&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&title=true&poster=true&autoplay=false&startAt=${startAt || ""}`,
      recommended: true,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 3 (VidLink 2)",
      source: `https://vidlink.pro/movie/${id}?player=default&primaryColor=006fee&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&title=true&poster=true&autoplay=false&startAt=${startAt}`,
      recommended: true,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 4 (VidSrc 5)",
      source: `https://vidsrc.cc/v3/embed/movie/${id}?autoPlay=false`,
      recommended: true,
      fast: true,
      ads: true,
    },
    {
      title: "Source 5 (Embed)",
      source: `https://embed.su/embed/movie/${id}`,
      recommended: false,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 6 (SuperEmbed)",
      source: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1`,
      fast: true,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 7 (FilmKu)",
      source: `https://filmku.stream/embed/${id}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 8 (NontonGo)",
      source: `https://www.nontongo.win/embed/movie/${id}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 9 (AutoEmbed 1)",
      source: `https://autoembed.co/movie/tmdb/${id}`,
      fast: true,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 10 (AutoEmbed 2)",
      source: `https://player.autoembed.cc/embed/movie/${id}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 11 (2Embed)",
      source: `https://www.2embed.cc/embed/${id}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 12 (VidSrc 1)",
      source: `https://vidsrc.xyz/embed/movie/${id}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 13 (VidSrc 2)",
      source: `https://vidsrc.to/embed/movie/${id}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 14 (VidSrc 3)",
      source: `https://vidsrc.icu/embed/movie/${id}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 15 (VidSrc 4)",
      source: `https://vidsrc.cc/v2/embed/movie/${id}?autoPlay=false`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 16 (VidSrc 6)",
      source: `https://vidsrcme.ru/embed/movie/${id}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 17 (VidSrc 7)",
      source: `https://vidsrcme.su/embed/movie/${id}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 18 (VidSrc 8)",
      source: `https://vidsrc-me.ru/embed/movie/${id}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 19 (VidSrc 9)",
      source: `https://vidsrc-me.su/embed/movie/${id}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 20 (VidSrc 10)",
      source: `https://vidsrc-embed.ru/embed/movie/${id}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 21 (VidSrc 11)",
      source: `https://vidsrc-embed.su/embed/movie/${id}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 22 (VidSrc 12)",
      source: `https://vsrc.su/embed/movie/${id}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 23 (MoviesAPI)",
      source: `https://moviesapi.club/movie/${id}`,
      ads: true,
      resumable: false,
    },
  ];
};

/**
 * Generates a list of TV show players with their respective titles and source URLs.
 * Each player is constructed using the provided TV show ID, season, and episode.
 *
 * @param {string | number} id - The ID of the TV show to be embedded in the player URLs.
 * @param {string | number} [season] - The season number of the TV show episode to be embedded.
 * @param {string | number} [episode] - The episode number of the TV show episode to be embedded.
 * @param {number} [startAt] - The start position in seconds to be embedded in the player URLs. Optional.
 * @returns {PlayersProps[]} - An array of objects, each containing
 * the title of the player and the corresponding source URL.
 */
export const getTvShowPlayers = (
  id: string | number,
  season: number,
  episode: number,
  startAt?: number,
): PlayersProps[] => {
  return [
    {
      title: "Source 1 (VidKing)",
      source: `https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=ffcc00&autoPlay=true&nextEpisode=true&episodeSelector=true${startAt ? `&progress=${startAt}` : ""}`,
      recommended: true,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 2 (VidLink)",
      source: `https://vidlink.pro/tv/${id}/${season}/${episode}?player=jw&primaryColor=f5a524&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&title=true&poster=true&autoplay=false&nextbutton=true&startAt=${startAt || ""}`,
      recommended: true,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 3 (VidLink 2)",
      source: `https://vidlink.pro/tv/${id}/${season}/${episode}?player=default&primaryColor=f5a524&secondaryColor=a2a2a2&iconColor=eefdec&icons=vid&title=true&poster=true&autoplay=false&nextbutton=true&startAt=${startAt}`,
      recommended: true,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 4 (VidSrc 5)",
      source: `https://vidsrc.cc/v3/embed/tv/${id}/${season}/${episode}?autoPlay=false`,
      recommended: true,
      fast: true,
      ads: true,
    },
    {
      title: "Source 5 (Embed)",
      source: `https://embed.su/embed/tv/${id}/${season}/${episode}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 6 (SuperEmbed)",
      source: `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
      fast: true,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 7 (FilmKu)",
      source: `https://filmku.stream/embed/series?tmdb=${id}&sea=${season}&epi=${episode}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 8 (NontonGo)",
      source: `https://www.NontonGo.win/embed/tv/${id}/${season}/${episode}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 9 (AutoEmbed 1)",
      source: `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`,
      fast: true,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 10 (AutoEmbed 2)",
      source: `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 11 (2Embed)",
      source: `https://www.2embed.cc/embedtv/${id}&s=${season}&e=${episode}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 12 (VidSrc 1)",
      source: `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 13 (VidSrc 2)",
      source: `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 14 (VidSrc 3)",
      source: `https://vidsrc.icu/embed/tv/${id}/${season}/${episode}`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 15 (VidSrc 4)",
      source: `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?autoPlay=false`,
      ads: true,
      resumable: false,
    },
    {
      title: "Source 16 (VidSrc 6)",
      source: `https://vidsrcme.ru/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 17 (VidSrc 7)",
      source: `https://vidsrcme.su/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 18 (VidSrc 8)",
      source: `https://vidsrc-me.ru/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 19 (VidSrc 9)",
      source: `https://vidsrc-me.su/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 20 (VidSrc 10)",
      source: `https://vidsrc-embed.ru/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 21 (VidSrc 11)",
      source: `https://vidsrc-embed.su/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 22 (VidSrc 12)",
      source: `https://vsrc.su/embed/tv/${id}/${season}/${episode}`,
      fast: true,
      ads: true,
      resumable: true,
    },
    {
      title: "Source 23 (MoviesAPI)",
      source: `https://moviesapi.club/tv/${id}-${season}-${episode}`,
      ads: true,
      resumable: false,
    },
  ];
};

/**
 * Generates a list of anime players with their respective titles and source URLs.
 * Each player is constructed using the provided anime ID and episode number.
 * Note: Most streaming services use MAL ID for anime, so we pass the MAL ID if available.
 *
 * @param {number} malId - The MyAnimeList ID of the anime (preferred for most players).
 * @param {number} [episode] - The episode number to be embedded. Optional.
 * @param {number} [startAt] - The start position in seconds to be embedded in the player URLs. Optional.
 * @returns {PlayersProps[]} - An array of objects, each containing
 * the title of the player and the corresponding source URL.
 */
export const getAnimePlayers = (
  malId: number,
  episode?: number,
  startAt?: number,
  titleForSlug?: string,
  hasMALId?: boolean,
  anilistId?: number,
): PlayersProps[] => {
  // Build vidsrc id variants:
  // - Plain numeric (works for MAL ids)
  // - AniList-prefixed variant (required for AniList ids)
  const idPlain = String(malId);
  const idAniListPrefixed = `ani${malId}`;

  // Controls
  const autoPlay = true;
  const autoSkipIntro = true;

  const ep = episode ?? 1;

  const toHyphenSlug = (rawTitle: string) => {
    // Normalize unicode and strip diacritics
    const normalized = rawTitle
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "");

    // Pre-map common symbols/words to words
    const mapped = normalized
      .replace(/&/g, " and ")
      .replace(/@/g, " at ")
      .replace(/\+/g, " plus ")
      .replace(/[''`]/g, "")
      .replace(/[×✕]/g, "x");

    // Lowercase and keep alphanumerics, convert others to hyphens
    const hyphenated = mapped
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-|-$/g, "");

    return hyphenated;
  };

  const baseSlug = titleForSlug ? toHyphenSlug(titleForSlug) : undefined;

  return [
    // SenpaiPlay as first source option
    {
      title: "SenpaiPlay",
      source: `hianime://${malId}/${ep}` as `https://${string}`, // Special protocol for HiAnime
      provider: "hianime",
      type: "both",
      recommended: true,
      fast: true,
      ads: false,
      resumable: true,
    },
    // KawaiiCast as second source option
    ...(baseSlug
      ? [
          {
            title: "KawaiiCast",
            source: `https://nontongo.win/embed/anime/${baseSlug}-episode-${ep}` as `https://${string}`,
            provider: "nontongo" as const,
            type: "sub" as const,
            fast: true,
            ads: true,
            resumable: true,
            recommended: true,
          },
        ]
      : []),
    // NekoFlix sources (new streaming source) - requires AniList ID
    ...(anilistId ? [
      {
        title: "NekoFlix",
        source: `https://vidsrc.icu/embed/anime/${anilistId}/${ep}/0` as `https://${string}`,
        provider: "vidsrc-icu" as const,
        type: "sub" as const,
        fast: true,
        ads: true,
        resumable: true,
        recommended: true,
      },
    ] : []),
    // SakuraPlay Sub
    {
      title: "SakuraPlay",
      source: `https://vidsrc.cc/v2/embed/anime/${idPlain}/${ep}/sub?autoPlay=${autoPlay}&autoSkipIntro=${autoSkipIntro}&noUI=1&hideUI=1&controls=0&ui=0`,
      provider: "vidsrc" as const,
      type: "sub" as const,
      fast: true,
      ads: true,
      resumable: true,
    },
    // SakuraPlay Sub (AniList) - AniList-prefixed fallback
    {
      title: "SakuraPlay",
      source: `https://vidsrc.cc/v2/embed/anime/${idAniListPrefixed}/${ep}/sub?autoPlay=${autoPlay}&autoSkipIntro=${autoSkipIntro}&noUI=1&hideUI=1&controls=0&ui=0`,
      provider: "vidsrc" as const,
      type: "sub" as const,
      fast: true,
      ads: true,
      resumable: true,
    },
    // NekoFlix Dub
    ...(anilistId ? [
      {
        title: "NekoFlix",
        source: `https://vidsrc.icu/embed/anime/${anilistId}/${ep}/1` as `https://${string}`,
        provider: "vidsrc-icu" as const,
        type: "dub" as const,
        fast: true,
        ads: true,
        resumable: true,
        recommended: true,
      },
    ] : []),
    // SakuraPlay Dub
    {
      title: "SakuraPlay",
      source: `https://vidsrc.cc/v2/embed/anime/${idPlain}/${ep}/dub?autoPlay=${autoPlay}&autoSkipIntro=${autoSkipIntro}&noUI=1&hideUI=1&controls=0&ui=0`,
      provider: "vidsrc" as const,
      type: "dub" as const,
      fast: true,
      ads: true,
      resumable: true,
    },
    // SakuraPlay Dub (AniList) - AniList-prefixed fallback
    {
      title: "SakuraPlay",
      source: `https://vidsrc.cc/v2/embed/anime/${idAniListPrefixed}/${ep}/dub?autoPlay=${autoPlay}&autoSkipIntro=${autoSkipIntro}&noUI=1&hideUI=1&controls=0&ui=0`,
      provider: "vidsrc" as const,
      type: "dub" as const,
      fast: true,
      ads: true,
      resumable: true,
    },
  ];
};

// Separate function to load HiAnime players on demand
export const loadHiAnimePlayers = async (
  malId: number,
  episode?: number,
  titleForSlug?: string,
  anilistId?: number,
): Promise<PlayersProps[]> => {
  const ep = episode ?? 1;
  return await HiAnimeService.generatePlayers(anilistId || malId, ep, titleForSlug || "", malId);
};
