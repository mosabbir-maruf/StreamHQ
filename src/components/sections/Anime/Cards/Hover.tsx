"use client";

import { anilist } from "@/api/anilist";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import Genres from "@/components/ui/other/Genres";
import Rating from "@/components/ui/other/Rating";
import {
  cleanAnimeDescription,
  getAnimeBannerUrl,
  mutateAnimeTitle,
  normalizeAnimeScore,
  getAnimeYear,
  animeDurationString,
} from "@/utils/anime";
import { cn } from "@/utils/helpers";
import { Button, Chip, Image, Link, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import { SavedMovieDetails } from "@/types/movie";
import { cachedFetch } from "@/utils/apiCache";

interface HoverPosterCardProps {
  id: number;
  fullWidth?: boolean;
  isUpcoming?: boolean;
}

const HoverPosterCard: React.FC<HoverPosterCardProps> = ({ id, fullWidth = false, isUpcoming = false }) => {
  const { data: anime, isPending } = useQuery({
    queryFn: () => cachedFetch(`anime-detail-${id}`, () => anilist.getAnimeById(id), 15 * 60 * 1000),
    queryKey: ["anime-hover", id],
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    retryDelay: 500,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const title = mutateAnimeTitle(anime || {});
  const year = getAnimeYear(anime?.startDate);
  const description = cleanAnimeDescription(anime?.description);
  const genres = anime?.genres?.map((g, i) => ({ id: i, name: g })) || [];

  if (isPending) {
    return (
      <div className={cn("w-80", { "w-full": fullWidth })}>
        <div className="h-96 w-80">
          <Spinner size="lg" color="danger" variant="simple" className="absolute-center" />
        </div>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-4">
        <p className="text-default-500">Failed to load anime details</p>
      </div>
    );
  }

  const backdropImage = getAnimeBannerUrl(anime.bannerImage);
  const isMovie = anime.format === "MOVIE";
  const href = isMovie ? `/anime/${id}/player` : `/anime/${id}/watch`;

  const bookmarkData: SavedMovieDetails = {
    type: "anime",
    adult: Boolean((anime as any)?.isAdult),
    backdrop_path: anime.bannerImage || "",
    id: Number(id),
    poster_path: anime.coverImage?.large || undefined,
    release_date: anime.startDate?.year ? `${anime.startDate.year}-01-01` : "",
    title,
    vote_average: normalizeAnimeScore(anime.averageScore),
    saved_date: new Date().toISOString(),
  };

  return (
    <>
      <div className={cn("w-80", { "w-full": fullWidth })}>
        <div className="relative">
          <div className="absolute aspect-video h-fit w-full">
            <div className="absolute z-2 h-full w-full bg-linear-to-t from-secondary-background from-1%"></div>
            <Image
              radius="none"
              alt={title}
              className="z-0 aspect-video rounded-t-lg object-cover object-center"
              src={backdropImage}
            />
          </div>
          <div className="flex flex-col gap-2 p-4 pt-[40%] *:z-10">
            <div className="flex gap-3">
              <Chip
                size="sm"
                color="danger"
                variant="faded"
                className="md:text-md text-xs"
                classNames={{ content: "font-bold" }}
              >
                Anime
              </Chip>
            </div>
            <h4 className="text-xl font-bold">{title}</h4>
            <div className="md:text-md flex flex-wrap gap-1 text-xs *:z-10">
              <div className="flex items-center gap-1">
                <span>{animeDurationString(anime.duration, anime.episodes)}</span>
              </div>
              <p>&#8226;</p>
              <div className="flex items-center gap-1">
                <span>{year}</span>
              </div>
              <p>&#8226;</p>
              <Rating rate={normalizeAnimeScore(anime.averageScore)} />
            </div>
            <Genres genres={genres} />
            <div className="flex w-full justify-between gap-2 py-1">
              {isUpcoming ? (
                <Button
                  fullWidth
                  color="danger"
                  variant="shadow"
                  isDisabled
                  startContent={<Icon icon="solar:clock-circle-bold" fontSize={24} />}
                  className="opacity-50 cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              ) : (
                <Button
                  as={Link}
                  href={href}
                  fullWidth
                  color="danger"
                  variant="shadow"
                  startContent={<Icon icon="solar:play-circle-bold" fontSize={24} />}
                >
                  Watch
                </Button>
              )}
              <BookmarkButton data={bookmarkData} isTooltipDisabled />
            </div>
            <p className="text-sm line-clamp-4">{description}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HoverPosterCard;

