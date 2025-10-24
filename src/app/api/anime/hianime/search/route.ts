import { anilist } from "@/api/anilist";

const HIANIME_API_BASE = process.env.HIANIME_API_URL || "https://hianime-apicalls.onrender.com";
const HIANIME_API_KEY = process.env.HIANIME_API_KEY;

export interface HiAnimeSearchResult {
  id: string;
  title: string;
  alternativeTitle: string;
  poster: string;
  type: string;
  episodes: {
    sub: number;
    dub: number;
    eps: number;
  };
}

export async function POST(request: Request) {
  try {
    const { anilistId, malId, title: fallbackTitle } = await request.json();

    if (!anilistId && !malId) {
      return new Response(
        JSON.stringify({ error: "AniList ID or MAL ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let title = "";
    let anime = null;

    // Try to get anime data from AniList first
    if (anilistId) {
      try {
        anime = await anilist.getAnimeById(anilistId);
        if (anime) {
          title = anime.title?.english || anime.title?.romaji || anime.title?.native || "";
        }
      } catch (anilistError) {
      }
    }

    // If AniList failed and we have MAL ID, try MAL API
    if (!title && malId) {
      try {
        const malResponse = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);
        if (malResponse.ok) {
          const malData = await malResponse.json();
          if (malData.data) {
            title = malData.data.title_english || malData.data.title || "";
          }
        }
      } catch (malError) {
      }
    }

    // If both AniList and MAL failed, use fallback title
    if (!title && fallbackTitle) {
      title = fallbackTitle;
    }

    if (!title) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No title available for search",
          message: "Could not find anime title from AniList or fallback"
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    
    // Clean title for better search (remove punctuation/symbols, collapse spaces)
    const cleanedTitle = title
      .replace(/[\p{P}\p{S}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Search in HiAnime API
    const searchUrl = `${HIANIME_API_BASE}/api/v1/search?keyword=${encodeURIComponent(cleanedTitle)}&page=1`;
    
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'x-api-key': HIANIME_API_KEY || '',
      },
    });

    if (!searchResponse.ok) {
      throw new Error(`HiAnime API search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.success || !searchData.data?.response?.length) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Not Available in rightnow",
          data: null 
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Find the best match (prefer exact/alt matches and correct format)
    const results = searchData.data.response as HiAnimeSearchResult[];

    const expectedIsMovie = (() => {
      const fmt = (anime as any)?.format; // AniList format if available
      if (!fmt) return undefined as unknown as boolean;
      return String(fmt).toUpperCase() === "MOVIE";
    })();

    const normalize = (s: string) =>
      (s || "")
        .toLowerCase()
        .replace(/[\p{P}\p{S}]+/gu, " ")
        .replace(/\s+/g, " ")
        .trim();

    const normQuery = normalize(cleanedTitle);

    const score = (r: HiAnimeSearchResult) => {
      const t1 = normalize(r.title);
      const t2 = normalize(r.alternativeTitle);
      let s = 0;
      if (t1 === normQuery || t2 === normQuery) s += 100; // exact
      const words = normQuery.split(" ").filter(w => w.length > 2);
      const hay = `${t1} ${t2}`;
      const matched = words.filter(w => hay.includes(w)).length;
      s += Math.min(60, matched * 10); // partial
      const isMovieType = r.type?.toLowerCase() === "movie" || r.episodes?.eps === 1;
      if (expectedIsMovie === true && isMovieType) s += 25;
      if (expectedIsMovie === false && !isMovieType) s += 15;
      return s;
    };

    const bestMatch = [...results].sort((a, b) => score(b) - score(a))[0] || results[0];


    return new Response(
      JSON.stringify({
        success: true,
        data: {
          anilistId,
          anilistTitle: title,
          hianimeId: bestMatch.id,
          hianimeTitle: bestMatch.title,
          alternativeTitle: bestMatch.alternativeTitle,
          poster: bestMatch.poster,
          type: bestMatch.type,
          episodes: bestMatch.episodes,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error searching HiAnime:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to search HiAnime",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
