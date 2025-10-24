import { cn } from "@/utils/helpers";
import { List, Next, Prev, Server } from "@/utils/icons";
import BackButton from "@/components/ui/button/BackButton";
import ActionButton from "./ActionButton";
import { TvShowPlayerProps } from "./Player";

interface TvShowPlayerHeaderProps extends Omit<TvShowPlayerProps, "episodes" | "tv" | "startAt"> {
  hidden?: boolean;
  selectedSource: number;
  showTitle?: boolean;
  onOpenSource: () => void;
  onOpenEpisode: () => void;
}

const TvShowPlayerHeader: React.FC<TvShowPlayerHeaderProps> = ({
  id,
  seriesName,
  seasonName,
  episode,
  hidden,
  selectedSource,
  showTitle = false,
  nextEpisodeNumber,
  prevEpisodeNumber,
  onOpenSource,
  onOpenEpisode,
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
      <BackButton href={`/tv/${id}`} />
      {showTitle && (
        <div className="absolute left-1/2 hidden -translate-x-1/2 flex-col justify-center text-center sm:flex">
          <p className="text-sm font-bold text-white text-shadow-lg sm:text-lg lg:text-xl">{seriesName}</p>
          <p className="text-xs font-semibold text-gray-200 text-shadow-lg sm:text-sm lg:text-base">
            {seasonName} - {episode.name}
          </p>
        </div>
      )}
      <div className="flex items-center gap-2 ml-auto">
        <ActionButton
          disabled={!prevEpisodeNumber}
          label="Previous Episode"
          tooltip="Previous Episode"
          href={`/tv/${id}/${episode.season_number}/${prevEpisodeNumber}/player?src=${selectedSource}`}
        >
          <Prev size={20} />
        </ActionButton>
        <ActionButton
          disabled={!nextEpisodeNumber}
          label="Next Episode"
          tooltip="Next Episode"
          href={`/tv/${id}/${episode.season_number}/${nextEpisodeNumber}/player?src=${selectedSource}`}
        >
          <Next size={20} />
        </ActionButton>
        <ActionButton label="Sources" tooltip="Sources" onClick={onOpenSource}>
          <Server size={20} />
        </ActionButton>
        <ActionButton label="Episodes" tooltip="Episodes" onClick={onOpenEpisode}>
          <List size={20} />
        </ActionButton>
      </div>
    </div>
  );
};

export default TvShowPlayerHeader;
