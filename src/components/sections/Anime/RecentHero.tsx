"use client";

import { anilist } from "@/api/anilist";
import { mutateAnimeTitle, getAnimeBannerUrl, normalizeAnimeScore, cleanAnimeDescription } from "@/utils/anime";
import { useInViewport } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { Button, Chip, Skeleton } from "@heroui/react";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { useCustomCarousel } from "@/hooks/useCustomCarousel";
import styles from "@/styles/embla-carousel.module.css";
import IconButton from "@/components/ui/button/IconButton";
import { ChevronLeft, ChevronRight, Play, Star } from "@/utils/icons";
import { cn } from "@/utils/helpers";
import { cachedFetch } from "@/utils/apiCache";

const AnimeRecentHero: React.FC = () => {
  const { ref, inViewport } = useInViewport();
  const { data, isPending } = useQuery({
    queryFn: () => cachedFetch("trending-anime-hero", () => anilist.getTrending(1, 20), 10 * 60 * 1000),
    queryKey: ["trending-anime-hero"],
    enabled: inViewport,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const c = useCustomCarousel(
    { loop: true },
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

  const items = data?.Page?.media?.slice(0, 9) || [];

  return (
    <section ref={ref} id="recent-anime" className="-mt-8 min-h-[70vh] md:-mt-4 md:min-h-[85vh]">
      {isPending ? (
        <Skeleton className="h-[70vh] rounded-xl md:h-[85vh]" />
      ) : (
        <div className="relative">
          <div className={cn(styles.wrapper, "relative flex w-full flex-col justify-center")}> 
            {/* Nav buttons */}
            <div className="absolute inset-y-0 z-10 flex items-center">
              <IconButton
                onPress={c.scrollPrev}
                size="lg"
                radius="full"
                disableRipple
                icon={<ChevronLeft size={24} />}
                aria-label="Previous"
                variant="flat"
                className="mx-2 size-10 bg-black/40 text-white shadow-lg ring-1 ring-black/30 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 dark:ring-white/20 md:mx-4 md:size-12"
              />
            </div>
            <div className="absolute inset-y-0 right-0 z-10 flex items-center">
              <IconButton
                onPress={c.scrollNext}
                size="lg"
                radius="full"
                disableRipple
                icon={<ChevronRight size={24} />}
                aria-label="Next"
                variant="flat"
                className="mx-2 size-10 bg-black/40 text-white shadow-lg ring-1 ring-black/30 hover:bg-black/60 dark:bg-white/10 dark:hover:bg-white/20 dark:ring-white/20 md:mx-4 md:size-12"
              />
            </div>

            {/* Viewport */}
            <div className={styles.viewport} ref={c.emblaRef}>
              <div className={cn(styles.container, "gap-3")}> 
                {items.map((anime) => {
                  const backdrop = getAnimeBannerUrl(anime.bannerImage || anime.coverImage?.extraLarge);
                  const title = mutateAnimeTitle(anime);
                  const rating = normalizeAnimeScore(anime.averageScore);
                  const overview = cleanAnimeDescription(anime.description)?.slice(0, 220);
                  return (
                    <div key={anime.id} className="embla__slide px-1">
                      <div className="relative h-[70vh] overflow-hidden rounded-xl md:h-[85vh]">
                        <img src={backdrop} alt={title} className="size-full object-cover object-center" />
                        <div className="absolute inset-0 z-10 bg-black/40 dark:bg-background/40" />
                        <div className="absolute inset-0 z-20 bg-linear-to-b from-black/60 from-1% via-transparent via-30% dark:from-background dark:from-1%" />
                        <div className="absolute inset-0 z-20 translate-y-px bg-linear-to-t from-black/60 from-1% via-transparent via-55% dark:from-background dark:from-1%" />
                        <div className="absolute bottom-24 left-0 right-0 z-30 p-5 pl-10 md:bottom-32 md:p-8 md:pl-20">
                          <div className="max-w-3xl">
                            <div className="mb-4 flex items-center gap-3 md:mb-6">
                              <Chip
                                size="md"
                                color="danger"
                                variant="solid"
                                className="px-3 py-1.5 text-base md:text-lg"
                                startContent={<Star size={14} />}
                              >
                                {rating.toFixed(1)}
                              </Chip>
                            </div>
                            <h2 className="mb-4 line-clamp-2 text-4xl font-extrabold text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] md:mb-6 md:text-7xl">
                              {title}
                            </h2>
                            {overview && (
                              <p className="mb-6 line-clamp-2 max-w-2xl text-sm text-gray-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] md:mb-8 md:line-clamp-3 md:text-base">
                                {overview}
                              </p>
                            )}
                            <Link href={`/anime/${anime.id}`}>
                              <Button color="danger" radius="full" size="lg" startContent={<Play size={18} />}>
                                Watch Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 select-none md:bottom-6">
            <div className="flex items-center gap-2">
              {items.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  onClick={() => c.scrollTo(idx)}
                  className={cn(
                    "size-2 rounded-full bg-white/40 transition md:size-2.5",
                    c.selectedIndex === idx && "bg-danger",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AnimeRecentHero;
