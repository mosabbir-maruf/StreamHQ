import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Next } from "@/utils/icons";
import { Saira } from "@/utils/fonts";
import { cn } from "@/utils/helpers";

const FAQ = dynamic(() => import("@/components/sections/About/FAQ"));

export const metadata: Metadata = {
  title: `About & FAQ | ${siteConfig.name}`,
  description: `${siteConfig.name} — ${siteConfig.description}`,
};

export default async function AboutAndFAQPage({ searchParams }: any) {
  const resolvedParams = searchParams && typeof searchParams.then === "function" ? await searchParams : searchParams;
  const raw = resolvedParams?.content;
  const content = Array.isArray(raw) ? raw[0] ?? "movie" : raw ?? "movie";
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 pt-2 pb-4">
      <header className="text-center">
        <h1 className="text-3xl font-semibold md:text-4xl flex items-center justify-center gap-2">
          About
          <span
            className={cn(
              "flex items-center bg-linear-to-r from-transparent from-80% via-white to-transparent bg-size-[200%_100%] bg-clip-text bg-position-[40%] text-2xl md:text-3xl",
              "tracking-widest transition-[letter-spacing] hover:tracking-[0.2em]",
              Saira.className,
            )}
          >
            Stream
            <span>
              <Next
                className={cn(
                  "size-full px-[2px] transition-colors",
                  {
                    "text-primary": content === "movie",
                    "text-warning": content === "tv",
                    "text-danger": content === "anime",
                  },
                )}
              />
            </span>
            HQ
          </span>
        </h1>
        <p className="mt-2 text-foreground/70">{siteConfig.description}</p>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3 md:gap-10">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-default-200 md:col-span-1">
          <Image
            src="/images/meta.jpeg"
            alt={`${siteConfig.name} preview`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="md:col-span-2">
          <h2 className="mb-2 text-2xl font-semibold">What we are</h2>
          <p className="text-foreground/80">
            {siteConfig.name} is a discovery-first streaming directory. We help you find movies and TV
            shows quickly with curated lists, powerful filters, and embedded players from
            third‑party providers. We do not store or host any video files.
          </p>
          <ul className={cn("mt-4 list-disc space-y-2 pl-6 text-foreground/80", {
            "marker:text-primary": content === "movie",
            "marker:text-warning": content === "tv",
            "marker:text-danger": content === "anime",
          })}>
            <li>Personalized lists like Trending, Popular, and Top Rated.</li>
            <li>Regional discovery for Bollywood, Tamil, Malayalam, and more.</li>
            <li>Watchlist, history, and continue watching when signed in.</li>
            <li>Responsive UI optimized for mobile, tablet, and desktop.</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
        <div className="rounded-xl border border-default-200 p-5">
          <h3 className="mb-2 text-xl font-semibold">How it works</h3>
          <p className="text-foreground/80">
            Browse or search titles, then play using built-in third‑party players (e.g., Vidlink,
            VidSrc). If a source is slow, switch servers from the player menu.
          </p>
        </div>
        <div className="rounded-xl border border-default-200 p-5">
          <h3 className="mb-2 text-xl font-semibold">Legal & Safety</h3>
          <p className="text-foreground/80">
            We index links from external providers for promotional purposes. Please review our
            <Link href={`/privacy?content=${content}`} className={cn("font-semibold underline underline-offset-4 hover:underline", {
              "text-primary": content === "movie",
              "text-warning": content === "tv",
              "text-danger": content === "anime",
            })}> Privacy Policy</Link>
            . Local laws apply—avoid downloading or redistributing copyrighted content.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-default-200 p-5">
        <h3 className="mb-2 text-xl font-semibold">Contact</h3>
        <p className="text-foreground/80">
          Have a question or suggestion? Visit our
          {" "}
          <Link href={`/contact?content=${content}`} className={cn("font-semibold underline underline-offset-4 hover:underline", {
            "text-primary": content === "movie",
            "text-warning": content === "tv",
            "text-danger": content === "anime",
          })}>
            Contact page
          </Link>
          .
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-4">
        <header className="text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Frequently Asked Questions</h2>
          <p className="text-foreground/80">Answers to common questions about {siteConfig.name}.</p>
        </header>
        <FAQ />
      </div>
    </section>
  );
}


