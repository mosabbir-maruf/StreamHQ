import { PlayersProps } from "@/types";
import VaulDrawer from "@/components/ui/overlay/VaulDrawer";
import { cn } from "@/utils/helpers";
import { Ads, Clock, Rocket, Star } from "@/utils/icons";

interface AnimePlayerSourceSelectionProps {
  opened: boolean;
  onClose: () => void;
  players: PlayersProps[];
  selectedSource: number;
  setSelectedSource: (source: number) => void;
}

const AnimePlayerSourceSelection: React.FC<AnimePlayerSourceSelectionProps> = ({
  opened,
  onClose,
  players,
  selectedSource,
  setSelectedSource,
}) => {
  const handleSourceChange = (index: number) => {
    setSelectedSource(index);
    onClose();
  };

  return (
    <VaulDrawer
      open={opened}
      onClose={onClose}
      backdrop="blur"
      title="Select Source"
      direction="right"
      hiddenHandler
      withCloseButton
      classNames={{ content: "space-y-0" }}
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg bg-warning-50 px-3 py-2 dark:bg-warning-50/10">
            <Star className="size-4 text-warning-500" />
            <span className="text-foreground-700">Recommended</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-danger-50 px-3 py-2 dark:bg-danger-50/10">
            <Rocket className="size-4 text-danger-500" />
            <span className="text-foreground-700">Fast Loading</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-success-50 px-3 py-2 dark:bg-success-50/10">
            <Clock className="size-4 text-success-500" />
            <span className="text-foreground-700">Resume Support</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 dark:bg-primary-50/10">
            <Ads className="size-4 text-primary-500" />
            <span className="text-foreground-700">Has Ads</span>
          </div>
        </div>
        <div className="rounded-lg bg-default-100 px-4 py-2.5 text-xs text-foreground-600 dark:bg-default-50">
          <p>💡 Use ad-blocker • Try different servers if one doesn't work</p>
          <p className="mt-1 italic opacity-80">It's free! Not working? Just try another server! 😄</p>
        </div>
        <div 
          className="max-h-[60vh] space-y-1 overflow-y-auto pr-1"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(212 212 212 / 0.3) transparent'
          }}
        >
          {players.map(({ title, recommended, fast, ads, resumable }, index) => {
            const isSelected = selectedSource === index;
            return (
              <button
                key={`source-${index}`}
                onClick={() => handleSourceChange(index)}
                className={cn(
                  "w-full rounded-md px-3 py-2.5 text-left transition-colors",
                  isSelected
                    ? "bg-danger text-danger-foreground"
                    : "hover:bg-default-100"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={cn("text-sm", isSelected ? "font-semibold" : "font-medium")}>
                    {title}
                  </span>
                  <div className="flex items-center gap-1">
                    {recommended && <Star className={cn("size-3", isSelected ? "text-danger-foreground" : "text-warning")} />}
                    {fast && <Rocket className={cn("size-3", isSelected ? "text-danger-foreground" : "text-danger")} />}
                    {resumable && <Clock className={cn("size-3", isSelected ? "text-danger-foreground" : "text-success")} />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </VaulDrawer>
  );
};

export default AnimePlayerSourceSelection;

