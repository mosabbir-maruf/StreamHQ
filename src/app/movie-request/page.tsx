import { siteConfig } from "@/config/site";
import type { Metadata } from "next";
import MovieRequestForm from "./MovieRequestForm";
import { Next } from "@/utils/icons";
import { Saira } from "@/utils/fonts";
import { cn } from "@/utils/helpers";

export const metadata: Metadata = {
  title: `Add/Remove Movie | ${siteConfig.name}`,
  description: `Request to add or remove movies from ${siteConfig.name}`,
};

export default async function MovieRequestPage({ searchParams }: any) {
  const resolvedParams = searchParams && typeof searchParams.then === "function" ? await searchParams : searchParams;
  const raw = resolvedParams?.content;
  const content = Array.isArray(raw) ? raw[0] ?? "movie" : raw ?? "movie";
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 pt-1 pb-2 md:pt-2 md:pb-4">
      <header className="text-center">
        <h1 className="text-3xl font-semibold md:text-4xl flex flex-col md:flex-row items-center justify-center gap-2">
          <span>Add/Remove Content</span>
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
        <p className="mt-2 text-foreground/70">
          Help us improve our collection by requesting to add or remove movies.
        </p>
      </header>

      <MovieRequestForm />
    </section>
  );
}
