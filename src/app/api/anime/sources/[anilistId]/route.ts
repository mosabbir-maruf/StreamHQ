import { anilist } from "@/api/anilist";

export interface StreamingSource {
  id: string;
  name: string;
  type: "hianime" | "vidsrc" | "vidsrc-icu" | "nontongo" | "vidlink";
  available: boolean;
  qualities?: string[];
  hasSub?: boolean;
  hasDub?: boolean;
  recommended?: boolean;
  fast?: boolean;
  ads?: boolean;
  resumable?: boolean;
}

// Cache API responses for 1 hour
export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ anilistId: string }> }
) {
  try {
    const { anilistId } = await params;
    const animeId = parseInt(anilistId);

    if (isNaN(animeId)) {
      return new Response(
        JSON.stringify({ error: "Invalid anime ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get anime data from AniList
    const anime = await anilist.getAnimeById(animeId);
    if (!anime) {
      return new Response(
        JSON.stringify({ error: "Anime not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const title = anime.title?.english || anime.title?.romaji || anime.title?.native || "";
    
    // Define available sources
    const sources: StreamingSource[] = [
      {
        id: "hianime",
        name: "HiAnime",
        type: "hianime",
        available: true,
        qualities: ["1080p", "720p", "480p", "360p"],
        hasSub: true,
        hasDub: true,
        recommended: true,
        fast: true,
        ads: false,
        resumable: true,
      },
      {
        id: "vidsrc",
        name: "VidSrc",
        type: "vidsrc",
        available: true,
        hasSub: true,
        hasDub: true,
        recommended: true,
        fast: true,
        ads: true,
        resumable: true,
      },
      {
        id: "vidsrc-icu",
        name: "Vidsrc.icu",
        type: "vidsrc-icu",
        available: true,
        hasSub: true,
        hasDub: true,
        recommended: true,
        fast: true,
        ads: true,
        resumable: true,
      },
      {
        id: "nontongo",
        name: "NontonGo",
        type: "nontongo",
        available: true,
        hasSub: true,
        hasDub: false,
        recommended: false,
        fast: true,
        ads: true,
        resumable: true,
      },
      {
        id: "vidlink",
        name: "VidLink",
        type: "vidlink",
        available: true,
        hasSub: true,
        hasDub: true,
        recommended: true,
        fast: true,
        ads: true,
        resumable: true,
      },
    ];

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          animeId,
          title,
          sources,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching anime sources:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch anime sources" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
