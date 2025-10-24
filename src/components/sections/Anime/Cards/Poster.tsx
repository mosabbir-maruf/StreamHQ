import Rating from "@/components/ui/other/Rating";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import useBreakpoints from "@/hooks/useBreakpoints";
import useDeviceVibration from "@/hooks/useDeviceVibration";
import { 
  getAnimeCoverUrl, 
  mutateAnimeTitle, 
  getAnimeYear, 
  isNewAnimeRelease,
  normalizeAnimeScore 
} from "@/utils/anime";
import { Card, CardBody, CardFooter, CardHeader, Chip, Image, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDisclosure, useHover } from "@mantine/hooks";
import Link from "next/link";
import { useCallback } from "react";
import { useLongPress } from "use-long-press";
import HoverPosterCard from "./Hover";
import { AnimeMedia } from "@/api/anilist";

interface AnimePosterCardProps {
  anime: Partial<AnimeMedia>;
  variant?: "full" | "bordered";
  isUpcoming?: boolean;
}

const AnimePosterCard: React.FC<AnimePosterCardProps> = ({ anime, variant = "full", isUpcoming = false }) => {
  const { hovered, ref } = useHover();
  const [opened, handlers] = useDisclosure(false);
  const releaseYear = getAnimeYear(anime.startDate);
  const isNew = isNewAnimeRelease(anime.startDate);
  const coverImage = getAnimeCoverUrl(anime.coverImage?.large);
  const title = mutateAnimeTitle(anime);
  const { mobile } = useBreakpoints();
  const { startVibration } = useDeviceVibration();

  const callback = useCallback(() => {
    handlers.open();
    setTimeout(() => startVibration([100]), 300);
  }, []);

  const longPress = useLongPress(mobile ? callback : null, {
    cancelOnMovement: true,
    threshold: 300,
  });

  return (
    <>
      <Tooltip
        isDisabled={mobile}
        showArrow
        className="bg-secondary-background p-0"
        shadow="lg"
        delay={1000}
        placement="right-start"
        content={<HoverPosterCard id={anime.id!} isUpcoming={isUpcoming} />}
      >
        <Link href={`/anime/${anime.id}`} ref={ref} {...longPress()}>
          {variant === "full" && (
            <div className="group motion-preset-focus relative aspect-2/3 overflow-hidden rounded-lg border-[3px] border-transparent text-white transition-colors hover:border-danger">
              {hovered && !isUpcoming && (
                <Icon
                  icon="line-md:play-filled"
                  width="64"
                  height="64"
                  className="absolute-center z-20 text-white"
                />
              )}
              {isNew && (
                <Chip
                  color="warning"
                  size="sm"
                  variant="shadow"
                  className="absolute right-2 top-2 z-20"
                >
                  New
                </Chip>
              )}
              {anime.isAdult && (
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
                  <Rating rate={normalizeAnimeScore(anime.averageScore)} />
                </div>
              </div>
              <Image
                alt={title}
                src={coverImage}
                radius="none"
                className="z-0 aspect-2/3 h-[250px] object-cover object-center transition group-hover:scale-110 md:h-[300px]"
                classNames={{
                  img: "group-hover:opacity-70",
                }}
              />
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
                  {hovered && !isUpcoming && (
                    <Icon
                      icon="line-md:play-filled"
                      width="64"
                      height="64"
                      className="absolute-center z-20 text-white"
                    />
                  )}
                  {isNew && (
                    <Chip
                      color="warning"
                      size="sm"
                      variant="shadow"
                      className="absolute right-2 top-2 z-20"
                    >
                      New
                    </Chip>
                  )}
                  {anime.isAdult && (
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
                      src={coverImage}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardBody className="justify-end pb-1">
                <p className="text-md truncate font-bold">{title}</p>
              </CardBody>
              <CardFooter className="justify-between pt-0 text-xs">
                <p>{releaseYear}</p>
                <Rating rate={normalizeAnimeScore(anime.averageScore)} />
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
          <HoverPosterCard id={anime.id!} fullWidth isUpcoming={isUpcoming} />
        </VaulDrawer>
      )}
    </>
  );
};

export default AnimePosterCard;

