import { AnimeMedia } from "@/api/anilist";

/**
 * Get the anime title, preferring English over Romaji
 */
export const mutateAnimeTitle = (anime: Partial<AnimeMedia>): string => {
  return anime.title?.english || anime.title?.romaji || anime.title?.native || "Unknown Title";
};

/**
 * Get anime cover image URL
 */
export const getAnimeCoverUrl = (
  path?: string,
  size: "large" | "medium" | "extraLarge" = "large"
): string => {
  if (!path) return "/images/NA Poster.jpg";
  
  // Check if it's AniList's default placeholder image
  if (path.includes('default.jpg')) {
    return "/images/NA Poster.jpg";
  }
  
  // AniList already provides full URLs
  return path;
};

/**
 * Get anime banner image URL
 */
export const getAnimeBannerUrl = (path?: string): string => {
  if (!path) return "/images/NA Backdrop.png";
  
  // Check if it's AniList's default placeholder image
  if (path.includes('default.jpg')) {
    return "/images/NA Backdrop.png";
  }
  
  return path;
};

/**
 * Format anime duration (duration is in minutes per episode)
 */
export const animeDurationString = (duration?: number, episodes?: number): string => {
  if (!duration && !episodes) return "N/A";
  
  if (episodes && duration) {
    const totalMinutes = duration * episodes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${episodes} eps · ${hours}h ${minutes}m`;
    }
    return `${episodes} eps · ${totalMinutes}m`;
  }
  
  if (episodes) {
    return `${episodes} episodes`;
  }
  
  return `${duration} min/ep`;
};

/**
 * Format anime release year from start date
 */
export const getAnimeYear = (startDate?: { year?: number; month?: number; day?: number }): string => {
  if (!startDate || !startDate.year) return "TBA";
  return startDate.year.toString();
};

/**
 * Format anime season and year
 */
export const getAnimeSeasonYear = (season?: string, year?: number): string => {
  if (!season && !year) return "Unknown";
  if (season && year) return `${season} ${year}`;
  if (year) return year.toString();
  return season || "Unknown";
};

/**
 * Check if anime is new (released within last 7 days)
 */
export const isNewAnimeRelease = (startDate?: { year?: number; month?: number; day?: number }): boolean => {
  if (!startDate || !startDate.year || !startDate.month || !startDate.day) return false;
  
  const releaseDate = new Date(startDate.year, startDate.month - 1, startDate.day);
  if (isNaN(releaseDate.getTime())) return false;
  
  const now = new Date();
  const diffMs = now.getTime() - releaseDate.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  return diffMs >= 0 && diffMs <= sevenDaysMs;
};

/**
 * Format anime status
 */
export const formatAnimeStatus = (status?: string): string => {
  if (!status) return "Unknown";
  
  const statusMap: Record<string, string> = {
    FINISHED: "Finished Airing",
    RELEASING: "Currently Airing",
    NOT_YET_RELEASED: "Not Yet Aired",
    CANCELLED: "Cancelled",
    HIATUS: "On Hiatus",
  };
  
  return statusMap[status] || status;
};

/**
 * Get anime format display name
 */
export const formatAnimeFormat = (format?: string): string => {
  if (!format) return "Unknown";
  
  const formatMap: Record<string, string> = {
    TV: "TV Series",
    TV_SHORT: "TV Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MUSIC: "Music",
  };
  
  return formatMap[format] || format;
};

/**
 * Normalize anime score (AniList uses 0-100, we want 0-10)
 */
export const normalizeAnimeScore = (score?: number): number => {
  if (!score) return 0;
  return score / 10;
};

/**
 * Clean anime description (remove HTML tags)
 */
export const cleanAnimeDescription = (description?: string): string => {
  if (!description) return "No description available.";
  
  return description
    .replace(/<br>/g, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
};

