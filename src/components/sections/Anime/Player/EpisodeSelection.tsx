import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import { Card, CardBody, Chip, Image } from "@heroui/react";
import Link from "next/link";
import { cn } from "@/utils/helpers";
import { useEffect, useRef } from "react";

interface EpisodeSelectionProps {
  opened: boolean;
  onClose: () => void;
  animeId: number;
  currentEpisode: number;
  totalEpisodes: number;
  banner?: string;
  duration?: number;
}

const EpisodeSelection: React.FC<EpisodeSelectionProps> = ({
  opened,
  onClose,
  animeId,
  currentEpisode,
  totalEpisodes,
  banner,
  duration,
}) => {
  const episodes = Array.from({ length: totalEpisodes }, (_, i) => i + 1);
  const episodeListRef = useRef<HTMLDivElement>(null);
  const activeEpisodeRef = useRef<HTMLDivElement>(null);

  // Scroll to active episode when drawer opens
  useEffect(() => {
    const scrollToActiveEpisode = () => {
      if (opened && episodeListRef.current) {
        const episodeList = episodeListRef.current;
        
        // Try to find the active episode element if ref is not available
        let activeEpisode = activeEpisodeRef.current;
        if (!activeEpisode) {
          const activeEpisodeElement = episodeList.querySelector(`[data-episode="${currentEpisode}"]`);
          if (activeEpisodeElement) {
            activeEpisode = activeEpisodeElement as HTMLDivElement;
          }
        }
        
        if (activeEpisode) {
          // Try scrollIntoView first as it's more reliable
          try {
            activeEpisode.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
          } catch (error) {
            // Fallback to manual scroll calculation
            const scrollTop = activeEpisode.offsetTop - episodeList.offsetTop - (episodeList.clientHeight / 2) + (activeEpisode.clientHeight / 2);
            
            episodeList.scrollTo({
              top: Math.max(0, scrollTop),
              behavior: 'smooth'
            });
          }
        }
      }
    };

    // Use a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(scrollToActiveEpisode, 200);
    
    return () => clearTimeout(timeoutId);
  }, [opened, currentEpisode]);

  return (
    <VaulDrawer
      open={opened}
      onClose={onClose}
      backdrop="blur"
      title="Select Episode"
      direction="right"
      hiddenHandler
      withCloseButton
    >
      <div 
        ref={episodeListRef}
        className="grid grid-cols-1 gap-2 p-2 sm:gap-4 sm:p-4 max-h-[70vh] overflow-y-auto"
      >
        {episodes.map((episode) => {
          const href = `/anime/${animeId}/watch?episode=${episode}`;
          const isCurrentEpisode = currentEpisode === episode;
          return (
            <Card
              key={episode}
              ref={isCurrentEpisode ? activeEpisodeRef : null}
              isPressable
              as={Link as any}
              href={href}
              data-episode={episode}
              shadow="md"
              className={cn(
                "group motion-preset-blur-right border-foreground-200 bg-background motion-duration-300 grid grid-cols-[auto_1fr] gap-3 border-2 transition-colors",
                "hover:border-danger hover:bg-foreground-200",
                { "border-danger bg-foreground-200": isCurrentEpisode }
              )}
              onClick={onClose}
            >
              <div className="relative">
                <Image
                  alt={`Episode ${episode}`}
                  src={banner || "/images/placeholder.png"}
                  height={120}
                  width={220}
                  className="rounded-r-none object-cover"
                />
                <Chip size="sm" className="absolute bottom-2 left-2 z-20 min-w-9 bg-black/35 text-center text-white backdrop-blur-xs">
                  {episode}
                </Chip>
                {duration && (
                  <Chip size="sm" className="absolute top-2 right-2 z-20 bg-black/35 backdrop-blur-xs">
                    {duration}m
                  </Chip>
                )}
              </div>
              <CardBody className="flex space-y-1">
                <p className="line-clamp-1 text-xl font-semibold transition-colors group-hover:text-danger">
                  Episode {episode}
                </p>
                <p className="text-foreground-500 line-clamp-2 text-sm">Click to play</p>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </VaulDrawer>
  );
};

export default EpisodeSelection;

