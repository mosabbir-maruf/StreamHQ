"use client";

import { Image, Chip, Button } from "@heroui/react";
import { 
  getAnimeCoverUrl, 
  mutateAnimeTitle, 
  cleanAnimeDescription,
  normalizeAnimeScore,
  getAnimeYear,
  formatAnimeStatus,
  animeDurationString,
  formatAnimeFormat
} from "@/utils/anime";
import BookmarkButton from "@/components/ui/button/BookmarkButton";
import Rating from "../../../ui/other/Rating";
import ShareButton from "@/components/ui/button/ShareButton";
import { useDocumentTitle } from "@mantine/hooks";
import { siteConfig } from "@/config/site";
import { FaCirclePlay } from "react-icons/fa6";
import Genres from "@/components/ui/other/Genres";
import SectionTitle from "@/components/ui/other/SectionTitle";
import Trailer from "@/components/ui/overlay/Trailer";
import { Calendar, Clock } from "@/utils/icons";
import Link from "next/link";
import { SavedMovieDetails } from "@/types/movie";
import { AnimeMedia } from "@/api/anilist";
import AnimeEpisodes from "./Episodes";

interface OverviewSectionProps {
  anime: AnimeMedia;
  onViewEpisodesClick: () => void;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ anime, onViewEpisodesClick }) => {
  const releaseYear = getAnimeYear(anime.startDate);
  const coverImage = getAnimeCoverUrl(anime.coverImage?.large);
  const title = mutateAnimeTitle(anime);
  const description = cleanAnimeDescription(anime.description);
  const genres = anime.genres?.map((g, i) => ({ id: i, name: g })) || [];
  const studioNames = Array.from(
    new Set(
      (anime.studios?.nodes || [])
        .filter((s) => s.isAnimationStudio)
        .map((s) => s.name)
    )
  ).join(", ");
  const isMovie = anime.format === "MOVIE";
  
  const bookmarkData: SavedMovieDetails = {
    type: "anime",
    adult: anime.isAdult,
    backdrop_path: anime.bannerImage || anime.coverImage?.large || "",
    id: anime.id,
    poster_path: anime.coverImage?.large,
    release_date: anime.startDate?.year ? `${anime.startDate.year}-01-01` : "",
    title: title,
    vote_average: normalizeAnimeScore(anime.averageScore),
    saved_date: new Date().toISOString(),
  };

  useDocumentTitle(`${title} | ${siteConfig.name}`);

  // Convert trailer to TMDB format if available
  const trailerVideos = anime.trailer
    ? [
        {
          id: anime.trailer.id,
          key: anime.trailer.id,
          site: anime.trailer.site,
          type: "Trailer",
          name: `${title} Trailer`,
        },
      ]
    : [];

  return (
    <section id="overview" className="relative z-3 flex flex-col gap-8 pt-[20vh] md:pt-[40vh]">
      <div className="md:grid md:grid-cols-[auto_1fr] md:gap-6">
        <Image
          isBlurred
          shadow="md"
          alt={title}
          classNames={{
            wrapper: "w-52 max-h-min aspect-2/3 hidden md:block",
          }}
          className="object-cover object-center"
          src={coverImage}
        />

        <div className="flex flex-col gap-8">
          <div id="title" className="flex flex-col gap-1 md:gap-2">
            <div className="flex gap-3">
              <Chip
                color="danger"
                variant="faded"
                className="md:text-md text-xs"
                classNames={{ content: "font-bold" }}
              >
                Anime
              </Chip>
              <Chip
                color="secondary"
                variant="faded"
                className="md:text-md text-xs"
              >
                {formatAnimeFormat(anime.format)}
              </Chip>
              {anime.isAdult && (
                <Chip color="danger" variant="faded">
                  18+
                </Chip>
              )}
            </div>
            <h2 className="text-2xl font-black md:text-4xl">{title}</h2>
            <div className="md:text-md flex flex-wrap gap-1 text-xs md:gap-2">
              <div className="flex items-center gap-1">
                <Clock />
                <span>{animeDurationString(anime.duration, anime.episodes)}</span>
              </div>
              <p>&#8226;</p>
              <div className="flex items-center gap-1">
                <Calendar />
                <span>{releaseYear}</span>
              </div>
              <p>&#8226;</p>
              <Rating rate={normalizeAnimeScore(anime.averageScore)} />
              <p>&#8226;</p>
              <span>{formatAnimeStatus(anime.status)}</span>
              {studioNames && (
                <>
                  <p>&#8226;</p>
                  <span>{studioNames}</span>
                </>
              )}
            </div>
            <Genres genres={genres} />
          </div>

          {/* Studios section removed; studios shown inline above */}

          <div id="action" className="flex w-full flex-wrap justify-between gap-4 md:gap-0">
            <div className="flex flex-wrap gap-2">
              {anime.status === 'NOT_YET_RELEASED' ? (
                <Button
                  color="danger"
                  variant="shadow"
                  isDisabled
                  startContent={<Clock size={22} />}
                  className="opacity-50 cursor-not-allowed"
                >
                  Coming Soon
                </Button>
              ) : isMovie ? (
                <Button
                  as={Link}
                  href={`/anime/${anime.id}/watch`}
                  color="danger"
                  variant="shadow"
                  startContent={<FaCirclePlay size={22} />}
                >
                  Watch
                </Button>
              ) : (
                <Button
                  as={Link}
                  href={`/anime/${anime.id}/watch`}
                  color="danger"
                  variant="shadow"
                  startContent={<FaCirclePlay size={22} />}
                >
                  Watch
                </Button>
              )}
              {trailerVideos.length > 0 && <Trailer color="danger" videos={trailerVideos as any} />}
            </div>
            <div className="flex flex-wrap gap-2">
              <ShareButton id={anime.id} title={title} />
              <BookmarkButton data={bookmarkData} />
            </div>
          </div>

          <div id="story" className="flex flex-col gap-2">
            <SectionTitle color="danger">Synopsis</SectionTitle>
            <p className="text-sm">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OverviewSection;

