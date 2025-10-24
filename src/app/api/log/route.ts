// Simple in-memory dedup cache to avoid duplicate logs flooding the terminal
// Keyed by level+message; entries expire quickly
const recentLogCache: Map<string, number> = new Map();
const DEDUP_WINDOW_MS = 800;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      level = "info",
      message = "",
      context,
      meta,
    }: { level?: string; message?: string; context?: any; meta?: any } = body || {};

    const timestamp = new Date().toISOString();
    const prefix = `[client-log] [${level}] ${timestamp}`;

    // Deduplicate rapid repeats
    // Prefer session-bound dedup if sessionId provided
    const sid = context?.sessionId || "";
    const path = context?.path || "";
    const cacheKey = `${sid}|${path}|${level}|${message}`;
    const now = Date.now();
    const last = recentLogCache.get(cacheKey) || 0;
    if (now - last < DEDUP_WINDOW_MS) {
      return new Response(JSON.stringify({ ok: true, deduped: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    recentLogCache.set(cacheKey, now);
    // Periodically trim
    if (recentLogCache.size > 500) {
      const cutoff = now - DEDUP_WINDOW_MS;
      for (const [k, t] of recentLogCache) if (t < cutoff) recentLogCache.delete(k);
    }

    // Log to server terminal
    if (level === "error") {
      console.error(prefix, message, context || meta || "");
    } else if (level === "warn") {
      console.warn(prefix, message, context || meta || "");
    } else {
      console.log(prefix, message, context || meta || "");
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[client-log] [error] Failed to log message:", err);
    return new Response(JSON.stringify({ ok: false }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}


