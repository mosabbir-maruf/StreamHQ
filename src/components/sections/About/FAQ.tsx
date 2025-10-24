"use client";

import useBreakpoints from "@/hooks/useBreakpoints";
import { Accordion, AccordionItem, Link } from "@heroui/react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/utils/helpers";

const FAQS = [
  {
    title: "What is StreamHQ?",
    description:
      "Your ultimate binge-watching paradise! Movies, TV shows, and anime galore - all free, all awesome!",
  },
  {
    title: "What do we actually do?",
    description:
      "We index and surface links from third‑party providers. We don’t host or store any videos. The site is for discovery and promotional purposes only.",
  },
  {
    title: "Is it safe to use this site?",
    description: (
      <p>
        Streaming happens via embedded players. Using StreamHQ is generally safe—just avoid pop‑ups
        and unknown downloads. For details on how we handle data, see our{" "}
        <Link href="/privacy" className="font-bold">
          Privacy Policy
        </Link>
        . Local laws apply; downloading or redistributing copyrighted content may be illegal.
      </p>
    ),
  },
  {
    title: "Why are there ads on some players?",
    description: (
      <p>
        Ads are shown by third‑party players, not StreamHQ. Avoid pop‑ups or downloads. For a cleaner
        experience, consider a trusted blocker like{" "}
        <Link
          href="https://chromewebstore.google.com/detail/adguard-adblocker/bgnkhhnnamicmpeenaelnjfhikgbkllg"
          target="_blank"
          className="font-bold"
        >
          AdGuard AdBlocker
        </Link>{" "}
        (recommended),{" "}
        <Link href="https://adblockplus.org/" target="_blank" className="font-bold">
          Adblock Plus
        </Link>
        , or the{" "}
        <Link href="https://brave.com/" target="_blank" className="font-bold">
          Brave browser
        </Link>
        .
      </p>
    ),
  },
  {
    title: "Videos are slow or not playing",
    description:
      "Switch the server in the player menu (e.g., Vidlink, VidSrc). Trying a different source usually fixes playback issues.",
  },
  {
    title: "Do I need an account?",
    description:
      "Browsing works without an account. Sign in to enable watchlist, continue watching, and sync across devices.",
  },
  {
    title: "How do watchlist and history work?",
    description:
      "When signed in, bookmarked titles appear in your watchlist and recently played items are saved to history so you can resume later.",
  },
  {
    title: "Can I request a movie or show?",
    description:
      "Use the request option on title pages when available, or open a suggestion via the project repository.",
  },
  {
    title: "Can I download videos?",
    description:
      "Only the Movies section supports torrent downloads. TV and anime sections will be supported soon.",
  },
];

const FAQ = () => {
  const { mobile } = useBreakpoints();
  const searchParams = useSearchParams();
  const content = (searchParams.get("content") || "movie") as "movie" | "tv" | "anime";
  const linkClass = cn("font-bold underline underline-offset-4 hover:underline", {
    "text-primary": content === "movie",
    "text-warning": content === "tv",
    "text-danger": content === "anime",
  });

  return (
    <Accordion variant="splitted" isCompact={mobile}>
      {FAQS.map(({ title, description }) => (
        <AccordionItem key={title} aria-label={title} title={title}>
          {typeof description === "string" ? (
            description
          ) : (
            // Clone elements to inject section-colored link classes where needed
            <div className="contents">
              {title === "Is it safe to use this site?" ? (
                <p>
                  Streaming happens via embedded players. Using StreamHQ is generally safe—just avoid pop‑ups
                  and unknown downloads. For details on how we handle data, see our{" "}
                  <Link href={`/privacy?content=${content}`} className={linkClass}>
                    Privacy Policy
                  </Link>
                  . Local laws apply; downloading or redistributing copyrighted content may be illegal.
                </p>
              ) : title === "Why are there ads on some players?" ? (
                <p>
                Some players include ads from their own providers — not us. To keep things smooth and hassle‑free,
                start with {" "}
                <Link href="https://adguard-dns.io/en/public-dns.html" target="_blank" className={linkClass}>
                  AdGuard DNS
                </Link>{" "}
                (recommended) — network‑level blocking that removes most ads across apps and browsers so you can just watch. You can also use {" "}
                <Link
                  href="https://chromewebstore.google.com/detail/adguard-adblocker/bgnkhhnnamicmpeenaelnjfhikgbkllg"
                  target="_blank"
                  className={linkClass}
                >
                  AdGuard AdBlocker
                </Link>{" "}
                (recommended), {" "}
                <Link href="https://adblockplus.org/" target="_blank" className={linkClass}>
                  Adblock Plus
                </Link>
                , or the {" "}
                <Link href="https://brave.com/" target="_blank" className={linkClass}>
                  Brave browser
                </Link>
                .
                </p>
              ) : (
                description
              )}
            </div>
          )}
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQ;
