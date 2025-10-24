import Rating from "@/components/ui/other/Rating";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { getImageUrl } from "@/utils/movies";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDisclosure, useHover } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { useLongPress } from "use-long-press";
import HoverPosterCard from "@/components/sections/Movie/Cards/Hover";
import TvShowHoverCard from "@/components/sections/TV/Cards/Hover";
import AnimeHoverCard from "@/components/sections/Anime/Cards/Hover";

interface ProfilePosterCardProps {
  item: any;
  type: "movie" | "anime" | "tv";
  variant?: "full" | "bordered";
}

const ProfilePosterCard: React.FC<ProfilePosterCardProps> = ({ item, type, variant = "full" }) => {
  const { hovered, ref } = useHover();
  const [opened, handlers] = useDisclosure(false);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();

  // Extract data based on type
  const getItemData = () => {
    // Handle both watchlist and history data structures
    const baseData = {
      id: item.id || item.media_id,
      title: item.title,
      poster_path: item.poster_path,
      release_date: item.release_date,
      vote_average: item.vote_average,
      adult: item.adult,
    };

    switch (type) {
      case "movie":
        return {
          ...baseData,
          isNew: item.release_date ? new Date(item.release_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false,
          href: `/movie/${baseData.id}`
        };
      case "anime":
        return {
          ...baseData,
          title: item.title?.english || item.title?.romaji || item.title?.native || item.title || "Unknown",
          poster_path: item.coverImage?.large || item.coverImage?.medium || item.poster_path,
          release_date: item.startDate?.year ? `${item.startDate.year}` : item.release_date,
          vote_average: item.averageScore ? item.averageScore / 10 : item.vote_average || 0,
          adult: item.isAdult !== undefined ? item.isAdult : item.adult,
          isNew: item.startDate?.year ? new Date(item.startDate.year, 0) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) : 
                 (item.release_date ? new Date(item.release_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false),
          href: `/anime/${baseData.id}`
        };
      case "tv":
        return {
          ...baseData,
          title: item.name || item.title,
          release_date: item.first_air_date || item.release_date,
          isNew: item.first_air_date ? new Date(item.first_air_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : 
                 (item.release_date ? new Date(item.release_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false),
          href: `/tv/${baseData.id}`
        };
      default:
        return {
          ...baseData,
          isNew: false,
          href: "#"
        };
    }
  };

  const itemData = getItemData();
  const releaseYear = itemData.release_date ? new Date(itemData.release_date).getFullYear() : 'TBA';
  
  // Handle image URLs correctly for different content types
  const getPosterImage = () => {
    if (!itemData.poster_path) return "/images/NA Poster.jpg";
    
    // If it's already a full URL (anime from AniList), use it directly
    if (itemData.poster_path.startsWith('http')) {
      return itemData.poster_path;
    }
    
    // For TMDB content (movies/TV), use getImageUrl
    return getImageUrl(itemData.poster_path);
  };
  
  const posterImage = getPosterImage();
  const title = itemData.title;
  

  const callback = useCallback(() => {
    handlers.open();
    setTimeout(() => startVibration([100]), 300);
  }, []);

  const longPress = useLongPress(mobile ? callback : null, {
    cancelOnMovement: true,
    threshold: 300,
  });

  // Get hover color based on type
  const getHoverColor = () => {
    switch (type) {
      case "movie": return "hover:border-primary";
      case "anime": return "hover:border-danger";
      case "tv": return "hover:border-warning";
      default: return "hover:border-primary";
    }
  };

  // Get hover card component based on type
  const getHoverCard = () => {
    switch (type) {
      case "movie":
        return <HoverPosterCard id={itemData.id} />;
      case "anime":
        return <AnimeHoverCard id={itemData.id} />;
      case "tv":
        return <TvShowHoverCard id={itemData.id} />;
      default:
        return <HoverPosterCard id={itemData.id} />;
    }
  };

  return (
    <>
      <Tooltip
        isDisabled={mobile}
        showArrow
        className="bg-secondary-background p-0"
        shadow="lg"
        delay={1000}
        placement="right-start"
        content={getHoverCard()}
      >
        <Link href={itemData.href} ref={ref} {...longPress()}>
          {variant === "full" && (
            <div className={`group motion-preset-focus relative aspect-2/3 overflow-hidden rounded-lg border-[3px] border-transparent text-white transition-colors bg-default-100 ${getHoverColor()}`}>
              {hovered && (
                <Icon
                  icon="line-md:play-filled"
                  width="64"
                  height="64"
                  className="absolute-center z-20 text-white"
                />
              )}
              {itemData.isNew && (
                <Chip
                  color="warning"
                  size="sm"
                  variant="shadow"
                  className="absolute right-2 top-2 z-20"
                >
                  New
                </Chip>
              )}
              {itemData.adult && (
                <Chip
                  color="danger"
                  size="sm"
                  variant="flat"
                  className="absolute left-2 top-2 z-20"
                >
                  18+
                </Chip>
              )}
              <div className="absolute bottom-0 z-2 h-1/2 w-full bg-linear-to-t from-black from-1%"></div>
              <div className="absolute bottom-0 z-3 flex w-full flex-col gap-1 px-4 py-3">
                <h6 className="truncate text-sm font-semibold">{title}</h6>
                <div className="flex justify-between text-xs">
                  <p>{releaseYear}</p>
                  <Rating rate={itemData.vote_average} />
                </div>
              </div>
              {type === "anime" ? (
                <div 
                  className="z-0 w-full h-full bg-cover bg-center bg-no-repeat transition group-hover:scale-110"
                  style={{
                    backgroundImage: `url(${posterImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                />
              ) : (
                <Image
                  alt={title}
                  src={posterImage}
                  radius="none"
                  className="z-0 w-full h-full object-cover object-center transition group-hover:scale-110"
                  classNames={{
                    img: "group-hover:opacity-70",
                  }}
                  fallbackSrc="/images/NA Poster.jpg"
                  onError={() => {
                  }}
                />
              )}
            </div>
          )}

          {variant === "bordered" && (
            <Card
              isHoverable
              fullWidth
              shadow="md"
              className="group h-full bg-secondary-background"
            >
              <CardHeader className="flex items-center justify-center pb-0">
                <div className="relative size-full">
                  {hovered && (
                    <Icon
                      icon="line-md:play-filled"
                      width="64"
                      height="64"
                      className="absolute-center z-20 text-white"
                    />
                  )}
                  {itemData.isNew && (
                    <Chip
                      color="warning"
                      size="sm"
                      variant="shadow"
                      className="absolute right-2 top-2 z-20"
                    >
                      New
                    </Chip>
                  )}
                  {itemData.adult && (
                    <Chip
                      color="danger"
                      size="sm"
                      variant="shadow"
                      className="absolute left-2 top-2 z-20"
                    >
                      18+
                    </Chip>
                  )}
                  <div className="relative overflow-hidden rounded-large">
                    <Image
                      isBlurred
                      alt={title}
                      className="aspect-2/3 rounded-lg object-cover object-center group-hover:scale-110"
                      src={posterImage}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody className="justify-end pb-1">
                <p className="text-md truncate font-bold">{title}</p>
              </CardBody>
              <CardFooter className="justify-between pt-0 text-xs">
                <p>{releaseYear}</p>
                <Rating rate={itemData.vote_average} />
              </CardFooter>
            </Card>
          )}
        </Link>
      </Tooltip>

      {mobile && (
        <VaulDrawer
          backdrop="blur"
          open={opened}
          onOpenChange={handlers.toggle}
          title={title}
          hiddenTitle
        >
          {getHoverCard()}
        </VaulDrawer>
      )}
    </>
  );
};

export default ProfilePosterCard;
