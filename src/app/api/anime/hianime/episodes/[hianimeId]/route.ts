const HIANIME_API_BASE = process.env.HIANIME_API_URL || "https://hianime-apicalls.onrender.com";
const HIANIME_API_KEY = process.env.HIANIME_API_KEY;

export interface HiAnimeEpisode {
  title: string;
  alternativeTitle: string;
  id: string;
  isFiller: boolean;
}

export interface HiAnimeEpisodesResponse {
  success: boolean;
  data: HiAnimeEpisode[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ hianimeId: string }> }
) {
  try {
    const { hianimeId } = await params;

    if (!hianimeId) {
      return new Response(
        JSON.stringify({ error: "HiAnime ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch episodes from HiAnime API
    const episodesUrl = `${HIANIME_API_BASE}/api/v1/episodes/${hianimeId}`;
    
    const episodesResponse = await fetch(episodesUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'x-api-key': HIANIME_API_KEY || '',
      },
    });

    if (!episodesResponse.ok) {
      throw new Error(`HiAnime API episodes failed: ${episodesResponse.status}`);
    }

    const episodesData = await episodesResponse.json();
    
    if (!episodesData.success || !episodesData.data?.length) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Not Available in rightnow",
          data: [] 
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          hianimeId,
          episodes: episodesData.data,
          totalEpisodes: episodesData.data.length,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching HiAnime episodes:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to fetch episodes",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
