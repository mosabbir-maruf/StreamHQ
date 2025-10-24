const HIANIME_API_BASE = process.env.HIANIME_API_URL || "https://hianime-apicalls.onrender.com";
const HIANIME_API_KEY = process.env.HIANIME_API_KEY;

export interface HiAnimeServer {
  index: number;
  type: "sub" | "dub";
  id: string;
  name: string;
}

export interface HiAnimeServersResponse {
  success: boolean;
  data: {
    episode: number;
    sub: HiAnimeServer[];
    dub: HiAnimeServer[];
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;

    if (!episodeId) {
      return new Response(
        JSON.stringify({ error: "Episode ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch servers from HiAnime API
    const serversUrl = `${HIANIME_API_BASE}/api/v1/servers?id=${encodeURIComponent(episodeId)}`;
    
    const serversResponse = await fetch(serversUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'x-api-key': HIANIME_API_KEY || '',
      },
    });

    if (!serversResponse.ok) {
      throw new Error(`HiAnime API servers failed: ${serversResponse.status}`);
    }

    const serversData = await serversResponse.json();
    
    if (!serversData.success || !serversData.data) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Not Available in rightnow",
          data: null 
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          episodeId,
          episode: serversData.data.episode,
          sub: serversData.data.sub || [],
          dub: serversData.data.dub || [],
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching HiAnime servers:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to fetch servers",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
