// Stream a remote .torrent file while setting a custom filename
// Usage: /api/torrents/download?url=<remote_url>&filename=<desired_name>.torrent

function safeFilename(input: string, fallback: string = "download.torrent") {
  try {
    const cleaned = input
      .replace(/[^a-zA-Z0-9._\-\s\(\)\[\]]+/g, "")
      .trim()
      .slice(0, 140);
    return cleaned || fallback;
  } catch {
    return fallback;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const filenameParam = searchParams.get("filename") || "download.torrent";
  const filename = safeFilename(filenameParam, "download.torrent");

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url" }), { status: 400 });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ error: "Upstream not available" }), { status: 502 });
    }

    const headers = new Headers(upstream.headers);
    headers.set("Content-Type", "application/x-bittorrent");
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.delete("Content-Length"); // length may change when proxied

    return new Response(upstream.body, { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Failed to download" }), { status: 500 });
  }
}


