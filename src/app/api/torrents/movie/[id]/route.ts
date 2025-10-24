import { tmdb } from "@/api/tmdb";

type TorrentItem = {
  title: string;
  quality?: string;
  size?: string;
  seeds?: number;
  peers?: number;
  magnet: string;
  torrentUrl?: string; // direct .torrent when available (e.g., YTS)
  source: "yts" | "torrentio";
};

// Cache API responses for 30 minutes
export const revalidate = 1800;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tmdbId = parseInt(id, 10);
    if (Number.isNaN(tmdbId)) {
      return new Response(JSON.stringify({ error: "Invalid TMDB id" }), { status: 400 });
    }

    // Fetch movie details to get IMDb id and metadata
    const movie = await tmdb.movies.details(tmdbId, ["external_ids"] as any);
    // @ts-ignore tmdb-ts returns external_ids when appended
    const imdbId: string | undefined = movie?.external_ids?.imdb_id;

    const title: string = movie?.title || movie?.original_title || "";
    const year: string = (movie?.release_date || "").slice(0, 4);

    const results: TorrentItem[] = [];

    // Query YTS by imdb id first, then fallback by title
    try {
      const ytsUrl = imdbId
        ? `https://yts.mx/api/v2/movie_details.json?imdb_id=${encodeURIComponent(imdbId)}`
        : `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(`${title} ${year}`.trim())}`;
      const ytsRes = await fetch(ytsUrl, { next: { revalidate: 60 * 30 } });
      if (ytsRes.ok) {
        const ytsJson = await ytsRes.json();
        const movieData = ytsJson?.data?.movie || (ytsJson?.data?.movies?.[0] ?? undefined);
        const torrents: any[] = movieData?.torrents || [];
        for (const t of torrents) {
          const trackers = [
            "udp://tracker.opentrackr.org:1337/announce",
            "udp://tracker.openbittorrent.com:6969/announce",
            "udp://tracker.coppersurfer.tk:6969/announce",
            "udp://tracker.leechers-paradise.org:6969/announce",
          ];
          const magnet = `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(
            `${title} ${t.quality}`,
          )}&tr=${trackers.map(encodeURIComponent).join("&tr=")}`;
          results.push({
            title: `${title} ${t.quality}`,
            quality: t.quality,
            size: t.size,
            seeds: Number(t.seeds) || undefined,
            peers: Number(t.peers) || undefined,
            magnet,
            torrentUrl: t.url || undefined,
            source: "yts",
          });
        }
      }
    } catch {
      // ignore YTS errors
    }

    // Query Torrentio by imdb id when available
    try {
      if (imdbId) {
        const tioUrl = `https://torrentio.strem.fun/stream/movie/${encodeURIComponent(imdbId)}.json`;
        const tioRes = await fetch(tioUrl, { next: { revalidate: 60 * 10 } });
        if (tioRes.ok) {
          const tioJson = await tioRes.json();
          const streams: any[] = tioJson?.streams || [];
          for (const s of streams) {
            const magnet: string | undefined = s?.url?.startsWith("magnet:") ? s.url : undefined;
            if (!magnet) continue;
            results.push({
              title: s?.title || `${title}`,
              quality: s?.quality,
              size: undefined,
              seeds: s?.seeders ?? s?.seeds,
              peers: undefined,
              magnet,
              source: "torrentio",
            });
          }
        }
      }
    } catch {
      // ignore Torrentio errors
    }

    // Deduplicate by magnet hash when possible
    const seen = new Set<string>();
    const unique = results.filter((r) => {
      const hashMatch = r.magnet.match(/btih:([a-fA-F0-9]+)/);
      const key = hashMatch ? hashMatch[1].toLowerCase() : r.magnet;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return new Response(
      JSON.stringify({ ok: true, imdbId: imdbId || null, title, year, torrents: unique }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to fetch torrents" }), { status: 500 });
  }
}


