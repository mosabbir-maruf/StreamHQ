import { env } from "@/utils/env";

// Simple in-memory rate limit map (per process). Suitable for single instance or edge.
const lastHitByIp = new Map<string, number>();
const COOLDOWN_MS = 15_000; // 15 seconds

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const now = Date.now();
    const last = lastHitByIp.get(ip) || 0;
    if (now - last < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
      return new Response(
        JSON.stringify({ error: `Please wait ${remaining}s before sending again.` }),
        { status: 429 },
      );
    }

    const body = await request.json();
    const { name, email, message } = body ?? {};

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    // Basic server-side email validation
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), { status: 400 });
    }

    const tasks: Promise<Response | void>[] = [];

    // Send to Web3Forms if configured
    if (env.WEB3FORMS_ACCESS_KEY) {
      const formData = new URLSearchParams();
      formData.set("access_key", env.WEB3FORMS_ACCESS_KEY);
      formData.set("subject", "New Contact Received from StreamHQ.");
      formData.set("from_name", name);
      formData.set("replyto", email);
      formData.set("email", env.CONTACT_NOTIFY_EMAIL || email);
      formData.set(
        "message",
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      );

      tasks.push(
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData.toString(),
        }).then((r) => r).catch(() => undefined),
      );
    }

    // Send to Telegram if configured (modern minimalist formatting)
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const html = `
<b>💬 New Contact from StreamHQ</b>\n\n
<b>Name</b>: ${escape(name)}\n
<b>Email</b>: <a href="mailto:${escape(email)}">${escape(email)}</a>\n\n
<b>Message</b>:\n${escape(message)}
      `.trim();

      tasks.push(
        fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: html,
            parse_mode: "HTML",
            disable_web_page_preview: true,
          }),
        }).then((r) => r).catch(() => undefined),
      );
    }

    await Promise.all(tasks);

    lastHitByIp.set(ip, now);

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Unexpected error" }), { status: 500 });
  }
}


