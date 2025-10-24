"use client";

import { AnimeMedia } from "@/api/anilist";
import { cn, formatDate } from "@/utils/helpers";
import { Grid, List, PlayOutline, Search, SortAlpha } from "@/utils/icons";
import { animeDurationString } from "@/utils/anime";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Input, Tabs, Tab, ScrollShadow } from "@heroui/react";
import Link from "next/link";
import { useDebouncedValue } from "@mantine/hooks";
import { useMemo, useState } from "react";
import IconButton from "@/components/ui/button/IconButton";
import useBreakpoints from "@/hooks/useBreakpoints";

interface AnimeEpisodesProps {
  anime: AnimeMedia;
}

const EpisodeListCard: React.FC<{ animeId: number; episode: number; duration?: number; banner?: string; airDate?: string; title?: string; overview?: string }> = ({ animeId, episode, duration, banner, airDate, title, overview }) => {
  const { mobile } = useBreakpoints();
  const href = `/anime/${animeId}/watch?episode=${episode}`;
  const episodeTitle = title || `Episode ${episode}`;
  const episodeAirDate = airDate || "";
  const episodeOverview = overview || "Click to play";
  
  return (
    <Card
      isPressable
      as={Link as any}
      href={href}
      shadow="none"
      className={cn(
        "group motion-preset-blur-right border-foreground-200 bg-foreground-100 motion-duration-300 grid grid-cols-[auto_1fr] gap-3 border-2 transition-colors",
        "hover:border-danger hover:bg-foreground-200",
      )}
    >
      <div className="relative">
        <Image
          alt={episodeTitle}
          src={banner || "/images/placeholder.png"}
          height={120}
          width={mobile ? 180 : 220}
          className="rounded-r-none object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
            <PlayOutline className="h-6 w-6 text-white" />
          </div>
        </div>
        <Chip size="sm" className="absolute bottom-2 left-2 z-20 min-w-9 bg-black/35 text-center text-white backdrop-blur-xs">
          {episode}
        </Chip>
        {duration && (
          <Chip size="sm" className="absolute top-2 right-2 z-20 bg-black/35 backdrop-blur-xs">
            {animeDurationString(duration, 1)}
          </Chip>
        )}
      </div>
      <CardBody className="flex space-y-1">
        <p
          title={episodeTitle}
          className="line-clamp-1 text-xl font-semibold transition-colors group-hover:text-danger"
        >
          {episodeTitle}
        </p>
        {episodeAirDate && (
          <p className="text-content4-foreground line-clamp-1 text-xs">
            {formatDate(episodeAirDate, "en-US")}
          </p>
        )}
        <p className="text-foreground-500 line-clamp-2 text-sm" title={episodeOverview}>
          {episodeOverview}
        </p>
      </CardBody>
    </Card>
  );
};

const EpisodeGridCard: React.FC<{ animeId: number; episode: number; duration?: number; banner?: string; airDate?: string; title?: string; overview?: string }> = ({ animeId, episode, duration, banner, airDate, title, overview }) => {
  const href = `/anime/${animeId}/watch?episode=${episode}`;
  const episodeTitle = title || `Episode ${episode}`;
  const episodeAirDate = airDate || "";
  const episodeOverview = overview || "Click to play";
  
  return (
    <Card isPressable as={Link as any} href={href} shadow="none" className="group motion-preset-focus border-foreground-200 bg-foreground-100 border-2 transition-colors hover:border-danger hover:bg-foreground-200">
      <CardBody className="overflow-visible p-0">
        <div className="relative">
          <Image alt={episodeTitle} src={banner || "/images/placeholder.png"} className="aspect-video w-full rounded-b-none object-cover" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/35 opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
              <PlayOutline className="h-6 w-6 text-white" />
            </div>
          </div>
          <Chip size="sm" className="absolute bottom-2 left-2 z-20 min-w-9 bg-black/35 text-center text-white backdrop-blur-xs">{episode}</Chip>
          {duration && (
            <Chip size="sm" className="absolute top-2 right-2 z-20 bg-black/35 backdrop-blur-xs">
              {animeDurationString(duration, 1)}
            </Chip>
          )}
        </div>
      </CardBody>
      <CardFooter className="h-full">
        <div className="flex h-full flex-col gap-2">
          <p
            title={episodeTitle}
            className="text-lg font-semibold transition-colors group-hover:text-danger"
          >
            {episodeTitle}
          </p>
          {episodeAirDate && (
            <p className="text-content4-foreground line-clamp-1 text-xs">
              {formatDate(episodeAirDate, "en-US")}
            </p>
          )}
          <p className="text-foreground-500 text-sm" title={episodeOverview}>
            {episodeOverview}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

const AnimeEpisodes: React.FC<AnimeEpisodesProps> = ({ anime }) => {
  // Don't show episodes for anime that hasn't been released yet
  if (anime.status === 'NOT_YET_RELEASED') {
    return (
      <Card className="p-2 sm:p-3">
        <CardBody>
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-foreground-700 mb-2">Coming Soon</h3>
            <p className="text-foreground-500">This anime hasn't been released yet. Episodes will be available once it starts airing.</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const total = anime.episodes && anime.episodes > 0 ? anime.episodes : 1;
  const isSingle = total === 1;

  // Compact layout for single-episode anime
  if (isSingle) {
    return (
      <Card className="p-2 sm:p-3">
        <CardBody>
          <div className="grid grid-cols-1">
            <EpisodeListCard
              animeId={anime.id}
              episode={1}
              duration={anime.duration || undefined}
              banner={anime.bannerImage || anime.coverImage?.large}
              title={anime.title?.english || anime.title?.romaji || `Episode 1`}
              overview="Click to play"
            />
          </div>
        </CardBody>
      </Card>
    );
  }

  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [search, setSearch] = useState("");
  const [searchQuery] = useDebouncedValue(search, 300);
  const [sortedDesc, setSortedDesc] = useState(false);

  const episodes = useMemo(() => Array.from({ length: total }, (_, i) => i + 1), [total]);
  const filtered = useMemo(() => {
    let list = episodes.filter((ep) => (searchQuery ? ep.toString().includes(searchQuery) : true));
    if (sortedDesc) list = [...list].sort((a, b) => b - a);
    return list;
  }, [episodes, searchQuery, sortedDesc]);

  return (
    <Card className="sm:p-3">
      <CardHeader className="grid grid-cols-1 grid-rows-[1fr_auto] gap-3 md:grid-cols-[1fr_auto_auto]">
        <Input
          isClearable
          aria-label="Search Episodes"
          placeholder="Search episodes..."
          value={search}
          onValueChange={setSearch}
          startContent={<Search />}
          classNames={{ inputWrapper: "border-2 border-foreground-200" }}
        />
        <Tabs
          color="danger"
          aria-label="Layout Select"
          size="sm"
          classNames={{ tabList: "border-2 border-foreground-200" }}
          onSelectionChange={(value) => setLayout(value as typeof layout)}
          selectedKey={layout}
        >
          <Tab key="list" title={<List />} />
          <Tab key="grid" title={<Grid />} />
        </Tabs>
        <IconButton
          tooltip="Sort order"
          className="p-2"
          icon={<SortAlpha />}
          onPress={() => setSortedDesc((p) => !p)}
          color={sortedDesc ? "danger" : undefined}
          variant={sortedDesc ? "shadow" : "faded"}
        />
      </CardHeader>
      <CardBody>
        <ScrollShadow className="h-[600px] py-2 pr-2 sm:pr-3">
          {layout === "grid" ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {filtered.map((ep) => (
                <EpisodeGridCard
                  key={ep}
                  animeId={anime.id}
                  episode={ep}
                  duration={anime.duration || undefined}
                  banner={anime.bannerImage || anime.coverImage?.large}
                  title={`Episode ${ep}`}
                  overview="Click to play"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:gap-4">
              {filtered.map((ep) => (
                <EpisodeListCard
                  key={ep}
                  animeId={anime.id}
                  episode={ep}
                  duration={anime.duration || undefined}
                  banner={anime.bannerImage || anime.coverImage?.large}
                  title={`Episode ${ep}`}
                  overview="Click to play"
                />
              ))}
            </div>
          )}
        </ScrollShadow>
      </CardBody>
    </Card>
  );
};

export default AnimeEpisodes;
