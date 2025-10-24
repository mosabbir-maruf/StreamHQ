const HIANIME_API_BASE = process.env.HIANIME_API_URL || "https://hianime-apicalls.onrender.com";
const HIANIME_API_KEY = process.env.HIANIME_API_KEY;

export interface HiAnimeStreamResponse {
  success: boolean;
  data: {
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
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    const { searchParams } = new URL(request.url);
    const server = searchParams.get("server") || "HD-1";
    const type = searchParams.get("type") || "sub";
    const quality = searchParams.get("quality") || "auto";

    if (!episodeId) {
      return new Response(
        JSON.stringify({ error: "Episode ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch stream from HiAnime API
    const streamUrl = `${HIANIME_API_BASE}/api/v1/stream?id=${encodeURIComponent(episodeId)}&server=${server}&type=${type}&quality=${quality}`;
    
    const streamResponse = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'x-api-key': HIANIME_API_KEY || '',
      },
    });

    if (!streamResponse.ok) {
      throw new Error(`HiAnime API stream failed: ${streamResponse.status}`);
    }

    const streamData = await streamResponse.json();
    
    if (!streamData.success || !streamData.data) {
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
          server,
          type,
          quality,
          streamingLink: {
            id: streamData.data.id,
            type: streamData.data.type,
            link: streamData.data.link,
            tracks: streamData.data.tracks,
            intro: streamData.data.intro,
            outro: streamData.data.outro,
            server: streamData.data.server,
            quality: streamData.data.quality,
          },
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching HiAnime stream:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to fetch stream",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
