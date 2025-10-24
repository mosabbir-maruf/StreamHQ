import { PlayersProps } from "@/types";

export interface HiAnimeSearchResult {
  anilistId: number;
  anilistTitle: string;
  hianimeId: string;
  hianimeTitle: string;
  alternativeTitle: string;
  poster: string;
  type: string;
  episodes: {
    sub: number;
    dub: number;
    eps: number;
  };
}

export interface HiAnimeEpisode {
  title: string;
  alternativeTitle: string;
  id: string;
  isFiller: boolean;
}

export interface HiAnimeServer {
  index: number | null;
  type: "sub" | "dub";
  id: string | null;
  name: string;
  quality: string;
  bitrateKbps: number;
}

export interface HiAnimeStreamData {
  episodeId: string;
  server: string;
  type: "sub" | "dub";
  quality: string;
  streamingLink: {
    id: string;
    type: "sub" | "dub";
    link: {
      file: string;
      type: "hls" | "mp4";
    };
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
    server: string;
    iframe: string;
  };
  servers: string;
}

export class HiAnimeService {
  private static cache = new Map<string, any>();

  static async searchAnime(anilistId: number, malId?: number, fallbackTitle?: string): Promise<HiAnimeSearchResult | null> {
    const cacheKey = `search_${anilistId}_${malId || 'no_mal'}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch('/api/anime/hianime/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anilistId, malId, title: fallbackTitle }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HiAnime search failed: ${response.status} - ${errorText}`);
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        this.cache.set(cacheKey, data.data);
        return data.data;
      }
      
      console.warn('HiAnime search returned no results for AniList ID:', anilistId);
      return null;
    } catch (error) {
      console.error('Error searching HiAnime:', error);
      return null;
    }
  }

  static async getEpisodes(hianimeId: string): Promise<HiAnimeEpisode[]> {
    const cacheKey = `episodes_${hianimeId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`/api/anime/hianime/episodes/${hianimeId}`);

      if (!response.ok) {
        throw new Error(`Episodes fetch failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        this.cache.set(cacheKey, data.data.episodes);
        return data.data.episodes;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching HiAnime episodes:', error);
      return [];
    }
  }

  static async getServers(episodeId: string): Promise<{ sub: HiAnimeServer[]; dub: HiAnimeServer[] }> {
    const cacheKey = `servers_${episodeId}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(`/api/anime/hianime/servers/${episodeId}`);

      if (!response.ok) {
        throw new Error(`Servers fetch failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const result = { sub: data.data.sub, dub: data.data.dub };
        this.cache.set(cacheKey, result);
        return result;
      }
      
      return { sub: [], dub: [] };
    } catch (error) {
      console.error('Error fetching HiAnime servers:', error);
      return { sub: [], dub: [] };
    }
  }

  static async getStream(
    episodeId: string, 
    server: string = "HD-1", 
    type: "sub" | "dub" | "both" = "sub", 
    quality: string = "auto"
  ): Promise<HiAnimeStreamData | HiAnimeStreamData[] | null> {
    try {
      // If type is "both", fetch both sub and dub streams
      if (type === "both") {
        const [subResponse, dubResponse] = await Promise.all([
          fetch(`/api/anime/hianime/stream/${episodeId}?server=${server}&type=sub&quality=${quality}`),
          fetch(`/api/anime/hianime/stream/${episodeId}?server=${server}&type=dub&quality=${quality}`)
        ]);

        const [subData, dubData] = await Promise.all([
          subResponse.ok ? subResponse.json() : null,
          dubResponse.ok ? dubResponse.json() : null
        ]);

        const results: HiAnimeStreamData[] = [];
        
        if (subData?.success) {
          results.push({ ...subData.data, type: "sub" });
        }
        
        if (dubData?.success) {
          results.push({ ...dubData.data, type: "dub" });
        }

        return results.length > 0 ? results : null;
      }

      // Handle single type (sub or dub)
      const response = await fetch(
        `/api/anime/hianime/stream/${episodeId}?server=${server}&type=${type}&quality=${quality}`
      );

      if (!response.ok) {
        throw new Error(`Stream fetch failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching HiAnime stream:', error);
      return null;
    }
  }

  static async generatePlayers(
    anilistId: number,
    episode: number,
    title: string,
    malId?: number
  ): Promise<PlayersProps[]> {
    try {
      
      // Search for anime in HiAnime
      const searchResult = await this.searchAnime(anilistId, malId, title);
      if (!searchResult) {
        console.warn(`No HiAnime results found for: ${title}`);
        return [];
      }


      // Get episodes
      const episodes = await this.getEpisodes(searchResult.hianimeId);
      if (episodes.length === 0) {
        console.warn(`No episodes found for HiAnime ID: ${searchResult.hianimeId}`);
        return [];
      }


      // Find the specific episode
      const targetEpisode = episodes[episode - 1];
      if (!targetEpisode) {
        console.warn(`Episode ${episode} not found. Available episodes: ${episodes.length}`);
        return [];
      }


      // Get servers for the episode
      const servers = await this.getServers(targetEpisode.id);
      
      const players: PlayersProps[] = [];

      // Generate players for each server and type combination
      const types = ["sub", "dub"] as const;

      for (const type of types) {
        const typeServers = type === "sub" ? servers.sub : servers.dub;
        if (typeServers.length === 0) {
          continue;
        }

        // Sort servers by priority: MegaPlay first, then VidWish
        // Within each server, sort by quality: 1080p, 720p, 480p, 360p
        const sortedServers = typeServers.sort((a, b) => {
          // First priority: MegaPlay over VidWish
          const aIsMegaPlay = a.name !== "HD-1";
          const bIsMegaPlay = b.name !== "HD-1";
          if (aIsMegaPlay && !bIsMegaPlay) return -1;
          if (!aIsMegaPlay && bIsMegaPlay) return 1;
          
          // Second priority: Quality (1080p > 720p > 480p > 360p)
          const qualityOrder = { "1080p": 4, "720p": 3, "480p": 2, "360p": 1 };
          const aQuality = qualityOrder[a.quality as keyof typeof qualityOrder] || 0;
          const bQuality = qualityOrder[b.quality as keyof typeof qualityOrder] || 0;
          return bQuality - aQuality;
        });

        for (const server of sortedServers) {
          // Skip servers without valid IDs only if we need to call the stream API
          // For iframe players, we can use servers without IDs
          if (!server.id) {
          }

          try {
            // For iframe players, we don't need to call the stream API
            // Create iframe URL for VidWish/MegaPlay style player
            const sourceName = server.name === "HD-1" ? "VidWish" : "MegaPlay";
            const iframeUrl = `https://${server.name === "HD-1" ? "vidwish.live" : "megaplay.buzz"}/stream/s-2/${targetEpisode.id.split("ep=").pop()}/${type}`;
            
            players.push({
              title: `SenpaiPlay ${type.charAt(0).toUpperCase() + type.slice(1)} ${sourceName} ${server.quality}`,
              source: iframeUrl as `https://${string}`,
              provider: "hianime",
              quality: server.quality,
              type,
              server: server.name,
              serverType: sourceName, // Add server type for easier identification
              recommended: server.quality === "1080p" || server.quality === "720p",
              fast: true,
              ads: false,
              resumable: true,
            });
          } catch (streamError) {
            console.warn(`Failed to create player for ${type} ${server.quality} ${server.name}:`, streamError);
          }
        }
      }

      return players;
    } catch (error) {
      console.error('Error generating premium players:', error);
      // Return empty array to indicate no sources available
      return [];
    }
  }

  static clearCache() {
    this.cache.clear();
  }
}
