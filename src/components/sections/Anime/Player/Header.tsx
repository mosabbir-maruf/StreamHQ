import { Button } from "@heroui/react";
import { cn } from "@/utils/helpers";
import ActionButton from "@/components/sections/Movie/Player/ActionButton";
import { List, Server } from "@/utils/icons";

interface AnimePlayerHeaderProps {
  id: number;
  animeName?: string;
  episode?: number;
  totalEpisodes?: number;
  showTitle?: boolean;
  onOpenSource: () => void;
  onOpenEpisodes: () => void;
  hidden: boolean;
  audio?: "sub" | "dub";
  onAudioChange?: (audio: "sub" | "dub") => void;
}

const AnimePlayerHeader: React.FC<AnimePlayerHeaderProps> = ({
  id,
  animeName,
  episode,
  totalEpisodes,
  showTitle = false,
  onOpenSource,
  onOpenEpisodes,
  hidden,
  audio,
  onAudioChange,
}) => {
  return (
    <div
      aria-hidden={hidden ? true : undefined}
      className={cn(
        "absolute top-0 z-40 flex h-28 w-full items-start justify-between gap-4",
        "bg-linear-to-b from-black/80 to-transparent p-2 text-white transition-opacity md:p-4",
        { "opacity-0": hidden },
      )}
    >
      {showTitle && animeName && (
        <div className="absolute left-1/2 hidden -translate-x-1/2 flex-col justify-center text-center sm:flex">
          <p className="text-sm font-bold text-white text-shadow-lg sm:text-lg lg:text-xl">{animeName}</p>
          {episode && totalEpisodes && (
            <p className="text-xs font-semibold text-gray-200 text-shadow-lg sm:text-sm lg:text-base">
              Episode {episode} of {totalEpisodes}
            </p>
          )}
        </div>
      )}
      <div className="flex items-center gap-2 ml-auto">
        {onAudioChange && (
          <div className="hidden gap-1 md:flex mr-1">
            <Button
              size="sm"
              variant={audio === "sub" ? "solid" : "flat"}
              color="danger"
              onPress={() => onAudioChange("sub")}
            >
              Sub
            </Button>
            <Button
              size="sm"
              variant={audio === "dub" ? "solid" : "flat"}
              color="danger"
              onPress={() => onAudioChange("dub")}
            >
              Dub
            </Button>
          </div>
        )}
        {totalEpisodes && totalEpisodes > 1 && (
          <ActionButton label="Episodes" tooltip="Episodes" onClick={onOpenEpisodes}>
            <List size={20} />
          </ActionButton>
        )}
        <ActionButton label="Sources" tooltip="Sources" onClick={onOpenSource}>
          <Server size={20} />
        </ActionButton>
      </div>
    </div>
  );
};

export default AnimePlayerHeader;

